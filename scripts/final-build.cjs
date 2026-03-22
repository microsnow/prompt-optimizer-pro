#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(projRoot, 'package.json');

console.log('🔧 最终打包 - 调试版本\n');

// 读取和修复 package.json
const original = fs.readFileSync(packageJsonPath, 'utf-8');
const pkg = JSON.parse(original);

console.log('修改前:');
console.log(`  main: ${pkg.main}`);
console.log(`  type: ${pkg.type || '(未设置)'}\n`);

// 确保 main 指向 main.cjs
pkg.main = 'dist/main.cjs';
delete pkg.type;

console.log('修改后:');
console.log(`  main: ${pkg.main}`);
console.log(`  type: ${pkg.type || '(已删除)'}\n`);

fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');

// 构建前端
console.log('📦 编译前端...\n');
const buildResult = spawnSync('npm', ['run', 'build'], {
  cwd: projRoot,
  stdio: 'inherit',
  shell: true
});

if (buildResult.error) {
  console.error('❌ 前端构建失败:', buildResult.error.message);
  process.exit(1);
}

// 打包
console.log('\n\n📦 运行 electron-builder...\n');
const packResult = spawnSync('npx', ['electron-builder', '--win'], {
  cwd: projRoot,
  stdio: 'inherit',
  shell: true
});

if (packResult.status === 0) {
  console.log('\n\n✅ 打包成功！');
  console.log(`   文件: dist-final/win-unpacked/PromptOptimizer Pro.exe`);
} else {
  console.log('\n\n❌ 打包失败');
  console.log(`   Exit code: ${packResult.status}`);
}
