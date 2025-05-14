'use client'

import { toast } from 'sonner'

interface ErrorDetails {
  code: string
  message: string
  details?: string
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
  }

  if (error instanceof Error) {
    // Error standar dari JavaScript
    errorDetails = {
      code: 'JS_ERROR',
      message: error.message || 'Terjadi kesalahan pada aplikasi',
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
          errorDetails = {
            code: response.data.error.code || `HTTP_${response.status || 500}`,
            message:
              response.data.error.message || 'Terjadi kesalahan pada server',
            details: response.data.error.details,
          }
        } else {
          // Format error umum
          errorDetails = {
            code: `HTTP_${response.status || 500}`,
            message:
              response.data.message || getHttpErrorMessage(response.status),
          }
        }
      } else {
        // Hanya status HTTP tanpa detail
        errorDetails = {
          code: `HTTP_${response.status || 500}`,
          message: getHttpErrorMessage(response.status),
        }
      }
    }
  } else if (typeof error === 'string') {
    // Error string biasa
    errorDetails = {
      code: 'STRING_ERROR',
      message: error,
    }
  } else if (error && typeof error === 'object') {
    // Error dalam bentuk object lainnya
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyError = error as any
    errorDetails = {
      code: anyError.code || 'OBJECT_ERROR',
      message: anyError.message || 'Terjadi kesalahan pada aplikasi',
      details: anyError.details || '',
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
 * Fungsi untuk menampilkan notifikasi error
 */
export function showErrorNotification(error: unknown): void {
  const errorDetails = handleError(error)

  toast.error(errorDetails.message, {
    description: errorDetails.code,
    duration: 5000,
  })
}

export default { handleError, showErrorNotification }
