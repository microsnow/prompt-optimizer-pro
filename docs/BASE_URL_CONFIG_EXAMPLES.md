# 配置文件示例 - Base URL 修改参考

## 📝 情景 1：开发环境（默认配置）

### .env
```ini
VITE_API_PROXY_URL=http://localhost:3001
VITE_APP_NAME=PromptOptimizer Pro
VITE_APP_VERSION=1.0.0
```

### .env.local（可选，本地覆盖）
```ini
# 空的或不存在，使用默认的 .env 配置
```

**结果：** 前端连接 `http://localhost:3001` 的本地代理服务器

---

## 📝 情景 2：代理在不同机器上

### .env.local（本地机器特有配置）
```ini
# 代理服务器在其他机器的 IP 地址
VITE_API_PROXY_URL=http://192.168.1.100:3001
```

**结果：** 前端连接到 `192.168.1.100:3001` 的代理服务器

---

## 📝 情景 3：生产环境（云服务器部署）

### .env
```ini
# 开发默认值
VITE_API_PROXY_URL=http://localhost:3001
```

### 部署时的 .env（生产）
```ini
# 改成云服务器地址
VITE_API_PROXY_URL=https://api.prompt-optimizer.com
```

**或者在部署脚本中设置环境变量：**
```bash
export VITE_API_PROXY_URL=https://api.prompt-optimizer.com
npm run build
```

**结果：** 前端连接到生产服务器上的代理

---

## 📝 情景 4：修改 AI 提供商 API

### 默认配置（src/server/api-proxy.js 行 98）

```javascript
async function callQwen(model, messages, temperature, max_tokens, top_p, apiKey) {
  const client = axios.create({
    baseURL: 'https://dashscope.aliyuncs.com/api/v1',  // ← 默认
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  // ...
}
```

**如果需要改成自己的代理地址：**

```javascript
async function callQwen(model, messages, temperature, max_tokens, top_p, apiKey) {
  const client = axios.create({
    baseURL: 'https://my-qwen-proxy.com/api/v1',  // ← 改成自己的
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  // ...
}
```

---

## 📝 情景 5：同时改多个配置

### 文件：.env.local
```ini
# 前端连接代理的地址改为自建代理
VITE_API_PROXY_URL=http://my-proxy-server.local:3001
```

### 文件：src/server/api-proxy.js（三处修改）

#### 修改 1：OpenAI 代理（第 76 行）
```javascript
// 之前
baseURL: 'https://api.openai.com/v1',

// 之后（使用自建代理中转）
baseURL: 'https://my-proxy.com/openai',
```

#### 修改 2：Qwen 代理（第 98 行）
```javascript
// 之前
baseURL: 'https://dashscope.aliyuncs.com/api/v1',

// 之后
baseURL: 'https://my-proxy.com/qwen',
```

#### 修改 3：接口路径调整（如果代理改了接口）
```javascript
// 之前
const response = await client.post('/services/aigc/text-generation/generation', {

// 之后
const response = await client.post('/chat/completions', {  // 统一接口
```

---

## 🔄 验证配置是否生效

### 验证前端配置

**在浏览器控制台中输入：**
```javascript
console.log(import.meta.env.VITE_API_PROXY_URL)
```

**输出应该是你设置的值：**
```
http://localhost:3001
或
http://192.168.1.100:3001
或
https://api.yourserver.com
```

### 验证后端配置

**检查代理服务器日志：**
```
[2024-03-18T12:00:00.000Z] POST /api/proxy/qwen/chat
```

**检查代理是否连接到正确的 API：**
```bash
# 查看网络请求（在代理服务器运行的机器上）
# 应该看到连接到 https://dashscope.aliyuncs.com/...
```

---

## 📊 配置对应表

| 要修改的对象 | 文件 | 内容示例 |
|-----------|------|--------|
| 前端 → 代理地址 | `.env` | `VITE_API_PROXY_URL=http://localhost:3001` |
| 代理 → OpenAI | `src/server/api-proxy.js` 第 76 行 | `https://api.openai.com/v1` |
| 代理 → Qwen | `src/server/api-proxy.js` 第 98 行 | `https://dashscope.aliyuncs.com/api/v1` |
| 代理 → MiniMax | `src/server/api-proxy.js` 第 122 行 | `https://api.minimax.chat/v1` |
| 代理 → Zhipu | `src/server/api-proxy.js` 第 154 行 | `https://open.bigmodel.cn/api/paas/v4` |

---

## 💡 配置最佳实践

### ✅ 推荐做法

1. **不要改 .env 中的默认值**
   ```ini
   # .env（提交到 git）
   VITE_API_PROXY_URL=http://localhost:3001
   ```

2. **用 .env.local 覆盖个人配置**
   ```ini
   # .env.local（不提交）
   VITE_API_PROXY_URL=http://192.168.1.100:3001
   ```

3. **用环境变量覆盖生产配置**
   ```bash
   # CI/CD 或部署脚本中
   export VITE_API_PROXY_URL=https://api.prod.com
   ```

### ❌ 避免做法

1. **不要在 src/server/api-proxy.js 中硬编码生产 URL**
   ```javascript
   // ❌ 不好
   baseURL: process.env.NODE_ENV === 'production' 
     ? 'https://prod.com' 
     : 'https://dev.com'
   
   // ✅ 好
   baseURL: 'https://dashscope.aliyuncs.com/api/v1'  // 官方 API
   ```

2. **不要提交包含密钥或个人信息的 .env.local**
   ```
   # .env.local 应该在 .gitignore 中
   ```

---

## 🚀 修改后重启

### 修改了前端配置

```bash
# 重启前端开发服务器
npm run dev
```

### 修改了后端配置

```bash
# 重启代理服务器
npm run api:proxy

# 或者重启整个
npm run start
```

### 修改了两个都改

```bash
# 停止当前运行
Ctrl+C

# 重新启动
npm run start
```

---

## 📝 完整示例：从开发改到生产

### 步骤 1：开发时的配置

**`.env`**
```ini
VITE_API_PROXY_URL=http://localhost:3001
```

**`npm run start`** - 启动开发环境

### 步骤 2：部署到生产

**修改 `.env`**
```ini
VITE_API_PROXY_URL=https://api.prompt-optimizer.com
```

**构建**
```bash
npm run build
```

**部署**
```bash
# 将 dist/ 文件夹上传到生产服务器
```

**在服务器上启动代理**
```bash
# 在服务器上
node src/server/api-proxy.js
# 或使用 PM2
pm2 start src/server/api-proxy.js --name "api-proxy"
```

---

**现在你知道怎么配置了！根据你的场景选择相应的修改方式。** 🚀
