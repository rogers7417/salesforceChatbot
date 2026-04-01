/**
 * 구조화된 로거
 */
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const ERROR_LOG = path.join(LOG_DIR, 'error.log');
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB

// 로그 디렉토리 생성
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function getTimestamp() {
  return new Date().toISOString();
}

function formatLog(level, module, message, data = null) {
  const entry = {
    timestamp: getTimestamp(),
    level,
    module,
    message,
    ...(data && { data }),
  };
  return JSON.stringify(entry);
}

function rotateLogIfNeeded() {
  try {
    if (fs.existsSync(ERROR_LOG)) {
      const stats = fs.statSync(ERROR_LOG);
      if (stats.size > MAX_LOG_SIZE) {
        const backup = ERROR_LOG.replace('.log', `-${Date.now()}.log`);
        fs.renameSync(ERROR_LOG, backup);
      }
    }
  } catch (e) {
    // 무시
  }
}

function writeToFile(entry) {
  rotateLogIfNeeded();
  fs.appendFileSync(ERROR_LOG, entry + '\n');
}

const logger = {
  info(module, message, data) {
    const entry = formatLog('INFO', module, message, data);
    console.log(`[${module}] ${message}`);
  },

  warn(module, message, data) {
    const entry = formatLog('WARN', module, message, data);
    console.warn(`[${module}] ⚠️ ${message}`);
    writeToFile(entry);
  },

  error(module, message, error, data) {
    const errorData = {
      ...data,
      error: {
        message: error?.message || String(error),
        stack: error?.stack,
        response: error?.response?.data,
      },
    };
    const entry = formatLog('ERROR', module, message, errorData);
    console.error(`[${module}] ❌ ${message}:`, error?.message || error);
    writeToFile(entry);
  },

  // 최근 에러 로그 조회
  getRecentErrors(limit = 20) {
    try {
      if (!fs.existsSync(ERROR_LOG)) return [];
      const content = fs.readFileSync(ERROR_LOG, 'utf-8');
      const lines = content.trim().split('\n').filter(l => l);
      return lines.slice(-limit).map(l => {
        try {
          return JSON.parse(l);
        } catch {
          return { raw: l };
        }
      }).reverse();
    } catch {
      return [];
    }
  },
};

module.exports = logger;
