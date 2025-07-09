// Logger utility
// Logs messages with levels: info, warn, error
const fs = require('fs');

class Logger {
  /**
   * @param {string} [logFile] - Optional file path to log to file
   */
  constructor(logFile) {
    this.logFile = logFile;
  }

  log(level, message) {
    const entry = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
    if (this.logFile) {
      fs.appendFileSync(this.logFile, entry + '\n');
    } else {
      if (level === 'error') console.error(entry);
      else if (level === 'warn') console.warn(entry);
      else console.log(entry);
    }
  }

  info(msg) { this.log('info', msg); }
  warn(msg) { this.log('warn', msg); }
  error(msg) { this.log('error', msg); }
}

module.exports = Logger;
