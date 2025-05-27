/**
 * Logger utility untuk aplikasi
 * Menyediakan fungsi logging yang lebih terstruktur daripada console.log
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// Menentukan level log minimum yang akan ditampilkan
// Dapat dikonfigurasi melalui environment variable di masa depan
const MIN_LOG_LEVEL: LogLevel =
  process.env.NODE_ENV === 'production' ? 'info' : 'debug'

// Map log level ke nilai numerik untuk komparasi
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

/**
 * Memeriksa apakah level log tertentu harus ditampilkan
 * @param level - Level log yang akan diperiksa
 * @returns Boolean yang menunjukkan apakah log harus ditampilkan
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LOG_LEVEL]
}

/**
 * Format timestamp untuk log
 * @returns String timestamp dalam format [HH:MM:SS]
 */
function getTimestamp(): string {
  const now = new Date()
  return `[${now.toISOString()}]`
}

/**
 * Format pesan log dengan context dan timestamp
 * @param level - Level log
 * @param context - Konteks log (nama service/module)
 * @param message - Pesan log
 * @returns String terformat
 */
function formatLogMessage(
  level: LogLevel,
  context: string,
  message: string
): string {
  return `${getTimestamp()} [${level.toUpperCase()}] [${context}] ${message}`
}

/**
 * Logger object untuk digunakan di seluruh aplikasi
 */
export const logger = {
  /**
   * Log pesan debug
   * @param context - Konteks log (nama service/module)
   * @param message - Pesan log
   * @param data - Data tambahan (opsional)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(context: string, message: string, data?: any): void {
    if (!shouldLog('debug')) return

    console.log(formatLogMessage('debug', context, message))
    if (data !== undefined) {
      console.log(data)
    }
  },

  /**
   * Log pesan info
   * @param context - Konteks log (nama service/module)
   * @param message - Pesan log
   * @param data - Data tambahan (opsional)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(context: string, message: string, data?: any): void {
    if (!shouldLog('info')) return

    console.log(formatLogMessage('info', context, message))
    if (data !== undefined) {
      console.log(data)
    }
  },

  /**
   * Log pesan warning
   * @param context - Konteks log (nama service/module)
   * @param message - Pesan log
   * @param data - Data tambahan (opsional)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(context: string, message: string, data?: any): void {
    if (!shouldLog('warn')) return

    console.warn(formatLogMessage('warn', context, message))
    if (data !== undefined) {
      console.warn(data)
    }
  },

  /**
   * Log pesan error
   * @param context - Konteks log (nama service/module)
   * @param message - Pesan log
   * @param error - Error object atau data error (opsional)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(context: string, message: string, error?: any): void {
    if (!shouldLog('error')) return

    console.error(formatLogMessage('error', context, message))
    if (error !== undefined) {
      if (error instanceof Error) {
        console.error(`${error.name}: ${error.message}`)
        console.error(error.stack)
      } else {
        console.error(error)
      }
    }
  },
}
