/**
 * OpenAI 格式适配器
 * 将所有 AI 提供商的 API 转换为 OpenAI 标准格式
 * 
 * OpenAI 格式规范：
 * - 请求路由：POST /v1/chat/completions
 * - 请求格式：{ model, messages, temperature, max_tokens, top_p, ... }
 * - 响应格式：{ choices: [{ message: { content: string } }], usage: {...} }
 */

import axios from 'axios';
import logger from './logger.js';

/**
 * 标准化的 OpenAI 格式响应
 */
function normalizeOpenAIResponse(content, usage = {}) {
  return {
    object: 'chat.completion',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: content
        },
        finish_reason: 'stop'
      }
    ],
    usage: {
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0
    }
  };
}

/**
 * OpenAI 直接调用 (无需转换)
 */
export async function callOpenAIChat(payload, apiKey) {
  const client = axios.create({
    baseURL: 'https://api.openai.com/v1',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await client.post('/chat/completions', {
    model: payload.model,
    messages: payload.messages,
    temperature: payload.temperature || 0.7,
    max_tokens: payload.max_tokens || 2000,
    top_p: payload.top_p || 1,
    stream: payload.stream || false,
  });

  // OpenAI 响应已经是标准格式
  return response.data;
}

/**
 * Qwen (阿里云通义千问) - 转换为 OpenAI 格式
 * 
 * 阿里云原始格式:
 * POST /api/v1/services/aigc/text-generation/generation
 * 响应: { output: { text: string }, usage: {...} }
 */
export async function callQwenChat(payload, apiKey) {
  const startTime = Date.now();
  
  try {
    logger.debug('QWEN', '开始调用 Qwen API', {
      model: payload.model,
      messageCount: payload.messages?.length,
      temperature: payload.temperature,
      max_tokens: payload.max_tokens
    });

    const client = axios.create({
      baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000
    });

    logger.trace('QWEN', '发送请求到 Qwen API', {
      endpoint: '/chat/completions',
      model: payload.model
    });

    const response = await client.post('/chat/completions', {
      model: payload.model,
      messages: payload.messages,
      temperature: payload.temperature || 0.7,
      max_tokens: payload.max_tokens || 2000,
      top_p: payload.top_p || 1,
    });

    const duration = Date.now() - startTime;
    logger.logPerformance('QWEN', '调用成功', duration);

    logger.debug('QWEN', 'API 响应成功', {
      status: response.status,
      contentLength: JSON.stringify(response.data).length,
      outputLength: response.data.choices?.[0]?.message?.content?.length || 0,
      usage: response.data.usage
    });

    // 响应已经是 OpenAI 格式，直接返回
    logger.trace('QWEN', 'OpenAI 格式响应', {
      model: response.data.model,
      messageCount: response.data.choices?.length,
      contentPreview: response.data.choices?.[0]?.message?.content?.substring(0, 50)
    });

    return response.data;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logPerformance('QWEN', '调用失败', duration);
    logger.logAPIError('QWEN', error);

    throw error;
  }
}

/**
 * MiniMax - 转换为 OpenAI 格式
 * 
 * MiniMax 原始格式:
 * POST /v1/text/chatcompletion
 * 响应: { reply: [{ text: string }], usage: {...} }
 */
export async function callMiniMaxChat(payload, apiKey) {
  const client = axios.create({
    baseURL: 'https://api.minimax.chat/v1',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await client.post('/text/chatcompletion', {
    model: payload.model,
    messages: payload.messages,
    temperature: payload.temperature || 0.7,
    max_tokens: payload.max_tokens || 2000,
    top_p: payload.top_p || 1,
  });

  // 转换为 OpenAI 格式
  const content = response.data.reply?.[0]?.text || '';
  return normalizeOpenAIResponse(content, response.data.usage);
}

/**
 * Zhipu (智谱 ChatGLM) - 转换为 OpenAI 格式
 * 
 * 智谱原始格式:
 * POST /api/paas/v4/chat/completions
 * 响应: { choices: [{ message: { content: string } }], usage: {...} }
 * (已经是类似 OpenAI 格式)
 */
export async function callZhipuChat(payload, apiKey) {
  const client = axios.create({
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await client.post('/chat/completions', {
    model: payload.model,
    messages: payload.messages,
    temperature: payload.temperature || 0.7,
    max_tokens: payload.max_tokens || 2000,
    top_p: payload.top_p || 1,
  });

  // 已经是 OpenAI 格式，直接返回
  return response.data;
}

/**
 * 豆包 (Douyin/ByteDance) - 转换为 OpenAI 格式
 * 
 * 豆包原始格式:
 * POST https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions
 * 响应: { choices: [{ message: { content: string } }], usage: {...} }
 * (已经是 OpenAI 格式)
 */
export async function callDouyinChat(payload, apiKey) {
  const startTime = Date.now();
  
  try {
    logger.debug('DOUYIN', '开始调用 Douyin API', {
      model: payload.model,
      messageCount: payload.messages?.length,
      temperature: payload.temperature,
      max_tokens: payload.max_tokens
    });

    const client = axios.create({
      baseURL: 'https://ark.cn-beijing.volces.com/api/coding/v3',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000
    });

    logger.trace('DOUYIN', '发送请求到 Douyin API', {
      endpoint: '/chat/completions',
      model: payload.model,
      baseURL: 'https://ark.cn-beijing.volces.com/api/coding/v3'
    });

    const response = await client.post('/chat/completions', {
      model: payload.model,
      messages: payload.messages,
      temperature: payload.temperature || 0.7,
      max_tokens: payload.max_tokens || 2000,
      top_p: payload.top_p || 1,
    });

    const duration = Date.now() - startTime;
    logger.logPerformance('DOUYIN', '调用成功', duration);

    logger.debug('DOUYIN', 'API 响应成功', {
      status: response.status,
      contentLength: JSON.stringify(response.data).length,
      outputLength: response.data.choices?.[0]?.message?.content?.length || 0,
      usage: response.data.usage
    });

    // 已经是 OpenAI 格式，直接返回
    return response.data;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logPerformance('DOUYIN', '调用失败', duration);
    logger.logAPIError('DOUYIN', error);

    throw error;
  }
}

/**
 * 通用 chat 调用函数 - 所有提供商统一接口
 */
export async function callChatCompletion(provider, payload, apiKey) {
  const startTime = Date.now();
  
  try {
    logger.info('CHAT_COMPLETION', `调用 ${provider.toUpperCase()} 开始`, {
      provider,
      model: payload.model,
      messageCount: payload.messages?.length
    });

    let response;

    switch (provider.toLowerCase()) {
      case 'openai':
        logger.debug('OPENAI', '路由到 OpenAI 处理器');
        response = await callOpenAIChat(payload, apiKey);
        break;
      case 'qwen':
      case 'qwen-turbo':
      case 'qwen3.5-plus':
      case 'qwen-long':
        logger.debug('QWEN', '路由到 Qwen 处理器');
        response = await callQwenChat(payload, apiKey);
        break;
      case 'minimax':
        logger.debug('MINIMAX', '路由到 MiniMax 处理器');
        response = await callMiniMaxChat(payload, apiKey);
        break;
      case 'zhipu':
      case 'glm-4':
      case 'glm-4-flash':
        logger.debug('ZHIPU', '路由到 Zhipu 处理器');
        response = await callZhipuChat(payload, apiKey);
        break;
      case 'douyin':
      case 'douyin-1.5-pro':
      case 'doubao':
        logger.debug('DOUYIN', '路由到豆包处理器');
        response = await callDouyinChat(payload, apiKey);
        break;
      default:
        logger.warn('CHAT_COMPLETION', `不支持的提供商: ${provider}`);
        throw new Error(`Unsupported provider: ${provider}`);
    }

    const duration = Date.now() - startTime;
    logger.logPerformance('CHAT_COMPLETION', `${provider.toUpperCase()} 调用`, duration);

    // 提取内容
    const content = response.choices?.[0]?.message?.content || '';
    const usage = response.usage || {};

    logger.info('CHAT_COMPLETION', `调用 ${provider.toUpperCase()} 成功`, {
      provider,
      model: payload.model,
      duration: `${duration}ms`,
      contentLength: content.length,
      usage
    });

    return {
      success: true,
      data: {
        content,
        usage,
        model: response.model,
        created: response.created
      }
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('CHAT_COMPLETION', `调用 ${provider.toUpperCase()} 失败`, {
      provider,
      model: payload.model,
      duration: `${duration}ms`,
      errorMessage: error.message,
      errorType: error.constructor.name
    });

    return {
      success: false,
      error: error.message,
      provider: provider
    };
  }
}

/**
 * 流式调用支持 (用于 streaming)
 */
export async function callChatCompletionStream(provider, payload, apiKey, onChunk) {
  try {
    payload.stream = true;
    
    let streamResponse;

    switch (provider.toLowerCase()) {
      case 'openai':
        streamResponse = await callOpenAIStreamChat(payload, apiKey, onChunk);
        break;
      case 'qwen':
      case 'qwen-turbo':
      case 'qwen3.5-plus':
      case 'qwen-long':
        streamResponse = await callQwenStreamChat(payload, apiKey, onChunk);
        break;
      case 'minimax':
        streamResponse = await callMiniMaxStreamChat(payload, apiKey, onChunk);
        break;
      case 'zhipu':
      case 'glm-4':
      case 'glm-4-flash':
        streamResponse = await callZhipuStreamChat(payload, apiKey, onChunk);
        break;
      case 'douyin':
      case 'douyin-1.5-pro':
      case 'doubao':
        streamResponse = await callDouyinStreamChat(payload, apiKey, onChunk);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return {
      success: true,
      message: 'Stream completed'
    };
  } catch (error) {
    console.error(`[${provider}] Stream error:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * OpenAI 流式调用
 */
async function callOpenAIStreamChat(payload, apiKey, onChunk) {
  const client = axios.create({
    baseURL: 'https://api.openai.com/v1',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    responseType: 'stream'
  });

  const response = await client.post('/chat/completions', {
    model: payload.model,
    messages: payload.messages,
    temperature: payload.temperature || 0.7,
    max_tokens: payload.max_tokens || 2000,
    top_p: payload.top_p || 1,
    stream: true,
  });

  return new Promise((resolve, reject) => {
    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const json = line.slice(6);
          if (json === '[DONE]') {
            resolve();
          } else if (json) {
            try {
              const parsed = JSON.parse(json);
              onChunk?.(parsed);
            } catch (e) {
              // 忽略 JSON 解析错误
            }
          }
        }
      }
    });
    response.data.on('error', reject);
  });
}

/**
 * Qwen 流式调用
 */
async function callQwenStreamChat(payload, apiKey, onChunk) {
  const client = axios.create({
    baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    responseType: 'stream'
  });

  const response = await client.post('/chat/completions', {
    model: payload.model,
    messages: payload.messages,
    temperature: payload.temperature || 0.7,
    max_tokens: payload.max_tokens || 2000,
    top_p: payload.top_p || 1,
    stream: true,
  });

  return new Promise((resolve, reject) => {
    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const json = line.slice(6);
          if (json === '[DONE]') {
            resolve();
            return;
          }
          if (json) {
            try {
              const parsed = JSON.parse(json);
              // 直接转发 OpenAI 格式的流数据
              if (parsed.choices?.[0]?.delta?.content) {
                onChunk?.(parsed);
              }
            } catch (e) {
              // 忽略 JSON 解析错误
            }
          }
        }
      }
    });
    response.data.on('error', reject);
  });
}

/**
 * MiniMax 流式调用
 */
async function callMiniMaxStreamChat(payload, apiKey, onChunk) {
  const client = axios.create({
    baseURL: 'https://api.minimax.chat/v1',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    responseType: 'stream'
  });

  const response = await client.post('/text/chatcompletion', {
    model: payload.model,
    messages: payload.messages,
    temperature: payload.temperature || 0.7,
    max_tokens: payload.max_tokens || 2000,
    top_p: payload.top_p || 1,
    stream: true,
  });

  return new Promise((resolve, reject) => {
    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const json = line.slice(6);
          if (json) {
            try {
              const parsed = JSON.parse(json);
              if (parsed.reply) {
                const chunk = {
                  choices: [{
                    index: 0,
                    delta: { content: parsed.reply[0]?.text || '' },
                    finish_reason: 'stop'
                  }]
                };
                onChunk?.(chunk);
              }
            } catch (e) {
              // 忽略 JSON 解析错误
            }
          }
        }
      }
    });
    response.data.on('error', reject);
  });
}

/**
 * Zhipu 流式调用
 */
async function callZhipuStreamChat(payload, apiKey, onChunk) {
  const client = axios.create({
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    responseType: 'stream'
  });

  const response = await client.post('/chat/completions', {
    model: payload.model,
    messages: payload.messages,
    temperature: payload.temperature || 0.7,
    max_tokens: payload.max_tokens || 2000,
    top_p: payload.top_p || 1,
    stream: true,
  });

  return new Promise((resolve, reject) => {
    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const json = line.slice(6);
          if (json === '[DONE]') {
            resolve();
          } else if (json) {
            try {
              const parsed = JSON.parse(json);
              onChunk?.(parsed);
            } catch (e) {
              // 忽略 JSON 解析错误
            }
          }
        }
      }
    });
    response.data.on('error', reject);
  });
}

/**
 * 豆包流式调用
 */
async function callDouyinStreamChat(payload, apiKey, onChunk) {
  const startTime = Date.now();
  
  try {
    logger.debug('DOUYIN_STREAM', '开始流式调用 Douyin API', {
      model: payload.model,
      messageCount: payload.messages?.length
    });

    const client = axios.create({
      baseURL: 'https://ark.cn-beijing.volces.com/api/coding/v3',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      responseType: 'stream',
      timeout: 60000
    });

    logger.trace('DOUYIN_STREAM', '发送流式请求到 Douyin API', {
      endpoint: '/chat/completions',
      model: payload.model,
      baseURL: 'https://ark.cn-beijing.volces.com/api/coding/v3'
    });

    const response = await client.post('/chat/completions', {
      model: payload.model,
      messages: payload.messages,
      temperature: payload.temperature || 0.7,
      max_tokens: payload.max_tokens || 2000,
      top_p: payload.top_p || 1,
      stream: true,
    });

    return new Promise((resolve, reject) => {
      let receivedChunks = 0;
      
      response.data.on('data', (chunk) => {
        try {
          const lines = chunk.toString().split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const json = line.slice(6);
              if (json === '[DONE]') {
                const duration = Date.now() - startTime;
                logger.debug('DOUYIN_STREAM', '流式响应完成', {
                  receivedChunks,
                  duration
                });
                resolve();
              } else if (json) {
                try {
                  const parsed = JSON.parse(json);
                  receivedChunks++;
                  onChunk?.(parsed);
                } catch (e) {
                  logger.trace('DOUYIN_STREAM', 'JSON 解析失败', {
                    line: line.substring(0, 100),
                    error: e.message
                  });
                }
              }
            }
          }
        } catch (e) {
          logger.error('DOUYIN_STREAM', '处理数据块失败', {
            error: e.message
          });
        }
      });

      response.data.on('error', (err) => {
        const duration = Date.now() - startTime;
        logger.error('DOUYIN_STREAM', '流式请求失败', {
          duration,
          error: err.message,
          receivedChunks
        });
        reject(err);
      });

      response.data.on('end', () => {
        logger.trace('DOUYIN_STREAM', '数据流结束事件触发');
      });
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('DOUYIN_STREAM', '流式调用异常', {
      duration,
      error: error.message,
      errorType: error.constructor.name
    });
    throw error;
  }
}
