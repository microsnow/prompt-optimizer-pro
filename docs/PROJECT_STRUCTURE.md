# 📁 项目结构说明

## 根目录文件概览

```
Claw/
├── docs/                       # 📚 技术文档和指南
│   ├── README.md              # 文档中心入口
│   ├── MODEL_CONFIGURATION.md # 模型配置指南（新增）
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── WEB_DEPLOYMENT_GUIDE.md
│   ├── BASE_URL_CONFIG_GUIDE.md
│   ├── CORS_SOLUTION.md
│   └── [更多文档...]
│
├── electron/                  # ⚛️ Electron 应用配置
│   ├── main.ts
│   ├── preload.ts
│   └── [Electron 特定文件]
│
├── src/                       # 🎯 源代码
│   ├── App.vue               # 主应用组件
│   ├── constants.ts          # 常量定义（已添加豆包）
│   ├── types.ts              # TypeScript 类型定义
│   ├── services/             # 服务层
│   │   ├── api.ts            # API 调用服务
│   │   └── [其他服务]
│   ├── server/               # 后端 API 代理
│   │   ├── api-proxy.js      # API 代理主文件
│   │   ├── openai-format.js  # OpenAI 格式转换（已修复豆包）
│   │   ├── logger.js         # 日志系统
│   │   └── [其他处理器]
│   └── [其他源文件]
│
├── logs/                      # 📊 运行时日志（不提交到 Git）
│   └── [日志文件...]
│
├── README.md                  # 📖 项目主文档（已更新豆包信息）
├── package.json               # 📦 NPM 依赖配置
├── package-lock.json
├── vite.config.ts            # ⚙️ Vite 构建配置
├── tsconfig.json             # 🔤 TypeScript 配置
├── tsconfig.node.json
├── electron-builder.yml      # 📦 Electron 打包配置
├── index.html                # 🌐 入口 HTML
│
├── test-douyin.js            # 🧪 豆包 API 测试脚本
│
└── PROJECT_STRUCTURE.md      # 📋 本文件（项目结构说明）
```

---

## 🔑 核心文件说明

### 📚 文档目录 (`docs/`)

| 文件 | 用途 | 优先级 |
|------|------|--------|
| **README.md** | 文档中心入口 | 必读 |
| **MODEL_CONFIGURATION.md** | 模型配置指南 | 必读 |
| **BASE_URL_CONFIG_GUIDE.md** | API baseURL 配置 | 必读 |
| **OPENAI_FORMAT_SPECIFICATION.md** | API 格式规范 | 参考 |
| **CORS_SOLUTION.md** | CORS 问题解决 | 问题诊断 |
| **TESTING.md** | 测试指南 | 开发阶段 |
| **DEPLOYMENT_CHECKLIST.md** | 部署前检查 | 发布前 |
| **WEB_DEPLOYMENT_GUIDE.md** | Web 部署指南 | 发布前 |
| **QWEN_MODELS_GUIDE.md** | Qwen 模型指南 | 参考 |
| **DETAILED_LOGGING_GUIDE.md** | 日志配置 | 调试 |

### 🎯 源代码 (`src/`)

#### `src/App.vue` - 主应用
- 模型选择界面（已添加豆包）
- API 配置管理
- 左侧导航栏

#### `src/constants.ts` - 常量定义
- **MODEL_CHARACTERISTICS** - 模型特性配置（已添加豆包）
- 各模型的 API 速率限制
- 支持的特性标志

#### `src/types.ts` - 类型定义
- **ModelType** - 模型类型联合类型（已添加 'douyin'）
- API 请求/响应类型
- 其他业务类型

#### `src/services/api.ts` - API 调用服务
- 调用各种 API 的公共接口
- 错误处理和重试逻辑

#### `src/server/api-proxy.js` - 后端代理
- Express 服务器配置
- `/v1/chat/completions` 路由处理
- 流式和非流式请求支持

#### `src/server/openai-format.js` - 格式转换
- **callDouyinChat()** - 豆包非流式调用（已修复）
- **callDouyinStreamChat()** - 豆包流式调用（已修复）
- 其他模型的格式转换函数

#### `src/server/logger.js` - 日志系统
- 按级别记录日志（TRACE, DEBUG, INFO, WARN, ERROR）
- API 调用性能监控
- 错误详情记录

---

## 🧪 测试脚本 (`test-douyin.js`)

### 用途
快速测试豆包 API 集成是否正常工作

### 使用方法

```bash
# 运行测试脚本
node test-douyin.js "YOUR_API_KEY_HERE"
```

### 功能
- ✅ 测试非流式 API 调用
- ✅ 测试流式 API 调用
- ✅ 打印详细的请求/响应信息
- ✅ 验证 API 端点和认证

### 预期输出
```
✅ 豆包非流式调用成功
✅ 豆包流式调用成功
```

---

## 🚀 快速开始指南

### 1️⃣ 新手入门

**阅读文档顺序**：
1. `README.md` - 了解项目整体
2. `docs/BASE_URL_CONFIG_GUIDE.md` - 配置 API
3. `docs/MODEL_CONFIGURATION.md` - 配置豆包等模型

### 2️⃣ 本地开发

```bash
# 安装依赖
npm install

# 启动后端代理服务器（终端1）
npm run server

# 启动前端开发服务器（终端2）
npm run dev

# 测试豆包 API（终端3）
node test-douyin.js "your-api-key"
```

### 3️⃣ 代码修改

**如果修改了以下文件，需要重启相应的服务**：

- `src/server/**/*.js` → 重启后端代理（npm run server）
- `src/**/*.ts` 或 `src/**/*.vue` → 重启前端（npm run dev）
- `src/constants.ts` → 两者都要重启

### 4️⃣ 豆包模型集成检查清单

- ✅ `src/constants.ts` - 已添加豆包配置
- ✅ `src/types.ts` - 已添加 'douyin' 类型
- ✅ `src/App.vue` - 已在模型列表中添加豆包
- ✅ `src/server/openai-format.js` - 已修复 API 端点
  - 域名：`volces.com` ✅
  - 路径：`/api/coding/v3` ✅
- ✅ 服务器启动日志 - 已显示豆包支持

---

## 📊 模型支持情况

| 模型 | 前端支持 | 后端支持 | 测试脚本 | 文档 |
|------|--------|--------|--------|------|
| GPT-4 | ✅ | ✅ | - | 见 API 文档 |
| GPT-3.5 | ✅ | ✅ | - | 见 API 文档 |
| 通义千问 | ✅ | ✅ | - | QWEN_MODELS_GUIDE.md |
| MiniMax | ✅ | ✅ | - | MODEL_CONFIGURATION.md |
| 智谱 | ✅ | ✅ | - | MODEL_CONFIGURATION.md |
| **豆包** | ✅ | ✅ | ✅ | MODEL_CONFIGURATION.md |
| Claude | ✅ | ✅ | - | 见 API 文档 |
| Gemini | ✅ | ✅ | - | 见 API 文档 |

---

## 🔧 常用命令

```bash
# 开发
npm run dev          # 启动前端
npm run server       # 启动后端代理
npm run build        # 生产构建

# 测试
npm run test         # 运行测试套件
node test-douyin.js  # 测试豆包 API

# 打包（Electron）
npm run build:app    # 构建 Electron 应用
npm run dist         # 创建安装程序
```

---

## 📝 最佳实践

### 📌 提交代码时

1. **在 `docs/` 中添加或更新相关文档**
2. **更新 `docs/README.md`** 添加新文档链接
3. **如果涉及新模型**，更新 `MODEL_CONFIGURATION.md`
4. **更新 `README.md`** 的模型支持表格

### 🎯 添加新模型时

1. 在 `src/constants.ts` 添加模型特性配置
2. 在 `src/types.ts` 的 `ModelType` 中添加类型
3. 在 `src/App.vue` 的 `availableModels` 中添加
4. 在 `src/server/openai-format.js` 中添加调用函数
5. 创建测试脚本（如 `test-<model>.js`）
6. 在 `docs/MODEL_CONFIGURATION.md` 中文档说明
7. 更新 `README.md` 的模型列表

### 🐛 故障排查

**问题：API 调用失败**
- 查看日志：`logs/` 目录
- 检查 API 端点：`src/server/openai-format.js`
- 验证 API Key：应用设置界面
- 运行测试脚本：`node test-douyin.js`

**问题：前端无法看到新模型**
- 检查 `src/constants.ts` 是否添加配置
- 检查 `src/types.ts` 是否添加类型
- 检查 `src/App.vue` 是否添加到列表
- 重启前端服务：`npm run dev`

---

## 📖 相关文档

- 📖 [README.md](./README.md) - 项目主文档
- 📚 [docs/README.md](./docs/README.md) - 文档中心
- 🔧 [docs/MODEL_CONFIGURATION.md](./docs/MODEL_CONFIGURATION.md) - 模型配置
- 🚀 [docs/DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md) - 部署清单
- 📋 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 本文件

---

**版本**: 1.0.0  
**最后更新**: 2025-03-18  
**维护者**: 开发团队
