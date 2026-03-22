import axios from 'axios';
import type { ModelCharacteristics, DomainType, ModelType, OptimizationStrategy } from '@/types';
import { externalApiService } from './externalApiService';

// 数组格式的接口定义
export interface ModelConfig {
  id: number;
  model_id: string;
  name: string;
  description: string;
  ideal_length: [number, number];
  tone: string;
  structure_preference: string;
  max_api_calls_per_minute: number;
  supports_system_prompt: boolean;
  supports_multimodal: boolean;
  enabled: boolean;
}

export interface DomainConfig {
  id: number;
  domain_id: string;
  name: string;
  keywords: string[];
  tips: string;
  base_template: string;
}

export interface StrategyConfig {
  id: number;
  strategy_id: string;
  name: string;
  icon: string;
  description: string;
  focus: string;
}

export interface QualityRubricConfig {
  id: number;
  rubric_id: string;
  name: string;
  weight: number;
  criteria: string[];
}

export interface OptimizationPromptConfig {
  id: number;
  prompt_id: string;
  content: string;
}

export interface ConfigData {
  models: ModelConfig[];
  domains: DomainConfig[];
  strategies: StrategyConfig[];
  qualityRubric: QualityRubricConfig[];
  optimizationPrompts: OptimizationPromptConfig[];
}

class ConfigService {
  private config: ConfigData | null = null;
  private isInitialized = false;
  private readonly baseUrl = '/config';

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {

      let configData: ConfigData | null = null;

      // 优先尝试从远程 API 加载
      if (externalApiService.isEnabled()) {
        try {
          configData = await externalApiService.loadAllConfig();
        } catch (error) {
          console.warn('[ConfigService] 远程 API 加载失败，降级到本地 JSON:', error);
          configData = null;
        }
      }

      // 降级: 从本地静态 JSON 加载
      if (!configData) {
        console.log('[ConfigService] 从本地 JSON 加载配置...');
        const [models, domains, strategies, qualityRubric, optimizationPrompts] = await Promise.all([
          this.fetchConfig<ModelConfig[]>('models.json'),
          this.fetchConfig<DomainConfig[]>('domains.json'),
          this.fetchConfig<StrategyConfig[]>('strategies.json'),
          this.fetchConfig<QualityRubricConfig[]>('quality-rubric.json'),
          this.fetchConfig<OptimizationPromptConfig[]>('optimization-prompts.json')
        ]);

        configData = {
          models: models.data,
          domains: domains.data,
          strategies: strategies.data,
          qualityRubric: qualityRubric.data,
          optimizationPrompts: optimizationPrompts.data
        };
      }

      this.config = configData;
      this.isInitialized = true;
      console.log('配置数据加载完成', this.config);
    } catch (error) {
      console.error('配置数据加载失败:', error);
      throw error;
    }
  }

  private async fetchConfig<T>(endpoint: string): Promise<{ success: boolean; data: T }> {
    try {
      const response = await axios.get(`${this.baseUrl}/${endpoint}`);
      return response.data;
    } catch (error) {
      console.error(`加载配置 ${endpoint} 失败:`, error);
      throw error;
    }
  }

  getConfig(): ConfigData {
    if (!this.config) {
      throw new Error('配置数据未初始化，请先调用 init() 方法');
    }
    return this.config;
  }

  // ============ 模型相关 ============

  getModels(): ModelConfig[] {
    return this.getConfig().models;
  }

  getEnabledModels(): ModelConfig[] {
    return this.getModels().filter(model => model.enabled);
  }

  getEnabledModelIds(): ModelType[] {
    return this.getEnabledModels().map(model => model.model_id as ModelType);
  }

  getModelByNumericId(id: number): ModelConfig | undefined {
    return this.getModels().find(model => model.id === id);
  }

  getModelByModelId(modelId: string): ModelConfig | undefined {
    return this.getModels().find(model => model.model_id === modelId);
  }

  getModelCharacteristics(modelId: string): ModelCharacteristics {
    const model = this.getModelByModelId(modelId);
    if (!model) {
      throw new Error(`模型 ${modelId} 不存在`);
    }
    return {
      name: model.name,
      description: model.description,
      ideal_length: model.ideal_length,
      tone: model.tone,
      structure_preference: model.structure_preference,
      max_api_calls_per_minute: model.max_api_calls_per_minute,
      supports_system_prompt: model.supports_system_prompt,
      supports_multimodal: model.supports_multimodal
    };
  }

  // ============ 领域相关 ============

  getDomains(): DomainConfig[] {
    return this.getConfig().domains;
  }

  getDomainList(): DomainType[] {
    return this.getDomains().map(domain => domain.domain_id as DomainType);
  }

  getDomainByNumericId(id: number): DomainConfig | undefined {
    return this.getDomains().find(domain => domain.id === id);
  }

  getDomainByDomainId(domainId: string): DomainConfig | undefined {
    return this.getDomains().find(domain => domain.domain_id === domainId);
  }

  getDomainInfo(domainId: DomainType): any {
    const domain = this.getDomainByDomainId(domainId);
    if (!domain) {
      throw new Error(`领域 ${domainId} 不存在`);
    }
    return domain;
  }

  // ============ 策略相关 ============

  getStrategies(): StrategyConfig[] {
    return this.getConfig().strategies;
  }

  getStrategyList(): OptimizationStrategy[] {
    return this.getStrategies().map(strategy => strategy.strategy_id as OptimizationStrategy);
  }

  getStrategyByNumericId(id: number): StrategyConfig | undefined {
    return this.getStrategies().find(strategy => strategy.id === id);
  }

  getStrategyByStrategyId(strategyId: string): StrategyConfig | undefined {
    return this.getStrategies().find(strategy => strategy.strategy_id === strategyId);
  }

  getStrategyInfo(strategyId: OptimizationStrategy): any {
    const strategy = this.getStrategyByStrategyId(strategyId);
    if (!strategy) {
      throw new Error(`策略 ${strategyId} 不存在`);
    }
    return strategy;
  }

  // ============ 质量评分相关 ============

  getQualityRubric(): QualityRubricConfig[] {
    return this.getConfig().qualityRubric;
  }

  // ============ 优化提示相关 ============

  getOptimizationPrompts(): OptimizationPromptConfig[] {
    return this.getConfig().optimizationPrompts;
  }

  getOptimizationPrompt(strategyId: OptimizationStrategy): string {
    const prompt = this.getOptimizationPrompts().find(p => p.prompt_id === strategyId);
    if (!prompt) {
      throw new Error(`策略 ${strategyId} 的优化提示不存在`);
    }
    return prompt.content;
  }

  // ============ 状态相关 ============

  isInitializedStatus(): boolean {
    return this.isInitialized;
  }

  // 重新加载配置
  async reload(): Promise<void> {
    this.isInitialized = false;
    this.config = null;
    await this.init();
  }
}

export const configService = new ConfigService();