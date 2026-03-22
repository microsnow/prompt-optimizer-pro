// 模型类型
export type ModelType = 'gpt-4' | 'gpt-3.5' | 'claude' | 'gemini' | 'qwen' | 'minmax' | 'zhipu' | 'douyin' | 'local';
export type DomainType = 'writing' | 'coding' | 'painting' | 'analysis' | 'marketing' | 'learning' | 'business' | 'smartTourism' | 'scenicArea' | 'smartPark' | 'pet' | 'dogVideo' | 'dogVideoGeneration';
export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced' | 'expert';
export type OutputFormat = 'detailed' | 'concise' | 'structured' | 'creative';
export type OptimizationStrategy = 'clarity' | 'specificity' | 'efficiency' | 'creativity' | 'precision';

// 提示词接口
export interface Prompt {
  id: string;
  content: string;
  domain: DomainType;
  model: ModelType;
  keywords: string[];
  difficulty: DifficultyLevel;
  outputFormat: OutputFormat;
  quality_score: number;
  created_at: number;
  updated_at: number;
  tags: string[];
  starred: boolean;
  notes: string;
}

// 优化历史
export interface OptimizationHistory {
  id: string;
  original_prompt: string;
  optimized_prompt: string;
  strategy: OptimizationStrategy[];
  model_used: 'openai' | 'aliyun' | 'comparison';
  timestamp: number;
  improvement_score: number;
  changes: string[];
}

// API 配置
export interface APIConfig {
  openai_key: string;
  aliyun_key: string;
  openai_base_url?: string;
  aliyun_base_url?: string;
}

// 生成请求
export interface GenerateRequest {
  keywords: string;
  requirement: string;
  domain: DomainType;
  model: ModelType;
  difficulty: DifficultyLevel;
  outputFormat: OutputFormat;
}

// 优化请求
export interface OptimizeRequest {
  prompt: string;
  strategies: OptimizationStrategy[];
  model: 'openai' | 'aliyun' | 'comparison';
  targetModel?: ModelType;
}

// API 响应
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 质量评分结果
export interface QualityScore {
  overall: number;
  clarity: number;
  specificity: number;
  completeness: number;
  structure: number;
  executability: number;
  suggestions: string[];
}

// 模型特性
export interface ModelCharacteristics {
  name: string;
  description: string;
  ideal_length: [number, number];
  tone: string;
  structure_preference: string;
  max_api_calls_per_minute: number;
  supports_system_prompt: boolean;
  supports_multimodal: boolean;
}
