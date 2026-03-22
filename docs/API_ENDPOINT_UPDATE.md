# API 端点更新说明

**更新日期**: 2026-03-18

## ✅ 已更新的端点

根据你提供的真实 API 测试,已更新以下端点:

### 1. Qwen (通义千问)

**旧端点**:
```
https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

**新端点** (OpenAI 兼容):
```
https://coding.dashscope.aliyuncs.com/v1/chat/completions
```

**更新内容**:
- ✅ 更新为 OpenAI 标准格式端点
- ✅ 直接使用标准 `messages` 和 `model` 参数
- ✅ 响应已经是标准 OpenAI 格式,无需额外转换

**测试命令**:
```bash
curl -X POST https://coding.dashscope.aliyuncs.com/v1/chat/completions \
  -H "Authorization: Bearer sk-sp-ac6d427db9054904a6dbe9cebcc6724b" \
  -H "Content-Type: application/json" \
  -d '{
      "model": "qwen3.5-plus",
      "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "你是谁?"}
      ]
  }'
```

---

### 2. Douyin (豆包)

**旧端点**:
```
https://ark.cn-beijing.volces.com/api/v3/chat/completions
```

**新端点** (Coding 专用):
```
https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions
```

**更新内容**:
- ✅ 更新为 coding 专用端点
- ✅ 保持标准 OpenAI 请求格式
- ✅ 响应为标准 OpenAI 格式

**测试命令**:
```bash
curl -X POST https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions \
  -H "Authorization: Bearer 9138fca9-9064-41b3-b7a5-a58e72ba774a" \
  -H "Content-Type: application/json" \
  -d '{
      "model": "doubao-seed-2.0-pro",
      "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "你是谁?"}
      ]
  }'
```

---

## 📝 未更改的端点

以下提供商的端点保持不变:

### OpenAI
```
https://api.openai.com/v1/chat/completions
```

### MiniMax
```
https://api.minimax.chat/v1/text/chatcompletion_v2
```

### Zhipu (智谱)
```
https://open.bigmodel.cn/api/paas/v4/chat/completions
```

---

## 🧪 测试方法

### 方法 1: 使用测试脚本

```bash
# 启动服务器
conda activate python311
python src/server/api-proxy.py

# 在另一个终端运行测试
python test-real-api.py
```

### 方法 2: 直接使用代理

```bash
# 测试 Qwen
curl -X POST http://localhost:3001/proxy/qwen/chat \
  -H "Content-Type: application/json" \
  -d '{
      "apiKey": "sk-sp-ac6d427db9054904a6dbe9cebcc6724b",
      "model": "qwen3.5-plus",
      "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "你好!"}
      ]
  }'

# 测试 Douyin
curl -X POST http://localhost:3001/proxy/douyin/chat \
  -H "Content-Type: application/json" \
  -d '{
      "apiKey": "9138fca9-9064-41b3-b7a5-a58e72ba774a",
      "model": "doubao-seed-2.0-pro",
      "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "你好!"}
      ]
  }'
```

---

## ✨ 改进点

1. **更简单的格式**: Qwen 现在使用标准的 OpenAI 格式,无需转换
2. **更好的兼容性**: 两个端点都支持标准消息格式
3. **更快的响应**: 减少了数据转换步骤
4. **更好的错误处理**: 直接返回原始 API 错误信息

---

## 🎯 代理服务器功能

Python 代理服务器现在支持:

✅ OpenAI (GPT-3.5/4)
✅ Qwen (qwen3.5-plus, qwen-turbo)
✅ MiniMax (minimax-text-saas)
✅ Zhipu (glm-4-flash)
✅ Douyin (doubao-seed-2.0-pro)

### 可用的路由

- `POST /v1/chat/completions` - OpenAI 标准格式
- `POST /proxy/<provider>/chat` - 前端兼容路径
- `POST /api/proxy/<provider>/<endpoint>` - 旧版兼容
- `GET /health` - 健康检查

### CORS 支持

- ✅ 支持预检请求 (OPTIONS)
- ✅ 正确的 CORS 头
- ✅ 支持多个源

---

## 🚀 使用建议

1. **启动服务器**:
   ```bash
   conda activate python311
   python src/server/api-proxy.py
   ```

2. **前端配置**:
   - 在应用界面输入 API 密钥
   - 选择对应的提供商和模型
   - 开始使用

3. **NPM 脚本**:
   ```bash
   npm run api:proxy:py  # 只启动代理
   npm start              # 同时启动代理和前端
   ```

---

## 📌 注意事项

- API 密钥已经在测试中验证有效
- 代理服务器会自动处理所有转换
- 无需修改前端代码,直接使用即可
- 日志格式化问题已修复

抱歉之前误判了 API 密钥的问题! 现在一切应该都能正常工作了。
