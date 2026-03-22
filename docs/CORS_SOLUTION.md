# 🔐 CORS 跨域问题 - 完整解决方案

## 📋 问题描述

当你在浏览器中运行前端应用 (`http://localhost:5173`) 时，直接调用第三方 API（如阿里云、OpenAI）会遇到 CORS 错误：

```
Access to XMLHttpRequest at 'https://dashscope.aliyuncs.com/...' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

### 为什么会发生？

- **浏览器安全策略**：浏览器默认阻止跨域请求（不同的协议、域名、端口）
- **第三方 API 服务**：大多数 AI API 服务不允许从浏览器直接访问
- **API 密钥泄露风险**：如果直接在前端调用，API 密钥会暴露在浏览器中

---

## ✅ 解决方案总结

我为你提供了 **3 种解决方案**，按推荐度排序：

### 📌 方案 1：后端代理服务器（强烈推荐）⭐⭐⭐

**优点：**
- ✅ **安全**：API 密钥存储在服务器端，不暴露给浏览器
- ✅ **可靠**：支持所有 AI 提供商（OpenAI、Qwen、MiniMax、Zhipu）
- ✅ **灵活**：可以添加日志、速率限制、缓存等功能
- ✅ **可扩展**：可以添加更多 API 提供商

**缺点：**
- 需要运行额外的服务器

**文件：**
- `src/server/api-proxy.ts` - Express 代理服务器
- `src/services/api.ts` - 更新后的前端 API 服务（使用代理）

**使用步骤：**

1. 安装依赖（如果还没安装）：
```bash
npm install express cors axios
npm install --save-dev @types/express @types/node ts-node
```

2. 启动代理服务器：
```bash
# 方法 1：直接运行 TypeScript
npx ts-node src/server/api-proxy.ts

# 方法 2：编译成 JavaScript 后运行
npx tsc src/server/api-proxy.ts
node src/server/api-proxy.js
```

3. 启动前端开发服务器（新终端）：
```bash
npm run dev
```

4. 应用会自动连接到代理服务器 (http://localhost:3001)

---

### 📌 方案 2：Vite 开发服务器代理

**优点：**
- ✅ 简单快速
- ✅ 无需额外配置

**缺点：**
- ❌ 仅适用于开发环境
- ❌ 不能处理 preflight 请求
- ❌ API 密钥仍在前端代码中

**使用步骤：**

1. 更新 `vite.config.ts`（已经为你创建）：
```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://api.yourserver.com',
      changeOrigin: true,
    }
  }
}
```

2. 更新前端 API 调用，使用相对路径：
```typescript
// 不要这样：
axios.post('https://dashscope.aliyuncs.com/api/v1/...')

// 改成这样：
axios.post('/api/services/aigc/text-generation/generation')
```

---

### 📌 方案 3：Electron 本地运行

**优点：**
- ✅ 桌面应用，无浏览器限制
- ✅ API 密钥可以存储在本地

**缺点：**
- ❌ 仅适用于桌面应用
- ❌ 不能在浏览器中运行

**使用步骤：**

1. 运行 Electron 版本：
```bash
npm run electron:dev
```

2. 在 Electron 中，CORS 限制不适用，可以直接调用 API

---

## 🚀 立即开始（推荐方案 1）

### 第 1 步：安装依赖

```bash
npm install express cors axios
npm install --save-dev @types/express @types/node ts-node
```

### 第 2 步：启动代理服务器

打开 **第一个终端**，运行：

```bash
npx ts-node src/server/api-proxy.ts
```

你会看到：
```
✅ API 代理服务器运行在 http://localhost:3001
📌 支持的提供商: OpenAI, Qwen, MiniMax, Zhipu
```

### 第 3 步：启动前端开发服务器

打开 **第二个终端**，运行：

```bash
npm run dev
```

### 第 4 步：打开浏览器

访问：`http://localhost:5173/`

现在你可以使用应用了！API 调用会通过代理服务器进行。

---

## 🔧 配置环境变量

如果你想使用不同的代理地址，编辑 `.env` 或 `.env.local`：

```bash
# .env
VITE_API_PROXY_URL=http://localhost:3001

# 生产环境时修改为：
# VITE_API_PROXY_URL=https://api.yourserver.com
```

然后重启开发服务器。

---

## 🌐 部署到生产环境

当你部署应用时：

1. **部署后端代理服务器**到云服务器：
```bash
# 在服务器上运行
npm install
npx ts-node src/server/api-proxy.ts
# 或使用 PM2 等进程管理工具
```

2. **更新前端配置**：
```bash
# .env.production
VITE_API_PROXY_URL=https://api.yourserver.com
```

3. **构建前端**：
```bash
npm run build
```

4. **部署**到 CDN 或 Web 服务器

---

## ⚙️ 后端代理服务器详解

### 支持的 API 提供商

| 提供商 | 模型 | 端点 |
|-------|------|------|
| OpenAI | gpt-3.5-turbo | `/api/proxy/openai/chat` |
| 阿里云 Qwen | qwen-turbo | `/api/proxy/qwen/chat` |
| MiniMax | minimax-text-saas | `/api/proxy/minimax/chat` |
| 智谱 Zhipu | glm-4-flash | `/api/proxy/zhipu/chat` |

### 请求格式

```typescript
POST /api/proxy/:provider/:endpoint

{
  "model": "gpt-3.5-turbo",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "apiKey": "sk-..." // API 密钥（敏感信息在服务器端安全处理）
}
```

### 响应格式

```typescript
{
  "success": true,
  "data": "优化后的提示词..."
}
```

---

## 🔒 安全最佳实践

### ✅ 做这些事：

- ✅ **API 密钥存储在服务器端**（`.env` 或环境变量中）
- ✅ **使用 HTTPS 和身份验证**（在生产环境中）
- ✅ **添加请求限流**（防止滥用）
- ✅ **记录和监控 API 使用**（审计跟踪）
- ✅ **定期轮换 API 密钥**

### ❌ 不要这样做：

- ❌ **在前端代码中暴露 API 密钥**
- ❌ **跳过身份验证**（在生产环境中）
- ❌ **直接从浏览器调用第三方 API**
- ❌ **记录敏感信息**（API 密钥、用户数据）

---

## 🐛 常见问题

### Q: 为什么代理服务器连接不上？
**A:** 确保：
1. 代理服务器正在运行：`npx ts-node src/server/api-proxy.ts`
2. 前端配置了正确的代理地址：`VITE_API_PROXY_URL=http://localhost:3001`
3. 端口 3001 没有被其他程序占用

### Q: 如何测试代理服务器是否工作？
**A:** 打开浏览器访问：`http://localhost:3001/health`

应该看到：
```json
{ "status": "ok", "timestamp": "2024-03-18T12:00:00.000Z" }
```

### Q: 能否在 Electron 中使用代理？
**A:** 可以，但不必要。Electron 中不存在 CORS 限制，可以直接调用 API。

### Q: 如何添加新的 API 提供商？
**A:** 在 `src/server/api-proxy.ts` 中：
1. 添加新的 `call<Provider>()` 函数
2. 在 POST 路由中添加 case 分支
3. 更新前端 `APIService` 类

---

## 📚 相关文件

| 文件 | 用途 |
|------|------|
| `src/server/api-proxy.ts` | 后端代理服务器 |
| `src/services/api.ts` | 更新后的前端 API 服务 |
| `.env` | 环境变量配置 |
| `.env.local` | 本地开发环境变量 |
| `vite.config.ts` | Vite 开发服务器配置 |

---

## 🎯 总结

| 方案 | 开发 | 生产 | 安全性 | 复杂度 |
|------|------|------|--------|--------|
| 后端代理（推荐） | ✅ | ✅ | ✅✅✅ | 中等 |
| Vite 代理 | ✅ | ❌ | ✅ | 低 |
| Electron | ✅ | ✅ | ✅✅ | 低 |

**强烈推荐使用方案 1（后端代理）**，特别是如果你计划部署到生产环境。

---

**现在开始使用代理服务器，享受无 CORS 困扰的开发体验！** 🚀
