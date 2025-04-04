import React from 'react'
import { toast } from 'sonner'

export type ErrorType = 'validation' | 'network' | 'server' | 'permission' | 'unknown'

export interface ErrorDetails {
  type: ErrorType
  message: string
  code?: string
}

export interface ErrorNotifierProps {
  error: ErrorDetails
}

const errorMessages: Record<ErrorType, string> = {
  validation: 'Terjadi kesalahan validasi. Silakan periksa kembali input Anda.',
  network: 'Gagal terhubung ke server. Periksa koneksi internet Anda.',
  server: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
  permission: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
  unknown: 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.'
}

export function ErrorNotifier({ error }: ErrorNotifierProps) {
  const { type, message, code } = error

  React.useEffect(() => {
    const defaultMessage = errorMessages[type] || errorMessages.unknown
    const fullMessage = `${defaultMessage} ${message ? `(${message})` : ''}`

    console.log('ErrorNotifier called with:', { type, message, code })

    toast.error(fullMessage, {
      description: code ? `Kode Error: ${code}` : undefined,
      duration: type === 'network' ? 5000 : 3000,
    })

    // Optional: Log error untuk debugging
    console.error(`[${type.toUpperCase()} Error]`, { message, code })
  }, [type, message, code])

  return null
}

export function handleError(error: unknown): ErrorDetails {
  console.log('handleError called with:', error)

  if (!error) {
    return { type: 'unknown', message: 'Error tidak diketahui' }
  }

  // Penanganan error dari React Query
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response: { status: number, data?: { message?: string } } }).response
    const status = response.status
    // const originalMessage = response.data?.message || ''
    
    switch (status) {
      case 400:
        return { 
          type: 'validation', 
          message: 'Terjadi kesalahan validasi. Silakan periksa kembali input Anda.', 
          code: `HTTP_${status}` 
        }
      case 401:
      case 403:
        return { 
          type: 'permission', 
          message: 'Akses ditolak. Anda tidak memiliki izin untuk melakukan tindakan ini.', 
          code: `HTTP_${status}` 
        }
      case 500:
      case 502:
      case 503:
      case 504:
        return { 
          type: 'server', 
          message: 'Masalah pada server. Silakan coba lagi nanti.', 
          code: `HTTP_${status}` 
        }
      default:
        return { 
          type: 'unknown', 
          message: 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.', 
          code: `HTTP_${status}` 
        }
    }
  }

  // Penanganan error jaringan
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message
    if (message === 'Network Error') {
      return { 
        type: 'network', 
        message: 'Tidak dapat terhubung ke server' 
      }
    }
  }

  // Penanganan error umum
  return { 
    type: 'unknown', 
    message: 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.' 
  }
}

export default ErrorNotifier
