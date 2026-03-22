/**
 * 外部 API 服务 - 对接后端对外接口
 *
 * 功能:
 * 1. HMAC-SHA256 签名鉴权
 * 2. 封装 5 个 GET 配置接口
 * 3. camelCase -> snake_case 字段映射
 */

import CryptoJS from 'crypto-js';
import axios, { type AxiosInstance } from 'axios';
import type {
  ModelConfig,
  DomainConfig,
  StrategyConfig,
  QualityRubricConfig,
  OptimizationPromptConfig,
} from './configService';

// ============ 通用响应类型 ============

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

// ============ 后端 API 原始类型（camelCase） ============

interface ApiModel {
  id: number;
  modelId: string;
  name: string;
  description: string;
  idealLengthMin: number;
  idealLengthMax: number;
  tone: string;
  structurePreference: string;
  maxApiCallsPerMinute: number;
  supportsSystemPrompt: boolean;
  supportsMultimodal: boolean;
  enabled: boolean;
}

interface ApiDomain {
  id: number;
  domainId: string;
  name: string;
  keywords: string;
  tips: string;
  baseTemplate: string;
}

interface ApiStrategy {
  id: number;
  strategyId: string;
  name: string;
  icon: string;
  description: string;
  focus: string;
}

interface ApiQualityRubric {
  id: number;
  rubricId: string;
  name: string;
  weight: number;
  criteria: string;
}

interface ApiOptimizationPrompt {
  id: number;
  promptId: string;
  content: string;
}

// ============ 字段映射函数 ============

function transformModel(api: ApiModel): ModelConfig {
  return {
    id: api.id,
    model_id: api.modelId,
    name: api.name,
    description: api.description,
    ideal_length: [api.idealLengthMin, api.idealLengthMax],
    tone: api.tone,
    structure_preference: api.structurePreference,
    max_api_calls_per_minute: api.maxApiCallsPerMinute,
    supports_system_prompt: api.supportsSystemPrompt,
    supports_multimodal: api.supportsMultimodal,
    enabled: api.enabled,
  };
}

function transformDomain(api: ApiDomain): DomainConfig {
  return {
    id: api.id,
    domain_id: api.domainId,
    name: api.name,
    keywords: typeof api.keywords === 'string' 
      ? api.keywords.split(',').map(k => k.trim()) 
      : api.keywords,
    tips: api.tips,
    base_template: api.baseTemplate,
  };
}

function transformStrategy(api: ApiStrategy): StrategyConfig {
  return {
    id: api.id,
    strategy_id: api.strategyId,
    name: api.name,
    icon: api.icon,
    description: api.description,
    focus: api.focus,
  };
}

function transformQualityRubric(api: ApiQualityRubric): QualityRubricConfig {
  return {
    id: api.id,
    rubric_id: api.rubricId,
    name: api.name,
    weight: api.weight,
    criteria: typeof api.criteria === 'string' 
      ? api.criteria.split(',').map(c => c.trim()) 
      : api.criteria,
  };
}

function transformOptimizationPrompt(api: ApiOptimizationPrompt): OptimizationPromptConfig {
  return {
    id: api.id,
    prompt_id: api.promptId,
    content: api.content,
  };
}

// ============ AI Proxy 请求/响应类型（camelCase） ============

/** 后端 AI Proxy 请求体 */
interface ChatProxyRequest {
  provider: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  apiKey: string;
  stream?: boolean;
}

/** 后端 AI Proxy 响应中的 usage */
interface ProxyUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** 后端 AI Proxy 响应中的 choice */
interface ProxyChoice {
  index: number;
  message: { role: string; content: string };
  finishReason: string;
}

/** 后端 AI Proxy 响应 data */
interface ChatProxyResponseData {
  object: string;
  choices: ProxyChoice[];
  usage: ProxyUsage;
}

// ============ HMAC 签名鉴权工具类 ============

class ApiAuth {
  private appId: string;
  private hmacKey: string;

  /**
   * @param appId - 应用 ID
   * @param appSecretHash - 存储的密钥哈希值（64位十六进制），直接作为 HMAC 密钥使用
   */
  constructor(appId: string, appSecretHash: string) {
    this.appId = appId;
    this.hmacKey = appSecretHash; // 直接使用，不再哈希
  }

  /**
   * 生成签名请求头
   */
  generateHeaders(method: string, path: string, body: string = ''): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyMd5 = body
      ? CryptoJS.MD5(body).toString()
      : 'd41d8cd98f00b204e9800998ecf8427e';
    const signature = this.generateSignature(method, path, timestamp, bodyMd5);

    return {
      'X-App-Id': this.appId,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
      'Content-Type': 'application/json',
    };
  }

  /**
   * 生成 HMAC-SHA256 签名（Base64 编码）
   */
  private generateSignature(
    method: string,
    path: string,
    timestamp: string,
    bodyMd5: string,
  ): string {
    const signString = `${method}\n${path}\n${timestamp}\n${bodyMd5}`;
    return CryptoJS.HmacSHA256(signString, this.hmacKey).toString(CryptoJS.enc.Base64);
  }
}

// ============ 外部 API 服务 ============

const API_BASE_PATH = '/api/external/prompt-optimizer';
const REQUEST_TIMEOUT = 5000; // 5 秒超时，便于快速降级

class ExternalApiService {
  private httpClient: AxiosInstance;
  private auth: ApiAuth;
  private enabled: boolean;

  constructor() {
    this.enabled = import.meta.env.VITE_USE_REMOTE_CONFIG === 'true';

    const appId = import.meta.env.VITE_EXTERNAL_APP_ID || '';
    const appSecretHash = import.meta.env.VITE_EXTERNAL_APP_SECRET_HASH || '';
    const baseUrl = import.meta.env.VITE_EXTERNAL_API_BASE || '';

    if (!appId || !appSecretHash || !baseUrl) {
      console.warn(
        '[ExternalApi] 鉴权凭证或 API 地址未配置，将使用本地 JSON 配置。' +
        '\n  请在 .env 中设置 VITE_EXTERNAL_API_BASE、VITE_EXTERNAL_APP_ID、VITE_EXTERNAL_APP_SECRET_HASH',
      );
      this.enabled = false;
    }

    this.auth = new ApiAuth(appId, appSecretHash);

    this.httpClient = axios.create({
      baseURL: baseUrl,
      timeout: REQUEST_TIMEOUT,
    });
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 通用 GET 请求方法
   */
  private async request<T>(path: string): Promise<T[]> {
    const fullPath = `${API_BASE_PATH}${path}`;
    const headers = this.auth.generateHeaders('GET', fullPath);

    const response = await this.httpClient.get<ApiResponse<T[]>>(fullPath, { headers });

    if (response.data.code !== 200) {
      throw new Error(`External API Error [${response.data.code}]: ${response.data.msg}`);
    }

    return response.data.data;
  }

  /**
   * 通用 POST 请求方法（用于 AI Proxy 等写操作）
   */
  private async postRequest<T>(path: string, body: any): Promise<T> {
    const fullPath = `${API_BASE_PATH}${path}`;
    const bodyStr = JSON.stringify(body);
    const headers = this.auth.generateHeaders('POST', fullPath, bodyStr);

    const response = await this.httpClient.post<ApiResponse<T>>(fullPath, body, {
      headers,
      timeout: 60000, // AI 调用 60 秒超时
    });

    if (response.data.code !== 200) {
      throw new Error(`External API Error [${response.data.code}]: ${response.data.msg}`);
    }

    return response.data.data;
  }

  // ========== 5 个配置接口 ==========

  async getModels(): Promise<ModelConfig[]> {
    const data = await this.request<ApiModel>('/models');
    return data.map(transformModel);
  }

  async getDomains(): Promise<DomainConfig[]> {
    const data = await this.request<ApiDomain>('/domains');
    return data.map(transformDomain);
  }

  async getStrategies(): Promise<StrategyConfig[]> {
    const data = await this.request<ApiStrategy>('/strategies');
    return data.map(transformStrategy);
  }

  async getQualityRubrics(): Promise<QualityRubricConfig[]> {
    const data = await this.request<ApiQualityRubric>('/quality-rubrics');
    return data.map(transformQualityRubric);
  }

  async getOptimizationPrompts(): Promise<OptimizationPromptConfig[]> {
    const data = await this.request<ApiOptimizationPrompt>('/optimization-prompts');
    return data.map(transformOptimizationPrompt);
  }

  /**
   * 并行加载全部配置
   */
  async loadAllConfig(): Promise<{
    models: ModelConfig[];
    domains: DomainConfig[];
    strategies: StrategyConfig[];
    qualityRubric: QualityRubricConfig[];
    optimizationPrompts: OptimizationPromptConfig[];
  }> {
    const [models, domains, strategies, qualityRubric, optimizationPrompts] = await Promise.all([
      this.getModels(),
      this.getDomains(),
      this.getStrategies(),
      this.getQualityRubrics(),
      this.getOptimizationPrompts(),
    ]);

    return { models, domains, strategies, qualityRubric, optimizationPrompts };
  }

  // ========== AI Proxy 聊天接口 ==========

  /**
   * 通过后端 AI Proxy 发送聊天请求
   *
   * 请求体字段说明（camelCase，与后端一致）：
   * - provider: AI 提供商 (openai/qwen/minimax/zhipu/douyin)
   * - model: 模型名称
   * - messages: 消息列表 [{role, content}]
   * - temperature: 温度参数
   * - maxTokens: 最大 token 数
   * - topP: Top-P 采样
   * - apiKey: 上游 AI 的 API Key（代理模式，调用方传入）
   * - stream: 是否流式（当前后端仅支持 false）
   */
  async chatCompletions(params: {
    provider: string;
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    apiKey: string;
    stream?: boolean;
  }): Promise<ChatProxyResponseData> {
    const request: ChatProxyRequest = {
      provider: params.provider,
      model: params.model,
      messages: params.messages,
      apiKey: params.apiKey,
      stream: params.stream ?? false,
    };

    if (params.temperature !== undefined) {
      request.temperature = params.temperature;
    }
    if (params.maxTokens !== undefined) {
      request.maxTokens = params.maxTokens;
    }
    if (params.topP !== undefined) {
      request.topP = params.topP;
    }

    return this.postRequest<ChatProxyResponseData>('/ai-proxy/chat', request);
  }
}

export const externalApiService = new ExternalApiService();
