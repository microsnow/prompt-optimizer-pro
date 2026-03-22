# PromptOptimizer Pro - 技能包

## 概述

**PromptOptimizer Pro** 是一个专业级的 AI 提示词生成、优化和管理平台。它通过智能的模型适配器和 API 集成，帮助用户快速生成高质量的提示词，并通过调用真实的大模型 API 进行自动优化。

**类型**: 独立应用 + 工具库  
**版本**: 1.0.0  
**维护者**: WorkBuddy Team  
**许可证**: MIT  

## 主要功能

### 1. 🎯 智能提示词生成
- **多模型支持**: 8 种主流模型（GPT、Claude、Gemini、通义千问、MiniMax、智谱、本地模型）
- **7 大领域**: 写作、编程、绘画、数据分析、营销、学习、商业
- **模型自适配**: 根据模型特性自动调整提示词结构
- **质量评分**: 自动评分和改进建议

### 2. 🔧 通过 API 的智能优化
- **OpenAI API**: 调用 GPT 进行优化
- **阿里云**: 通过通义千问进行优化
- **MiniMax**: 快速推理模式优化
- **智谱**: 精准的中文优化
- **多维度优化**: 清晰度、具体性、效率、创意性、精准度

### 3. 📋 完整的生命周期管理
- **本地保存**: 所有数据保存在本地
- **收藏管理**: 快速标记和分类
- **搜索筛选**: 强大的查询功能
- **批量导出**: 支持多种格式（JSON、CSV、Markdown）
- **版本追踪**: 记录优化历史

### 4. 🎨 专业的用户界面
- **现代设计**: 深色/浅色主题
- **响应式**: 桌面、平板、手机支持
- **实时反馈**: 操作即时响应
- **离线模式**: 基础功能无需网络

## 技术架构

```
前端框架: Vue 3 + TypeScript + Vite
状态管理: Pinia
API 调用: Axios
本地存储: localStorage + IndexedDB
桌面应用: Electron
打包工具: Electron Builder
```

### 项目结构

```
src/
├── components/          # Vue 组件
├── services/           # 业务逻辑层
│   ├── api.ts         # API 客户端
│   ├── promptGenerator.ts  # 生成引擎
│   └── storage.ts     # 本地存储
├── models/            # 数据模型
│   └── adapters/      # 模型适配器
├── stores/            # 状态管理
├── utils/             # 工具函数
├── types.ts           # TypeScript 类型
├── constants.ts       # 常量定义
└── App.vue            # 主应用
```

## 使用场景

### 场景 1: AI 工程师
快速生成和优化各种任务的提示词，提高工作效率

### 场景 2: 内容创作者
为文案、文章、创意等生成高质量的指引提示

### 场景 3: 开发者
为代码生成、算法解析等编程任务创建提示词

### 场景 4: 研究人员
构建标准化的提示词库，用于科研和分析

### 场景 5: 企业团队
建立组织级的提示词库和最佳实践

## 快速开始

### 安装

#### 从源码构建
```bash
# 克隆仓库
git clone https://github.com/promptoptimizer/pro.git
cd PromptOptimizer

# 安装依赖
npm install

# 开发模式
npm run electron-dev

# 构建可执行文件
npm run dist:win      # Windows
npm run dist:mac      # macOS
npm run dist:linux    # Linux
```

#### 使用预编译版本
- 下载 [GitHub Releases](https://github.com/promptoptimizer/pro/releases)
- 按系统选择对应版本
- 双击运行安装程序

### 配置 API

1. **打开设置** → ⚙️ 按钮
2. **输入 API 密钥**:
   - OpenAI: 从 https://platform.openai.com/api-keys 获取
   - 通义千问: 从 https://dashscope.console.aliyun.com/ 获取
   - MiniMax: 从 https://www.minimaxi.com/ 获取
   - 智谱: 从 https://open.bigmodel.cn/ 获取
3. **点击保存**

### 首次使用

1. 选择目标模型和领域
2. 输入关键词和需求
3. 点击"生成提示词"
4. 复制或保存结果

## 模型特性

### GPT-4
- **优势**: 最强大的推理能力
- **适用**: 复杂问题、创意任务、多步骤推理
- **长度**: 500-2000 字

### 通义千问
- **优势**: 中文理解最优
- **适用**: 中文内容、本地化需求
- **长度**: 500-2000 字

### MiniMax
- **优势**: 快速响应
- **适用**: 实时应用、低延迟需求
- **长度**: 400-1800 字

### 智谱 ChatGLM
- **优势**: 双语精准、开源
- **适用**: 学术、研究、精准分析
- **长度**: 600-2200 字

## API 参考

### PromptGeneratorService

```typescript
// 生成提示词
generatePrompt(request: GenerateRequest): string

// 计算质量评分
calculateInitialScore(
  prompt: string,
  domain: DomainType,
  model: ModelType
): number
```

### APIService

```typescript
// 初始化客户端
initOpenAI(apiKey: string): void
initQwen(apiKey: string): void
initMinMax(apiKey: string): void
initZhipu(apiKey: string): void

// 优化提示词
async optimizePrompt(
  prompt: string,
  strategy: string,
  provider: 'openai' | 'qwen' | 'minmax' | 'zhipu'
): Promise<APIResponse<string>>

// 分析质量
async analyzeQuality(
  prompt: string,
  provider: 'openai' | 'qwen' | 'minmax' | 'zhipu'
): Promise<APIResponse<any>>
```

### StorageService

```typescript
// 保存提示词
savePrompt(prompt: Prompt): void

// 获取提示词
getPrompts(): Prompt[]

// 搜索
searchPrompts(query: string): Prompt[]

// 导出
exportAsJSON(prompts?: Prompt[]): string
exportAsCSV(prompts?: Prompt[]): string
exportAsMarkdown(prompts?: Prompt[]): string
```

## 常见问题

### Q: 如何离线使用?
A: 基础的提示词生成功能不需要 API，可以完全离线使用。只有优化功能需要 API。

### Q: 数据会上传吗?
A: 否。所有数据保存在本地，不会上传到任何服务器。

### Q: 支持团队协作吗?
A: 当前版本支持导出/导入，可以通过文件共享进行协作。企业版计划支持云同步。

### Q: 可以自定义模型吗?
A: 支持。代码完全开源，可以添加自定义适配器。

### Q: 性能如何?
A: 本地生成<100ms，API 调用通常<5 秒，支持离线模式。

## 扩展和定制

### 添加新模型

1. 在 `src/types.ts` 中添加模型类型
2. 在 `src/constants.ts` 中添加模型特性
3. 在 `src/services/api.ts` 中添加客户端类
4. 在 `src/services/promptGenerator.ts` 中添加优化方法

### 添加新领域

1. 在 `types.ts` 中添加领域类型
2. 在 `constants.ts` 中添加领域模板
3. 在组件中注册选项

### 自定义优化策略

在 `src/constants.ts` 中修改 `OPTIMIZATION_STRATEGIES` 和 `AI_OPTIMIZATION_PROMPTS`

## 性能指标

- **启动时间**: <2 秒
- **提示词生成**: <100 毫秒
- **API 调用**: <5 秒
- **搜索响应**: <50 毫秒
- **内存使用**: <200 MB
- **磁盘占用**: ~100 MB

## 安全性

- ✅ 所有数据本地存储
- ✅ API 密钥加密保存
- ✅ 无网络数据传输（除 API 调用外）
- ✅ 代码完全开源，可审计
- ✅ 支持离线模式

## 更新日志

### v1.0.0 (2024-03-18)
- 🎉 初始发布
- ✅ 8 种模型支持
- ✅ 7 大领域覆盖
- ✅ 完整的生成和优化流程
- ✅ 本地保存和管理
- ✅ 跨平台桌面应用

## 支持和反馈

- 📧 Email: support@promptoptimizer.com
- 🐛 Issues: [GitHub](https://github.com/promptoptimizer/pro/issues)
- 💬 Discussions: [GitHub](https://github.com/promptoptimizer/pro/discussions)
- 🌐 Website: https://promptoptimizer.com

## 许可证

MIT License - 详见项目根目录 LICENSE 文件

## 贡献

欢迎提交 Pull Request 或报告 Issue！

---

**最后更新**: 2024-03-18  
**维护者**: WorkBuddy Team  
**社区**: 中文开发者社区
