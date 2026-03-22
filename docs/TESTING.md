# 📋 AI 提示词生成优化平台 - 完整测试指南

## 🎯 测试概览

本文档提供完整的测试流程，涵盖**本地开发测试** → **功能测试** → **API 集成测试** → **打包部署测试**。

---

## 第一步：环境准备

### 1.1 系统要求

```
操作系统: Windows 10+, macOS 10.13+, Ubuntu 18+
Node.js: v16+ 或更高
npm: v7+ 或更高
磁盘空间: 至少 2GB
```

### 1.2 验证环境

```bash
# 检查 Node.js 版本
node --version  # 应该 >= v16.0.0

# 检查 npm 版本
npm --version   # 应该 >= v7.0.0
```

### 1.3 安装依赖

```bash
# 进入项目目录
cd c:/Users/Administrator/WorkBuddy/Claw

# 清空之前的 node_modules（如果有）
rmdir /s node_modules
del package-lock.json

# 重新安装依赖
npm install

# 验证安装成功
npm list
```

**预期输出**:
```
├── vue@3.x
├── typescript@5.x
├── vite@4.x
├── electron@26.x
├── electron-builder@24.x
└── ... (其他依赖)
```

---

## 第二步：开发环境启动

### 2.1 启动开发服务器

```bash
# 启动 Vite 开发服务器
npm run dev

# 预期输出:
# VITE v4.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

### 2.2 访问应用

打开浏览器，访问：`http://localhost:5173/`

**预期看到**:
- ✅ 深色主题界面加载
- ✅ 左侧导航栏显示 8 个模型
- ✅ 右侧工作区显示生成表单
- ✅ 底部显示历史记录面板

### 2.3 开发环境热更新

修改任何 `.ts` 或 `.vue` 文件后，浏览器应自动刷新（无需手动重启）。

```bash
# 测试热更新:
# 1. 在 src/App.vue 中修改任意文本
# 2. 保存文件
# 3. 应在 1-2 秒内看到浏览器自动刷新
```

---

## 第三步：功能测试

### 3.1 测试场景清单

#### ✅ 生成提示词功能

| 测试项 | 操作 | 预期结果 |
|-------|------|--------|
| **选择模型** | 点击左侧任一模型 | 右侧表单应更新，显示对应模型信息 |
| **选择领域** | 点击领域下拉框 | 应显示 8 个领域选项 |
| **选择难度** | 点击难度下拉框 | 应显示 4 个难度等级 |
| **输入关键字** | 在关键字输入框输入文本 | 实时显示字数统计 |
| **生成提示词** | 点击"生成提示词"按钮 | 1 秒内显示生成结果 |
| **字数统计** | 生成完成后 | 显示提示词的确切字数 |

#### ✅ 优化功能

| 测试项 | 操作 | 预期结果 |
|-------|------|--------|
| **选择优化方向** | 点击优化方向按钮 | 5 个按钮应高亮可选 |
| **优化提示词** | 点击"优化提示词"按钮 | 显示新的优化版本 |
| **对比展示** | 优化完成后 | 左侧原版，右侧优化版本 |
| **质量评分** | 优化完成后 | 显示 1-100 的评分 |

#### ✅ 复制和导出

| 测试项 | 操作 | 预期结果 |
|-------|------|--------|
| **复制到剪贴板** | 点击"复制"按钮 | 显示"已复制"提示，内容保存到剪贴板 |
| **导出 Markdown** | 点击"导出 MD"按钮 | 下载 `.md` 文件 |
| **导出 JSON** | 点击"导出 JSON"按钮 | 下载 `.json` 文件 |
| **导出 TXT** | 点击"导出 TXT"按钮 | 下载 `.txt` 文件 |

#### ✅ 本地存储

| 测试项 | 操作 | 预期结果 |
|-------|------|--------|
| **保存提示词** | 生成后点击"保存"按钮 | 显示"已保存"提示 |
| **查看历史** | 底部历史面板 | 显示所有保存的提示词 |
| **搜索功能** | 在历史中搜索 | 实时过滤结果 |
| **删除记录** | 点击历史记录的删除按钮 | 记录被移除 |
| **刷新后保留** | F5 刷新页面 | 历史数据应保留 |

### 3.2 手动功能测试脚本

```bash
# 进入项目目录
cd c:/Users/Administrator/WorkBuddy/Claw

# 启动开发服务器
npm run dev

# 然后打开浏览器 http://localhost:5173/
```

**测试步骤**:

1. **测试生成功能**
   ```
   ✓ 选择模型: GPT-4
   ✓ 选择领域: 编程
   ✓ 选择难度: 高级
   ✓ 输入关键字: React + TypeScript 最佳实践
   ✓ 点击 "生成提示词"
   ✓ 验证生成内容合理
   ```

2. **测试优化功能**
   ```
   ✓ 点击 "优化提示词"
   ✓ 选择优化方向: 清晰度
   ✓ 验证优化后的内容
   ✓ 查看质量评分
   ```

3. **测试复制功能**
   ```
   ✓ 点击 "复制到剪贴板"
   ✓ 打开记事本 (Notepad)
   ✓ Ctrl+V 粘贴验证内容
   ```

4. **测试存储功能**
   ```
   ✓ 点击 "保存"
   ✓ 刷新页面 (F5)
   ✓ 验证记录仍在历史中
   ✓ 测试搜索功能
   ```

5. **测试导出功能**
   ```
   ✓ 点击 "导出 MD"，验证下载的文件
   ✓ 点击 "导出 JSON"，验证 JSON 格式
   ✓ 点击 "导出 TXT"，验证文本格式
   ```

---

## 第四步：API 集成测试

### 4.1 配置 API 密钥

#### 方式 A：环境变量（推荐）

```bash
# Windows PowerShell
$env:OPENAI_API_KEY="sk-..."
$env:QWEN_API_KEY="..."
$env:MINMAX_API_KEY="..."
$env:ZHIPU_API_KEY="..."

# 然后启动开发服务器
npm run dev
```

#### 方式 B：配置文件

在项目根目录创建 `.env.local`：

```
VITE_OPENAI_API_KEY=sk-...
VITE_QWEN_API_KEY=...
VITE_MINMAX_API_KEY=...
VITE_ZHIPU_API_KEY=...
```

### 4.2 API 测试场景

#### 测试 OpenAI API

```bash
# 1. 配置 API 密钥
$env:OPENAI_API_KEY="你的 OpenAI API 密钥"

# 2. 启动开发服务器
npm run dev

# 3. 在界面中:
# - 选择模型: GPT-4
# - 输入关键字
# - 点击 "使用 API 优化"
# - 预期: 5-30 秒内返回优化结果
```

**验证项**:
- ✓ 优化请求发送成功
- ✓ 返回内容有实质改进
- ✓ 不显示错误提示
- ✓ 网络请求在浏览器控制台显示为 200/2xx

#### 测试阿里云通义千问

```bash
# 1. 配置密钥 (需要阿里云账号)
$env:QWEN_API_KEY="你的阿里云通义千问密钥"

# 2. 选择模型: 通义千问
# 3. 测试生成和优化
```

#### 测试其他模型

依次测试：MiniMax、智谱 ChatGLM，步骤类似。

### 4.3 API 测试脚本（自动化）

创建 `test/api.test.ts`：

```typescript
import { callOpenAI, callQwen, callMiniMax, callZhipu } from '../src/services/api';

describe('API Integration Tests', () => {
  test('OpenAI API should work', async () => {
    const result = await callOpenAI({
      prompt: 'Test prompt',
      model: 'gpt-4',
    });
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });

  test('Qwen API should work', async () => {
    const result = await callQwen({
      prompt: 'Test prompt',
      model: 'qwen-turbo',
    });
    expect(result).toBeTruthy();
  });

  // 测试其他 API...
});
```

运行测试：

```bash
npm run test:api
```

---

## 第五步：Electron 桌面应用测试

### 5.1 启动 Electron 开发模式

```bash
# 方式 1: 使用开发脚本
npm run electron:dev

# 预期: 
# - Electron 窗口启动
# - 加载本地 Vite 开发服务器 (localhost:5173)
# - 热更新工作正常
```

### 5.2 Electron 功能测试

| 测试项 | 操作 | 预期 |
|-------|------|------|
| **窗口启动** | 运行 `npm run electron:dev` | 窗口无闪烁地打开 |
| **窗口大小** | 调整窗口 | 布局自适应 |
| **开发者工具** | `F12` 或右键→检查 | 打开浏览器开发者工具 |
| **菜单功能** | 点击菜单项 | 各功能正常响应 |
| **窗口控制** | 关闭/最小化/最大化 | 正常工作 |

### 5.3 Electron 快捷键测试

```
Ctrl+R  → 重新加载
Ctrl+Shift+I → 打开开发者工具
F12 → 打开开发者工具
F5 → 刷新
```

---

## 第六步：打包和部署测试

### 6.1 构建生产版本

```bash
# 生成优化的生产构建
npm run build

# 预期输出:
# ✓ 编译成功
# ✓ 生成 dist/ 文件夹
# ✓ 体积 < 5MB
```

### 6.2 打包 Electron 可执行文件

#### Windows (.exe)

```bash
# 打包 Windows
npm run build:win

# 预期文件:
# dist/PromptEngineer.exe (安装程序)
# dist/PromptEngineer-portable.exe (便携版)
```

**测试步骤**:
1. 双击 `.exe` 文件
2. 按照安装向导安装
3. 启动应用验证功能
4. 卸载应用验证清理

#### macOS (.dmg)

```bash
# 打包 macOS
npm run build:mac

# 预期文件:
# dist/PromptEngineer.dmg
```

#### Linux (.AppImage)

```bash
# 打包 Linux
npm run build:linux

# 预期文件:
# dist/PromptEngineer.AppImage
```

### 6.3 可执行文件测试清单

| 项目 | Windows (.exe) | macOS (.dmg) | Linux (.AppImage) |
|------|----------------|--------------|------------------|
| **文件大小** | < 200MB | < 250MB | < 200MB |
| **启动时间** | < 3s | < 3s | < 3s |
| **功能完整** | ✓ | ✓ | ✓ |
| **API 可用** | ✓ | ✓ | ✓ |
| **存储正常** | ✓ | ✓ | ✓ |
| **导出功能** | ✓ | ✓ | ✓ |

---

## 第七步：自动化测试

### 7.1 单元测试

```bash
# 运行单元测试
npm run test

# 覆盖率报告
npm run test:coverage

# 预期覆盖率: > 80%
```

### 7.2 E2E 测试

```bash
# Playwright E2E 测试
npm run test:e2e

# 测试场景:
# - 用户流程测试
# - API 集成测试
# - 性能基准测试
```

### 7.3 性能测试

```bash
# Lighthouse 性能审计
npm run test:performance

# 预期指标:
# - 性能: > 90
# - 可访问性: > 90
# - 最佳实践: > 90
```

---

## 第八步：压力测试

### 8.1 并发请求测试

```bash
# 同时生成 10 个提示词
# 预期: 应稳定处理，无崩溃
```

### 8.2 大数据测试

```bash
# 保存 1000+ 条历史记录
# 预期: 搜索响应 < 500ms
```

### 8.3 内存泄漏测试

```bash
# 连续操作 1 小时
# 使用 Chrome DevTools Memory 检测
# 预期: 内存稳定在 200-300MB
```

---

## 第九步：兼容性测试

### 9.1 浏览器兼容性

```
Chrome/Edge: 最新版本 (✓)
Firefox: 最新版本 (✓)
Safari: 最新版本 (✓)
IE 11: 不支持 (✗)
```

### 9.2 操作系统兼容性

```
Windows 10+: ✓
Windows 7/8: 可能不支持
macOS 10.13+: ✓
Ubuntu 18+: ✓
CentOS 7+: ✓
```

### 9.3 网络环境测试

```bash
# 低速网络模拟 (Chrome DevTools)
# - 3G: 应能正常加载
# - 离线模式: 应显示友好提示

# 高延迟测试
# - 模拟 500ms 延迟
# - 预期: 应有超时处理
```

---

## 测试检查清单

### ✅ 功能测试完成度

- [ ] 生成功能正常
- [ ] 优化功能正常
- [ ] 复制功能正常
- [ ] 导出功能正常
- [ ] 历史记录正常
- [ ] 搜索功能正常
- [ ] 删除功能正常
- [ ] 本地存储正常

### ✅ API 集成完成度

- [ ] OpenAI 连接成功
- [ ] 阿里云通义千问连接成功
- [ ] MiniMax 连接成功
- [ ] 智谱连接成功
- [ ] 错误处理合理
- [ ] 超时处理正确

### ✅ 应用交付完成度

- [ ] Windows .exe 可正常运行
- [ ] macOS .dmg 可正常运行
- [ ] Linux .AppImage 可正常运行
- [ ] 应用启动 < 3 秒
- [ ] 所有功能可用
- [ ] 没有崩溃和错误

### ✅ 性能完成度

- [ ] 页面加载 < 2 秒
- [ ] 生成提示词 < 1 秒
- [ ] API 调用 < 10 秒
- [ ] 内存占用 < 300MB
- [ ] CPU 占用 < 30%

---

## 常见问题排查

### Q: "npm install" 失败？

```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules
rmdir /s node_modules

# 重新安装
npm install
```

### Q: 开发服务器无法启动？

```bash
# 检查端口是否被占用
netstat -ano | findstr :5173

# 如果被占用，杀死进程
taskkill /PID <PID> /F

# 重新启动
npm run dev
```

### Q: Electron 窗口无法打开？

```bash
# 检查 Electron 是否正确安装
npm list electron

# 重新安装
npm install electron --save-dev

# 启动
npm run electron:dev
```

### Q: API 调用返回 401/403？

```
检查事项:
✓ API 密钥是否正确
✓ 密钥是否过期
✓ 账户余额是否充足
✓ API 端点是否正确
```

---

## 测试报告模板

```markdown
# 测试报告 - [日期]

## 测试环境
- OS: Windows 10
- Node.js: v16.0.0
- npm: v8.0.0
- 测试者: [名字]

## 测试结果

### 功能测试: ✓ 通过 / ✗ 失败
- 生成功能: ✓
- 优化功能: ✓
- ...

### API 集成: ✓ 通过 / ✗ 失败
- OpenAI: ✓
- Qwen: ✓
- ...

### 打包部署: ✓ 通过 / ✗ 失败
- Windows: ✓
- macOS: ✗ (需要 Mac 环境)
- Linux: ✓

## 发现的问题

1. [问题描述]
2. [问题描述]

## 建议

[建议...]
```

---

## 总结

这个完整的测试方案覆盖了：

✅ **开发阶段** - 本地开发和热更新测试  
✅ **功能测试** - 核心功能的手动测试  
✅ **API 测试** - 各大模型 API 的集成测试  
✅ **部署测试** - 可执行文件的打包和测试  
✅ **性能测试** - 性能和资源占用测试  
✅ **兼容性测试** - 跨浏览器和系统测试  

**预计测试时间**: 2-3 小时（完整测试）

**最快开始**: 5 分钟（快速验证）

祝测试顺利！🚀
