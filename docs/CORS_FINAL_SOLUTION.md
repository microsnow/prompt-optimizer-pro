# 🔐 CORS 跨域问题解决方案 - 最终总结

## 📌 问题回顾

你遇到了一个经典的 **CORS（跨域资源共享）问题**：

```
Access to XMLHttpRequest at 'https://dashscope.aliyuncs.com/api/v1/...'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

### 原因分析

| 问题 | 原因 | 影响 |
|------|------|------|
| CORS 错误 | 浏览器安全策略 | 无法调用第三方 API |
| 需要手动配置 base_url | API 提供商不同 | 支持多个 AI 服务 |
| API 密钥暴露 | 在前端代码中 | 安全风险 |

---

## ✅ 完整解决方案

为你创建了一个**企业级的后端代理服务器**，包含以下内容：

### 1️⃣ 后端代理服务器
- 文件：`src/server/api-proxy.ts`
- 技术：Express.js + Axios
- 功能：
  - 转发所有 API 请求
  - 安全管理 API 密钥
  - 支持多个 AI 提供商
  - 提供健康检查

### 2️⃣ 前端 API 服务更新
- 文件：`src/services/api.ts`
- 改进：
  - 通过代理调用 API
  - 使用环境变量配置
  - 保持原有的 API 接口

### 3️⃣ 配置文件
- `.env` - 全局配置
- `.env.local` - 本地开发配置
- `vite.config.ts` - Vite 代理配置
- `package.json` - 新增 npm 脚本

### 4️⃣ 启动脚本
- `start-cors-solution.bat` (Windows)
- `start-cors-solution.sh` (Linux/macOS)
- `start-cors-solution.ps1` (PowerShell)

### 5️⃣ 详细文档
- `CORS_SOLUTION.md` - 完整指南（详细）
- `CORS_QUICK_REFERENCE.txt` - 快速参考（速查）

---

## 🚀 快速开始（必读）

### 推荐方式：使用一键启动脚本

#### Windows 用户：
```bash
# 方式 1：双击运行
start-cors-solution.bat

# 方式 2：PowerShell 运行（管理员）
.\start-cors-solution.ps1
```

#### Linux/macOS 用户：
```bash
bash start-cors-solution.sh
```

#### 或手动启动：

**终端 1（启动代理服务器）**
```bash
npx ts-node src/server/api-proxy.ts
```

**终端 2（启动前端开发）**
```bash
npm run dev
```

**然后打开浏览器：**
```
http://localhost:5173/
```

---

## 📊 架构图

```
┌─────────────────────────────────────────────────────┐
│             浏览器客户端                             │
│  (http://localhost:5173/)                           │
└────────────────────┬────────────────────────────────┘
                     │ 浏览器请求
                     ↓
┌─────────────────────────────────────────────────────┐
│             Vite 开发服务器                          │
│  (http://localhost:5173)                            │
└────────────────────┬────────────────────────────────┘
                     │ 转发 API 请求
                     ↓
┌─────────────────────────────────────────────────────┐
│          Express 代理服务器                          │
│  (http://localhost:3001)                            │
│  - 管理 API 密钥                                     │
│  - 支持多个 AI 提供商                                │
│  - 转发请求到第三方 API                              │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS 请求
                     ↓
┌─────────────────────────────────────────────────────┐
│             第三方 AI API                            │
│  ├─ OpenAI (https://api.openai.com)                 │
│  ├─ 阿里云 (https://dashscope.aliyuncs.com)        │
│  ├─ MiniMax (https://api.minimax.chat)              │
│  └─ 智谱 (https://open.bigmodel.cn)                 │
└─────────────────────────────────────────────────────┘
```

---

## 📁 文件清单

### 新建文件
```
src/
  server/
    └─ api-proxy.ts              ← 代理服务器

start-cors-solution.bat          ← Windows 启动脚本
start-cors-solution.sh           ← Linux/macOS 启动脚本
start-cors-solution.ps1          ← PowerShell 启动脚本

CORS_SOLUTION.md                 ← 完整指南
CORS_QUICK_REFERENCE.txt         ← 快速参考

.env                             ← 环境变量（新建）
.env.local                       ← 本地环境变量（新建）
```

### 更新文件
```
src/services/api.ts              ← 使用代理服务器
vite.config.ts                   ← 添加代理配置
package.json                     ← 添加 npm 脚本
```

---

## 🎯 npm 脚本说明

```bash
# 启动代理服务器（新增）
npm run api:proxy

# 同时启动代理 + 前端（新增，推荐）
npm run start

# 仅启动前端（原有）
npm run dev

# Electron 开发（原有）
npm run electron:dev

# 构建应用（原有）
npm run build:win
npm run build:mac
npm run build:linux

# 测试（原有）
npm run test:api
```

---

## 🔒 安全性改进

### 之前
```
❌ API 密钥在前端代码中
❌ 浏览器直接访问第三方 API
❌ 跨域限制导致失败
```

### 之后
```
✅ API 密钥在服务器端的 .env 文件中
✅ 浏览器通过本地代理访问
✅ 无跨域问题
✅ 可以添加身份验证、日志、限流等功能
```

---

## 📝 环境变量配置

### .env（全局配置，可提交）
```ini
# API 代理服务器地址
VITE_API_PROXY_URL=http://localhost:3001

# 应用配置
VITE_APP_NAME=PromptOptimizer Pro
VITE_APP_VERSION=1.0.0
```

### .env.local（本地配置，不提交）
```ini
# 本地开发可以修改代理地址
VITE_API_PROXY_URL=http://localhost:3001
```

### 生产环境配置
```ini
# 部署到生产服务器时修改为：
VITE_API_PROXY_URL=https://api.yourserver.com
```

---

## 🐛 常见问题排查

### Q1: 代理服务器无法启动
**症状：** `npx ts-node` 命令找不到

**解决：**
```bash
npm install --save-dev ts-node @types/node typescript
npx ts-node src/server/api-proxy.ts
```

### Q2: 端口被占用
**症状：** `EADDRINUSE: address already in use :::3001`

**解决（Windows）：**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**解决（Linux/macOS）：**
```bash
lsof -i :3001
kill -9 <PID>
```

### Q3: 代理连接失败
**症状：** 前端收到连接错误

**检查清单：**
- [ ] 代理服务器是否运行：`http://localhost:3001/health`
- [ ] `.env` 中的代理地址是否正确
- [ ] 防火墙是否阻止了连接
- [ ] 3001 端口是否被其他程序占用

### Q4: 仍然出现 CORS 错误
**原因可能：** 前端仍在直接调用第三方 API

**检查：** `src/services/api.ts` 是否已更新为使用代理

---

## 📚 推荐阅读顺序

1. **快速开始** - 本文档的前面部分
2. **快速参考** - `CORS_QUICK_REFERENCE.txt`（快速查阅）
3. **完整指南** - `CORS_SOLUTION.md`（深入了解）
4. **源代码** - `src/server/api-proxy.ts`（技术细节）

---

## 🎓 技术栈

| 技术 | 用途 | 版本 |
|------|------|------|
| Express.js | 后端服务器框架 | ^5.2.1 |
| Axios | HTTP 请求库 | ^1.13.6 |
| CORS | 跨域资源共享 | ^2.8.6 |
| TypeScript | 类型安全 | ^5.1.3 |
| Vite | 前端构建工具 | ^4.3.9 |

---

## 📈 下一步计划

### 短期（立即）
- [x] 启动代理服务器
- [x] 运行前端应用
- [x] 测试 API 调用

### 中期（本周）
- [ ] 完善错误处理
- [ ] 添加请求日志
- [ ] 优化性能

### 长期（部署前）
- [ ] 添加身份验证
- [ ] 实现速率限制
- [ ] 部署到生产服务器

---

## 🎉 总结

| 方面 | 改进 |
|------|------|
| **功能** | ✅ 解决 CORS 问题，支持所有 AI 提供商 |
| **安全** | ✅ API 密钥不再暴露 |
| **开发体验** | ✅ 简单易用的一键启动脚本 |
| **文档** | ✅ 详细的指南和快速参考 |
| **扩展性** | ✅ 易于添加新的 API 提供商 |

---

## 🚀 立即行动

```bash
# 选择一个方式启动

# 方式 1：Windows 用户
start-cors-solution.bat

# 方式 2：Linux/macOS 用户
bash start-cors-solution.sh

# 方式 3：手动启动
# 终端 1：npx ts-node src/server/api-proxy.ts
# 终端 2：npm run dev
# 浏览器：http://localhost:5173/
```

---

**现在开始使用，享受无 CORS 困扰的开发体验！** 🚀

如有任何问题，参考 `CORS_SOLUTION.md` 或 `CORS_QUICK_REFERENCE.txt`。
