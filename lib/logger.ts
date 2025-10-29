/**
 * Centralized Logging Service
 *
 * Provides structured logging with context tracking, error metadata collection,
 * and environment-aware output (console in dev, external service in prod).
 *
 * Usage:
 * import { logger } from '@/lib/logger'
 *
 * logger.info('User logged in', { userId: user.id })
 * logger.error('Database query failed', { error, query })
 * logger.warn('Rate limit approaching', { userId, remaining: 5 })
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  page?: string
  component?: string
  action?: string
  duration?: number
  [key: string]: any
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
}

class Logger {
  private isDevelopment: boolean
  private logBuffer: LogEntry[] = []
  private bufferSize: number = 100

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  /**
   * Main logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext | Error,
    error?: Error
  ): void {
    const entry = this.createLogEntry(level, message, context, error)

    // Always log to console in development
    if (this.isDevelopment) {
      this.logToConsole(entry)
    }

    // Buffer logs for production (would send to external service)
    this.bufferLog(entry)

    // Send to external service if buffer is full or critical error
    if (level === LogLevel.CRITICAL || this.logBuffer.length >= this.bufferSize) {
      this.flushLogs()
    }
  }

  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext | Error,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    }

    // Handle context parameter
    if (context instanceof Error) {
      entry.error = this.extractErrorInfo(context)
    } else if (context) {
      entry.context = context
    }

    // Handle separate error parameter
    if (error) {
      entry.error = this.extractErrorInfo(error)
    }

    return entry
  }

  /**
   * Extract error information
   */
  private extractErrorInfo(error: Error): LogEntry['error'] {
    return {
      name: error.name,
      message: error.message,
      stack: this.isDevelopment ? error.stack : undefined,
      code: (error as any).code,
    }
  }

  /**
   * Log to console with color coding
   */
  private logToConsole(entry: LogEntry): void {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.CRITICAL]: '\x1b[41m', // Red background
    }

    const reset = '\x1b[0m'
    const color = colors[entry.level]

    const timestamp = entry.timestamp.split('T')[1].split('.')[0] // HH:MM:SS
    const prefix = `${color}[${timestamp}] ${entry.level}${reset}`

    if (entry.error) {
      console.error(`${prefix} ${entry.message}`, entry.error)
      if (entry.context) console.error('Context:', entry.context)
    } else {
      console.log(`${prefix} ${entry.message}`, entry.context || '')
    }
  }

  /**
   * Buffer log for batching
   */
  private bufferLog(entry: LogEntry): void {
    this.logBuffer.push(entry)
  }

  /**
   * Flush buffered logs to external service
   */
  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return

    const logsToSend = [...this.logBuffer]
    this.logBuffer = []

    // In production, send to external logging service
    if (!this.isDevelopment && typeof window === 'undefined') {
      // Server-side: could send to Datadog, Sentry, CloudWatch, etc.
      // For now, just log to console as fallback
      console.log(`[Logger] Flushing ${logsToSend.length} log entries`)
    }
  }

  /**
   * Public logging methods
   */

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, error?: Error | LogContext, context?: LogContext): void {
    if (error instanceof Error) {
      this.log(LogLevel.ERROR, message, context, error)
    } else {
      this.log(LogLevel.ERROR, message, error)
    }
  }

  critical(message: string, error?: Error | LogContext, context?: LogContext): void {
    if (error instanceof Error) {
      this.log(LogLevel.CRITICAL, message, context, error)
    } else {
      this.log(LogLevel.CRITICAL, message, error)
    }
  }

  /**
   * Utility: Generate request ID for distributed tracing
   */
  static generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Utility: Measure async operation duration
   */
  static async measureAsync<T>(
    label: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      logger.info(`${label} completed`, { duration: Math.round(duration) })
      return result
    } catch (error) {
      const duration = performance.now() - start
      logger.error(`${label} failed`, error as Error, { duration: Math.round(duration) })
      throw error
    }
  }
}

// Singleton instance
export const logger = new Logger()

// Export class for static method usage
export { Logger }

// Default export
export default logger
