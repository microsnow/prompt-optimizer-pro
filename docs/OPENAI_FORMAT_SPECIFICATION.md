# OpenAI 格式规范 - 大模型统一接口

## 📋 概述

所有大模型接口已统一为 **OpenAI 标准格式**，包括请求格式、响应格式和错误处理。这确保了跨平台的一致性和互操作性。

---

## 🎯 关键特性

| 特性 | 说明 |
|------|------|
| **统一端点** | `/v1/chat/completions` |
| **标准请求** | OpenAI 兼容的请求格式 |
| **标准响应** | OpenAI 兼容的响应格式 |
| **流式支持** | SSE (Server-Sent Events) 流式传输 |
| **多提供商** | OpenAI, Qwen, MiniMax, Zhipu |
| **向后兼容** | 支持旧 `/api/proxy/` 路由 |

---

## 📡 API 端点

### 主端点

```
POST /v1/chat/completions
```

**基础 URL：**
- 开发环境：`http://localhost:3001`
- 生产环境：`https://your-api-server.com`

---

## 📤 请求格式

### 基础请求

```json
POST /v1/chat/completions
Content-Type: application/json

{
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "你是一个有帮助的助手。"
    },
    {
      "role": "user",
      "content": "Hello!"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "top_p": 1,
  "apiKey": "sk-xxxxxxxxxxxxxxxx"
}
```

### 请求参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `provider` | string | ✅ | AI 提供商: `openai`, `qwen`, `minimax`, `zhipu` |
| `model` | string | ✅ | 模型名称，见下表 |
| `messages` | array | ✅ | 消息列表，OpenAI 格式 |
| `temperature` | number | ❌ | 温度 (0-2)，默认 0.7 |
| `max_tokens` | number | ❌ | 最大输出 token 数，默认 2000 |
| `top_p` | number | ❌ | Top-p 采样，默认 1 |
| `apiKey` | string | ✅ | API 密钥 |
| `stream` | boolean | ❌ | 是否流式输出，默认 false |

### 消息格式

```json
{
  "role": "user|assistant|system",
  "content": "消息内容"
}
```

**role 说明：**
- `system` - 系统提示词
- `user` - 用户消息
- `assistant` - 助手回复

---

## 📥 响应格式

### 非流式响应

```json
{
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "这是助手的回复"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 50,
    "total_tokens": 70
  }
}
```

### 流式响应

```
data: {"choices":[{"index":0,"delta":{"role":"assistant","content":"这"},"finish_reason":null}]}

data: {"choices":[{"index":0,"delta":{"content":"是"},"finish_reason":null}]}

data: {"choices":[{"index":0,"delta":{"content":"回复"},"finish_reason":"stop"}]}

data: [DONE]
```

### 错误响应

```json
{
  "error": "错误信息",
  "provider": "openai"
}
```

---

## 🔄 支持的模型

### OpenAI

| 模型 | 说明 |
|------|------|
| `gpt-4` | 最强大的模型 |
| `gpt-4-turbo-preview` | GPT-4 Turbo |
| `gpt-3.5-turbo` | 快速、便宜的模型 |
| `gpt-3.5-turbo-16k` | 16K 上下文窗口 |

**示例：**
```json
{
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "apiKey": "sk-xxxxxxxxxxxxxxxx",
  ...
}
```

### Qwen (阿里云通义千问)

| 模型 | 说明 |
|------|------|
| `qwen-turbo` | 快速响应 |
| `qwen3.5-plus` | 平衡性能 |
| `qwen-long` | 长上下文 (200K) |
| `qwen-max` | 最强能力 |

**示例：**
```json
{
  "provider": "qwen",
  "model": "qwen-turbo",
  "apiKey": "sk-xxxxxxxxxxxxxxxx",
  ...
}
```

### MiniMax

| 模型 | 说明 |
|------|------|
| `minimax-text-saas` | 标准文本模型 |

**示例：**
```json
{
  "provider": "minimax",
  "model": "minimax-text-saas",
  "apiKey": "xxxxxxxxxxxxxxxx",
  ...
}
```

### Zhipu (智谱 ChatGLM)

| 模型 | 说明 |
|------|------|
| `glm-4` | 最强模型 |
| `glm-4-flash` | 快速模型 |
| `glm-3-turbo` | 经济型模型 |

**示例：**
```json
{
  "provider": "zhipu",
  "model": "glm-4",
  "apiKey": "xxxxxxxxxxxxxxxx",
  ...
}
```

---

## 💻 代码示例

### Python 示例

```python
import requests
import json

def call_chat_completion(provider, model, messages, api_key):
    url = "http://localhost:3001/v1/chat/completions"
    
    payload = {
        "provider": provider,
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2000,
        "top_p": 1,
        "apiKey": api_key,
        "stream": False
    }
    
    response = requests.post(url, json=payload)
    return response.json()

# 使用示例
messages = [
    {"role": "system", "content": "你是一个有帮助的助手"},
    {"role": "user", "content": "你好！"}
]

result = call_chat_completion(
    provider="openai",
    model="gpt-3.5-turbo",
    messages=messages,
    api_key="sk-xxxxxxxxxxxxxxxx"
)

print(result["choices"][0]["message"]["content"])
```

### JavaScript 示例

```javascript
async function callChatCompletion(provider, model, messages, apiKey) {
  const response = await fetch('http://localhost:3001/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider,
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      apiKey,
      stream: false
    })
  });

  const data = await response.json();
  return data;
}

// 使用示例
const messages = [
  { role: 'system', content: '你是一个有帮助的助手' },
  { role: 'user', content: '你好！' }
];

const result = await callChatCompletion(
  'openai',
  'gpt-3.5-turbo',
  messages,
  'sk-xxxxxxxxxxxxxxxx'
);

console.log(result.choices[0].message.content);
```

### TypeScript 示例

```typescript
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  provider: 'openai' | 'qwen' | 'minimax' | 'zhipu';
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  apiKey: string;
  stream?: boolean;
}

interface ChatCompletionResponse {
  object: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function callChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const response = await fetch('http://localhost:3001/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// 使用示例
const result = await callChatCompletion({
  provider: 'openai',
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: '你是一个有帮助的助手' },
    { role: 'user', content: '你好！' }
  ],
  apiKey: 'sk-xxxxxxxxxxxxxxxx'
});

console.log(result.choices[0].message.content);
```

### cURL 示例

```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "system",
        "content": "你是一个有帮助的助手"
      },
      {
        "role": "user",
        "content": "你好！"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 2000,
    "top_p": 1,
    "apiKey": "sk-xxxxxxxxxxxxxxxx",
    "stream": false
  }'
```

---

## 🔀 流式请求示例

### JavaScript 流式调用

```javascript
async function* streamChatCompletion(provider, model, messages, apiKey) {
  const response = await fetch('http://localhost:3001/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider,
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      apiKey,
      stream: true  // 启用流式
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const json = line.slice(6);
        if (json !== '[DONE]' && json) {
          try {
            yield JSON.parse(json);
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }
}

// 使用示例
for await (const chunk of streamChatCompletion('openai', 'gpt-3.5-turbo', messages, apiKey)) {
  const content = chunk.choices?.[0]?.delta?.content || '';
  process.stdout.write(content);
}
```

---

## ❌ 错误处理

### 常见错误

| 错误 | 状态码 | 解决方案 |
|------|--------|--------|
| 缺少 provider | 400 | 检查请求中是否包含 `provider` 字段 |
| 缺少 model | 400 | 检查请求中是否包含 `model` 字段 |
| 缺少 apiKey | 400 | 检查请求中是否包含 `apiKey` 字段 |
| 无效的 apiKey | 401 | 验证 API 密钥是否正确 |
| 请求过于频繁 | 429 | 实施速率限制，稍后重试 |
| 服务器错误 | 500 | 检查服务器日志，稍后重试 |

### 错误响应示例

```json
{
  "error": "无效的 API 密钥",
  "provider": "openai"
}
```

---

## 🔧 配置

### 环境变量

```bash
# .env 或 .env.local

# 代理服务器端口
PORT=3001

# 开发环境标志
NODE_ENV=development

# API 提供商配置（可选）
# OPENAI_API_BASE=https://api.openai.com/v1
# QWEN_API_BASE=https://dashscope.aliyuncs.com/api/v1
# MINIMAX_API_BASE=https://api.minimax.chat/v1
# ZHIPU_API_BASE=https://open.bigmodel.cn/api/paas/v4
```

### 启动代理服务器

```bash
# 方法 1: 直接运行
node src/server/api-proxy.js

# 方法 2: npm 命令
npm run api:proxy

# 方法 3: 启动前端和代理
npm run start
```

---

## 📚 参考资源

- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [Qwen API 文档](https://help.aliyun.com/document_detail/2400091.html)
- [MiniMax API 文档](https://www.minimaxi.com/document)
- [Zhipu API 文档](https://open.bigmodel.cn/dev/api)

---

## 📋 检查清单

在使用接口前，确保：

- ✅ 代理服务器正在运行 (`npm run api:proxy`)
- ✅ 已配置正确的 API 密钥
- ✅ 消息格式符合 OpenAI 标准
- ✅ 已设置合理的超时时间
- ✅ 已实施适当的错误处理
- ✅ 了解模型的 token 限制

---

**现在所有大模型接口都统一为 OpenAI 格式了！** 🚀
