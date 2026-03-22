# PromptOptimizer Pro 🚀

AI 提示词生成、优化和管理平台 - 支持多个国产和国际顶级大模型

## ✨ 核心特性

### 🎯 智能生成
- **多模型支持**: GPT-4、GPT-3.5、通义千问、MiniMax、智谱、字节豆包、Claude、Gemini、本地模型
- **7 大领域**: 写作、编程、绘画、数据分析、营销、学习、商业
- **4 个难度级别**: 基础、中级、高级、专家
- **模型自适配**: 根据选定模型自动调整提示词结构和语言风格

### 🔧 智能优化
- **通过 API 优化**: 调用真实大模型进行提示词优化
- **多维度优化**: 清晰度、具体性、效率、创意性、精准度
- **实时对比**: 查看优化前后的详细对比
- **质量评分**: 自动评分和改进建议

### 📋 完整管理
- **本地保存**: 所有数据保存在本地，隐私保护
- **收藏标记**: 快速标记重要提示词
- **搜索筛选**: 按领域、关键词、模型快速查找
- **批量导出**: 支持 JSON、CSV、Markdown 格式导出
- **版本追踪**: 记录优化历史和改进建议

### 🎨 用户体验
- **深色/浅色主题**: 支持系统主题自适应
- **响应式设计**: 桌面、平板、手机完美适配
- **实时反馈**: 操作结果即时显示
- **离线可用**: 仅需配置 API 密钥，可完全离线使用

## 🚀 快速开始

## 🔗 代理服务器使用说明

### 📋 代理服务器概述

代理服务器 (`src/server/api-proxy.js`) 是解决前端跨域问题和安全管理 API 密钥的核心组件：

- **解决 CORS 问题**：允许前端安全调用第三方 AI API
- **安全管理密钥**：API 密钥存储在服务器端，不暴露给浏览器
- **统一 API 格式**：将所有 AI 提供商的 API 统一为 OpenAI 格式
- **日志记录**：完整的请求日志和错误追踪

### 🛠️ 启动代理服务器

1. **安装依赖**（如果还没安装）：
```bash
npm install express cors axios
```

2. **启动服务器**：
```bash
# 方式 1：直接运行 JavaScript 版本
node src/server/api-proxy.js

# 方式 2：使用 npm 脚本（推荐）
npm run proxy

# 方式 3：开发模式（带热重载）
npm run proxy:dev
```

3. **验证启动**：
服务器将在 `http://localhost:3001` 启动，访问 `http://localhost:3001/health` 检查健康状态。

### ⚙️ 环境配置

创建 `.env` 文件配置代理服务器：

```env
# 服务器端口（默认 3001）
PORT=3001

# 运行环境
NODE_ENV=development

# 允许的跨域源（逗号分隔）
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,file://

# 日志级别
LOG_LEVEL=INFO
```

### 📡 API 端点说明

#### 主端点（OpenAI 格式）
```
POST /v1/chat/completions
```

**请求格式**：
```json
{
  "provider": "openai|qwen|minimax|zhipu|douyin",
  "model": "gpt-3.5-turbo|qwen-turbo|...",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "top_p": 1,
  "apiKey": "your-api-key",
  "stream": false
}
```

**响应格式**（OpenAI 标准）：
```json
{
  "object": "chat.completion",
  "choices": [{
    "message": {"role": "assistant", "content": "..."},
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

#### 兼容端点（向后兼容）
```
POST /api/proxy/:provider/:endpoint
POST /proxy/:provider/:endpoint
```

#### 其他端点
- `GET /health` - 健康检查
- `GET /logs` - 查看最近日志

### 💡 使用示例

#### 基本请求
```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "qwen",
    "model": "qwen-turbo",
    "messages": [{"role": "user", "content": "你好"}],
    "apiKey": "your-qwen-api-key"
  }'
```

#### 流式响应
```json
{
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "messages": [{"role": "user", "content": "写一首诗"}],
  "apiKey": "your-openai-key",
  "stream": true
}
```

### 🔍 日志查看

访问 `http://localhost:3001/logs` 查看最近的请求日志，包括：
- 请求时间和持续时间
- API 提供商和模型
- 成功/失败状态
- 错误详情

### ⚠️ 注意事项

- **端口冲突**：确保 3001 端口未被占用
- **API 密钥安全**：永远不要在前端代码中硬编码 API 密钥
- **防火墙**：如果无法访问，确保防火墙允许 3001 端口
- **并发限制**：注意各 AI 提供商的 API 速率限制

## 🔑 API 配置指南

### OpenAI
```
网址: https://platform.openai.com/api-keys
1. 登录 OpenAI 账户
2. 点击 "Create new secret key"
3. 复制密钥到应用设置
```

### 阿里云通义千问
```
网址: https://dashscope.console.aliyun.com/
1. 登录阿里云账户
2. 创建 API 密钥
3. 复制到应用设置
```

### 稀宝 MiniMax
```
网址: https://www.minimaxi.com/
1. 注册账户
2. 创建 API 密钥
3. 复制到应用设置
```

### 智谱 ChatGLM
```
网址: https://open.bigmodel.cn/
1. 登录智谱账户
2. 创建 API 密钥
3. 复制到应用设置
```

### 字节豆包
```
网址: https://www.doubao.com/
1. 登录字节跳动账户
2. 创建 API 密钥（在控制面板）
3. 复制到应用设置
```

## 📚 使用示例

### 示例 1: 生成技术文章提示词
```
模型: GPT-3.5
领域: 写作
关键词: Python, 数据处理, 最佳实践
难度: 中级
需求: 写一篇关于 Python 数据处理的技术文章，目标受众是初级开发者
输出格式: 详细

结果: 系统会生成针对 GPT-3.5 优化的提示词
```

### 示例 2: 优化已有提示词
```
粘贴你的提示词
选择: 清晰度 + 具体性 优化
选择模型: 通义千问
点击优化

结果: 获得改进版本和详细的改进说明
```

## 🎯 最佳实践

### 提示词生成
1. **明确关键词** - 使用 3-5 个相关的关键词
2. **详细描述** - 提供足够的背景信息和上下文
3. **选择合适的难度** - 根据目标受众调整
4. **指定输出格式** - 确保得到所需的形式

### 提示词优化
1. **选择相关策略** - 根据优化目标选择 1-2 个主要策略
2. **选择目标模型** - 用目标模型优化提示词
3. **迭代优化** - 根据结果进一步优化
4. **保存历史** - 保存各个版本便于对比

### API 使用
1. **合理使用** - 注意 API 调用频率限制
2. **监控成本** - 跟踪 API 使用情况
3. **备用方案** - 配置多个 API 提供商
4. **隐私保护** - 避免在提示词中包含敏感信息

## 🔒 隐私和安全

- ✅ **本地存储**: 所有数据保存在本地硬盘
- ✅ **无云同步**: 不上传数据到任何云服务
- ✅ **加密存储**: API 密钥采用加密方式存储
- ✅ **开源透明**: 代码完全开源，可审计

## 📊 支持的模型特性对比

| 模型 | 适用领域 | 长度 | 特性 |
|------|--------|------|------|
| GPT-4 | 全能 | 500-2000 | 最强大，思维深度 |
| GPT-3.5 | 全能 | 300-1500 | 快速，成本低 |
| 通义千问 | 全能 | 500-2000 | 中文优化，本地化 |
| MiniMax | 快速 | 400-1800 | 实时应用，低延迟 |
| 智谱 | 全能 | 600-2200 | 双语精准，开源 |
| 豆包 | 全能 | 500-2000 | 中文能力强，友好 |
| Claude | 长文本 | 800-3000 | 深度理解，伦理 |
| Gemini | 多模态 | 1000-3000 | 视觉能力，实时 |
| 本地模型 | 离线 | 200-800 | 隐私，快速 |

## 🐛 故障排查

### 问题: API 调用失败
**解决方案**:
1. 检查 API 密钥是否正确
2. 确认网络连接
3. 查看 API 配额是否充足
4. 尝试其他 API 提供商

### 问题: 生成的提示词质量差
**解决方案**:
1. 提供更详细的需求描述
2. 调整难度级别
3. 使用更具体的关键词
4. 尝试其他模型

### 问题: 应用启动缓慢
**解决方案**:
1. 关闭后台应用
2. 增加系统 RAM
3. 更新到最新版本
4. 重新安装应用

## 📚 详细文档

更多技术文档和配置指南，请访问 [docs/](docs/) 文件夹：

- **[BASE_URL_CONFIG_GUIDE.md](docs/BASE_URL_CONFIG_GUIDE.md)** - API baseURL 配置
- **[CORS_SOLUTION.md](docs/CORS_SOLUTION.md)** - CORS 问题解决
- **[MODEL_CONFIGURATION.md](docs/MODEL_CONFIGURATION.md)** - 模型配置指南（包括豆包）
- **[QWEN_MODELS_GUIDE.md](docs/QWEN_MODELS_GUIDE.md)** - Qwen 模型集成指南
- **[OPENAI_FORMAT_SPECIFICATION.md](docs/OPENAI_FORMAT_SPECIFICATION.md)** - OpenAI 格式规范
- **[TESTING.md](docs/TESTING.md)** - 测试指南
- **[DETAILED_LOGGING_GUIDE.md](docs/DETAILED_LOGGING_GUIDE.md)** - 日志配置
- **[DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** - 部署检查清单
- **[WEB_DEPLOYMENT_GUIDE.md](docs/WEB_DEPLOYMENT_GUIDE.md)** - Web 部署指南

查看 [docs/README.md](docs/README.md) 获取完整文档列表。

## 📞 支持和反馈

- 📧 邮件: yiyun@outlook.com
- 🐛 报告 Bug: [GitHub Issues](https://github.com/microsnow/prompt-optimizer-pro/issues)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 感谢

感谢所有贡献者和用户的支持！

---

**版本**: 1.0.0  
**最后更新**: 2024年  
**官网**: https://prompt-optimizer-pro-eight.vercel.app/
