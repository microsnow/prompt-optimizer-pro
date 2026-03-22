import axios from 'axios';
import type { APIResponse } from '@/types';
import { API_PROXY_URL, AXIOS_CONFIG, USE_BACKEND_PROXY } from '@/config/api.config';
import { externalApiService } from './externalApiService';

// ============ 配置 ============

// 单个 axios 实例，用于所有代理请求
const proxyClient = axios.create({
  baseURL: API_PROXY_URL,
  headers: AXIOS_CONFIG.headers,
  timeout: AXIOS_CONFIG.timeout,
});

// ============ 错误处理 ============

function handleError(error: any): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'API 密钥无效或已过期';
    }
    if (error.response?.status === 429) {
      return 'API 请求过于频繁，请稍候再试';
    }
    if (error.response?.status === 500) {
      return 'API 服务器错误，请稍候再试';
    }
    return error.response?.data?.error || error.message || '网络请求失败';
  }
  return String(error);
}

// ============ 通用 API 客户端 ============

/**
 * 通用 API 客户端 - 适用于所有提供商
 * 通过代理服务器调用外部 API
 */
export class ProxyAPIClient {
  private provider: 'openai' | 'qwen' | 'minimax' | 'zhipu' | 'douyin';
  private apiKey: string;
  private model: string;

  constructor(
    provider: 'openai' | 'qwen' | 'minimax' | 'zhipu' | 'douyin',
    apiKey: string,
    model: string
  ) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.model = model;
  }

  private async callAPI(messages: any[], temperature: number, max_tokens: number, top_p?: number): Promise<any> {
    try {
      const payload: any = {
        model: this.model,
        messages,
        temperature,
        max_tokens,
        apiKey: this.apiKey, // 注意：API 密钥在代理中安全处理
        provider: this.provider,
      };

      if (top_p !== undefined) {
        payload.top_p = top_p;
      }

      // 根据开关决定走后端代理还是本地 Express 代理
      if (USE_BACKEND_PROXY()) {
        // ===== 后端 AI Proxy（HMAC 签名，camelCase 字段） =====
        const backendPayload = {
          provider: this.provider,
          model: this.model,
          messages,
          temperature,
          maxTokens: max_tokens,  // snake_case -> camelCase
          ...(top_p !== undefined ? { topP: top_p } : {}),  // snake_case -> camelCase
          apiKey: this.apiKey,
          stream: false,
        };

        const data = await externalApiService.chatCompletions(backendPayload);

        // 后端响应: data.choices[0].message.content (camelCase)
        return data.choices[0].message.content;
      }

      // ===== 本地 Express 代理（原始逻辑，snake_case 字段） =====
      const response = await proxyClient.post(
        `/proxy/${this.provider}/chat`,
        payload
      );

      if (!response.data.success) {
        throw new Error(response.data.error || '请求失败');
      }

      return response.data.data;
    } catch (error) {
      throw new Error(`${this.provider.toUpperCase()} API 调用失败: ${handleError(error)}`);
    }
  }

  async optimizePrompt(prompt: string, strategy: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `你是一个专业的提示词优化师。你的任务是根据指定的优化策略改进提示词。
优化策略: ${strategy}
请返回改进后的提示词，确保它更有效、更清晰、更容易被 AI 模型理解。`,
      },
      {
        role: 'user',
        content: `请优化以下提示词:\n\n${prompt}`,
      },
    ];

    return await this.callAPI(messages, 0.7, 2000, this.provider === 'qwen' ? 0.8 : undefined);
  }

  async analyzeQuality(prompt: string): Promise<any> {
    const messages = [
      {
        role: 'system',
        content: `你是一个提示词质量评估专家。请按照以下维度评估提示词的质量（每个维度0-100分）：
1. 清晰度 - 是否明确、无歧义
2. 具体性 - 是否包含具体示例
3. 完整性 - 是否包含所有必要信息
4. 结构化 - 是否组织清晰
5. 可执行性 - 是否能直接使用

请返回 JSON 格式的评分结果和改进建议。`,
      },
      {
        role: 'user',
        content: `请评估以下提示词:\n\n${prompt}`,
      },
    ];

    const result = await this.callAPI(messages, 0.5, 1500, this.provider === 'qwen' ? 0.8 : undefined);

    try {
      return JSON.parse(result);
    } catch {
      return { analysis: result, raw: true };
    }
  }
}

// ============ 统一 API 服务 ============

/**
 * 使用代理的统一 API 服务
 */
export class APIService {
  private openaiClient: ProxyAPIClient | null = null;
  private qwenClient: ProxyAPIClient | null = null;
  private minmaxClient: ProxyAPIClient | null = null;
  private zhipuClient: ProxyAPIClient | null = null;
  private douyinClient: ProxyAPIClient | null = null;

  initOpenAI(apiKey: string) {
    this.openaiClient = new ProxyAPIClient('openai', apiKey, 'gpt-3.5-turbo');
  }

  initQwen(apiKey: string) {
    this.qwenClient = new ProxyAPIClient('qwen', apiKey, 'qwen3.5-plus');
  }

  initMinMax(apiKey: string) {
    this.minmaxClient = new ProxyAPIClient('minimax', apiKey, 'minimax-text-saas');
  }

  initZhipu(apiKey: string) {
    this.zhipuClient = new ProxyAPIClient('zhipu', apiKey, 'glm-4-flash');
  }

  initDouyin(apiKey: string) {
    this.douyinClient = new ProxyAPIClient('douyin', apiKey, 'doubao-seed-2.0-pro');
  }

  async optimizePrompt(
    prompt: string,
    strategy: string,
    provider: 'openai' | 'qwen' | 'minimax' | 'zhipu' | 'douyin'
  ): Promise<APIResponse<string>> {
    try {
      let optimized: string;

      if (provider === 'openai') {
        if (!this.openaiClient) {
          return { success: false, error: 'OpenAI 客户端未初始化' };
        }
        optimized = await this.openaiClient.optimizePrompt(prompt, strategy);
      } else if (provider === 'qwen') {
        if (!this.qwenClient) {
          return { success: false, error: '阿里云客户端未初始化' };
        }
        optimized = await this.qwenClient.optimizePrompt(prompt, strategy);
      } else if (provider === 'minimax') {
        if (!this.minmaxClient) {
          return { success: false, error: 'MiniMax 客户端未初始化' };
        }
        optimized = await this.minmaxClient.optimizePrompt(prompt, strategy);
      } else if (provider === 'zhipu') {
        if (!this.zhipuClient) {
          return { success: false, error: '智谱客户端未初始化' };
        }
        optimized = await this.zhipuClient.optimizePrompt(prompt, strategy);
      } else if (provider === 'douyin') {
        if (!this.douyinClient) {
          return { success: false, error: '豆包客户端未初始化' };
        }
        optimized = await this.douyinClient.optimizePrompt(prompt, strategy);
      } else {
        return { success: false, error: '未知的 API 提供商' };
      }

      return { success: true, data: optimized };
    } catch (error) {
      return { success: false, error: `优化失败: ${error}` };
    }
  }

  async analyzeQuality(
    prompt: string,
    provider: 'openai' | 'qwen' | 'minimax' | 'zhipu' | 'douyin'
  ): Promise<APIResponse<any>> {
    try {
      let analysis: any;

      if (provider === 'openai') {
        if (!this.openaiClient) {
          return { success: false, error: 'OpenAI 客户端未初始化' };
        }
        analysis = await this.openaiClient.analyzeQuality(prompt);
      } else if (provider === 'qwen') {
        if (!this.qwenClient) {
          return { success: false, error: '阿里云客户端未初始化' };
        }
        analysis = await this.qwenClient.analyzeQuality(prompt);
      } else if (provider === 'minimax') {
        if (!this.minmaxClient) {
          return { success: false, error: 'MiniMax 客户端未初始化' };
        }
        analysis = await this.minmaxClient.analyzeQuality(prompt);
      } else if (provider === 'zhipu') {
        if (!this.zhipuClient) {
          return { success: false, error: '智谱客户端未初始化' };
        }
        analysis = await this.zhipuClient.analyzeQuality(prompt);
      } else if (provider === 'douyin') {
        if (!this.douyinClient) {
          return { success: false, error: '豆包客户端未初始化' };
        }
        analysis = await this.douyinClient.analyzeQuality(prompt);
      } else {
        return { success: false, error: '未知的 API 提供商' };
      }

      return { success: true, data: analysis };
    } catch (error) {
      return { success: false, error: `分析失败: ${error}` };
    }
  }

  isOpenAIReady(): boolean {
    return this.openaiClient !== null;
  }

  isQwenReady(): boolean {
    return this.qwenClient !== null;
  }

  isMinMaxReady(): boolean {
    return this.minmaxClient !== null;
  }

  isZhipuReady(): boolean {
    return this.zhipuClient !== null;
  }

  isDouyinReady(): boolean {
    return this.douyinClient !== null;
  }
}

export const apiService = new APIService();
