const config = require('../config/config');

const logger = {
  info: (message, ...meta) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...meta);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      console.error(error.stack || error);
    }
  },
  warn: (message, ...meta) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...meta);
  },
  debug: (message, ...meta) => {
    if (config.nodeEnv === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...meta);
    }
  }
};

module.exports = logger;
