/**
 * 前端模拟数据验证脚本 (数组结构版本)
 * 运行方式: node verify-frontend-config.cjs
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, 'public', 'config');
const BASE_URL = 'http://localhost:5173';

const CONFIG_FILES = [
  'models.json',
  'domains.json',
  'strategies.json',
  'quality-rubric.json',
  'optimization-prompts.json'
];

console.log('=== 前端模拟数据验证 (数组结构) ===\n');

// 1. 检查本地文件
console.log('1. 检查本地配置文件...\n');

let allFilesExist = true;
CONFIG_FILES.forEach(file => {
  const filePath = path.join(CONFIG_DIR, file);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      if (data.success && Array.isArray(data.data)) {
        console.log(`   ✅ ${file} (${data.data.length} 项，数组结构)`);
        // 显示第一项的id
        if (data.data.length > 0 && data.data[0].id) {
          console.log(`      示例: id="${data.data[0].id}"`);
        }
      } else if (data.success && typeof data.data === 'object') {
        console.log(`   ❌ ${file} (是对象结构，不是数组!)`);
        allFilesExist = false;
      } else {
        console.log(`   ❌ ${file} (格式错误)`);
        allFilesExist = false;
      }
    } catch (e) {
      console.log(`   ❌ ${file} (JSON格式错误: ${e.message})`);
      allFilesExist = false;
    }
  } else {
    console.log(`   ❌ ${file} (文件不存在)`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ 部分配置文件格式不正确或缺失!');
  process.exit(1);
}

console.log('\n✅ 所有配置文件检查通过!\n');

// 2. 检查开发服务器
console.log('2. 检查开发服务器接口...\n');

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            if (data.success && Array.isArray(data.data)) {
              console.log(`   ✅ ${url}`);
              console.log(`      状态码: ${res.statusCode}, 数据: ${data.data.length} 项`);
              resolve(true);
            } else if (data.success && typeof data.data === 'object') {
              console.log(`   ❌ ${url}`);
              console.log(`      返回的是对象结构，不是数组!`);
              resolve(false);
            } else {
              console.log(`   ❌ ${url} (格式错误)`);
              resolve(false);
            }
          } catch (e) {
            console.log(`   ❌ ${url} (JSON解析错误)`);
            resolve(false);
          }
        } else {
          console.log(`   ❌ ${url} (状态码: ${res.statusCode})`);
          resolve(false);
        }
      });
    }).on('error', (e) => {
      console.log(`   ❌ ${url} (错误: ${e.message})`);
      resolve(false);
    });
  });
}

async function checkDevServer() {
  console.log('   等待服务器响应...\n');
  const results = [];
  for (const file of CONFIG_FILES) {
    const url = `${BASE_URL}/config/${file}`;
    results.push(await checkUrl(url));
  }
  return results.every(r => r);
}

checkDevServer().then(serverOk => {
  console.log('\n' + '='.repeat(50));
  
  if (serverOk) {
    console.log('✅ 所有检查通过! 前端模拟数据(数组结构)已调通。\n');
    console.log('数据结构说明:');
    console.log('- 所有配置返回格式: { success: true, data: [...] }');
    console.log('- 每项数据包含 id 字段用于标识\n');
    console.log('下一步:');
    console.log('1. 打开浏览器访问: http://localhost:5173');
    console.log('2. 打开开发者工具 (F12) 查看控制台');
    console.log('3. 应该看到 "配置数据加载完成" 的日志');
    console.log('4. 点击右上角 🔧 按钮测试配置功能\n');
  } else {
    console.log('⚠️  开发服务器检查未完全通过。');
    console.log('请确保已运行: npm run dev\n');
  }
  
  console.log('='.repeat(50));
}).catch(err => {
  console.error('检查失败:', err);
  process.exit(1);
});