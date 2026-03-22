#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projRoot = path.resolve(__dirname, '..');
const distDir = path.join(projRoot, 'dist');
const packageJsonPath = path.join(projRoot, 'package.json');

console.log('📋 检查必要文件...');
const requiredInDist = ['main.js', 'preload.js', 'api-proxy.js', 'logger.js', 'openai-format.js'];
for (const file of requiredInDist) {
  if (!fs.existsSync(path.join(distDir, file))) {
    console.error(`❌ 缺失: ${file}`);
    process.exit(1);
  }
}
console.log('✅ 所有必要文件存在\n');

const originalContent = fs.readFileSync(packageJsonPath, 'utf-8');

try {
  console.log('⚙️  临时修改 package.json...');
  const pkg = JSON.parse(originalContent);
  delete pkg.type;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('✅ 已移除 "type": "module"\n');

  console.log('📦 运行 electron-builder...\n');
  // 不捕获错误，让输出直接显示
  execSync('npx electron-builder --win --publish never', { 
    cwd: projRoot, 
    stdio: 'inherit',
    shell: true
  });
  
  console.log('\n✅ 打包成功！');

} catch (error) {
  console.error('\n❌ 打包失败，但 package.json 将被恢复...');
  throw error;
} finally {
  console.log('\n🔄 恢复 package.json...');
  fs.writeFileSync(packageJsonPath, originalContent);
  console.log('✅ 已恢复');
}
