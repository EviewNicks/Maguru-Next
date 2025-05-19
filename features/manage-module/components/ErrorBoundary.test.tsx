import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ErrorBoundary } from './ErrorBoundary'

// Component yang akan melempar error
const ErrorThrowingComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Normal content</div>
}

// Mock untuk console.error
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('renders fallback UI when error occurs', () => {
    // Suppress React's error boundary console errors for this test
    jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    // Verify fallback UI is rendered
    expect(screen.getByText('Terjadi kesalahan!')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Aplikasi mengalami masalah yang tidak terduga. Silakan muat ulang halaman atau kembali ke beranda.'
      )
    ).toBeInTheDocument()
  })

  test('fallback UI has reload and home buttons', () => {
    // Suppress React's error boundary console errors for this test
    jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('reload-button')).toBeInTheDocument()
    expect(screen.getByTestId('home-button')).toBeInTheDocument()
  })

  test('renders custom fallback when provided', () => {
    // Suppress React's error boundary console errors for this test
    jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
  })
})
