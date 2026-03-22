# Nginx 直接代理 API - 配置指南

## 🎯 核心概念

**用 Nginx 直接代理外部 API，完全替换 Node.js 代理**

```
┌─────────────────────────────────────────┐
│         用户浏览器                       │
└────────────┬────────────────────────────┘
             │
             ↓
    ┌────────────────────┐
    │   Nginx :80/443    │  ← 唯一的代理
    ├────────────────────┤
    │ /           → dist/ (前端)
    │ /api/qwen   → Qwen API
    │ /api/openai → OpenAI API
    │ /api/doubao → 豆包 API
    └────────────────────┘
             │
    ┌────────┴─────────────┬───────────┐
    ↓                      ↓           ↓
  Qwen API            OpenAI API    豆包 API
```

---

## ⚙️ Nginx 配置（关键部分）

### **1. 完整的 Nginx 配置**

```nginx
# HTTP 重定向 HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志
    access_log /var/log/nginx/access.log combined;
    error_log /var/log/nginx/error.log warn;

    # ============================================================
    # 前端静态资源
    # ============================================================
    location / {
        root /var/www/html/your-app;
        try_files $uri $uri/ /index.html;

        # 缓存策略
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 7d;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }

    # ============================================================
    # API 代理：Qwen
    # ============================================================
    location /api/qwen/ {
        # 目标 API 地址
        proxy_pass https://coding.dashscope.aliyuncs.com/v1/;

        # 基础代理配置
        proxy_http_version 1.1;
        proxy_set_header Host coding.dashscope.aliyuncs.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 请求体大小
        client_max_body_size 50M;

        # 超时
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 300s;  # 适合流式响应

        # 关键：修改请求头（隐藏 API Key 处理）
        proxy_set_header Authorization $http_x_api_key;
    }

    # ============================================================
    # API 代理：OpenAI
    # ============================================================
    location /api/openai/ {
        proxy_pass https://api.openai.com/v1/;

        proxy_http_version 1.1;
        proxy_set_header Host api.openai.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 传递 Authorization 头
        proxy_set_header Authorization $http_authorization;

        client_max_body_size 50M;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 300s;
    }

    # ============================================================
    # API 代理：豆包 (字节)
    # ============================================================
    location /api/doubao/ {
        proxy_pass https://ark.cn-beijing.volces.com/api/v3/;

        proxy_http_version 1.1;
        proxy_set_header Host ark.cn-beijing.volces.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 传递 Authorization 头
        proxy_set_header Authorization $http_authorization;

        client_max_body_size 50M;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 300s;
    }

    # ============================================================
    # 安全响应头
    # ============================================================
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
}
```

---

## 📝 前端代码修改

前端直接调用 Nginx 代理的 API，而不是 Node.js：

### **修改 API 调用地址**

```typescript
// src/services/api.ts - 原来的（错误）
// const API_BASE = 'http://localhost:3001';

// ✅ 新的（正确）- 前端直接调用 Nginx 代理的 API
const API_BASE = '/api';

export async function chatWithQwen(data: ChatRequest) {
  // 原来：/api/proxy/qwen/chat → Node.js:3001
  // 现在：/api/qwen/chat/completions → Nginx → Qwen API
  
  const response = await axios.post(`${API_BASE}/qwen/chat/completions`, {
    model: data.model,
    messages: data.messages,
    // ✅ 关键：直接传递 API Key 到前端，让 Nginx 转发
  }, {
    headers: {
      'Authorization': `Bearer ${data.apiKey}`,
    }
  });
  
  return response.data;
}

// OpenAI
export async function chatWithOpenAI(data: ChatRequest) {
  const response = await axios.post(`${API_BASE}/openai/chat/completions`, {
    model: data.model,
    messages: data.messages,
  }, {
    headers: {
      'Authorization': `Bearer ${data.apiKey}`,
    }
  });
  
  return response.data;
}

// 豆包
export async function chatWithDoubao(data: ChatRequest) {
  const response = await axios.post(`${API_BASE}/doubao/chat/completions`, {
    model: data.model,
    messages: data.messages,
  }, {
    headers: {
      'Authorization': `Bearer ${data.apiKey}`,
    }
  });
  
  return response.data;
}
```

### **环境变量配置**

```env
# .env.production
VITE_API_BASE=/api
VITE_NODE_ENV=production
```

---

## 🔒 关键安全考虑

### **1. API Key 的处理**

**选项 A：客户端提供（推荐，简单）**
```
用户在 UI 中输入 API Key
→ 前端在请求中传递
→ Nginx 转发到 API 服务器
→ API 服务器不存储 Key
```

**选项 B：服务器端管理（更安全）**
```
用户提供 API Key
→ 保存在服务器数据库中
→ 前端只发送用户 ID
→ Nginx/后端代码读取 Key 并添加到请求中
```

### **2. 添加 CORS 支持**

```nginx
location /api {
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;

    if ($request_method = OPTIONS) {
        return 204;
    }

    # 代理配置...
}
```

### **3. 添加 API 密钥验证（可选）**

```nginx
# 验证前端的认证令牌
location /api {
    # 检查自定义的 X-API-Key 头
    set $api_key $http_x_api_key;
    
    if ($api_key = "") {
        return 401 "API Key required";
    }

    # 继续代理...
}
```

---

## 🚀 部署步骤

### **1. 更新前端代码**

```bash
# 修改 src/services/api.ts
# 更新 API 调用地址从 localhost:3001 改为 /api

git add .
git commit -m "chore: replace Node.js proxy with Nginx proxy"
```

### **2. 构建前端**

```bash
npm run build
```

### **3. 上传文件到服务器**

```bash
scp -r dist/* user@your-server:/var/www/html/your-app/
```

### **4. 配置 Nginx**

```bash
ssh user@your-server

# 编辑 Nginx 配置文件
sudo vim /etc/nginx/sites-available/your-app.conf

# 复制上面的配置，修改域名和 SSL 证书路径

# 检查语法
sudo nginx -t

# 重新加载
sudo systemctl reload nginx
```

### **5. 完成！删除 Node.js 代理**

```bash
# 不再需要运行 npm run api:proxy
# 完全用 Nginx 代理替换
```

---

## 🧪 测试

### **1. 测试前端访问**

```bash
curl https://yourdomain.com/
# 应该返回 index.html
```

### **2. 测试 API 代理**

```bash
# 测试 Qwen API
curl -X POST https://yourdomain.com/api/qwen/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-qwen-key" \
  -d '{
    "model": "qwen3.5-plus",
    "messages": [{"role": "user", "content": "你好"}]
  }'

# 应该返回 Qwen 的响应
```

### **3. 检查日志**

```bash
sudo tail -f /var/log/nginx/access.log
# 应该看到 API 请求被代理
```

---

## 📋 优势对比

| 功能 | Node.js 代理 | Nginx 代理 |
|------|------|------|
| **性能** | 中等（多一层处理） | ⭐⭐⭐⭐⭐ 更快 |
| **维护** | 需要运行额外的 Node.js 进程 | ⭐ 简单 |
| **配置** | 代码中配置 | ⭐ Nginx 配置 |
| **扩展性** | 有限 | ⭐⭐⭐⭐⭐ 灵活 |
| **安全性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **资源占用** | 需要额外 RAM | ⭐ 轻量 |

---

## 🎯 迁移清单

- [ ] 修改前端 API 调用地址（localhost:3001 → /api）
- [ ] 更新 Qwen、OpenAI、豆包 的 API 端点
- [ ] 前端构建成功
- [ ] 文件上传到服务器
- [ ] Nginx 配置已编写和测试
- [ ] SSL 证书已配置
- [ ] Nginx 重新加载成功
- [ ] API 代理测试通过
- [ ] 删除 Node.js 代理代码（src/server/api-proxy.*)
- [ ] 从 package.json 删除 api:proxy 脚本

---

## 📚 相关文档

- [WEB_DEPLOYMENT_GUIDE.md](WEB_DEPLOYMENT_GUIDE.md) - Web 部署
- [CORS_SOLUTION.md](CORS_SOLUTION.md) - CORS 问题
- [OPENAI_FORMAT_SPECIFICATION.md](OPENAI_FORMAT_SPECIFICATION.md) - API 格式
- [MODEL_CONFIGURATION.md](MODEL_CONFIGURATION.md) - 模型配置
