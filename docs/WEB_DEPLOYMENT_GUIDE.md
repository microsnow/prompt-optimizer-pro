# Web 部署指南

## 📋 概述

本应用采用**前后端分离架构**，包含：
1. **Vue 前端** - 用户界面
2. **Node.js 代理服务器** - API 中转和安全管理
3. **第三方 AI API** - Qwen 等大模型

---

## ❓ 代理是否必需？

### **答案：是的，强烈推荐！**

**三个核心原因**：

#### 1️⃣ **解决 CORS 跨域问题**
```
❌ 前端直连外部 API
├─ 浏览器同源策略阻止
├─ 需要 API 服务方配置 CORS
└─ 容易失败或被限制

✅ 通过代理转发
├─ 服务器间通信无跨域限制
├─ 前后端在同域通信
└─ 更加稳定可靠
```

#### 2️⃣ **保护 API 密钥安全**
```
❌ 密钥在前端代码中
├─ 暴露在浏览器 DevTools
├─ 任何人都可看到和滥用
└─ 造成安全漏洞和费用损失

✅ 密钥在服务器端
├─ 用户只提交请求参数
├─ API Key 完全隐藏
└─ 可添加用户认证和审核
```

#### 3️⃣ **集中管理能力**
```
✅ 统一处理
├─ 多个 AI 提供商管理
├─ 请求日志和统计
├─ 速率限制和配额管理
└─ 统一的 OpenAI 格式
```

---

## 🚀 Web 部署方案

### **推荐方案：前后端同服务器部署**

```
┌─────────────────────────────────────┐
│      Web 服务器 (例如 Nginx)         │
├─────────────────────────────────────┤
│ 前端资源                  API 代理    │
│ (dist/)              (Node.js Port)  │
│                                     │
│ /          → index.html          │
│ /api       → Node.js :3001       │
│ /health    → 健康检查            │
└─────────────────────────────────────┘
           ↓
    Qwen API / OpenAI API
```

---

## ⚙️ 部署步骤

### **1. 构建前端**

```bash
npm run build
# 输出到 dist/ 文件夹
```

### **2. 启动后端代理**

```bash
# 生产环境启动
NODE_ENV=production npm run api:proxy
```

### **3. 配置 Nginx 反向代理**

```nginx
server {
  listen 80;
  server_name yourdomain.com;

  # 前端静态文件
  location / {
    root /var/www/html/your-app;
    try_files $uri $uri/ /index.html;
  }

  # API 代理
  location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

**📖 详细配置说明：**
- 完整配置指南：[NGINX_CONFIGURATION_GUIDE.md](NGINX_CONFIGURATION_GUIDE.md)
- Nginx 配置示例：[nginx.conf.example](nginx.conf.example)
- 自动配置脚本：在 `scripts/setup-nginx.sh` 中

### **4. 设置环境变量**

创建 `.env.production` 或在启动前设置：

```bash
# Linux/Mac
export NODE_ENV=production
export ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
npm run api:proxy

# Windows PowerShell
$env:NODE_ENV = "production"
$env:ALLOWED_ORIGINS = "https://yourdomain.com"
npm run api:proxy

# 或在 package.json 中配置
```

---

## 🔒 CORS 配置

### **环境变量方式（推荐）**

```bash
# 允许多个源（逗号分隔，无空格）
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com,https://admin.yourdomain.com
```

### **代码中的默认值**

```javascript
// src/server/api-proxy.js
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];
```

### **特殊情况处理**

```javascript
// ✅ 支持无 origin 的请求（curl、Electron、移动应用）
// ✅ 支持动态 CORS 配置
// ✅ 自动拒绝未授权的源
```

---

## 📊 部署架构对比

| 方案 | 难度 | 安全性 | CORS | 维护 | 推荐 |
|-----|------|--------|------|------|------|
| **同服务器部署** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ✅ 强烈推荐 |
| **前后端分离（同域）** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | ⭐⭐ | 可以 |
| **完全分离（跨域）** | ⭐⭐ | ⭐⭐ | ❌ | ❌ | ❌ 不推荐 |
| **直连外部 API** | ⭐ | ⭐ | ❌ 困难 | ⭐ | ❌ 最差 |

---

## 🔧 API 端点

### **健康检查**
```bash
curl http://localhost:3001/health
# 返回: {"status":"ok","timestamp":"..."}
```

### **Qwen 聊天补全**
```bash
curl -X POST http://localhost:3001/api/proxy/qwen/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.5-plus",
    "messages": [{"role": "user", "content": "你好"}],
    "apiKey": "sk-xxx"
  }'
```

### **流式响应**
```bash
curl -X POST http://localhost:3001/api/proxy/qwen/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.5-plus",
    "messages": [...],
    "apiKey": "sk-xxx",
    "stream": true
  }'
```

---

## 🎯 前端配置

### **开发环境**（localhost）
```typescript
// src/main.ts 或 .env
VITE_API_BASE=http://localhost:3001
```

### **生产环境**（Web）
```typescript
// 自动使用相同域名
const API_BASE = '/api';
```

**修改前端 API 调用**：
```typescript
// ❌ 不要直连
// const res = await axios.post('https://coding.dashscope.aliyuncs.com/v1/chat/completions', ...)

// ✅ 应该调用代理
const res = await axios.post('/api/proxy/qwen/chat', {
  model: 'qwen3.5-plus',
  messages: [...],
  apiKey: userApiKey,  // 用户输入
})
```

---

## 🚨 常见问题

### **Q1: 如果不用代理会怎样？**

**CORS 错误示例**：
```
Access to XMLHttpRequest at 'https://coding.dashscope.aliyuncs.com/v1/chat/completions' 
from origin 'https://yourdomain.com' has been blocked by CORS policy
```

**需要 Qwen API 添加 CORS 头**（通常不支持），或使用代理转发。

### **Q2: 代理会增加延迟吗？**

**答**：忽略不计（<10ms）。代理只是转发，不做复杂计算。

### **Q3: API Key 怎么处理？**

**安全方案**：
```typescript
// ❌ 错误：硬编码在代码中
const apiKey = 'sk-xxx';  // 暴露了！

// ✅ 正确：用户在 UI 中输入
// 前端: const res = await api.chat(userInputApiKey)
// 后端: 直接用传入的 key，不存储
```

### **Q4: 可以添加用户认证吗？**

**完全可以**！代理可以拦截请求并验证用户：

```javascript
// 示例
app.post('/api/proxy/qwen/chat', (req, res) => {
  // ✅ 验证用户认证
  if (!req.headers.authorization) {
    return res.status(401).json({ error: '未授权' });
  }
  
  // ✅ 检查用户配额
  if (userQuotaExceeded(req.user)) {
    return res.status(429).json({ error: '超出配额' });
  }
  
  // ✅ 转发请求
  // ...
});
```

---

## ✅ 检查清单

- [ ] 前端构建完成（`npm run build`）
- [ ] 代理服务器可启动（`npm run api:proxy`）
- [ ] 环境变量配置正确（`ALLOWED_ORIGINS`）
- [ ] Nginx 反向代理配置完成
- [ ] 前端 API 调用指向代理（`/api`）
- [ ] HTTPS 证书配置（生产环境必须）
- [ ] 测试 CORS 请求
- [ ] 测试完整流程
- [ ] 设置 PM2 自动重启（推荐）

---

## 📚 相关文件

- [BASE_URL_CONFIG_GUIDE.md](BASE_URL_CONFIG_GUIDE.md) - API 配置
- [CORS_SOLUTION.md](CORS_SOLUTION.md) - CORS 详解
- [DETAILED_LOGGING_GUIDE.md](DETAILED_LOGGING_GUIDE.md) - 日志配置

