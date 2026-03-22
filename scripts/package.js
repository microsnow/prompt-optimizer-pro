#!/usr/bin/env node

/**
 * 完整的打包脚本
 * 1. 构建前端
 * 2. 准备 Electron 文件
 * 3. 打包为 Windows exe
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projRoot = path.resolve(__dirname, '..')

console.log('🚀 开始打包应用...\n')

try {
  // 第一步：构建前端
  console.log('📦 第一步：构建前端应用...')
  execSync('npm run build', { cwd: projRoot, stdio: 'inherit' })
  console.log('✅ 前端构建完成\n')

  // 第二步：准备 Electron 文件
  console.log('⚙️  第二步：准备 Electron 文件...')
  execSync('node scripts/build-electron.js', { cwd: projRoot, stdio: 'inherit' })
  console.log('✅ Electron 文件准备完成\n')

  // 第三步：打包
  console.log('📤 第三步：打包应用...')
  execSync('npx electron-builder --win --publish=never', { cwd: projRoot, stdio: 'inherit' })
  console.log('✅ 打包完成\n')

  // 检查输出文件
  const releaseDir = path.join(projRoot, 'release')
  if (fs.existsSync(releaseDir)) {
    const files = fs.readdirSync(releaseDir).filter(f => f.endsWith('.exe'))
    console.log('📦 生成的文件：')
    files.forEach(f => console.log(`   - ${f}`))
  }

  console.log('\n🎉 打包成功！')
} catch (error) {
  console.error('\n❌ 打包失败：', error.message)
  process.exit(1)
}
