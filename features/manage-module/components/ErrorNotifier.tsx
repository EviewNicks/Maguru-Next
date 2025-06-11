'use client'

import { toast } from 'sonner'

export type ErrorCategory =
  | 'network'
  | 'validation'
  | 'server'
  | 'client'
  | 'auth'
  | 'unknown'

export interface ErrorDetails {
  code: string
  message: string
  details?: string
  category?: ErrorCategory
  isRetryable?: boolean
}

export interface ErrorNotificationOptions {
  retryFn?: () => void
  duration?: number
  dismissable?: boolean
}

/**
 * Kategorisasi error berdasarkan jenis dan pesan
 * @param error - Error yang akan dikategorisasi
 * @returns Kategori error
 */
export function categorizeError(error: unknown): ErrorCategory {
  // Error jaringan
  if (error instanceof Error) {
    const errorMsg = error.message.toLowerCase()

    // Network errors
    if (
      errorMsg.includes('network') ||
      errorMsg.includes('connection') ||
      errorMsg.includes('offline') ||
      errorMsg.includes('timeout') ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).name === 'NetworkError'
    ) {
      return 'network'
    }

    // Validation errors
    if (
      errorMsg.includes('validation') ||
      errorMsg.includes('invalid') ||
      errorMsg.includes('required')
    ) {
      return 'validation'
    }

    // Auth errors
    if (
      errorMsg.includes('authentication') ||
      errorMsg.includes('unauthorized') ||
      errorMsg.includes('permission') ||
      errorMsg.includes('forbidden') ||
      errorMsg.includes('access denied')
    ) {
      return 'auth'
    }
  }

  // HTTP error status codes

  if (
    typeof error === 'object' &&
    error !== null &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'response' in (error as any)
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any).response?.status

    if (status >= 400 && status < 500) {
      if (status === 401 || status === 403) {
        return 'auth'
      }
      return 'client'
    }

    if (status >= 500) {
      return 'server'
    }
  }

  // Default category
  return 'unknown'
}

/**
 * Menentukan apakah error dapat diulang (retry) berdasarkan kategori
 * @param category - Kategori error
 * @returns Boolean apakah error dapat diulang
 */
export function isErrorRetryable(category: ErrorCategory): boolean {
  // Network dan server errors biasanya dapat dicoba lagi
  return ['network', 'server'].includes(category)
}

/**
 * Mendapatkan label aksi berdasarkan kategori error
 * @param category - Kategori error
 * @returns Label untuk tombol aksi
 */
export function getActionLabelByCategory(category: ErrorCategory): string {
  switch (category) {
    case 'network':
      return 'Coba Lagi'
    case 'auth':
      return 'Login Ulang'
    case 'validation':
      return 'Perbaiki'
    case 'server':
      return 'Coba Lagi'
    default:
      return 'OK'
  }
}

/**
 * Menangani aksi berdasarkan kategori error
 * @param error - Error asli
 * @param category - Kategori error
 * @param retryFn - Fungsi untuk mencoba lagi
 */
export function handleErrorAction(
  error: unknown,
  category: ErrorCategory,
  retryFn?: () => void
): void {
  switch (category) {
    case 'network':
    case 'server':
      if (retryFn) retryFn()
      break
    case 'auth':
      // Redirect ke halaman login jika tersedia
      // window.location.href = '/login'
      break
    default:
      // Tidak ada aksi khusus
      break
  }
}

/**
 * Fungsi untuk menangani dan memformat error dari API
 * @param error - Error yang ditangkap dari API call
 * @returns Object berisi kode error dan pesan yang user-friendly
 */
export function handleError(error: unknown): ErrorDetails {
  // Error default jika tidak bisa mengidentifikasi jenis error
  let errorDetails: ErrorDetails = {
    code: 'UNKNOWN_ERROR',
    message: 'Terjadi kesalahan yang tidak diketahui',
    category: 'unknown',
    isRetryable: false,
  }

  if (error instanceof Error) {
    // Error standar dari JavaScript
    const category = categorizeError(error)
    errorDetails = {
      code: 'JS_ERROR',
      message: error.message || 'Terjadi kesalahan pada aplikasi',
      category,
      isRetryable: isErrorRetryable(category),
    }

    // Periksa apakah error adalah HTTP error dengan response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyError = error as any
    if (anyError.response) {
      const response = anyError.response

      // Coba ekstrak data dari response
      if (response.data) {
        if (response.data.error) {
          // Format error API kita
          const category = categorizeError(error)
          errorDetails = {
            code: response.data.error.code || `HTTP_${response.status || 500}`,
            message:
              response.data.error.message || 'Terjadi kesalahan pada server',
            details: response.data.error.details,
            category,
            isRetryable: isErrorRetryable(category),
          }
        } else {
          // Format error umum
          const category = categorizeError(error)
          errorDetails = {
            code: `HTTP_${response.status || 500}`,
            message:
              response.data.message || getHttpErrorMessage(response.status),
            category,
            isRetryable: isErrorRetryable(category),
          }
        }
      } else {
        // Hanya status HTTP tanpa detail
        const category = categorizeError(error)
        errorDetails = {
          code: `HTTP_${response.status || 500}`,
          message: getHttpErrorMessage(response.status),
          category,
          isRetryable: isErrorRetryable(category),
        }
      }
    }
  } else if (typeof error === 'string') {
    // Error string biasa
    errorDetails = {
      code: 'STRING_ERROR',
      message: error,
      category: 'unknown',
      isRetryable: false,
    }
  } else if (error && typeof error === 'object') {
    // Error dalam bentuk object lainnya
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyError = error as any
    const category = categorizeError(error)
    errorDetails = {
      code: anyError.code || 'OBJECT_ERROR',
      message: anyError.message || 'Terjadi kesalahan pada aplikasi',
      details: anyError.details || '',
      category,
      isRetryable: isErrorRetryable(category),
    }
  }

  return errorDetails
}

/**
 * Fungsi helper untuk mendapatkan pesan error berdasarkan status HTTP
 */
function getHttpErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Permintaan tidak valid. Periksa data yang dikirim'
    case 401:
      return 'Anda tidak memiliki akses. Silakan login kembali'
    case 403:
      return 'Anda tidak memiliki izin untuk mengakses resource ini'
    case 404:
      return 'Data yang diminta tidak ditemukan'
    case 429:
      return 'Terlalu banyak permintaan. Coba lagi nanti'
    case 500:
      return 'Terjadi kesalahan pada server. Coba lagi nanti'
    default:
      return 'Terjadi kesalahan pada server'
  }
}

/**
 * Menampilkan error notification dengan format yang konsisten dan dukungan retry
 * @param error - Error yang akan ditampilkan
 * @param options - Opsi tambahan untuk notifikasi
 */
export function showErrorNotification(
  error: unknown,
  options?: ErrorNotificationOptions
): void {
  const errorDetails = handleError(error)
  const category = errorDetails.category || 'unknown'

  // Konfigurasi durasi berdasarkan jenis error
  const duration =
    options?.duration ||
    (category === 'network' || category === 'server' ? 8000 : 5000)

  // Tentukan deskripsi error berdasarkan kategori
  let description = errorDetails.details || 'Silakan coba lagi nanti.'

  if (category === 'network') {
    description = 'Periksa koneksi internet Anda dan coba lagi.'
  } else if (category === 'validation') {
    description = 'Periksa kembali data yang dimasukkan.'
  } else if (category === 'auth') {
    description = 'Silakan login kembali untuk melanjutkan.'
  } else if (category === 'server') {
    description = 'Server sedang mengalami gangguan. Silakan coba lagi nanti.'
  }

  // Tampilkan toast error dengan aksi sesuai kategori
  if (errorDetails.isRetryable && options?.retryFn) {
    toast.error(errorDetails.message, {
      description,
      duration,
      action: {
        label: getActionLabelByCategory(category),
        onClick: () => {
          if (options.retryFn) options.retryFn()
        },
      },
    })
  } else {
    // Toast error tanpa opsi retry
    toast.error(errorDetails.message, {
      description,
      duration,
    })
  }
}

/**
 * Menangani error API dan menampilkan error yang sesuai dengan opsi retry
 * @param error - Error dari API
 * @param options - Opsi tambahan termasuk retry function
 * @param defaultMessage - Default message jika error tidak memiliki format yang diharapkan
 */
export function handleApiError(
  error: unknown,
  options?: ErrorNotificationOptions,
  defaultMessage?: string
): void {
  // Default message jika tidak disediakan
  const fallbackMessage =
    defaultMessage || 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'

  try {
    // Coba parse error sebagai respons API
    if (typeof error === 'object' && error !== null) {
      // Case 1: Error dengan struktur { error: { message: string } }
      if (
        'error' in error &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (error as any).error === 'object' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).error !== null &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'message' in (error as any).error
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiError = (error as any).error
        showErrorNotification(apiError.message, options)
        return
      }

      // Case 2: Error dengan struktur { message: string }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ('message' in error && typeof (error as any).message === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        showErrorNotification((error as any).message, options)
        return
      }
    }

    // Fallback: Tampilkan default message
    showErrorNotification(fallbackMessage, options)
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    showErrorNotification((err as any).message || fallbackMessage, options)
  }
}

export default {
  handleError,
  showErrorNotification,
  categorizeError,
  isErrorRetryable,
  getActionLabelByCategory,
  handleErrorAction,
  handleApiError,
}
