# 配置数据接口化改造测试指南

## 已完成的工作

1. **创建了本地JSON配置数据文件**（位于 `public/config/`）：
   - `models.json` - 模型特性配置
   - `domains.json` - 领域模板配置
   - `strategies.json` - 优化策略配置
   - `quality-rubric.json` - 质量评分标准
   - `optimization-prompts.json` - AI优化提示模板

2. **创建了配置服务**（位于 `src/services/configService.ts`）：
   - 提供统一的配置数据访问接口
   - 支持异步加载和缓存配置
   - 提供类型安全的配置访问方法

3. **改造了前端代码**：
   - 修改 `App.vue` 使用配置服务动态加载数据
   - 修改 `promptGenerator.ts` 使用配置服务获取模型和领域配置
   - 添加配置测试界面（开发环境可见）

## 测试步骤

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 访问应用
打开浏览器访问：http://localhost:5173

### 3. 测试配置加载
1. 页面右上角会出现一个 🔧 按钮（仅在开发环境显示）
2. 点击 🔧 按钮打开配置测试面板
3. 面板会显示：
   - 配置加载状态
   - 各配置项的数量统计
   - 已启用模型列表
   - 可用领域列表
   - 优化策略列表

### 4. 检查控制台日志
打开浏览器开发者工具（F12），查看控制台输出：
- 配置数据加载成功的日志
- 配置数据的详细信息

### 5. 功能测试
1. **测试生成提示词功能**：
   - 选择模型（应显示 qwen 和 douyin）
   - 选择领域（应显示13个领域）
   - 填写关键词和需求
   - 点击生成按钮，验证功能正常

2. **测试优化提示词功能**：
   - 切换到"优化"标签页
   - 粘贴测试提示词
   - 选择优化策略
   - 点击优化按钮，验证功能正常

## 配置数据结构

### 模型配置
```json
{
  "model-id": {
    "name": "模型名称",
    "description": "模型描述",
    "ideal_length": [最小字数, 最大字数],
    "tone": "语气风格",
    "structure_preference": "结构偏好",
    "max_api_calls_per_minute": 5000,
    "supports_system_prompt": true,
    "supports_multimodal": false,
    "enabled": true
  }
}
```

### 领域配置
```json
{
  "domain-id": {
    "name": "领域名称",
    "keywords": ["关键词1", "关键词2"],
    "tips": "使用提示",
    "base_template": "基础模板..."
  }
}
```

## 接口访问测试

可以通过以下URL直接访问配置数据：

```
http://localhost:5173/config/models.json
http://localhost:5173/config/domains.json
http://localhost:5173/config/strategies.json
http://localhost:5173/config/quality-rubric.json
http://localhost:5173/config/optimization-prompts.json
```

## 下一步工作

1. **后端接口开发**：
   - 创建 `/api/config/models` 等接口
   - 实现数据库存储配置
   - 添加配置管理后台

2. **前端优化**：
   - 添加配置缓存机制
   - 支持配置版本管理
   - 添加配置热更新功能

3. **扩展功能**：
   - 支持多租户配置
   - 添加A/B测试配置
   - 实现配置灰度发布

## 问题排查

如果配置加载失败，请检查：

1. **文件路径是否正确**：
   - 确认 `public/config/` 目录存在
   - 确认JSON文件语法正确

2. **网络请求是否成功**：
   - 检查浏览器Network面板
   - 确认请求返回200状态码

3. **控制台错误信息**：
   - 检查是否有JavaScript错误
   - 查看配置服务初始化日志

## 联系方式

如有问题，请检查代码或联系开发人员。