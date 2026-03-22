# 模型配置指南

## 支持的 AI 模型提供商

本应用支持多个 AI 模型提供商，可以通过 API Key 配置启用。

### 1. OpenAI
- **模型**: GPT-4, GPT-3.5-Turbo
- **官网**: https://openai.com
- **API Key 获取**: https://platform.openai.com/api-keys
- **文档**: https://platform.openai.com/docs/api-reference/chat/create

### 2. 通义千问 (Qwen) - 阿里云
- **模型**: qwen3.5-plus, qwen-plus, qwen-turbo
- **官网**: https://aliyun.com
- **API 端点**: `https://coding.dashscope.aliyuncs.com/v1/chat/completions`
- **文档**: https://help.aliyun.com/zh/dashscope/developer-reference/api-details

### 3. MiniMax - 稀宝
- **模型**: minimax-text-saas
- **官网**: https://www.minimaxi.com
- **API 端点**: `https://api.minimax.chat/v1`
- **文档**: https://api.minimaxi.com/

### 4. 智谱 (Zhipu) - ChatGLM
- **模型**: glm-4-flash, glm-4
- **官网**: https://www.zhipuai.cn
- **API 端点**: `https://open.bigmodel.cn/api/paas/v4`
- **文档**: https://bigmodel.cn/dev/api

### 5. 豆包 (Douyin/ByteDance) - 字节跳动 🆕
- **模型**: douyin-1.5-pro, doubao
- **官网**: https://www.doubao.com
- **API 端点**: `https://ark.cn-beijing.byteplus.com/api/v3/chat/completions`
- **文档**: https://www.volcengine.com/docs/82379

---

## 配置步骤

### 1. 获取 API Key

根据你选择的模型提供商，前往官网获取 API Key：

```
OpenAI      → https://platform.openai.com/api-keys
Qwen        → https://dashscope.console.aliyun.com/
MiniMax     → https://www.minimaxi.com/user-center/api-keys
Zhipu       → https://bigmodel.cn/usercenter/apikeys
Douyin      → https://console.volcengine.com/
```

### 2. 在应用中配置

1. 点击右上角 ⚙️ **设置**按钮
2. 在弹出的设置窗口中找到对应的 API Key 输入框
3. 粘贴你的 API Key
4. 点击 **保存设置**

```
👤 API 配置
├─ OpenAI API Key          [输入框] sk-...
├─ 通义千问 API Key         [输入框] sk-...
├─ MiniMax API Key         [输入框] xxxxx
├─ 智谱 API Key            [输入框] xxxxx
└─ 豆包 API Key            [输入框] xxxxx
```

### 3. 验证配置

保存后，在左侧边栏可以看到 **🔧 API 状态**，显示各个模型的连接状态：

```
🔧 API 状态
├─ OpenAI      🟢 (已连接) 或 🔴 (未连接)
├─ 通义千问     🟢 或 🔴
├─ MiniMax      🟢 或 🔴
├─ 智谱         🟢 或 🔴
└─ 豆包         🟢 或 🔴
```

---

## 在优化功能中使用

### 选择模型

1. 进入 **🔧 优化**标签页
2. 在上方看到 **模型选择**按钮组
3. 选择你要使用的 AI 提供商：

```
模型选择
├─ [OpenAI]
├─ [通义千问]
├─ [MiniMax]
├─ [智谱]
└─ [豆包]  ← 新增！
```

4. 输入要优化的提示词
5. 点击 **🔧 优化** 按钮

### 模型特点对比

| 模型 | 优点 | 缺点 | 推荐场景 |
|-----|-----|-----|--------|
| **GPT-4** | 能力强、输出质量高 | 费用贵 | 复杂任务 |
| **GPT-3.5** | 速度快、平衡 | 理解能力一般 | 一般任务 |
| **Qwen3.5** | 中文优秀、便宜 | 能力一般 | 中文文本 |
| **GLM-4** | 多模态、均衡 | 国内可用性 | 混合任务 |
| **Douyin** | 新兴、成本低 | 成熟度未知 | 试验尝试 |

---

## 常见问题

### Q: API Key 会被保存吗？
**A**: 
- ✅ 密钥保存在**本地浏览器**（localStorage）
- ❌ **不会**上传到任何服务器
- 🔐 可以放心使用（可查看源代码验证）

### Q: 支持多个 Key 吗？
**A**: 完全支持！可以同时配置多个提供商的 Key，在使用时自由选择。

### Q: Key 过期了怎么办？
**A**: 
1. 重新获取新的 API Key
2. 进入设置，粘贴新 Key
3. 保存即可，无需重启应用

### Q: 为什么提示"API Key 无效"？
**A**: 
- 检查 Key 是否正确复制（无多余空格）
- 检查 Key 是否过期（某些平台有有效期）
- 检查网络连接（需要访问外部 API）
- 检查配额是否用尽（API 余额不足）

### Q: 哪个模型最便宜？
**A**: 一般来说 Qwen 和豆包最便宜，但实际费用取决于你的配额和调用频率。

### Q: 可以本地部署吗？
**A**: 可以！如果部署到服务器，代理会处理 CORS 问题，参考 [WEB_DEPLOYMENT_GUIDE.md](../WEB_DEPLOYMENT_GUIDE.md)。

---

## 安全建议

⚠️ **重要**: 

1. **不要在代码中硬编码 API Key**
   ```javascript
   ❌ const apiKey = 'sk-xxx'; // 危险！
   ✅ // 通过设置界面输入
   ```

2. **不要分享你的 API Key**
   - 不要在 GitHub 公开
   - 不要分享屏幕截图
   - 每个人用自己的 Key

3. **定期检查 API 使用情况**
   - 登录官网控制台
   - 查看 API 调用量
   - 如有异常立即更换 Key

4. **本应用离线可用**
   - 所有数据保存在本地
   - 无服务器跟踪
   - 可放心使用

---

## 获取帮助

如遇到问题，可以查看：

- [CORS_SOLUTION.md](CORS_SOLUTION.md) - 跨域问题解决
- [DETAILED_LOGGING_GUIDE.md](DETAILED_LOGGING_GUIDE.md) - 日志查看
- [WEB_DEPLOYMENT_GUIDE.md](WEB_DEPLOYMENT_GUIDE.md) - 部署指南

