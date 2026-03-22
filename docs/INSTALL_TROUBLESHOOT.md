# 🔧 npm 依赖安装问题排查指南

## 问题现象

```
'vite' is not recognized as an internal or external command
```

这表示 vite 没有被正确安装到 node_modules 目录中。

---

## 快速修复（推荐）

### 方法 1：运行自动修复脚本（最简单）

1. 打开项目文件夹：`c:/Users/Administrator/WorkBuddy/Claw`
2. **双击运行** `fix-dependencies.bat` 文件
3. 脚本会自动处理所有问题
4. 完成后会显示成功提示

**预计时间：3-5 分钟**

---

## 手动修复步骤

如果自动脚本不工作，请按照以下步骤手动修复：

### 步骤 1：打开 PowerShell

```powershell
# 以管理员身份打开 PowerShell
# (右键点击 PowerShell，选择 "以管理员身份运行")
```

### 步骤 2：进入项目目录

```powershell
cd c:/Users/Administrator/WorkBuddy/Claw
```

### 步骤 3：清理旧文件

```powershell
# 删除 node_modules 文件夹
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# 删除 package-lock.json
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
```

### 步骤 4：清理 npm 缓存

```powershell
npm cache clean --force
```

### 步骤 5：重新安装依赖

```powershell
# 标准安装
npm install

# 如果上面失败，尝试这个
npm install --legacy-peer-deps
```

### 步骤 6：验证安装

```powershell
# 检查 vite 是否安装
npm list vite

# 预期输出应该类似：
# prompt-optimizer-pro@1.0.0
# `-- vite@4.3.9
```

---

## 常见问题和解决方案

### ❌ 问题 1：安装仍然失败

**原因**：网络连接问题或 npm registry 响应慢

**解决方案**：

```powershell
# 切换到国内镜像源
npm config set registry https://registry.npmmirror.com

# 验证配置
npm config get registry

# 重新安装
npm install
```

---

### ❌ 问题 2："npm: 无法将"npm"识别为 cmdlet 的名称"

**原因**：npm 不在 PATH 中或 Node.js 安装不完整

**解决方案**：

```powershell
# 检查 npm 位置
Get-Command npm

# 如果找不到，重新安装 Node.js：
# 1. 访问 https://nodejs.org/
# 2. 下载 LTS 版本
# 3. 安装时勾选 "Automatically install the necessary tools"
# 4. 重新启动 PowerShell
```

---

### ❌ 问题 3：磁盘空间不足

**原因**：node_modules 需要 500MB+ 的空间

**解决方案**：

```powershell
# 检查磁盘空间
Get-Volume

# 清理临时文件
Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue

# 然后重试
npm install
```

---

### ❌ 问题 4："最后已收到错误代码"或其他神秘错误

**原因**：npm 进程损坏或 Windows Defender 阻止

**解决方案**：

```powershell
# 方案 A：完全清除并重新开始
npm cache clean --force
$env:npm_config_update_notifier = false
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# 方案 B：重启 PowerShell（以管理员身份）
# 然后重新运行 npm install

# 方案 C：检查 Windows Defender（如果问题仍然存在）
# 将项目文件夹添加到病毒防护排除项
```

---

## 验证安装成功

### 检查清单

```powershell
# 1. 检查关键文件是否存在
Test-Path -Path "node_modules/vite" -PathType Container
# 应输出: True

Test-Path -Path "node_modules/vue" -PathType Container
# 应输出: True

# 2. 列出所有已安装的顶级包
npm list --depth=0

# 应该显示:
# prompt-optimizer-pro@1.0.0
# ├── axios@1.4.0
# ├── date-fns@2.30.0
# ├── dexie@3.2.4
# ├── pinia@2.1.3
# ├── @types/node@20.2.5
# ├── @vitejs/plugin-vue@4.2.3
# ├── electron@25.1.0
# ├── electron-builder@24.4.0
# ├── typescript@5.1.3
# ├── vite@4.3.9
# ├── vue@3.3.4
# ├── vue-tsc@1.8.2
# ├── concurrently@8.1.0
# └── wait-on@7.0.1
```

---

## 启动应用

### 安装完成后

```powershell
# 启动开发服务器
npm run dev

# 预期输出：
# VITE v4.3.9  ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

### 打开浏览器

访问：`http://localhost:5173/`

应该看到应用的主界面。

---

## 如果都不行？

### 核选项：完全重装 Node.js

有时候 Node.js 安装本身有问题。如果所有上述方法都失败了：

1. **卸载 Node.js**
   - 打开"控制面板" → "程序和功能"
   - 找到"Node.js"并卸载

2. **清理注册表**（可选）
   ```powershell
   # 运行注册表编辑器
   regedit
   
   # 搜索并删除包含 "Node" 的项目
   ```

3. **重启电脑**

4. **重新安装 Node.js**
   - 下载：https://nodejs.org/ (LTS 版本)
   - 安装时选择"Automatically install the necessary tools"
   - 完成后重启

5. **再次尝试 npm install**

---

## 获取帮助

如果问题仍未解决，请检查：

1. **Node.js 版本**
   ```powershell
   node -v      # 应该 >= v16.0.0
   npm -v       # 应该 >= v7.0.0
   ```

2. **网络连接**
   ```powershell
   # 测试能否访问 npm registry
   npm ping
   ```

3. **项目完整性**
   ```powershell
   # 检查 package.json 是否存在且有效
   Get-Content package.json
   ```

4. **系统权限**
   ```powershell
   # 确保以管理员身份运行 PowerShell
   # 查看当前用户权限
   whoami /groups
   ```

---

## 简明速查表

| 问题 | 命令 | 说明 |
|------|------|------|
| npm 命令找不到 | `node -v` | 检查 Node.js 是否安装 |
| vite 找不到 | `npm list vite` | 检查 vite 是否安装 |
| 安装失败 | `npm cache clean --force` | 清除缓存并重试 |
| 磁盘不足 | 清理 `%TEMP%` 文件夹 | 释放空间 |
| 网络问题 | 切换 npm 源 | 使用国内镜像 |
| 一切都坏了 | 卸载重装 Node.js | 终极解决方案 |

---

## 成功标志

✅ 成功安装的标志：

1. `npm list vite` 显示 vite 已安装
2. `npm run dev` 能启动开发服务器
3. 浏览器可以访问 `http://localhost:5173/`
4. 看到应用的主界面

---

## 下一步

安装完成后：

```powershell
# 启动开发服务器
npm run dev

# 打开浏览器，访问
# http://localhost:5173/

# 开始测试！
```

---

**祝安装顺利！** 🚀

如有问题，请参考 `TESTING_GUIDE.md` 或 `README.md`。
