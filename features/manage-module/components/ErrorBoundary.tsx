'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { logger } from '../services/logger'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  name?: string // Nama komponen untuk logging
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

const COMPONENT_NAME = 'ErrorBoundary'

class ErrorBoundaryBase extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state sehingga render berikutnya menampilkan fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { name = 'unnamed-component' } = this.props
    const FUNCTION_NAME = 'componentDidCatch'

    // Filter error DOM tertentu yang bisa diabaikan
    const isDOMRemoveChildError =
      error.message.includes('removeChild') &&
      error.message.includes('not a child of this node')

    // Log error ke logger service dengan level yang tepat
    if (isDOMRemoveChildError) {
      // Untuk error removeChild, kita log sebagai warning saja
      logger.warn(
        COMPONENT_NAME,
        FUNCTION_NAME,
        `DOM removeChild error pada komponen ${name}`,
        {
          message: error.message,
          componentStack: errorInfo.componentStack,
          name: error.name,
        }
      )
    } else {
      // Untuk error lain, log sebagai error
      logger.error(
        COMPONENT_NAME,
        FUNCTION_NAME,
        `Error pada komponen ${name}`,
        {
          error: error instanceof Error ? error : new Error('Unknown error'),
          componentStack: errorInfo.componentStack,
        }
      )
    }

    // Set state dengan info error
    this.setState({
      errorInfo,
    })
  }

  render() {
    const { hasError, error } = this.state

    if (hasError) {
      // Cek apakah ini error DOM yang bisa diabaikan
      const isDOMRemoveChildError =
        error?.message.includes('removeChild') &&
        error.message.includes('not a child of this node')

      // Untuk error DOM removeChild tertentu, kita coba render children
      // karena ini sering terjadi saat transisi UI dan biasanya tidak fatal
      if (isDOMRemoveChildError) {
        try {
          return this.props.children
        } catch {
          // Jika masih gagal, gunakan fallback
        }
      }

      // Jika prop fallback diberikan, gunakan fallback tersebut
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Terjadi kesalahan!</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Aplikasi mengalami masalah yang tidak terduga. Silakan muat ulang
            halaman atau kembali ke beranda.
          </p>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center"
              data-testid="reload-button"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Muat Ulang
            </Button>
            <Button
              onClick={() => (window.location.href = '/')}
              className="flex items-center"
              data-testid="home-button"
            >
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper komponen
export function ErrorBoundary({
  children,
  fallback,
  name,
}: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryBase fallback={fallback} name={name}>
      {children}
    </ErrorBoundaryBase>
  )
}
