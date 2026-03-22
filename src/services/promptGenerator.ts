import type { ModelType, DomainType, DifficultyLevel, OutputFormat, GenerateRequest, Prompt } from '@/types';
import { MODEL_CHARACTERISTICS, DOMAIN_TEMPLATES } from '@/constants';

/**
 * 提示词生成服务
 * 根据用户输入和选择的模型，生成定制化的提示词
 */
export class PromptGeneratorService {
  /**
   * 生成提示词
   */
  generatePrompt(request: GenerateRequest): string {
    const model = MODEL_CHARACTERISTICS[request.model];
    const domain = DOMAIN_TEMPLATES[request.domain];

    // 根据模型特性调整提示词结构
    let prompt = this.buildPromptStructure(
      domain.base_template,
      request,
      model
    );

    // 添加模型特定的优化
    prompt = this.optimizeForModel(prompt, request.model);

    return prompt;
  }

  /**
   * 根据基础模板构建提示词
   */
  private buildPromptStructure(
    template: string,
    request: GenerateRequest,
    model: any
  ): string {
    const specialty = this.getSpecialty(request.domain, request.keywords);
    const tone = this.getToneDescription(request.domain);
    const length = this.getLengthHint(request.difficulty, request.domain);
    const planningPoints = this.getPlanningPoints(request.domain);

    let prompt = template
      .replace('{specialty}', specialty)
      .replace('{format}', this.getFormatDescription(request.outputFormat))
      .replace('{keywords}', request.keywords)
      .replace('{requirement}', request.requirement)
      .replace('{tone}', tone)
      .replace('{difficulty}', request.difficulty)
      .replace('{audience}', this.getAudience(request.domain))
      .replace('{length}', length)
      .replace('{planningPoints}', planningPoints);

    // 添加难度级别相关的指导
    prompt += `\n\n【难度等级】${request.difficulty}`;
    prompt += this.addDifficultyGuidance(request.difficulty);

    // 添加模型特定的优化建议
    prompt += `\n\n【针对 ${MODEL_CHARACTERISTICS[request.model].name} 的优化】`;
    prompt += this.getModelSpecificGuidance(request.model);

    return prompt;
  }

  /**
   * 根据模型类型优化提示词
   */
  private optimizeForModel(prompt: string, model: ModelType): string {
    switch (model) {
      case 'gpt-4':
      case 'gpt-3.5':
        return this.optimizeForGPT(prompt);
      case 'qwen':
        return this.optimizeForQwen(prompt);
      case 'minmax':
        return this.optimizeForMinMax(prompt);
      case 'zhipu':
        return this.optimizeForZhipu(prompt);
      case 'claude':
        return this.optimizeForClaude(prompt);
      case 'gemini':
        return this.optimizeForGemini(prompt);
      case 'local':
        return this.optimizeForLocal(prompt);
      default:
        return prompt;
    }
  }

  /**
   * GPT 模型优化
   */
  private optimizeForGPT(prompt: string): string {
    return ` ${prompt}`;
  }

  /**
   * 阿里云通义千问优化
   */
  private optimizeForQwen(prompt: string): string {
    return `你是一个专业的AI助手，能够帮助用户完成各种任务。

用户需求：
${prompt}

请根据以上需求提供高质量、全面的回答。`;
  }

  /**
   * MiniMax 优化
   */
  private optimizeForMinMax(prompt: string): string {
    return `请根据以下要求提供帮助：

${prompt}

请提供高质量、全面的回答。`;
  }

  /**
   * 智谱 ChatGLM 优化
   */
  private optimizeForZhipu(prompt: string): string {
    return `你是一个优秀的AI助手。

用户需求：
${prompt}

请根据以上需求提供高质量的回答。`;
  }

  /**
   * Claude 优化
   */
  private optimizeForClaude(prompt: string): string {
    return `${prompt}

Please provide a thoughtful and detailed response.`;
  }

  /**
   * Gemini 优化
   */
  private optimizeForGemini(prompt: string): string {
    return `${prompt}

Feel free to include multimodal elements in your response if relevant.`;
  }

  /**
   * 本地模型优化（简洁模式）
   */
  private optimizeForLocal(prompt: string): string {
    // 本地模型通常需要更简洁的指令
    const lines = prompt.split('\n').filter(line => line.trim());
    return lines.slice(0, 5).join('\n');
  }

  /**
   * 获取专长描述
   */
  private getSpecialty(domain: DomainType, keywords: string): string {
    const keywordArray = keywords.split(',').map(k => k.trim());
    return keywordArray[0] || domain;
  }

  /**
   * 获取格式描述
   */
  private getFormatDescription(format: OutputFormat): string {
    const descriptions = {
      detailed: '详细、深入的',
      concise: '简洁、要点清晰的',
      structured: '结构化、层次清晰的',
      creative: '创意性、创新性的',
    };
    return descriptions[format];
  }

  /**
   * 获取语气描述
   */
  private getToneDescription(domain: DomainType): string {
    const tones = {
      writing: '优雅、引人入胜',
      coding: '专业、准确',
      painting: '艺术性、视觉化',
      analysis: '数据驱动、客观',
      marketing: '说服力强、吸引眼球',
      learning: '教学性、循序渐进',
      business: '战略性、可行性强',
      smartTourism: '文化感、体验性强',
      scenicArea: '科学规划、生态友好',
      smartPark: '智能化、产业化',
      pet: '专业、关爱',
      dogVideo: '生动、有故事性',
      dogVideoGeneration: '技术性、AI导向',
    };
    return tones[domain];
  }

  /**
   * 获取规划要点
   */
  private getPlanningPoints(domain: DomainType): string {
    const planningPoints = {
      scenicArea: `- 场地空间规划与功能分区\n- 交通组织与游览动线设计\n- 核心景观节点布局\n- 生态环境与可持续发展`,
      smartPark: `- 智能化基础设施建设\n- 产业定位与空间布局\n- 服务平台体系搭建\n- 运营管理体系设计`,
      smartTourism: `- 文化主题与IP打造\n- 线上线下融合体验设计\n- 智能化服务系统规划\n- 营销推广策略制定`,
      business: `- 战略目标与路径规划\n- 组织架构与资源配置\n- 关键业务流程设计\n- 风险评估与应对措施`,
      marketing: `- 目标客群精准定位\n- 产品核心价值提炼\n- 营销渠道组合策略\n- 转化漏斗优化设计`,
      learning: `- 知识体系框架搭建\n- 学习路径科学设计\n- 实践案例精选安排\n- 评估反馈机制建立`,
      writing: `- 核心观点与论据梳理\n- 文章结构层次设计\n- 段落逻辑关系安排\n- 语言风格统一把握`,
      coding: `- 需求分析与技术选型\n- 架构设计原则确定\n- 模块划分与接口定义\n- 测试策略与质量保障`,
      painting: `- 创意概念与主题确定\n- 视觉风格与色彩方案\n- 构图布局与层次关系\n- 细节表现与技法运用`,
      analysis: `- 数据采集与清洗流程\n- 分析模型与方法选择\n- 可视化呈现设计\n- 结论提炼与洞察输出`,
      pet: `- 需求评估与方案制定\n- 实施步骤详细说明\n- 安全风险提醒\n- 效果评估与跟进建议`,
      dogVideo: `- 视频主题与故事线设计\n- 拍摄场景与镜头规划\n- 拍摄技术与器材建议\n- 剪辑节奏与特效处理`,
      dogVideoGeneration: `- 提示词工程化设计\n- 生成平台与工具选择\n- 参数配置与优化调试\n- 后期处理与质量提升`,
    };
    return planningPoints[domain] || `- 核心要素梳理\n- 逻辑结构设计\n- 实施步骤规划\n- 质量标准制定`;
  }

  /**
   * 获取目标受众
   */
  private getAudience(domain: DomainType): string {
    const audiences = {
      writing: '文学爱好者、一般读者',
      coding: '开发者、技术从业者',
      painting: '艺术家、设计师、创意工作者',
      analysis: '数据分析师、决策者',
      marketing: '营销专业人士、品牌方',
      learning: '学生、学习者',
      business: '管理者、决策层',
      smartTourism: '游客、旅游爱好者',
      scenicArea: '景区管理者、规划者',
      smartPark: '园区运营者、企业',
      pet: '宠物主人、宠物爱好者',
      dogVideo: '宠物视频创作者、观众',
      dogVideoGeneration: 'AI视频创作者、内容创作者',
    };
    return audiences[domain];
  }

  /**
   * 获取长度提示
   */
  private getLengthHint(difficulty: DifficultyLevel, domain: DomainType): string {
    const lengths = {
      basic: '500-1000 字',
      intermediate: '1000-2000 字',
      advanced: '2000-3500 字',
      expert: '3500 字以上',
    };
    return lengths[difficulty];
  }

  /**
   * 添加难度级别指导
   */
  private addDifficultyGuidance(difficulty: DifficultyLevel): string {
    const guidance = {
      basic: '\n- 使用易懂的语言\n- 包含基础概念解释\n- 避免复杂术语',
      intermediate: '\n- 平衡专业性和可读性\n- 包含一些高级概念\n- 提供实践例子',
      advanced: '\n- 假设读者有相关背景知识\n- 深入讨论复杂问题\n- 提供研究级别的内容',
      expert: '\n- 最高水平的专业内容\n- 包含前沿思想和观点\n- 适合专家级别的读者',
    };
    return guidance[difficulty];
  }

  /**
   * 获取模型特定的指导
   */
  private getModelSpecificGuidance(model: ModelType): string {
    const guidance = {
      'gpt-4': '\n- 充分利用多步推理能力\n- 可以处理复杂的上下文\n- 支持详细的系统提示',
      'gpt-3.5': '\n- 保持提示词简洁清晰\n- 使用明确的指令\n- 避免过度复杂的结构',
      qwen: '\n- 中文表达优化\n- 支持详细的上下文\n- 擅长知识整合',
      minmax: '\n- 快速推理模式\n- 适合实时应用\n- 保持指令直接有效',
      zhipu: '\n- 双语理解能力强\n- 适合长文本处理\n- 支持多轮对话优化',
      douyin: '\n- 中文能力强\n- 对话风格友好\n- 适合快速生成和优化',
      claude: '\n- 擅长长文本处理\n- 提供上下文和背景信息\n- 支持细致的推理步骤',
      gemini: '\n- 充分发挥多模态能力\n- 可以引入图像、视频等\n- 实时信息访问',
      local: '\n- 使用最简洁的指令\n- 明确的停止条件\n- 避免复杂嵌套结构',
    };
    return guidance[model] || '';
  }

  /**
   * 计算初步质量评分
   */
  calculateInitialScore(prompt: string, domain: DomainType, model: ModelType): number {
    let score = 0;

    // 长度评分
    const length = prompt.length;
    const characteristics = MODEL_CHARACTERISTICS[model];
    const [minLen, maxLen] = characteristics.ideal_length;

    if (length >= minLen && length <= maxLen) {
      score += 20;
    } else if (length >= minLen * 0.8 && length <= maxLen * 1.2) {
      score += 10;
    }

    // 结构评分
    if (prompt.includes('【') && prompt.includes('】')) score += 15;
    if (prompt.includes('请') || prompt.includes('需要') || prompt.includes('应该')) score += 10;
    if ((prompt.match(/\n/g) || []).length > 3) score += 10;

    // 内容评分
    if (prompt.includes('关键词') || prompt.includes('核心')) score += 10;
    if (prompt.includes('格式') || prompt.includes('输出')) score += 10;
    if (prompt.includes('要求') || prompt.includes('标准')) score += 10;

    // 模型特定评分
    if (prompt.includes(MODEL_CHARACTERISTICS[model].name)) score += 5;

    return Math.min(score, 100);
  }
}

export const promptGeneratorService = new PromptGeneratorService();
