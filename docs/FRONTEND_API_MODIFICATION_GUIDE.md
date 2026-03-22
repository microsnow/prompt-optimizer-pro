# 前端代码修改指南 - 使用 Nginx 代理 API

## 📝 需要修改的文件

### 1. `src/services/api.ts` - 核心修改

```typescript
// ============================================================
// 原来的配置（错误）
// ============================================================
// const API_PROXY_URL = 'http://localhost:3001';

// ============================================================
// 新的配置（正确）- 直接调用 Nginx 代理
// ============================================================
const API_BASE = '/api';

export async function chatWithQwen(request: {
  model: string;
  messages: any[];
  apiKey: string;
  stream?: boolean;
}) {
  // ✅ 新的 API 端点：/api/qwen/... → Nginx → Qwen API
  const url = `${API_BASE}/qwen/chat/completions`;
  
  try {
    const response = await axios.post(url, {
      model: request.model,
      messages: request.messages,
      stream: request.stream || false,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.apiKey}`,  // ✅ 直接传递 API Key
      },
      timeout: 60000,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Qwen API 错误:', error.response?.data || error.message);
    throw error;
  }
}

export async function chatWithOpenAI(request: {
  model: string;
  messages: any[];
  apiKey: string;
  stream?: boolean;
}) {
  // ✅ 新的 API 端点：/api/openai/... → Nginx → OpenAI API
  const url = `${API_BASE}/openai/chat/completions`;
  
  try {
    const response = await axios.post(url, {
      model: request.model,
      messages: request.messages,
      stream: request.stream || false,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.apiKey}`,
      },
      timeout: 60000,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ OpenAI API 错误:', error.response?.data || error.message);
    throw error;
  }
}

export async function chatWithDoubao(request: {
  model: string;
  messages: any[];
  apiKey: string;
  stream?: boolean;
}) {
  // ✅ 新的 API 端点：/api/doubao/... → Nginx → 豆包 API
  const url = `${API_BASE}/doubao/chat/completions`;
  
  try {
    const response = await axios.post(url, {
      model: request.model,
      messages: request.messages,
      stream: request.stream || false,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.apiKey}`,
      },
      timeout: 60000,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ 豆包 API 错误:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================================
// 流式响应处理（如需要）
// ============================================================
export async function chatStreamWithQwen(request: {
  model: string;
  messages: any[];
  apiKey: string;
  onChunk: (chunk: string) => void;
  onError: (error: Error) => void;
}) {
  const url = `${API_BASE}/qwen/chat/completions`;
  
  try {
    const response = await axios.post(url, {
      model: request.model,
      messages: request.messages,
      stream: true,  // ✅ 启用流式模式
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.apiKey}`,
      },
      responseType: 'stream',  // ✅ 处理流式响应
      timeout: 300000,  // 流式需要更长的超时时间
    });

    // 处理流式数据
    response.data.on('data', (chunk: any) => {
      const text = chunk.toString();
      // 解析 Server-Sent Events 格式
      const lines = text.split('\\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6);
          if (jsonStr === '[DONE]') continue;
          
          try {
            const json = JSON.parse(jsonStr);
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              request.onChunk(content);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    });

    response.data.on('error', (error: Error) => {
      request.onError(error);
    });
  } catch (error: any) {
    request.onError(error);
  }
}
```

### 2. `.env.production` - 环境变量

```env
# API 基础 URL - 生产环境使用相对路径
VITE_API_BASE=/api

# 应用名称
VITE_APP_NAME=PromptOptimizer Pro

# 版本
VITE_APP_VERSION=1.0.0
```

### 3. `src/main.ts` - 检查（可能需要调整）

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// ✅ 全局 API 配置
const apiConfig = {
  // 开发环境：使用 localhost:3001
  // 生产环境：使用 /api（Nginx 代理）
  baseURL: import.meta.env.VITE_API_BASE || '/api',
};

// 配置全局属性
const app = createApp(App)
app.config.globalProperties.$apiConfig = apiConfig
app.mount('#app')
```

### 4. 如果使用 axios 全局配置

```typescript
// src/services/axios-config.ts - 新建文件

import axios from 'axios'

// 创建 axios 实例
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 可以在这里添加通用的请求头
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
apiClient.interceptors.response.use(
  response => response,
  error => {
    // 错误处理
    console.error('API 错误:', error)
    return Promise.reject(error)
  }
)

export default apiClient
```

---

## 🔄 调用方式比较

### **原来的方式（不用了）**
```typescript
// ❌ 调用 Node.js 代理
const response = await axios.post('http://localhost:3001/api/proxy/qwen/chat', {
  model: 'qwen3.5-plus',
  messages: [...],
  apiKey: userKey,
})
```

### **新的方式（现在用这个）**
```typescript
// ✅ 直接调用 Nginx 代理
const response = await axios.post('/api/qwen/chat/completions', {
  model: 'qwen3.5-plus',
  messages: [...],
}, {
  headers: {
    'Authorization': `Bearer ${userKey}`,
  }
})
```

---

## 📋 修改检查清单

### **src/services/api.ts 中**
- [ ] 删除所有 `localhost:3001` 引用
- [ ] 更新 Qwen 端点为 `/api/qwen/chat/completions`
- [ ] 更新 OpenAI 端点为 `/api/openai/chat/completions`
- [ ] 更新豆包端点为 `/api/doubao/chat/completions`
- [ ] 使用 Authorization 头传递 API Key
- [ ] 测试所有 API 调用

### **其他文件中**
- [ ] src/main.ts - 确认 API_BASE 配置
- [ ] .env.production - 添加 VITE_API_BASE=/api
- [ ] vite.config.ts - 删除或注释掉 proxy 配置

### **删除不再需要的代码**
- [ ] 删除 src/server/api-proxy.ts（不再需要）
- [ ] 删除 src/server/api-proxy.js（不再需要）
- [ ] 从 package.json 删除 api:proxy 脚本
- [ ] 从 package.json 删除相关依赖（express 等）

---

## 🧪 测试

### **开发环境测试**
```bash
# 1. 启动开发服务器
npm run dev

# 2. 确保 Nginx 正在运行并正确代理 API
# 或者配置 vite 本地代理指向实际的 API

# 3. 在浏览器中测试 API 调用
# 打开 F12 → Network 标签
# 查看 /api/qwen/... 请求
# 应该看到来自真实 API 的响应
```

### **生产环境测试**
```bash
# 1. 构建
npm run build

# 2. 上传到服务器
scp -r dist/* user@server:/var/www/html/your-app/

# 3. 测试
curl https://yourdomain.com/
curl -X POST https://yourdomain.com/api/qwen/chat/completions \\
  -H "Authorization: Bearer sk-your-key" \\
  -d '{"model":"qwen3.5-plus","messages":[{"role":"user","content":"hi"}]}'
```

---

## ⚠️ 常见问题

### **Q1: 403 Forbidden - CORS 错误**
**原因**: Nginx 没有正确转发请求头或 API 服务器拒绝

**解决**:
```nginx
# 在 Nginx 配置中确保：
proxy_pass_request_headers on;  # 转发所有请求头
```

### **Q2: 401 Unauthorized**
**原因**: API Key 没有正确传递

**解决**:
```typescript
// 确保在 headers 中传递
headers: {
  'Authorization': `Bearer ${apiKey}`,  // ✅ 正确格式
}
```

### **Q3: 404 Not Found**
**原因**: API 端点路径错误

**解决**: 检查 Nginx 配置中的 proxy_pass 地址和前端调用的路径是否匹配

### **Q4: 504 Gateway Timeout**
**原因**: API 请求超时

**解决**: 增加 Nginx 的超时时间
```nginx
proxy_read_timeout 300s;  # 增加到 5 分钟
```

---

## 📚 相关文件

- [NGINX_API_PROXY_GUIDE.md](NGINX_API_PROXY_GUIDE.md) - Nginx 配置指南
- [nginx.conf.api-proxy](nginx.conf.api-proxy) - 完整的 Nginx 配置
- [OPENAI_FORMAT_SPECIFICATION.md](OPENAI_FORMAT_SPECIFICATION.md) - API 格式规范
- [MODEL_CONFIGURATION.md](MODEL_CONFIGURATION.md) - 模型配置
