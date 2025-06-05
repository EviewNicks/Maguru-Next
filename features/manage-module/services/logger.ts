/**
 * Logger utility untuk aplikasi
 * Menyediakan fungsi logging yang kompatibel dengan Next.js (server dan client side)
 */

// Cek apakah kode berjalan di server atau client
const isServer = typeof window === 'undefined'
const isEdgeRuntime =
  typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge'

// Tentukan level log minimum berdasarkan environment
const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'info' : 'debug'

// Level log dengan prioritas numerik (semakin kecil semakin penting)
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
}

// Tentukan apakah level tertentu harus di-log berdasarkan LOG_LEVEL
const shouldLog = (level: keyof typeof LOG_LEVELS): boolean => {
  return LOG_LEVELS[level] <= LOG_LEVELS[LOG_LEVEL as keyof typeof LOG_LEVELS]
}

// Format timestamp untuk log
const getTimestamp = (): string => {
  const now = new Date()
  return now.toISOString()
}

// Warna untuk console
const COLORS = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m', // Yellow
  info: '\x1b[36m', // Cyan
  http: '\x1b[35m', // Magenta
  verbose: '\x1b[34m', // Blue
  debug: '\x1b[32m', // Green
  reset: '\x1b[0m', // Reset
}

// Definisikan tipe untuk data log
interface LogData {
  [key: string]: unknown
  performance?: {
    label?: string
    duration?: string
    timestamp?: number
    memory?: NodeJS.MemoryUsage | null
  }
}

// Definisikan tipe untuk logger
interface Logger {
  debug(context: string, message: string, data?: Record<string, unknown>): void
  info(context: string, message: string, data?: Record<string, unknown>): void
  warn(context: string, message: string, data?: Record<string, unknown>): void
  error(
    context: string,
    message: string,
    error?: Error | Record<string, unknown>
  ): void
  http(context: string, message: string, data?: Record<string, unknown>): void
  verbose(
    context: string,
    message: string,
    data?: Record<string, unknown>
  ): void
  child(context: string): {
    debug(message: string, data?: Record<string, unknown>): void
    info(message: string, data?: Record<string, unknown>): void
    warn(message: string, data?: Record<string, unknown>): void
    error(message: string, error?: Error | Record<string, unknown>): void
    http(message: string, data?: Record<string, unknown>): void
    verbose(message: string, data?: Record<string, unknown>): void
  }
  startTimer(
    context: string,
    label: string
  ): {
    end(message?: string): number
  }
  _saveToFile?(level: string, message: string): void
}

// Tambahkan metadata untuk performance monitoring
const addPerformanceData = (data?: Record<string, unknown>): LogData => {
  if (!data) return {}

  // Jika sudah ada properti performance, gunakan itu
  if (data.performance) return data as LogData

  // Tambahkan data performance hanya jika di server-side dan bukan Edge Runtime
  if (isServer && !isEdgeRuntime) {
    try {
      return {
        ...data,
        performance: {
          timestamp: Date.now(),
          memory: process.memoryUsage(),
        },
      }
    } catch {
      // Jika memoryUsage tidak tersedia (misalnya di Edge Runtime)
      return {
        ...data,
        performance: {
          timestamp: Date.now(),
          memory: null,
        },
      }
    }
  }

  // Di client-side, hanya tambahkan timestamp
  return {
    ...data,
    performance: {
      timestamp: Date.now(),
      memory: null,
    },
  }
}

// Format pesan log
const formatLogMessage = (
  level: string,
  context: string,
  message: string,
  data?: Record<string, unknown>
): string => {
  const timestamp = getTimestamp()
  const prefix = `${timestamp} [${level.toUpperCase()}] [${context || 'APP'}]`
  const dataString =
    data && Object.keys(data).length ? `\n${JSON.stringify(data, null, 2)}` : ''

  return `${prefix} ${message}${dataString}`
}

// Implementasi logger sederhana yang kompatibel dengan Next.js
export const logger: Logger = {
  /**
   * Log pesan debug
   * @param context - Konteks log (nama service/module)
   * @param message - Pesan log
   * @param data - Data tambahan (opsional)
   */
  debug(
    context: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    if (!shouldLog('debug')) return

    const logData = addPerformanceData(data)
    const formattedMessage = formatLogMessage(
      'debug',
      context,
      message,
      logData
    )

    console.debug(`${COLORS.debug}${formattedMessage}${COLORS.reset}`)

    // Simpan ke file jika di server-side dan bukan Edge Runtime
    this._saveToFile?.('debug', formattedMessage)
  },

  /**
   * Log pesan info
   * @param context - Konteks log (nama service/module)
   * @param message - Pesan log
   * @param data - Data tambahan (opsional)
   */
  info(context: string, message: string, data?: Record<string, unknown>): void {
    if (!shouldLog('info')) return

    const logData = addPerformanceData(data)
    const formattedMessage = formatLogMessage('info', context, message, logData)

    console.info(`${COLORS.info}${formattedMessage}${COLORS.reset}`)

    // Simpan ke file jika di server-side dan bukan Edge Runtime
    this._saveToFile?.('info', formattedMessage)
  },

  /**
   * Log pesan warning
   * @param context - Konteks log (nama service/module)
   * @param message - Pesan log
   * @param data - Data tambahan (opsional)
   */
  warn(context: string, message: string, data?: Record<string, unknown>): void {
    if (!shouldLog('warn')) return

    const logData = addPerformanceData(data)
    const formattedMessage = formatLogMessage('warn', context, message, logData)

    console.warn(`${COLORS.warn}${formattedMessage}${COLORS.reset}`)

    // Simpan ke file jika di server-side dan bukan Edge Runtime
    this._saveToFile?.('warn', formattedMessage)
  },

  /**
   * Log pesan error
   * @param context - Konteks log (nama service/module)
   * @param message - Pesan log
   * @param error - Error object atau data error (opsional)
   */
  error(
    context: string,
    message: string,
    error?: Error | Record<string, unknown>
  ): void {
    if (!shouldLog('error')) return

    // Ekstrak stack trace jika error adalah instance Error
    const errorData =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            ...addPerformanceData({}),
          }
        : addPerformanceData(error as Record<string, unknown>)

    const formattedMessage = formatLogMessage(
      'error',
      context,
      message,
      errorData
    )

    console.error(`${COLORS.error}${formattedMessage}${COLORS.reset}`)

    // Simpan ke file jika di server-side dan bukan Edge Runtime
    this._saveToFile?.('error', formattedMessage)
  },

  /**
   * Log pesan HTTP (untuk request/response)
   * @param context - Konteks log (nama service/module)
   * @param message - Pesan log
   * @param data - Data tambahan (opsional)
   */
  http(context: string, message: string, data?: Record<string, unknown>): void {
    if (!shouldLog('http')) return

    const logData = addPerformanceData(data)
    const formattedMessage = formatLogMessage('http', context, message, logData)

    console.log(`${COLORS.http}${formattedMessage}${COLORS.reset}`)

    // Simpan ke file jika di server-side dan bukan Edge Runtime
    this._saveToFile?.('http', formattedMessage)
  },

  /**
   * Log pesan verbose (lebih detail dari info)
   * @param context - Konteks log (nama service/module)
   * @param message - Pesan log
   * @param data - Data tambahan (opsional)
   */
  verbose(
    context: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    if (!shouldLog('verbose')) return

    const logData = addPerformanceData(data)
    const formattedMessage = formatLogMessage(
      'verbose',
      context,
      message,
      logData
    )

    console.log(`${COLORS.verbose}${formattedMessage}${COLORS.reset}`)

    // Simpan ke file jika di server-side dan bukan Edge Runtime
    this._saveToFile?.('verbose', formattedMessage)
  },

  /**
   * Membuat child logger dengan konteks tertentu
   * @param context - Konteks default untuk child logger
   * @returns Child logger dengan konteks yang sudah diset
   */
  child(context: string) {
    return {
      debug: (message: string, data?: Record<string, unknown>) =>
        this.debug(context, message, data),
      info: (message: string, data?: Record<string, unknown>) =>
        this.info(context, message, data),
      warn: (message: string, data?: Record<string, unknown>) =>
        this.warn(context, message, data),
      error: (message: string, error?: Error | Record<string, unknown>) =>
        this.error(context, message, error),
      http: (message: string, data?: Record<string, unknown>) =>
        this.http(context, message, data),
      verbose: (message: string, data?: Record<string, unknown>) =>
        this.verbose(context, message, data),
    }
  },

  /**
   * Mulai mengukur waktu eksekusi
   * @param context - Konteks log
   * @param label - Label untuk identifikasi pengukuran
   * @returns Fungsi untuk mengakhiri pengukuran dan mencatat hasilnya
   */
  startTimer(context: string, label: string) {
    const start = Date.now()
    return {
      end: (message?: string) => {
        const duration = Date.now() - start
        this.info(context, message || `${label} completed`, {
          performance: {
            label,
            duration: `${duration}ms`,
          },
        })
        return duration
      },
    }
  },
}

// Tambahkan fungsi untuk menyimpan ke file hanya jika di server-side dan bukan Edge Runtime
if (isServer && !isEdgeRuntime) {
  try {
    // Gunakan dynamic import untuk fs dan path
    // Ini hanya akan dijalankan di server-side Node.js
    import('fs')
      .then((fs) => {
        import('path')
          .then((path) => {
            // Buat direktori log jika belum ada
            const LOG_DIR = path.join(
              process.cwd(),
              'services',
              'logger-detailed'
            )
            if (!fs.existsSync(LOG_DIR)) {
              fs.mkdirSync(LOG_DIR, { recursive: true })
            }

            // Tambahkan fungsi _saveToFile ke logger
            logger._saveToFile = (level: string, message: string) => {
              try {
                const today = new Date().toISOString().split('T')[0]
                const combinedLogPath = path.join(LOG_DIR, 'combined.log')
                const dailyLogPath = path.join(LOG_DIR, `app-${today}.log`)
                const errorLogPath = path.join(LOG_DIR, 'error.log')

                // Append ke combined.log
                fs.appendFileSync(combinedLogPath, message + '\n')

                // Append ke daily log
                fs.appendFileSync(dailyLogPath, message + '\n')

                // Jika level error, append juga ke error.log
                if (level === 'error') {
                  fs.appendFileSync(errorLogPath, message + '\n')
                }
              } catch (err) {
                console.error('Failed to write log to file:', err)
              }
            }
          })
          .catch((err) => {
            console.error('Failed to import path module:', err)
          })
      })
      .catch((err) => {
        console.error('Failed to import fs module:', err)
      })
  } catch (err) {
    console.error('Failed to setup file logging:', err)
  }
}
