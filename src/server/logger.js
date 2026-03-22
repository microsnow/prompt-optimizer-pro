/**
 * 日志系统
 * 提供结构化日志，便于问题排查
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日志级别
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  TRACE: 'TRACE'
};

// 颜色代码 (用于控制台输出)
const COLORS = {
  ERROR: '\x1b[31m',    // 红
  WARN: '\x1b[33m',     // 黄
  INFO: '\x1b[36m',     // 青
  DEBUG: '\x1b[35m',    // 紫
  TRACE: '\x1b[37m',    // 白
  RESET: '\x1b[0m'
};

class Logger {
  constructor(options = {}) {
    this.level = options.level || 'INFO';
    this.logDir = options.logDir || './logs';
    this.enableConsole = options.enableConsole !== false;
    this.enableFile = options.enableFile !== false;
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB

    // 创建日志目录
    if (this.enableFile && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * 获取当前时间戳
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * 格式化日志消息
   */
  formatMessage(level, context, message, data) {
    const timestamp = this.getTimestamp();
    let output = `[${timestamp}] [${level}]`;

    if (context) {
      output += ` [${context}]`;
    }

    output += ` ${message}`;

    if (data) {
      if (typeof data === 'object') {
        output += `\n${JSON.stringify(data, null, 2)}`;
      } else {
        output += ` ${data}`;
      }
    }

    return output;
  }

  /**
   * 输出到控制台
   */
  logToConsole(level, formatted) {
    const color = COLORS[level] || '';
    const reset = COLORS.RESET;
    console.log(`${color}${formatted}${reset}`);
  }

  /**
   * 输出到文件
   */
  logToFile(level, formatted) {
    if (!this.enableFile) return;

    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `${dateStr}.log`);

    try {
      // 检查文件大小
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.size > this.maxFileSize) {
          const backupFile = path.join(this.logDir, `${dateStr}-${Date.now()}.log`);
          fs.renameSync(logFile, backupFile);
        }
      }

      fs.appendFileSync(logFile, formatted + '\n');
    } catch (error) {
      console.error('写入日志文件失败:', error.message);
    }
  }

  /**
   * 核心日志方法
   */
  log(level, context, message, data) {
    const formatted = this.formatMessage(level, context, message, data);

    if (this.enableConsole) {
      this.logToConsole(level, formatted);
    }

    if (this.enableFile) {
      this.logToFile(level, formatted);
    }
  }

  // 便捷方法
  error(context, message, data) {
    this.log(LOG_LEVELS.ERROR, context, message, data);
  }

  warn(context, message, data) {
    this.log(LOG_LEVELS.WARN, context, message, data);
  }

  info(context, message, data) {
    this.log(LOG_LEVELS.INFO, context, message, data);
  }

  debug(context, message, data) {
    this.log(LOG_LEVELS.DEBUG, context, message, data);
  }

  trace(context, message, data) {
    this.log(LOG_LEVELS.TRACE, context, message, data);
  }

  /**
   * 记录 API 请求
   */
  logRequest(provider, method, path, headers, body) {
    this.debug('API_REQUEST', `${method} ${path}`, {
      provider,
      headers: this.sanitizeHeaders(headers),
      body: this.sanitizeBody(body)
    });
  }

  /**
   * 记录 API 响应
   */
  logResponse(provider, statusCode, responseData) {
    this.debug('API_RESPONSE', `Status: ${statusCode}`, {
      provider,
      responseSize: JSON.stringify(responseData).length,
      // 不输出完整响应体，只显示摘要
      responseSummary: this.summarizeResponse(responseData)
    });
  }

  /**
   * 记录 API 错误
   */
  logAPIError(provider, error) {
    this.error('API_ERROR', `${provider} API 调用失败`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
  }

  /**
   * 脱敏 headers (隐藏敏感信息)
   */
  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    if (sanitized.Authorization) {
      const token = sanitized.Authorization;
      sanitized.Authorization = token.substring(0, 10) + '...' + token.substring(token.length - 5);
    }
    return sanitized;
  }

  /**
   * 脱敏 body (隐藏敏感信息)
   */
  sanitizeBody(body) {
    if (!body) return body;
    const sanitized = JSON.parse(JSON.stringify(body));
    if (sanitized.apiKey) {
      sanitized.apiKey = sanitized.apiKey.substring(0, 5) + '...' + sanitized.apiKey.substring(sanitized.apiKey.length - 3);
    }
    // 删除 messages 中的详细内容，只保留数量
    if (sanitized.messages && Array.isArray(sanitized.messages)) {
      sanitized.messages = `[${sanitized.messages.length} messages]`;
    }
    return sanitized;
  }

  /**
   * 摘要化响应 (避免日志过大)
   */
  summarizeResponse(data) {
    if (!data) return null;
    if (data.choices && Array.isArray(data.choices)) {
      return {
        hasChoices: true,
        choiceCount: data.choices.length,
        firstChoiceLength: data.choices[0]?.message?.content?.length || 0
      };
    }
    if (data.output) {
      return {
        hasOutput: true,
        outputLength: data.output.text?.length || 0
      };
    }
    return Object.keys(data).slice(0, 5);
  }

  /**
   * 性能日志
   */
  logPerformance(context, operation, duration) {
    const level = duration > 5000 ? 'WARN' : 'DEBUG';
    this.log(level, context, `${operation} 耗时 ${duration}ms`, {
      operation,
      duration: `${duration}ms`,
      warning: duration > 5000 ? '⚠️  耗时过长' : null
    });
  }

  /**
   * 获取日志文件列表
   */
  getLogFiles() {
    if (!this.enableFile || !fs.existsSync(this.logDir)) {
      return [];
    }
    return fs.readdirSync(this.logDir).filter(f => f.endsWith('.log'));
  }

  /**
   * 清理旧日志
   */
  cleanOldLogs(days = 7) {
    if (!this.enableFile || !fs.existsSync(this.logDir)) {
      return;
    }

    const now = Date.now();
    const maxAge = days * 24 * 60 * 60 * 1000;

    fs.readdirSync(this.logDir).forEach(file => {
      const filePath = path.join(this.logDir, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        this.info('CLEANUP', `删除旧日志文件: ${file}`);
      }
    });
  }
}

// 创建全局 logger 实例
const logger = new Logger({
  level: process.env.LOG_LEVEL || 'INFO',
  logDir: './logs',
  enableConsole: true,
  enableFile: true
});

export default logger;
