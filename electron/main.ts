import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { spawn } from 'child_process'

// 检查是否是开发模式
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow
let proxyProcess = null

// ============ API 代理子进程管理 ============
function startProxyServer() {
  if (proxyProcess) {
    return // 已经启动
  }

  const proxyPath = join(__dirname, '..', 'src', 'server', 'api-proxy.js')
  
  // 设置代理进程的环境变量
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    ALLOWED_ORIGINS: 'file://',
    PORT: '3001'
  }

  proxyProcess = spawn('node', [proxyPath], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  })

  // 监听代理进程的输出
  proxyProcess.stdout.on('data', (data) => {
    console.log(`[Proxy] ${data}`)
  })

  proxyProcess.stderr.on('data', (data) => {
    console.error(`[Proxy Error] ${data}`)
  })

  proxyProcess.on('error', (error) => {
    console.error('启动代理服务器失败:', error)
  })

  proxyProcess.on('exit', (code) => {
    console.log(`代理进程退出，代码: ${code}`)
    proxyProcess = null
  })

  console.log('API 代理服务器已启动 (端口 3001)')
}

function stopProxyServer() {
  if (proxyProcess) {
    proxyProcess.kill()
    proxyProcess = null
    console.log('API 代理服务器已停止')
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: join(__dirname, '../public/icon.png'),
  })

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${join(__dirname, '../dist/index.html')}`

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  // 先启动代理服务器，再启动主窗口
  startProxyServer()
  
  // 等待代理服务器启动后再创建窗口
  setTimeout(() => {
    createWindow()
  }, 500)
})

app.on('window-all-closed', () => {
  stopProxyServer()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  stopProxyServer()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// 创建应用菜单
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Exit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit()
        },
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
    ],
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'toggleDevTools' },
    ],
  },
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
