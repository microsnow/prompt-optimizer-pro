/**
 * API 配置文件
 * 集中管理所有 API 相关的 URL 和配置
 *
 * 环境说明：
 * - 开发环境：http://localhost:3001
 * - 打包环境：http://192.168.1.67:10002
 */

// API 代理服务器地址配置
export const getAPIBaseURL = (): string => {
  // 优先使用环境变量配置（支持 .env 文件）
  // 打包时设置：VITE_API_BASE=http://192.168.1.67:10002
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }

  // 检测是否是 Electron 环境（通过 file:// 协议）
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    // Electron 应用：使用本地代理服务器
    return 'http://localhost:3001';
  }

  // 生产环境 Web：使用相对路径（Nginx 代理）
  if (import.meta.env.PROD) {
    return '/api';
  }

  // 开发环境：默认使用 localhost:3001
  return 'http://localhost:3001';
};

// API 基础 URL
export const API_PROXY_URL = getAPIBaseURL();

// API 端点配置
export const API_ENDPOINTS = {
  // 健康检查
  HEALTH: '/health',

  // API 代理相关
  PROXY: {
    CHAT: '/proxy/chat',
    MODELS: '/proxy/models',
  },

  // 其他 API 端点...
} as const;

// Axios 默认配置
export const AXIOS_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 秒超时
} as const;
