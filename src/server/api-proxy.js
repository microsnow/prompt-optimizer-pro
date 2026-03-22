/**
 * API 代理服务器 (JavaScript 版本)
 * 用途：
 * 1. 解决前端跨域 (CORS) 问题
 * 2. 安全管理 API 密钥（存储在服务器端，不暴露给前端）
 * 3. 统一管理多个 AI 提供商的 API
 * 4. 统一所有接口为 OpenAI 格式规范
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import logger from './logger.js';
import { callChatCompletion, callChatCompletionStream } from './openai-format.js';

const app = express();

// ============ 环境配置 ============
const NODE_ENV = process.env.NODE_ENV || 'development';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'file://',
    ];

logger.info('CONFIG', '代理服务器配置', {
  environment: NODE_ENV,
  allowedOrigins: ALLOWED_ORIGINS
});

// 中间件
app.use(cors({
  origin: (origin, callback) => {
    // 允许无 origin 的请求（比如 curl、移动应用、Electron）
    if (!origin) {
      return callback(null, true);
    }
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS', '请求被拒绝', { origin });
      callback(new Error('CORS 不允许此源'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// 日志中间件 - 记录所有请求
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  logger.info('HTTP_REQUEST', `${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : null,
    contentType: req.headers['content-type'],
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });

  // 捕获响应状态
  const originalJson = res.json;
  res.json = function(data) {
    logger.debug('HTTP_RESPONSE', `${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      method: req.method,
      path: req.path
    });
    return originalJson.call(this, data);
  };

  next();
});

// ============ OpenAI 格式 API 代理端点 ============

/**
 * 通用 chat/completions 端点 (OpenAI 格式)
 * 
 * 所有请求统一走这个路由，支持所有 AI 提供商
 * 
 * 请求格式:
 * POST /v1/chat/completions
 * {
 *   "provider": "openai|qwen|minimax|zhipu",
 *   "model": "gpt-3.5-turbo|qwen-turbo|...",
 *   "messages": [...],
 *   "temperature": 0.7,
 *   "max_tokens": 2000,
 *   "top_p": 1,
 *   "apiKey": "your-api-key",
 *   "stream": false
 * }
 * 
 * 响应格式 (OpenAI 标准):
 * {
 *   "object": "chat.completion",
 *   "choices": [{
 *     "message": {"role": "assistant", "content": "..."},
 *     "finish_reason": "stop"
 *   }],
 *   "usage": {...}
 * }
 */
app.post('/v1/chat/completions', async (req, res) => {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const { provider, model, messages, temperature, max_tokens, top_p, apiKey, stream } = req.body;

    logger.info('ROUTE_V1', `[${requestId}] 新请求到达 /v1/chat/completions`, {
      requestId,
      provider,
      model,
      messageCount: messages?.length,
      stream: stream || false
    });

    // 验证必要字段
    if (!provider) {
      logger.warn('VALIDATION', `[${requestId}] 缺少 provider 字段`);
      return res.status(400).json({ error: '缺少 provider 字段' });
    }
    if (!model) {
      logger.warn('VALIDATION', `[${requestId}] 缺少 model 字段`);
      return res.status(400).json({ error: '缺少 model 字段' });
    }
    if (!messages || !Array.isArray(messages)) {
      logger.warn('VALIDATION', `[${requestId}] 缺少或格式错误的 messages 字段`);
      return res.status(400).json({ error: '缺少或格式错误的 messages 字段' });
    }
    if (!apiKey) {
      logger.warn('VALIDATION', `[${requestId}] 缺少 apiKey 字段`);
      return res.status(400).json({ error: '缺少 apiKey 字段' });
    }

    logger.debug('VALIDATION', `[${requestId}] 字段验证通过`);

    // 构建标准化 payload
    const payload = {
      model,
      messages,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 2000,
      top_p: top_p || 1,
      stream: stream || false,
    };

    logger.trace('PAYLOAD', `[${requestId}] 最终 payload`, {
      requestId,
      model: payload.model,
      messageCount: payload.messages.length,
      temperature: payload.temperature,
      max_tokens: payload.max_tokens,
      top_p: payload.top_p
    });

    if (stream) {
      // 流式响应
      logger.info('STREAM', `[${requestId}] 启用流式模式`);
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const streamResult = await callChatCompletionStream(provider, payload, apiKey, (chunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      });

      if (streamResult.success) {
        const duration = Date.now() - startTime;
        logger.info('STREAM_SUCCESS', `[${requestId}] 流式响应完成`, {
          requestId,
          provider,
          duration: `${duration}ms`
        });
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        logger.error('STREAM_ERROR', `[${requestId}] 流式响应失败`, {
          requestId,
          error: streamResult.error
        });
        res.write(`data: ${JSON.stringify({ error: streamResult.error })}\n\n`);
        res.end();
      }
    } else {
      // 非流式响应
      logger.debug('PROCESSING', `[${requestId}] 调用 ${provider} API`);
      
      const result = await callChatCompletion(provider, payload, apiKey);
      const duration = Date.now() - startTime;

      if (result.success) {
        logger.info('SUCCESS', `[${requestId}] API 调用成功`, {
          requestId,
          provider,
          model,
          duration: `${duration}ms`,
          responseSize: JSON.stringify(result.data).length
        });
        return res.json(result.data);
      } else {
        logger.error('ERROR', `[${requestId}] API 调用失败`, {
          requestId,
          provider,
          model,
          duration: `${duration}ms`,
          error: result.error
        });
        return res.status(500).json({
          error: result.error,
          provider: result.provider,
          requestId
        });
      }
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('EXCEPTION', `[${requestId}] 未捕获的异常`, {
      requestId,
      duration: `${duration}ms`,
      errorMessage: error.message,
      errorStack: error.stack,
      errorType: error.constructor.name
    });
    return res.status(500).json({
      error: error.message || '请求失败',
      requestId,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * 兼容旧 API 的代理路由 (向后兼容)
 */
app.post('/api/proxy/:provider/:endpoint', async (req, res) => {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const { provider, endpoint } = req.params;
    const { model, messages, temperature, max_tokens, top_p, apiKey } = req.body;

    logger.info('ROUTE_LEGACY', `[${requestId}] 旧 API 请求 /api/proxy/${provider}/${endpoint}`, {
      requestId,
      provider,
      endpoint,
      model,
      messageCount: messages?.length
    });

    if (!apiKey) {
      logger.warn('VALIDATION', `[${requestId}] 缺少 API 密钥`);
      return res.status(400).json({ error: '缺少 API 密钥' });
    }

    // 转发到新的 OpenAI 格式端点
    const payload = {
      provider,
      model,
      messages,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 2000,
      top_p,
      apiKey,
      stream: false
    };

    logger.debug('PROCESSING', `[${requestId}] 转发到新格式端点`);

    const result = await callChatCompletion(provider, payload, apiKey);
    const duration = Date.now() - startTime;

    if (result.success) {
      logger.info('SUCCESS', `[${requestId}] 旧 API 调用成功`, {
        requestId,
        provider,
        model,
        duration: `${duration}ms`
      });
      return res.json({ success: true, data: result.data });
    } else {
      logger.error('ERROR', `[${requestId}] 旧 API 调用失败`, {
        requestId,
        provider,
        model,
        duration: `${duration}ms`,
        error: result.error
      });
      return res.status(500).json({
        success: false,
        error: result.error,
        requestId
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('EXCEPTION', `[${requestId}] 旧 API 异常`, {
      requestId,
      duration: `${duration}ms`,
      errorMessage: error.message,
      errorStack: error.stack
    });
    return res.status(500).json({
      success: false,
      error: error.message || '请求失败',
      requestId
    });
  }
});

// ============ 新的代理路由（支持 /proxy/... 路径） ============

app.post('/proxy/:provider/:endpoint', async (req, res) => {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const { provider, endpoint } = req.params;
    const { model, messages, temperature, max_tokens, top_p, apiKey } = req.body;

    logger.info('ROUTE_PROXY', `[${requestId}] 代理 API 请求 /proxy/${provider}/${endpoint}`, {
      requestId,
      provider,
      endpoint,
      model,
      messageCount: messages?.length
    });

    if (!apiKey) {
      logger.warn('VALIDATION', `[${requestId}] 缺少 API 密钥`);
      return res.status(400).json({ error: '缺少 API 密钥' });
    }

    // 转发到新的 OpenAI 格式端点
    const payload = {
      provider,
      model,
      messages,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 2000,
      top_p,
      apiKey,
      stream: false
    };

    logger.debug('PROCESSING', `[${requestId}] 转发到新格式端点`);

    const result = await callChatCompletion(provider, payload, apiKey);
    const duration = Date.now() - startTime;

    if (result.success) {
      logger.info('SUCCESS', `[${requestId}] 代理 API 调用成功`, {
        requestId,
        provider,
        model,
        duration: `${duration}ms`
      });
      return res.json({ success: true, data: result.data });
    } else {
      logger.error('ERROR', `[${requestId}] 代理 API 调用失败`, {
        requestId,
        provider,
        model,
        duration: `${duration}ms`,
        error: result.error
      });
      return res.status(500).json({
        success: false,
        error: result.error,
        requestId
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('EXCEPTION', `[${requestId}] 代理 API 异常`, {
      requestId,
      duration: `${duration}ms`,
      errorMessage: error.message,
      errorStack: error.stack
    });
    return res.status(500).json({
      success: false,
      error: error.message || '请求失败',
      requestId
    });
  }
});

// ============ 旧的代理路由（保持向后兼容）============

app.post('/api/proxy/:provider/:endpoint', async (req, res) => {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const { provider, endpoint } = req.params;
    const { model, messages, temperature, max_tokens, top_p, apiKey } = req.body;

    logger.info('ROUTE_LEGACY', `[${requestId}] 旧 API 请求 /api/proxy/${provider}/${endpoint}`, {
      requestId,
      provider,
      endpoint,
      model,
      messageCount: messages?.length
    });

    if (!apiKey) {
      logger.warn('VALIDATION', `[${requestId}] 缺少 API 密钥`);
      return res.status(400).json({ error: '缺少 API 密钥' });
    }

    // 转发到新的 OpenAI 格式端点
    const payload = {
      provider,
      model,
      messages,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 2000,
      top_p,
      apiKey,
      stream: false
    };

    logger.debug('PROCESSING', `[${requestId}] 转发到新格式端点`);

    const result = await callChatCompletion(provider, payload, apiKey);
    const duration = Date.now() - startTime;

    if (result.success) {
      logger.info('SUCCESS', `[${requestId}] 旧 API 调用成功`, {
        requestId,
        provider,
        model,
        duration: `${duration}ms`
      });
      return res.json({ success: true, data: result.data });
    } else {
      logger.error('ERROR', `[${requestId}] 旧 API 调用失败`, {
        requestId,
        provider,
        model,
        duration: `${duration}ms`,
        error: result.error
      });
      return res.status(500).json({
        success: false,
        error: result.error,
        requestId
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('EXCEPTION', `[${requestId}] 旧 API 异常`, {
      requestId,
      duration: `${duration}ms`,
      errorMessage: error.message,
      errorStack: error.stack
    });
    return res.status(500).json({
      success: false,
      error: error.message || '请求失败',
      requestId
    });
  }
});

// ============ 健康检查 ============

app.get('/health', (req, res) => {
  logger.debug('HEALTH_CHECK', '健康检查请求');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ 日志查看端点 ============

/**
 * 获取最近的日志
 */
app.get('/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logFiles = logger.getLogFiles();

    if (logFiles.length === 0) {
      return res.json({ logs: [], message: '暂无日志' });
    }

    // 获取最新的日志文件
    const latestLogFile = logFiles.sort().pop();
    const logPath = path.join(logger.logDir || './logs', latestLogFile);

    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    // 返回最后 N 行
    const recentLogs = lines.slice(-limit);

    res.json({
      file: latestLogFile,
      totalLines: lines.length,
      returnedLines: recentLogs.length,
      logs: recentLogs
    });
  } catch (error) {
    logger.error('LOGS_ERROR', '获取日志失败', {
      error: error.message
    });
    res.status(500).json({
      error: '获取日志失败',
      message: error.message
    });
  }
});

// ============ 工具函数 ============

/**
 * 生成唯一的请求 ID
 */
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============ 启动服务器 ============

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info('SERVER_START', `🚀 API 代理服务器启动成功`, {
    port: PORT,
    url: `http://localhost:${PORT}`,
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'INFO'
  });
  logger.info('SERVER_START', `📌 支持的提供商: OpenAI, Qwen, MiniMax, Zhipu, Douyin(豆包)`);
  logger.info('SERVER_START', `📍 主端点: POST /v1/chat/completions`);
  logger.info('SERVER_START', `📊 日志查看: GET /logs`);
  logger.info('SERVER_START', `❤️  健康检查: GET /health`);
});
