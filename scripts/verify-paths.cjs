#!/usr/bin/env node

/**
 * 验证修复后的应用
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证资源路径修复\n');

const distDir = 'c:\\Users\\Administrator\\WorkBuddy\\Claw\\dist';
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ 找不到 index.html');
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf-8');

console.log('📄 检查 index.html 中的资源路径:\n');

// 检查相对路径
const hasRelativePaths = html.includes('./assets/');
const hasAbsolutePaths = html.includes('src="/assets/') || html.includes('href="/assets/');

if (hasRelativePaths) {
  console.log('✅ 存在相对路径 ./assets/');
  // 提取并显示
  const matches = html.match(/src="\.\/assets\/[^"]+"|href="\.\/assets\/[^"]+"/g);
  if (matches) {
    console.log('   找到的资源:');
    matches.forEach(m => console.log(`   - ${m}`));
  }
}

if (hasAbsolutePaths) {
  console.log('⚠️  仍然存在绝对路径 /assets/');
}

if (!hasAbsolutePaths && hasRelativePaths) {
  console.log('\n✅ 路径修复成功！');
  console.log('   应用现在应该能在 Electron 中正常加载资源。');
} else {
  console.log('\n⚠️  可能存在问题');
}

// 检查 main.cjs
const mainPath = path.join(distDir, 'main.cjs');
if (fs.existsSync(mainPath)) {
  const mainContent = fs.readFileSync(mainPath, 'utf-8');
  if (mainContent.includes("path.join(__dirname, 'index.html')")) {
    console.log('✅ main.cjs 路径配置正确');
  } else {
    console.log('⚠️  main.cjs 路径可能需要检查');
  }
}

console.log('\n---');
console.log('如果重新打包后仍有问题，请检查:');
console.log('1. vite.config.ts 中 base: "./"');
console.log('2. dist/index.html 中资源路径');
console.log('3. dist/main.cjs 中的 HTML 加载路径');
