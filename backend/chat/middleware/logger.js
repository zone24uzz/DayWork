/**
 * Centralized logger for DayWork backend
 * Uses Winston with console and optional file transports
 */
const fs = require('fs')
const path = require('path')

// Ensure log directory exists
const logDir = path.join(__dirname, '..', '..', 'logs')
try { fs.mkdirSync(logDir, { recursive: true }) } catch (e) { /* silent */ }

// Simple console logger with timestamps (no external deps)
const logLevels = { error: 0, warn: 1, info: 2, debug: 3 }

class Logger {
  constructor(module) {
    this.module = module
    this.level = process.env.LOG_LEVEL || 'info'
  }

  _log(level, message, data = null) {
    if (logLevels[level] > logLevels[this.level]) return

    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.module}]`

    if (data) {
      console[level === 'error' ? 'error' : 'log'](`${prefix} ${message}`, data)
    } else {
      console[level === 'error' ? 'error' : 'log'](`${prefix} ${message}`)
    }

    // Also write to log file for persistence
    try {
      const logLine = `${prefix} ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`
      const logFile = path.join(logDir, `${new Date().toISOString().slice(0, 10)}.log`)
      fs.appendFileSync(logFile, logLine)
    } catch (e) { /* silent */ }
  }

  error(message, data) { this._log('error', message, data) }
  warn(message, data) { this._log('warn', message, data) }
  info(message, data) { this._log('info', message, data) }
  debug(message, data) { this._log('debug', message, data) }
}

// Factory function
const getLogger = (module) => new Logger(module)

// Express middleware for request logging
const requestLogger = (req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    const logger = getLogger('HTTP')
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`)
  })
  next()
}

module.exports = { getLogger, requestLogger }
