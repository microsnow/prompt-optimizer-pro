# 🔧 Base URL 和接口协议配置指南

## 📍 配置位置总览

你的应用有两层配置：

```
┌─────────────────────────────────────────────────────────┐
│  第 1 层：前端配置（浏览器如何连接代理服务器）        │
│  位置：src/services/api.ts                              │
│  配置文件：.env / .env.local                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  第 2 层：后端配置（代理如何连接第三方 API）           │
│  位置：src/server/api-proxy.js                           │
│  配置文件：无需配置，已硬编码                            │
└─────────────────────────────────────────────────────────┘
```

---

## 1️⃣ 前端配置（第一层）

### 📝 配置文件位置

#### `.env` 或 `.env.local`
```ini
# API 代理服务器地址（前端连接代理用）
VITE_API_PROXY_URL=http://localhost:3001

# 开发环境
# VITE_API_PROXY_URL=http://localhost:3001

# 生产环境（部署时修改）
# VITE_API_PROXY_URL=https://api.yourserver.com
```

**文件位置：** `c:/Users/Administrator/WorkBuddy/Claw/.env` 或 `.env.local`

### 📌 代码位置

#### `src/services/api.ts` 第 1-16 行
```typescript
// ============ 配置 ============

// API 代理服务器地址 (可以通过环境变量覆盖)
const API_PROXY_URL = import.meta.env.VITE_API_PROXY_URL || 'http://localhost:3001';
                      ↑
                      从 .env 读取

// 单个 axios 实例，用于所有代理请求
const proxyClient = axios.create({
  baseURL: API_PROXY_URL,  // ← 这里就是 base_url
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 秒超时
});
```

### 🔄 配置流程

```
1. 读取 .env 文件中的 VITE_API_PROXY_URL
   例：http://localhost:3001
   
2. 赋值给 API_PROXY_URL
   const API_PROXY_URL = import.meta.env.VITE_API_PROXY_URL
   
3. 传给 axios 的 baseURL
   baseURL: API_PROXY_URL
   
4. 所有请求都会加这个前缀
   POST http://localhost:3001/api/proxy/qwen/chat
```

### 📊 前端请求流程示例

```
前端发送请求：
POST /api/proxy/qwen/chat

经过 baseURL 处理后变成：
POST http://localhost:3001/api/proxy/qwen/chat
                ↑
                来自 .env 配置
```

---

## 2️⃣ 后端配置（第二层）

### 📝 配置位置

所有第三方 API 的 base_url 都在 `src/server/api-proxy.js` 中**硬编码**。

### 🔗 支持的 AI 提供商

#### OpenAI（第 74-91 行）
```javascript
async function callOpenAI(model, messages, temperature, max_tokens, apiKey) {
  const client = axios.create({
    baseURL: 'https://api.openai.com/v1',  // ← OpenAI base_url
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await client.post('/chat/completions', {  // ← 接口路径
    model,
    messages,
    temperature,
    max_tokens,
  });

  return response.data.choices[0].message.content;
}
```

#### 阿里云通义千问（第 96-118 行）
```javascript
async function callQwen(model, messages, temperature, max_tokens, top_p, apiKey) {
  const client = axios.create({
    baseURL: 'https://dashscope.aliyuncs.com/api/v1',  // ← Qwen base_url
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await client.post('/services/aigc/text-generation/generation', {  // ← 接口路径
    model,
    messages,
    temperature,
    top_p,
    max_tokens,
  });

  return response.data.output.text;
}
```

#### MiniMax（第 120-150 行）
```javascript
async function callMiniMax(model, messages, temperature, max_tokens, apiKey) {
  const client = axios.create({
    baseURL: 'https://api.minimax.chat/v1',  // ← MiniMax base_url
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await client.post('/text/chatcompletion', {  // ← 接口路径
    model,
    messages,
    temperature,
    max_tokens,
  });

  return response.data.reply[0].text;
}
```

#### 智谱 ChatGLM（第 152-182 行）
```javascript
async function callZhipu(model, messages, temperature, max_tokens, apiKey) {
  const client = axios.create({
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',  // ← Zhipu base_url
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await client.post('/chat/completions', {  // ← 接口路径
    model,
    messages,
    temperature,
    max_tokens,
  });

  return response.data.choices[0].message.content;
}
```

### 📊 后端 Base URL 汇总

| AI 提供商 | Base URL | 完整接口 |
|----------|----------|--------|
| **OpenAI** | `https://api.openai.com/v1` | `/chat/completions` |
| **阿里云 Qwen** | `https://dashscope.aliyuncs.com/api/v1` | `/services/aigc/text-generation/generation` |
| **MiniMax** | `https://api.minimax.chat/v1` | `/text/chatcompletion` |
| **智谱 Zhipu** | `https://open.bigmodel.cn/api/paas/v4` | `/chat/completions` |

---

## 🔧 如何修改配置

### 修改前端 Base URL

**编辑 `.env` 或 `.env.local`：**

```ini
# 开发环境（本地）
VITE_API_PROXY_URL=http://localhost:3001

# 生产环境（部署）
VITE_API_PROXY_URL=https://api.yourserver.com

# 其他机器（局域网）
VITE_API_PROXY_URL=http://192.168.1.100:3001
```

然后重启前端开发服务器：
```bash
npm run dev
```

### 修改后端 Base URL

**编辑 `src/server/api-proxy.js`：**

例如，修改 OpenAI 的 base_url：

```javascript
// 之前
async function callOpenAI(model, messages, temperature, max_tokens, apiKey) {
  const client = axios.create({
    baseURL: 'https://api.openai.com/v1',
    ...
  });
}

// 之后（如果使用代理）
async function callOpenAI(model, messages, temperature, max_tokens, apiKey) {
  const client = axios.create({
    baseURL: 'https://api.openai.com/v1',  // 改这里
    ...
  });
}
```

修改后重启代理服务器：
```bash
# 重新启动
npm run api:proxy
```

### 添加新的 AI 提供商

**在 `src/server/api-proxy.js` 中：**

1. **添加函数**（第 184 行之后）：
```javascript
async function callNewProvider(model, messages, temperature, max_tokens, apiKey) {
  const client = axios.create({
    baseURL: 'https://api.newprovider.com/v1',  // 新 base_url
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await client.post('/chat/completions', {  // 新接口
    model,
    messages,
    temperature,
    max_tokens,
  });

  return response.data.choices[0].message.content;
}
```

2. **在路由中添加 case**（第 54 行之前）：
```javascript
case 'newprovider':
  response = await callNewProvider(model, messages, temperature, max_tokens, apiKey);
  break;
```

3. **在前端注册**（`src/services/api.ts`）：
```typescript
initNewProvider(apiKey: string) {
  this.newproviderClient = new ProxyAPIClient('newprovider', apiKey, 'model-name');
}
```

---

## 📋 完整请求流程

```
┌─────────────────────────────────────────────────────────┐
│  1. 用户在浏览器中输入提示词                            │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  2. 前端调用 apiService.optimizePrompt()                │
│     (位置：src/services/api.ts)                         │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  3. 前端发送 HTTP 请求到代理                            │
│     POST http://localhost:3001/api/proxy/qwen/chat      │
│            ↑ 来自 .env VITE_API_PROXY_URL               │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  4. 代理服务器接收请求                                  │
│     (位置：src/server/api-proxy.js)                     │
│     路由：POST /api/proxy/:provider/:endpoint           │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  5. 代理服务器转发到真实 API                            │
│     POST https://dashscope.aliyuncs.com/api/v1/...      │
│            ↑ 硬编码在 src/server/api-proxy.js 中        │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  6. 第三方 API 返回结果                                 │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  7. 代理服务器转发结果给前端                            │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│  8. 前端显示结果                                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 快速查找表

### 我要修改...

| 需求 | 文件位置 | 行号 |
|------|--------|------|
| **前端 → 代理 base_url** | `.env` / `.env.local` | - |
| **前端连接配置** | `src/services/api.ts` | 1-16 |
| **代理 → OpenAI base_url** | `src/server/api-proxy.js` | 76 |
| **代理 → Qwen base_url** | `src/server/api-proxy.js` | 98 |
| **代理 → MiniMax base_url** | `src/server/api-proxy.js` | 122 |
| **代理 → Zhipu base_url** | `src/server/api-proxy.js` | 154 |
| **接口路由配置** | `src/server/api-proxy.js` | 33 |
| **CORS 白名单** | `src/server/api-proxy.js` | 16-18 |
| **Vite 代理** | `vite.config.ts` | 12-20 |

---

## 🚀 常用修改场景

### 场景 1：改变代理服务器地址

**修改 `.env`：**
```ini
# 从本地改为云服务器
VITE_API_PROXY_URL=https://api.yourserver.com
```

### 场景 2：改变某个 AI 提供商的 base_url

**修改 `src/server/api-proxy.js`：**
```javascript
// 找到对应的函数，改 baseURL
async function callQwen(...) {
  const client = axios.create({
    baseURL: 'https://新的base_url',  // 改这里
    ...
  });
}
```

### 场景 3：修改接口路径

**修改 `src/server/api-proxy.js`：**
```javascript
// 在对应的函数中改 post 的第一个参数
const response = await client.post('/新的接口路径', {
  ...
});
```

### 场景 4：改变请求协议（HTTP → HTTPS）

**修改 `.env`：**
```ini
# HTTP
VITE_API_PROXY_URL=http://localhost:3001

# 改为 HTTPS
VITE_API_PROXY_URL=https://api.yourserver.com
```

---

## ⚙️ 环境变量说明

### .env（全局，可提交）
```ini
# 默认开发配置
VITE_API_PROXY_URL=http://localhost:3001
```

### .env.local（本地，不提交）
```ini
# 本地开发用，会覆盖 .env
# 例如使用其他机器的代理
VITE_API_PROXY_URL=http://192.168.1.100:3001
```

### 优先级
```
.env.local > .env > 硬编码默认值
```

---

## 📚 相关文件

| 文件 | 用途 |
|------|------|
| `.env` | 前端全局配置 |
| `.env.local` | 前端本地配置（开发用） |
| `src/services/api.ts` | 前端 API 服务 |
| `src/server/api-proxy.js` | 后端代理服务器 |
| `vite.config.ts` | Vite 构建配置 |
| `package.json` | npm 脚本 |

---

## 🎯 总结

### 记住这两点：

1. **前端 Base URL（第一层）**
   - 配置文件：`.env` / `.env.local`
   - 变量名：`VITE_API_PROXY_URL`
   - 值：`http://localhost:3001`（开发）或 `https://api.yourserver.com`（生产）

2. **后端 Base URL（第二层）**
   - 配置文件：`src/server/api-proxy.js`
   - 文件中硬编码 AI 提供商的 API 地址
   - 每个提供商一个函数，各有各的 base_url

---

**现在你知道去哪里修改配置了！** 🚀
