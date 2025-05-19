 'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundaryBase extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state sehingga render berikutnya menampilkan fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error ke monitoring service
    console.error('UI Error:', error)
    console.error('Error detail:', errorInfo)
    
    this.setState({
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
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
            Aplikasi mengalami masalah yang tidak terduga. Silakan muat ulang halaman atau kembali ke beranda.
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
              onClick={() => window.location.href = '/'}
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
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryBase fallback={fallback}>
      {children}
    </ErrorBoundaryBase>
  )
}