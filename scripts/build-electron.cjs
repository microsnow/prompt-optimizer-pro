#!/usr/bin/env node

/**
 * 编译脚本 - Electron 文件准备及 Package.json 修复
 * 此脚本会：
 * 1. 验证 Electron 和 Server 文件
 * 2. 临时修改 package.json 移除 "type": "module"
 * 3. 打包完成后恢复
 */

const fs = require('fs');
const path = require('path');

const projRoot = path.resolve(__dirname, '..');
const distDir = path.join(projRoot, 'dist');
const srcServerDir = path.join(projRoot, 'src', 'server');
const packageJsonPath = path.join(projRoot, 'package.json');

// 验证必需的 Electron 文件
const electronFiles = [
  'main.cjs',
  'preload.js',
];

// 验证必需的 Server 文件
const serverFiles = [
  'api-proxy.js',
  'logger.js',
  'openai-format.js'
];

console.log('🔍 验证 Electron 文件...');

let allOk = true;
for (const file of electronFiles) {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ dist/${file}`);
  } else {
    console.log(`❌ dist/${file} - 缺失`);
    allOk = false;
  }
}

console.log('\n🔍 验证 Server 文件...');
for (const file of serverFiles) {
  const filePath = path.join(srcServerDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ src/server/${file}`);
  } else {
    console.log(`❌ src/server/${file} - 缺失`);
    allOk = false;
  }
}

if (!allOk) {
  console.error('\n❌ 部分文件缺失');
  process.exit(1);
}

// 修复 package.json - 移除 "type": "module"
console.log('\n🔧 修复 package.json...');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const hadTypeModule = packageJson.type === 'module';

if (hadTypeModule) {
  delete packageJson.type;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
  console.log('✅ 已移除 "type": "module"');
}

console.log('\n✅ 所有文件已准备完成');
console.log('⚠️  注意：package.json 已修改，electron-builder 打包完成后需要恢复');
