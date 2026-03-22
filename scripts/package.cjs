#!/usr/bin/env node

/**
 * 完整的打包脚本 - 处理 ESM/CommonJS 兼容性问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJsonPath = path.resolve(__dirname, '..', 'package.json');

// 读取原始 package.json
const originalPackageJson = fs.readFileSync(packageJsonPath, 'utf-8');
const packageJson = JSON.parse(originalPackageJson);
const hadTypeModule = packageJson.type === 'module';

try {
  // 步骤 1: 准备 Electron 文件
  console.log('\n📦 步骤 1: 准备 Electron 文件...\n');
  execSync('node scripts/build-electron.cjs', { cwd: path.dirname(packageJsonPath), stdio: 'inherit' });

  // 步骤 2: 运行 electron-builder
  console.log('\n📦 步骤 2: 运行 electron-builder...\n');
  const args = process.argv.slice(2);
  const cmd = `npx electron-builder ${args.join(' ')}`;
  console.log(`执行: ${cmd}\n`);
  execSync(cmd, { cwd: path.dirname(packageJsonPath), stdio: 'inherit' });

  console.log('\n✅ 打包完成！');
} catch (error) {
  console.error('\n❌ 打包失败！', error.message);
  process.exit(1);
} finally {
  // 恢复 package.json
  if (hadTypeModule) {
    console.log('\n🔄 恢复 package.json...');
    fs.writeFileSync(packageJsonPath, originalPackageJson, 'utf-8');
    console.log('✅ package.json 已恢复');
  }
}
