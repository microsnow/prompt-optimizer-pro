/**
 * API 代理服务器
 * 用途：
 * 1. 解决前端跨域 (CORS) 问题
 * 2. 安全管理 API 密钥（存储在服务器端，不暴露给前端）
 * 3. 统一管理多个 AI 提供商的 API
 */

import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'file://'],
  credentials: true,
}));
app.use(express.json());

// 日志中间件
app.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

// ============ API 代理端点 ============

/**
 * 通用代理路由 - 转发请求到实际的 API
 * 支持路径：/proxy/:provider/... 
 * 例如：/proxy/qwen/chat, /proxy/douyin/chat/completions 等
 */
app.post('/proxy/:provider/:endpoint', async (req: Request, res: Response) => {
  try {
    const { provider, endpoint } = req.params;
    const { model, messages, temperature, max_tokens, top_p, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: '缺少 API 密钥' });
    }

    let response;

    switch (provider) {
      case 'openai':
        response = await callOpenAI(model, messages, temperature, max_tokens, apiKey);
        break;
      case 'qwen':
        response = await callQwen(model, messages, temperature, max_tokens, top_p, apiKey);
        break;
      case 'minimax':
        response = await callMiniMax(model, messages, temperature, max_tokens, apiKey);
        break;
      case 'zhipu':
        response = await callZhipu(model, messages, temperature, max_tokens, apiKey);
        break;
      case 'douyin':
        response = await callDouyin(model, messages, temperature, max_tokens, apiKey);
        break;
      default:
        return res.status(400).json({ error: '不支持的 API 提供商' });
    }

    return res.json({ success: true, data: response });
  } catch (error: any) {
    console.error('代理错误:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '请求失败',
    });
  }
});

/**
 * OpenAI 代理
 */
async function callOpenAI(
  model: string,
  messages: any[],
  temperature: number,
  max_tokens: number,
  apiKey: string
) {
  const client = axios.create({
    baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  const response = await client.post('/chat/completions', {
    model,
    messages,
    temperature,
    max_tokens,
  });

  return response.data.choices[0].message.content;
}

/**
 * 阿里云通义千问代理
 */
async function callQwen(
  model: string,
  messages: any[],
  temperature: number,
  max_tokens: number,
  top_p: number,
  apiKey: string
) {
  const client = axios.create({
    baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await client.post('/chat/completions', {
    model,
    messages,
    temperature,
    top_p,
    max_tokens,
  });

  return response.data.choices[0].message.content;
}

/**
 * MiniMax 代理
 */
async function callMiniMax(
  model: string,
  messages: any[],
  temperature: number,
  max_tokens: number,
  apiKey: string
) {
  const client = axios.create({
    baseURL: 'https://api.minimax.chat/v1',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await client.post('/text/chatcompletion', {
    model,
    messages,
    temperature,
    max_tokens,
  });

  return response.data.reply[0].text;
}

/**
 * 智谱 ChatGLM 代理
 */
async function callZhipu(
  model: string,
  messages: any[],
  temperature: number,
  max_tokens: number,
  apiKey: string
) {
  const client = axios.create({
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await client.post('/chat/completions', {
    model,
    messages,
    temperature,
    max_tokens,
  });

  return response.data.choices[0].message.content;
}

/**
 * 豆包 (字节跳动) 代理
 */
async function callDouyin(
  model: string,
  messages: any[],
  temperature: number,
  max_tokens: number,
  apiKey: string
) {
  const client = axios.create({
    baseURL: 'https://ark.cn-beijing.volces.com/api/coding/v3',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await client.post('/chat/completions', {
    model,
    messages,
    temperature,
    max_tokens,
    top_p: 1,
  });

  return response.data.choices[0].message.content;
}

// ============ 健康检查 ============

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ 启动服务器 ============

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ API 代理服务器运行在 http://localhost:${PORT}`);
  console.log(`📌 支持的提供商: OpenAI, Qwen, MiniMax, Zhipu`);
});
