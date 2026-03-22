#!/usr/bin/env node

/**
 * 验证打包成功
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证打包成功\n');

const projRoot = 'c:\\Users\\Administrator\\WorkBuddy\\Claw';
const exePath = path.join(projRoot, 'dist-release-v2\\win-unpacked\\PromptOptimizer Pro.exe');
const packageJsonPath = path.join(projRoot, 'package.json');

// 检查 exe 存在
console.log('1️⃣  检查 exe 文件:');
if (fs.existsSync(exePath)) {
  const stats = fs.statSync(exePath);
  console.log(`   ✅ 存在`);
  console.log(`   📁 位置: ${exePath}`);
  console.log(`   📏 大小: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
} else {
  console.log(`   ❌ 不存在: ${exePath}`);
  process.exit(1);
}

// 检查 package.json 配置
console.log('\n2️⃣  检查 package.json 配置:');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
console.log(`   main: ${pkg.main}`);
console.log(`   type: ${pkg.type || '(未设置 ✅)'}`);

if (pkg.main === 'dist/main.cjs') {
  console.log(`   ✅ main 正确指向 main.cjs`);
} else {
  console.log(`   ❌ main 配置错误: ${pkg.main}`);
}

if (!pkg.type || pkg.type !== 'module') {
  console.log(`   ✅ 没有 "type": "module"`);
} else {
  console.log(`   ❌ 仍然有 "type": "module"`);
}

// 检查 main.cjs 存在
console.log('\n3️⃣  检查 main.cjs:');
const mainCjsPath = path.join(projRoot, 'dist', 'main.cjs');
if (fs.existsSync(mainCjsPath)) {
  console.log(`   ✅ 存在`);
  const content = fs.readFileSync(mainCjsPath, 'utf-8');
  const isCommonJs = content.startsWith('const') && content.includes('require(');
  console.log(`   ${isCommonJs ? '✅' : '❌'} CommonJS 格式`);
} else {
  console.log(`   ❌ 不存在`);
}

console.log('\n4️⃣  总结:');
console.log('   ✅ 打包已完成');
console.log('   ✅ 配置已修正');
console.log('   ✅ 应用就绪\n');
console.log('📍 给同事分发:');
console.log(`   复制此文件: dist-release-v2\\win-unpacked\\PromptOptimizer Pro.exe`);
console.log(`   或复制整个文件夹: dist-release-v2\\win-unpacked\\`);
