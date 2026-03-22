# Qwen API 模型和端点配置指南

## Qwen 模型分类

### 1️⃣ 纯文本模型（文本生成）
用于文本到文本的任务，如回复、总结、翻译等。

**支持的模型：**
- `qwen3.5-plus` - 中等性能，平衡速度和质量
- `qwen-turbo` - 高速模型，适合实时场景
- `qwen-long` - 支持超长输入（最多 8K tokens）

**API 端点：**
```
POST https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

**请求格式：**
```json
{
  "model": "qwen3.5-plus",
  "messages": [
    {
      "role": "user",
      "content": "你好"
    }
  ],
  "parameters": {
    "temperature": 0.7,
    "max_tokens": 2000,
    "top_p": 1
  }
}
```

**响应格式：**
```json
{
  "output": {
    "text": "你好！我是通义千问..."
  },
  "usage": {
    "input_tokens": 5,
    "output_tokens": 50
  }
}
```

---

### 2️⃣ 多模态模型（图文理解）
用于处理图片和文本的任务。

**支持的模型：**
- `qwen-vl-plus` - 视觉理解模型
- `qwen-vl-max` - 高性能视觉模型

**API 端点：**
```
POST https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation
```

⚠️ **目前本项目不支持多模态模型**

---

## 在项目中使用

### 配置前端

```typescript
// App.vue 或相关配置
import { apiService } from '@/services/api';

// 初始化 Qwen 客户端
apiService.initQwen('your-qwen-api-key');

// 使用
const result = await apiService.optimizePrompt(
  '你的提示词',
  '优化策略',
  'qwen'
);
```

### 后端自动处理

后端代理服务器会自动：
1. 识别是否是 Qwen 提供商
2. 选择正确的端点
3. 转换请求格式
4. 转换响应为 OpenAI 格式

---

## 模型选择建议

| 场景 | 推荐模型 | 原因 |
|------|---------|------|
| 实时聊天 | `qwen-turbo` | 速度快，延迟低 |
| 文本优化 | `qwen3.5-plus` | 质量好，性价比高 |
| 长文本 | `qwen-long` | 支持 8K tokens |
| 常规任务 | `qwen3.5-plus` | 平衡型，默认推荐 |

---

## 常见参数说明

### temperature (温度)
- 范围：0.0 - 2.0
- 默认：0.7
- 说明：越低越确定，越高越随机

```javascript
// 确定性回复（如翻译、分类）
temperature: 0.3

// 平衡型（如对话、总结）
temperature: 0.7

// 创意型（如创意写作）
temperature: 1.5
```

### max_tokens (最大输出长度)
- 范围：1-2000
- 默认：2000
- 说明：限制输出文本长度

### top_p (核采样)
- 范围：0.0 - 1.0
- 默认：1.0
- 说明：控制词汇多样性

---

## API 调用示例

### 使用 curl

```bash
curl -X POST https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.5-plus",
    "messages": [
      {
        "role": "user",
        "content": "你好"
      }
    ],
    "parameters": {
      "temperature": 0.7,
      "max_tokens": 2000,
      "top_p": 1
    }
  }'
```

### 使用本项目的代理

```bash
curl -X POST http://localhost:3001/api/proxy/qwen/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.5-plus",
    "messages": [
      {
        "role": "user",
        "content": "你好"
      }
    ],
    "apiKey": "your-valid-qwen-api-key"
  }'
```

### 使用新的 OpenAI 格式端点

```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "qwen",
    "model": "qwen3.5-plus",
    "messages": [
      {
        "role": "user",
        "content": "你好"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 2000,
    "apiKey": "your-valid-qwen-api-key"
  }'
```

---

## 错误处理

### 常见错误

| 错误码 | 原因 | 解决 |
|--------|------|------|
| 401 | API Key 无效 | 检查并更新 API Key |
| 429 | 请求过于频繁 | 降低请求速率 |
| 500 | 服务器错误 | 稍后重试 |

### 调试技巧

查看详细日志：
```bash
# 启用 DEBUG 日志
LOG_LEVEL=DEBUG npm run api:proxy

# 查看最近日志
curl http://localhost:3001/logs?limit=100
```

---

## 项目中的实现

### 后端路由

```javascript
// /api/proxy/qwen/chat - 旧格式
// /v1/chat/completions - 新格式 (provider=qwen)
```

### 自动转换流程

1. **前端发送**：OpenAI 格式
2. **代理服务器**：识别 provider=qwen
3. **后端**：转换为 Qwen API 格式
4. **Qwen API**：返回 Qwen 格式
5. **代理服务器**：转换回 OpenAI 格式
6. **前端接收**：统一的 OpenAI 格式

```
前端 (OpenAI 格式)
  ↓
代理服务器 (格式转换)
  ↓
Qwen API (native 格式)
  ↓
代理服务器 (格式转换)
  ↓
前端 (OpenAI 格式)
```

---

## 最佳实践

✅ 使用 `qwen3.5-plus` 作为默认模型  
✅ 设置合理的 `max_tokens` 限制成本  
✅ 使用环境变量存储 API Key  
✅ 在代理服务器处理 API Key 安全  
✅ 实现请求超时和重试逻辑  
✅ 监控 API 使用和成本  

❌ 不要在前端硬编码 API Key  
❌ 不要使用过大的 `max_tokens`  
❌ 不要频繁切换模型  

---

## 参考资源

- [阿里云通义千问官方文档](https://help.aliyun.com/zh/model-service/user-guide/api-details)
- [Dashscope API 文档](https://dashscope.aliyuncs.com/developer/overview)
- 项目中的 `OPENAI_FORMAT_SPECIFICATION.md`

