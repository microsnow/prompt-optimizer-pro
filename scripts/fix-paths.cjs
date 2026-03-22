#!/usr/bin/env node

/**
 * 修复打包后的资源路径
 * 将绝对路径 /assets/ 改为相对路径 ./assets/
 * 这样在 Electron 中使用 file:// 协议时能正确加载资源
 */

const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

console.log('🔧 修复 Electron 资源路径...\n');

if (!fs.existsSync(indexHtmlPath)) {
  console.error(`❌ 找不到 index.html: ${indexHtmlPath}`);
  process.exit(1);
}

// 读取 HTML
let html = fs.readFileSync(indexHtmlPath, 'utf-8');

// 记录修改前的内容
const before = html;

// 将绝对路径改为相对路径
html = html.replace(/src="\/assets\//g, 'src="./assets/');
html = html.replace(/href="\/assets\//g, 'href="./assets/');

// 检查是否有修改
if (html === before) {
  console.log('✅ HTML 路径已是相对路径，无需修改');
} else {
  // 写回文件
  fs.writeFileSync(indexHtmlPath, html, 'utf-8');
  console.log('✅ 已修复 HTML 资源路径:');
  console.log('   /assets/ → ./assets/');
  console.log(`   文件: ${indexHtmlPath}`);
}

// 同时检查和修复 main.cjs 的路径
const mainCjsPath = path.join(distDir, 'main.cjs');
if (fs.existsSync(mainCjsPath)) {
  let mainContent = fs.readFileSync(mainCjsPath, 'utf-8');
  const mainBefore = mainContent;
  
  // 确保 main.cjs 中的路径是相对的
  mainContent = mainContent.replace(
    /`file:\/\/\$\{path\.join\(__dirname, '\.\.\/dist\/index\.html'\)\}`/,
    "`file://${path.join(__dirname, 'index.html')}`"
  );
  
  if (mainContent !== mainBefore) {
    fs.writeFileSync(mainCjsPath, mainContent, 'utf-8');
    console.log('✅ 已修复 main.cjs 路径');
  }
}

console.log('\n✅ 资源路径修复完成！');
