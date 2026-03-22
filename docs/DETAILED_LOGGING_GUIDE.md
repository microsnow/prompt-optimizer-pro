# 🔍 详细日志系统 - 调试指南

## 📋 概述

已为所有 API 代理功能添加了**企业级的详细日志系统**，可以快速定位问题。

---

## 🚀 启用日志

### 设置日志级别

```bash
# 开发环境 - 最详细的日志
LOG_LEVEL=DEBUG npm run api:proxy

# 或生产环境
LOG_LEVEL=INFO npm run api:proxy
```

### 日志级别说明

| 级别 | 说明 | 用途 |
|------|------|------|
| **ERROR** | 错误信息 | 定位错误 |
| **WARN** | 警告信息 | 发现潜在问题 |
| **INFO** | 信息 | 重要事件 |
| **DEBUG** | 调试信息 | 理解流程 |
| **TRACE** | 详细跟踪 | 完整细节 |

---

## 📊 日志输出方式

### 1️⃣ 控制台输出

启动服务器时，日志会实时显示在控制台：

```bash
[2024-03-18T10:30:45.123Z] [INFO] [ROUTE_V1] 新请求到达 /v1/chat/completions
{
  "requestId": "1710753045123-abc1234",
  "provider": "qwen",
  "model": "qwen-turbo",
  "messageCount": 1,
  "stream": false
}
```

### 2️⃣ 文件日志

日志也会保存到文件：

```
./logs/2024-03-18.log
./logs/2024-03-19.log
...
```

**文件位置：** `项目根目录/logs/`

### 3️⃣ 通过 HTTP 查看日志

```bash
# 获取最近 100 行日志
curl http://localhost:3001/logs

# 获取最近 50 行日志
curl http://localhost:3001/logs?limit=50
```

**响应示例：**

```json
{
  "file": "2024-03-18.log",
  "totalLines": 245,
  "returnedLines": 100,
  "logs": [
    "[2024-03-18T10:30:45.123Z] [INFO] [ROUTE_V1] 新请求到达...",
    "[2024-03-18T10:30:45.456Z] [DEBUG] [VALIDATION] 字段验证通过...",
    ...
  ]
}
```

---

## 🔍 调试 500 错误的步骤

### 第 1 步：查看完整的请求

```bash
# 查看最近日志
curl http://localhost:3001/logs?limit=50
```

**查找 `requestId` 对应的日志链**

### 第 2 步：查找错误堆栈

在日志中搜索：

```
[EXCEPTION]    # 捕获到异常
[ERROR]        # API 调用失败
[API_ERROR]    # 第三方 API 返回错误
```

### 第 3 步：检查具体错误信息

```bash
# 查看完整错误栈
curl "http://localhost:3001/logs?limit=100" | grep -A 5 "EXCEPTION"
```

---

## 📍 关键日志标记

### HTTP 请求流程

```
┌─ HTTP_REQUEST      → 新请求到达
│  ├─ VALIDATION     → 验证参数
│  ├─ ROUTE_V1       → 调用 /v1/chat/completions
│  └─ ROUTE_LEGACY   → 调用 /api/proxy/...
│
├─ PAYLOAD          → 构建请求体
├─ PROCESSING       → 处理中
│
├─ CHAT_COMPLETION  → 调用大模型 API
│  ├─ [PROVIDER]    → 特定提供商处理
│  ├─ API_REQUEST   → 发送 HTTP 请求
│  ├─ API_RESPONSE  → 收到响应
│  └─ API_ERROR     → API 返回错误
│
├─ SUCCESS          → 成功返回
├─ ERROR            → 调用失败
└─ EXCEPTION        → 未捕获异常
```

### 日志颜色编码

| 颜色 | 级别 | 含义 |
|------|------|------|
| 🔴 红 | ERROR | 错误，需要修复 |
| 🟡 黄 | WARN | 警告，需要注意 |
| 🔵 青 | INFO | 信息，正常事件 |
| 🟣 紫 | DEBUG | 调试，调试用途 |
| ⚪ 白 | TRACE | 追踪，详细细节 |

---

## 🔧 常见问题排查

### 问题 1：`500 Internal Server Error`

**查看日志：**

```bash
curl "http://localhost:3001/logs?limit=100" | grep "EXCEPTION\|ERROR"
```

**找到对应的 `requestId`，然后查看完整日志链。**

### 问题 2：验证失败 (400 错误)

**检查：**
- `缺少 provider 字段` → 检查请求中是否有 `provider`
- `缺少 model 字段` → 检查请求中是否有 `model`
- `缺少 apiKey 字段` → 检查请求中是否有 `apiKey`

```bash
# 查看验证日志
curl "http://localhost:3001/logs?limit=50" | grep "VALIDATION"
```

### 问题 3：API 调用失败

**查看 API 错误详情：**

```bash
# 搜索 API 错误
curl "http://localhost:3001/logs?limit=200" | grep "API_ERROR"
```

**日志会包含：**
- HTTP 状态码
- API 响应数据
- 请求的 URL
- 错误原因

---

## 📝 日志样本

### 成功的请求日志

```
[2024-03-18T10:30:45.123Z] [INFO] [HTTP_REQUEST] POST /v1/chat/completions
{
  "method": "POST",
  "path": "/v1/chat/completions",
  "contentType": "application/json"
}

[2024-03-18T10:30:45.124Z] [INFO] [ROUTE_V1] [1710753045123-abc1234] 新请求到达 /v1/chat/completions
{
  "requestId": "1710753045123-abc1234",
  "provider": "qwen",
  "model": "qwen-turbo",
  "messageCount": 1,
  "stream": false
}

[2024-03-18T10:30:45.125Z] [DEBUG] [VALIDATION] [1710753045123-abc1234] 字段验证通过

[2024-03-18T10:30:45.126Z] [DEBUG] [PROCESSING] [1710753045123-abc1234] 调用 qwen API

[2024-03-18T10:30:45.127Z] [INFO] [CHAT_COMPLETION] 调用 qwen 开始
{
  "provider": "qwen",
  "model": "qwen-turbo",
  "messageCount": 1
}

[2024-03-18T10:30:47.456Z] [DEBUG] [QWEN] 开始调用 Qwen API
{
  "model": "qwen-turbo",
  "messageCount": 1,
  "temperature": 0.7,
  "max_tokens": 2000
}

[2024-03-18T10:30:48.789Z] [DEBUG] [QWEN] API 响应成功
{
  "status": 200,
  "contentLength": 1234,
  "outputLength": 456,
  "usage": { ... }
}

[2024-03-18T10:30:48.790Z] [INFO] [SUCCESS] [1710753045123-abc1234] API 调用成功
{
  "requestId": "1710753045123-abc1234",
  "provider": "qwen",
  "model": "qwen-turbo",
  "duration": "2665ms",
  "responseSize": 1500
}

[2024-03-18T10:30:48.791Z] [DEBUG] [HTTP_RESPONSE] POST /v1/chat/completions
{
  "statusCode": 200,
  "method": "POST",
  "path": "/v1/chat/completions"
}
```

### 失败的请求日志

```
[2024-03-18T10:35:20.100Z] [INFO] [ROUTE_V1] [1710753320100-def5678] 新请求到达 /v1/chat/completions
{
  "requestId": "1710753320100-def5678",
  "provider": "qwen",
  "model": "qwen-turbo"
}

[2024-03-18T10:35:20.101Z] [DEBUG] [PROCESSING] [1710753320100-def5678] 调用 qwen API

[2024-03-18T10:35:20.102Z] [DEBUG] [QWEN] 开始调用 Qwen API

[2024-03-18T10:35:22.345Z] [ERROR] [API_ERROR] [QWEN] Qwen API 调用失败
{
  "message": "401 Unauthorized",
  "status": 401,
  "statusText": "Unauthorized",
  "url": "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
  "data": {
    "code": "401",
    "message": "Invalid API key"
  }
}

[2024-03-18T10:35:22.346Z] [ERROR] [ERROR] [1710753320100-def5678] API 调用失败
{
  "requestId": "1710753320100-def5678",
  "provider": "qwen",
  "model": "qwen-turbo",
  "duration": "2246ms",
  "error": "401 Unauthorized"
}

[2024-03-18T10:35:22.347Z] [DEBUG] [HTTP_RESPONSE] POST /v1/chat/completions
{
  "statusCode": 500,
  "method": "POST",
  "path": "/v1/chat/completions"
}
```

---

## 🎯 快速调试命令

### 查看最近的错误

```bash
# 查看最近 50 行日志，高亮错误
curl "http://localhost:3001/logs?limit=50" | grep -E "ERROR|EXCEPTION|WARN"
```

### 跟踪特定请求

```bash
# 获取最近日志，查找特定的 requestId
curl "http://localhost:3001/logs?limit=200" | grep "1710753045123-abc1234"
```

### 监控性能

```bash
# 查看耗时超过 5 秒的操作
curl "http://localhost:3001/logs?limit=100" | grep "WARN.*耗时"
```

### 实时监控

```bash
# 监听最新日志文件
tail -f logs/2024-03-18.log

# 或分文件显示
tail -f logs/2024-03-18.log | grep "ERROR\|WARN"
```

---

## 🔐 敏感信息保护

日志系统会**自动脱敏**敏感信息：

- API 密钥：显示为 `sk-xxxxx...xxxxx`
- Authorization 头：显示为 `Bearerxxxxx...xxxxx`
- 消息内容：仅显示数量 `[3 messages]`

---

## 📊 日志文件管理

### 文件位置

```
项目根目录/
└── logs/
    ├── 2024-03-18.log      ← 按日期命名
    ├── 2024-03-18-1710753000000.log  ← 旧日志备份
    └── 2024-03-19.log
```

### 自动清理

日志系统会自动：
- 单个日志文件超过 10MB 时自动轮转
- 可在代码中设置保留天数（默认 7 天）

---

## 🛠️ 配置日志

### 环境变量

```bash
# 日志级别
LOG_LEVEL=DEBUG        # DEBUG, INFO, WARN, ERROR, TRACE

# 日志目录
LOG_DIR=./logs

# 最大文件大小 (默认 10MB)
LOG_MAX_SIZE=10485760
```

### 代码配置

编辑 `src/server/logger.js`：

```javascript
const logger = new Logger({
  level: 'DEBUG',           // 日志级别
  logDir: './logs',         // 日志目录
  enableConsole: true,      // 控制台输出
  enableFile: true,         // 文件输出
  maxFileSize: 10 * 1024 * 1024  // 10MB
});
```

---

## ✨ 特色功能

### 1️⃣ 请求追踪 ID

每个请求都有唯一的 `requestId`，可以追踪完整的请求流程：

```
请求 ID: 1710753045123-abc1234
├─ 进入路由
├─ 验证参数
├─ 调用 API
├─ 处理响应
└─ 返回结果
```

### 2️⃣ 自动性能监控

系统自动记录耗时超过 5 秒的操作：

```
[WARN] API 耗时 5234ms ⚠️  耗时过长
```

### 3️⃣ HTTP 日志端点

无需访问文件系统，直接通过 HTTP 查看日志：

```bash
GET /logs?limit=100
```

---

## 🎉 总结

现在你有了：

✅ **实时日志** - 完整的请求/响应追踪  
✅ **性能监控** - 自动检测慢查询  
✅ **错误追踪** - 完整的错误堆栈  
✅ **敏感信息保护** - 自动脱敏  
✅ **HTTP 查看** - 无需文件系统访问  
✅ **自动轮转** - 日志自动管理  

**开始调试吧！** 🚀
