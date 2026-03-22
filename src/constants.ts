import type { ModelType, DomainType, ModelCharacteristics } from '@/types';

// 模型特性配置库
export const MODEL_CHARACTERISTICS: Record<ModelType, ModelCharacteristics> = {
  'gpt-4': {
    name: 'GPT-4',
    description: '最强大的通用模型，适合复杂任务',
    ideal_length: [500, 2000],
    tone: '指令式、任务导向',
    structure_preference: 'System Prompt + User Message',
    max_api_calls_per_minute: 3500,
    supports_system_prompt: true,
    supports_multimodal: true,
  },
  'gpt-3.5': {
    name: 'GPT-3.5-Turbo',
    description: '快速且成本效益高的模型',
    ideal_length: [300, 1500],
    tone: '指令式、简洁',
    structure_preference: 'Role + Task',
    max_api_calls_per_minute: 3500,
    supports_system_prompt: true,
    supports_multimodal: false,
  },
  claude: {
    name: 'Claude',
    description: '对话能力强，适合长文本处理',
    ideal_length: [800, 3000],
    tone: '对话式、解释性',
    structure_preference: ' Context + Instruction',
    max_api_calls_per_minute: 2000,
    supports_system_prompt: false,
    supports_multimodal: false,
  },
  gemini: {
    name: 'Gemini',
    description: '多模态能力强，适合视觉任务',
    ideal_length: [1000, 3000],
    tone: '灵活、多模态友好',
    structure_preference: 'Rich Content + Instruction',
    max_api_calls_per_minute: 5000,
    supports_system_prompt: false,
    supports_multimodal: true,
  },
  qwen: {
    name: '阿里云·通义千问',
    description: '国产领先模型，中文理解能力强',
    ideal_length: [500, 2000],
    tone: '灵活、中文友好',
    structure_preference: 'Context + Instruction',
    max_api_calls_per_minute: 5000,
    supports_system_prompt: true,
    supports_multimodal: true,
  },
  minmax: {
    name: '稀宝·MiniMax',
    description: '高效推理，适合实时应用',
    ideal_length: [400, 1800],
    tone: '指令式、快速响应',
    structure_preference: 'Prompt + Context',
    max_api_calls_per_minute: 4000,
    supports_system_prompt: true,
    supports_multimodal: false,
  },
  zhipu: {
    name: '智谱·ChatGLM',
    description: '开源模型，双语理解优秀',
    ideal_length: [600, 2200],
    tone: '对话式、精准回答',
    structure_preference: 'System Role + History + Input',
    max_api_calls_per_minute: 3000,
    supports_system_prompt: true,
    supports_multimodal: false,
  },
  douyin: {
    name: '字节豆包',
    description: '字节跳动AI助手，中文能力强',
    ideal_length: [500, 2000],
    tone: '友好、实用',
    structure_preference: 'System + User Message',
    max_api_calls_per_minute: 5000,
    supports_system_prompt: true,
    supports_multimodal: false,
  },
  local: {
    name: '本地模型',
    description: '离线运行，隐私保护',
    ideal_length: [200, 800],
    tone: '简洁、直接',
    structure_preference: 'Direct Instruction',
    max_api_calls_per_minute: 999999,
    supports_system_prompt: false,
    supports_multimodal: false,
  },
};

// 领域模板配置
export const DOMAIN_TEMPLATES: Record<DomainType, any> = {
  writing: {
    name: '📝 写作',
    keywords: ['文章', '小说', '文案', '博客', '诗歌', '脚本'],
    tips: '提供写作风格、目标受众、字数限制等信息',
    base_template: `你是一位专业的{specialty}写手。
请为以下需求创建{format}的内容：

【关键词】{keywords}
【目标受众】{audience}
【核心需求】{requirement}
【写作风格】{tone}
【字数限制】{length}

请确保内容：
- 原创且引人入胜
- 符合目标受众的偏好
- 逻辑清晰，层次分明
- 包含具体例子或数据支撑`,
  },
  coding: {
    name: '💻 编程',
    keywords: ['Python', '算法', '调试', '优化', '设计模式', 'API', 'Web'],
    tips: '说明编程语言、问题类型、难度等级',
    base_template: `你是{specialty}领域的资深开发者。
请为以下问题提供{format}的代码解决方案：

【技术栈】{keywords}
【具体问题】{requirement}
【难度等级】{difficulty}
【代码质量标准】
- 高效且可维护
- 包含详细注释
- 遵循最佳实践
- 有错误处理

请提供完整的代码示例和解释。`,
  },
  painting: {
    name: '🎨 绘画',
    keywords: ['风格', '色彩', '构图', '光影', '细节', '主题'],
    tips: '描述艺术风格、主题、氛围、技术要求',
    base_template: `你是专业的{specialty}艺术指导。
请创建{format}的视觉描述：

【视觉元素】{keywords}
【艺术风格】{tone}
【核心主题】{requirement}
【技术要求】
- 专业级细节描述
- 考虑光影和色彩
- 包含构图建议
- 参考风格清晰

请提供详细的创意描述。`,
  },
  analysis: {
    name: '📊 数据分析',
    keywords: ['数据清洗', '可视化', '统计', '预测', '报告'],
    tips: '说明数据类型、分析目标、工具偏好',
    base_template: `你是数据科学家，进行{specialty}分析。
请提供{format}的分析方案：

【数据维度】{keywords}
【核心目标】{requirement}
【分析方法】{difficulty}
【交付格式】
- 数据清洗步骤
- 可视化图表
- 统计结论
- 业务洞察

请提供完整的分析框架。`,
  },
  marketing: {
    name: '📢 营销',
    keywords: ['文案', '策略', '品牌', '用户', '转化', '社媒'],
    tips: '描述目标市场、产品特点、营销渠道',
    base_template: `你是{specialty}营销专家。
请创建{format}的营销内容：

【目标受众】{keywords}
【产品/服务】{requirement}
【营销目标】{tone}
【渠道策略】
- 内容调性清晰
- 包含行动号召
- 数据驱动建议
- 可测量目标

请提供完整的营销方案。`,
  },
  learning: {
    name: '🎓 学习',
    keywords: ['教学', '概念', '练习', '评估', '进度'],
    tips: '说明学科、学习水平、学习目标',
    base_template: `你是耐心的{specialty}教育工作者。
请创建{format}的学习材料：

【学科内容】{keywords}
【学习目标】{requirement}
【学习水平】{difficulty}
【教学要求】
- 概念讲解循序渐进
- 包含实践练习
- 有评估题目
- 鼓励思考

请提供完整的学习方案。`,
  },
  business: {
    name: '💼 商业',
    keywords: ['战略', '流程', '管理', '决策', '沟通'],
    tips: '描述业务背景、目标、利益相关者',
    base_template: `你是{specialty}业务顾问。
请提供{format}的解决方案：

【业务背景】{keywords}
【核心问题】{requirement}
【目标结果】{tone}
【方案特点】
- 战略清晰
- 可行性强
- 包含执行步骤
- 风险考虑

请提供完整的业务方案。`,
  },
  smartTourism: {
    name: '🏞️ 智慧文旅',
    keywords: ['景点介绍', '旅游攻略', '文化活动', '导游解说', '旅游路线', '体验设计'],
    tips: '描述旅游主题、目标客群、体验亮点',
    base_template: `你是专业的{specialty}文旅策划师。
请创建{format}的文旅内容：

【旅游主题】{keywords}
【核心需求】{requirement}
【目标游客】{audience}
【内容要求】
- 文化内涵丰富
- 特色突出鲜明
- 实用指导性强
- 体验感描述生动

请提供完整的文旅方案。`,
  },
  scenicArea: {
    name: '🏔️ 景区建设',
    keywords: ['规划设计', '基础设施', '游览动线', '景观打造', '配套服务', '运营管理'],
    tips: '说明景区类型、建设目标、资源条件',
    base_template: `你是{specialty}景区规划专家。
请提供{format}的建设方案：

【景区类型】{keywords}
【建设目标】{requirement}
【规划要点】{planningPoints}
【方案重点】
- 整体规划科学
- 游览体验优化
- 基础设施完善
- 环境保护协调

请提供完整的景区建设方案。`,
  },
  smartPark: {
    name: '🏢 智慧园区',
    keywords: ['园区管理', '智能化系统', '产业布局', '企业服务', '园区运营', '数字化转型'],
    tips: '描述园区定位、产业方向、管理需求',
    base_template: `你是{specialty}园区运营专家。
请创建{format}的园区方案：

【园区定位】{keywords}
【核心需求】{requirement}
【服务对象】{audience}
【方案特点】
- 智能化管理
- 产业配套完善
- 企业服务贴心
- 运营模式创新

请提供完整的智慧园区方案。`,
  },
  pet: {
    name: '🐾 宠物',
    keywords: ['宠物护理', '行为训练', '健康管理', '营养饮食', '美容清洁', '疾病预防', '疫苗接种', '驱虫护理', '宠物心理', '互动游戏'],
    tips: '说明宠物类型(猫/狗等)、具体需求(护理/训练/医疗等)、宠物年龄和健康状况',
    base_template: `你是专业的{specialty}宠物护理专家。
请为以下需求创建{format}的{keywords}内容：

【宠物类型】{petType}
【宠物年龄】{petAge}
【核心需求】{requirement}
【健康状况】{healthStatus}
【特殊情况】{specialCondition}
【内容要求】
- 科学依据充分,符合宠物习性
- 操作步骤清晰易懂
- 包含安全注意事项
- 提供专业建议和实用技巧
- 考虑不同品种的差异性
- 关注宠物心理和情感需求

请提供完整的专业方案。如涉及医疗问题,请标注必要时需要就医。`,
  },
  dogVideo: {
    name: '📹 狗狗视频',
    keywords: ['视频拍摄', '镜头角度', '低视角拍摄', '光线运用', '宠物特写', '慢动作', '人宠互动', '环境空镜', '视频剪辑', '配乐音效'],
    tips: '说明视频类型(Vlog/短片/教程等)、拍摄场景(室内/户外等)、视频风格(温馨/搞笑/纪实等)',
    base_template: `你是专业的{specialty}宠物视频创作专家。
请为以下需求创建{format}的狗狗视频{keywords}方案：

【视频类型】{videoType}
【拍摄场景】{scene}
【视频风格】{videoStyle}
【核心需求】{requirement}
【狗狗特征】{dogFeatures}
【时长要求】{duration}

【拍摄要点建议】
1. 主题锁定: 聚焦狗狗的"天性",捕捉最自然、最真实的状态
2. 视角选择: 采用低角度拍摄,与狗狗眼睛平齐,记录细腻表情
3. 环境营造: 巧用环境空镜,拍摄阳光、玩具、场景细节营造氛围
4. 互动注入: 加强人宠互动画面,传递情感温度
5. 光线运用: 优先使用自然光,清晨或黄昏时光线最佳
6. 镜头稳定: 使用稳定器或三脚架,确保画面流畅稳定
7. 声音处理: 添加合适的背景音乐和狗狗真实声音,增强趣味性

【内容要求】
- 视频结构清晰,有故事性
- 画面质量高,色彩饱满
- 剪辑节奏恰当,时长合理
- 突出狗狗的可爱、活泼、聪明等特质
- 包含拍摄器材建议和技术参数

请提供完整的狗狗视频创作方案,包括前期策划、拍摄要点和后期剪辑建议。`,
  },
  dogVideoGeneration: {
    name: '🎬 狗狗视频生成',
    keywords: ['文生视频', '图生视频', 'AI提示词', '视频生成模型', 'Sora', '可灵AI', '即梦AI', 'Runway', '提示词工程', '视频后期'],
    tips: '说明生成方式(文生/图生/图文结合)、视频平台(Sora/可灵/即梦/Runway等)、视频风格(写实/卡通/拟人化等)',
    base_template: `你是专业的{specialty}AI狗狗视频生成专家。
请为以下需求创建{format}的狗狗视频{keywords}生成方案：

【生成方式】{generationMode}
【使用平台】{platform}
【视频风格】{videoStyle}
【核心需求】{requirement}
【狗狗特征】{dogFeatures}
【视频时长】{duration}

【AI视频生成提示词构建公式】
基础公式: 主体 + 主体描述 + 运动 + 场景 + 场景描述 + 镜头语言 + 光影 + 风格 + 参数设定

【提示词编写要点】
1. 主体描述: 狗狗品种、毛色、体型、表情、姿态等细节
   示例: "金毛犬,金色毛发,微笑表情,尾巴摇摆"

2. 运动描述: 动作状态不宜过于复杂,符合视频时长
   示例: "在草地上奔跑、跳跃、叼球"

3. 场景描述: 前景、背景等环境细节
   示例: "阳光明媚的公园,绿草地,远处有树木"

4. 镜头语言: 运镜方式、角度、景深等
   示例: "低角度拍摄,缓慢推进,背景虚化"

5. 光影氛围: 光线类型、氛围营造
   示例: "夕阳金光,柔和光影,温馨氛围"

6. 风格设定: 画面风格、色调等
   示例: "高清8K,电影质感,暖色调"

【推荐平台与工具】
- 可灵AI: 免费或低成本,支持图生视频和文生视频
- 即梦AI: 一键动画化,适合图生视频
- Runway: 专业级视频生成,支持多种运镜效果
- Sora: OpenAI视频生成,高质量长视频
- LiblibAI: 文生视频平台,5-15秒短视频

【生成流程建议】
1. 方案A: 文生视频 → 后期剪辑
   - 直接输入详细提示词生成完整视频
   - 使用剪映等工具添加字幕、配音、特效

2. 方案B: 图生视频 → 拼接剪辑
   - 用AI绘画工具(如可灵)生成系列图片
   - 上传至视频生成工具制作动态片段
   - 使用剪映拼接、剪辑、添加后期效果

3. 方案C: 图文结合 → 高质量生成
   - 上传参考图片配合文字提示词
   - 精准控制角色一致性
   - 多次生成选择最佳效果

【参数配置建议】
- 视频时长: 3-15秒(平台限制不同)
- 分辨率: 1080P或更高
- 帧率: 24fps或60fps
- 运动幅度: 20%-30%之间,确保自然不失真
- 动画时长: 6-8秒最佳,匹配短视频节奏

【优化技巧】
- 提示词越详细,生成效果越好
- 批量生成多个版本,择优选择
- 使用负向提示词排除不想要元素(如"模糊、低质量")
- 多次调试参数,确保画面自然流畅

请提供完整的狗狗视频生成方案,包括提示词编写、平台选择、参数配置和后期优化建议。`,
  },
};

// 优化策略配置
export const OPTIMIZATION_STRATEGIES = {
  clarity: {
    name: '清晰度',
    icon: '✨',
    description: '确保每个句子只表达一个概念，避免含糊其辞',
    focus: '简化语言，明确表达',
  },
  specificity: {
    name: '具体性',
    icon: '🎯',
    description: '用具体例子替代抽象表述，明确数值和范围',
    focus: '添加具体例子和指标',
  },
  efficiency: {
    name: '效率',
    icon: '⚡',
    description: '删除冗余部分，强调核心信息，缩短长度',
    focus: '简化表述，删除冗余',
  },
  creativity: {
    name: '创意性',
    icon: '💡',
    description: '添加创意角度，鼓励创新思维，增加表达多样性',
    focus: '增加创意维度',
  },
  precision: {
    name: '精准度',
    icon: '🎲',
    description: '使用专业术语，确保技术准确性，明确目标',
    focus: '提高专业性',
  },
};

// 质量评分标准
export const QUALITY_SCORE_RUBRIC = {
  clarity: {
    weight: 0.2,
    criteria: [
      '语言是否清晰易懂',
      '是否避免了歧义',
      '句子结构是否简洁',
    ],
  },
  specificity: {
    weight: 0.2,
    criteria: [
      '是否包含具体例子',
      '是否明确了数值范围',
      '是否有具体指标',
    ],
  },
  completeness: {
    weight: 0.2,
    criteria: [
      '是否包含所有必要信息',
      '是否覆盖了预期输出',
      '是否提供了背景信息',
    ],
  },
  structure: {
    weight: 0.2,
    criteria: [
      '组织结构是否清晰',
      '是否使用了逻辑层次',
      '是否易于理解',
    ],
  },
  executability: {
    weight: 0.2,
    criteria: [
      '是否能直接使用',
      '是否提供了实施步骤',
      '是否包含必要的格式要求',
    ],
  },
};

// 默认 AI 优化提示
export const AI_OPTIMIZATION_PROMPTS = {
  clarity: `请改进以下提示词的清晰度。目标是确保每个句子只表达一个概念，避免含糊其辞。

提示词：
{prompt}

请提供改进的版本，并说明你做的主要调整。`,
  
  specificity: `请改进以下提示词的具体性。目标是用具体例子替代抽象表述，明确数值和范围。

提示词：
{prompt}

请提供改进的版本，添加具体例子和指标。`,
  
  efficiency: `请优化以下提示词的效率。目标是删除冗余部分，强调核心信息，使其更简洁。

提示词：
{prompt}

请提供改进的版本，说明删除的冗余部分。`,
  
  creativity: `请增强以下提示词的创意性。目标是添加创意角度，鼓励创新思维。

提示词：
{prompt}

请提供改进的版本，说明添加的创意维度。`,
  
  precision: `请提高以下提示词的精准度。目标是使用专业术语，确保技术准确性。

提示词：
{prompt}

请提供改进的版本，说明提高的精准度。`,
};
