# 🔧 CORS 代理 - 快速修复指南

## ❌ 遇到的错误

```
SyntaxError: The requested module 'axios' does not provide an export named 'AxiosInstance'
```

### 原因分析

这是 TypeScript 和 ESM（ES Modules）的兼容性问题：
- `axios` 在某些版本中不导出 `AxiosInstance` 类型
- `ts-node` 运行 TypeScript 时会出现此错误

---

## ✅ 解决方案

我已经为你准备了 **JavaScript 版本的代理服务器**，完全绕过这个问题。

### 已为你创建的文件

| 文件 | 用途 | 状态 |
|------|------|------|
| `src/server/api-proxy.js` | JavaScript 版本（新建） | ✅ 使用这个 |
| `src/server/api-proxy.ts` | TypeScript 版本（已修复） | 可选 |

### 已更新的文件

| 文件 | 改动 | 
|------|------|
| `package.json` | 改用 `node` 运行 `.js` 文件 |

---

## 🚀 立即启动（2 选 1）

### 方式 1：使用 npm 命令（推荐）

```bash
npm run start
```

这会同时启动：
- API 代理服务器（端口 3001）
- 前端开发服务器（端口 5173）

### 方式 2：分别启动

**终端 1 - 启动代理服务器：**
```bash
node src/server/api-proxy.js
```

**终端 2 - 启动前端：**
```bash
npm run dev
```

### 方式 3：使用启动脚本

**Windows：**
```
双击：start-cors-solution.bat
```

**Linux/macOS：**
```bash
bash start-cors-solution.sh
```

---

## ✅ 验证是否工作

### 1. 检查代理服务器

在浏览器打开：
```
http://localhost:3001/health
```

应该看到：
```json
{ "status": "ok", "timestamp": "2024-03-18T..." }
```

### 2. 检查前端应用

在浏览器打开：
```
http://localhost:5173/
```

应该看到应用界面

### 3. 查看服务器日志

两个终端应该都能看到请求日志：
```
[2024-03-18T12:00:00.000Z] POST /api/proxy/qwen/chat
```

---

## 📝 如果还是有问题

### 问题 1：找不到 axios
**症状：** `Cannot find module 'axios'`

**解决：**
```bash
npm install axios cors express
```

### 问题 2：端口被占用
**症状：** `EADDRINUSE: address already in use :::3001`

**解决（Windows）：**
```bash
# 查看占用端口的进程
netstat -ano | findstr :3001

# 杀死进程（替换 PID）
taskkill /PID <PID> /F
```

**解决（Linux/macOS）：**
```bash
# 查看占用端口的进程
lsof -i :3001

# 杀死进程（替换 PID）
kill -9 <PID>
```

### 问题 3：前端和代理无法连接
**症状：** 前端收到连接错误

**检查：**
1. 代理是否运行：`http://localhost:3001/health`
2. `.env` 配置是否正确：`VITE_API_PROXY_URL=http://localhost:3001`
3. 重启前端开发服务器

---

## 📊 快速参考

| 命令 | 作用 |
|------|------|
| `npm run start` | 同时启动代理 + 前端 |
| `npm run api:proxy` | 仅启动代理服务器 |
| `npm run dev` | 仅启动前端 |
| `npm run electron:dev` | 启动 Electron |

---

## 🎯 关键改动

### package.json 更新
```json
{
  "scripts": {
    "api:proxy": "node src/server/api-proxy.js",
    "start": "concurrently \"npm run api:proxy\" \"npm run dev\""
  }
}
```

**从：** `ts-node src/server/api-proxy.ts`
**改为：** `node src/server/api-proxy.js`

---

## ✨ 为什么使用 JavaScript 版本

| 方面 | TypeScript | JavaScript |
|------|-----------|------------|
| 兼容性 | ⚠️ 可能有导入问题 | ✅ 无问题 |
| 速度 | 需要编译 | ✅ 直接运行 |
| 调试 | 复杂 | ✅ 简单 |
| 文件大小 | 较大 | ✅ 较小 |

---

## 🎉 现在可以开始了

```bash
# 最简单的方式
npm run start

# 然后打开浏览器
# http://localhost:5173/
```

**享受无 CORS 困扰的开发体验！** 🚀

---

## 📚 相关文档

- `CORS_SOLUTION.md` - 完整详细指南
- `CORS_QUICK_REFERENCE.txt` - 快速参考卡片
- `CORS_FINAL_SOLUTION.md` - 最终总结
