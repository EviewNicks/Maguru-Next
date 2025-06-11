import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModulePageEditorPage from './pages/page'
import { useModulePageData } from '@/features/manage-module/hooks/useModulePageData'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}))

jest.mock('@/features/manage-module/hooks/useModulePageData', () => ({
  useModulePageData: jest.fn(),
}))

jest.mock('@/features/manage-module/components/ModulePageEditor', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(() => (
      <div data-testid="module-page-editor">ModulePageEditor</div>
    )),
}))

jest.mock('@/features/manage-module/components/ErrorBoundary', () => ({
  ErrorBoundary: jest.fn(({ children, fallback }) => {
    if (process.env.TEST_ERROR_BOUNDARY) {
      return fallback || <div>Fallback UI</div>
    }
    return children
  }),
}))

describe('ModulePageEditorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mocks
    ;(useParams as jest.Mock).mockReturnValue({ moduleId: 'test-module-id' })
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('test-page-id'),
    })
    ;(useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    })
    ;(useModulePageData as jest.Mock).mockReturnValue({
      getAllPages: {
        data: {
          data: [{ id: 'test-page-id' }],
        },
        isLoading: false,
      },
    })
  })

  test('renders ModulePageEditor with correct props', () => {
    render(<ModulePageEditorPage />)

    expect(screen.getByTestId('module-page-editor')).toBeInTheDocument()
  })

  test('renders Skeleton during loading', () => {
    ;(useModulePageData as jest.Mock).mockReturnValue({
      getAllPages: {
        data: null,
        isLoading: true,
      },
    })

    // Force React.Suspense to show fallback
    jest
      .spyOn(React, 'Suspense')
      .mockImplementation(({ fallback }) => fallback as React.ReactElement)

    render(<ModulePageEditorPage />)

    expect(screen.getByText(/skeleton/i)).toBeInTheDocument()
  })

  test('redirects to first page if no pageId is provided', () => {
    const pushMock = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    })
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    })
    ;(useModulePageData as jest.Mock).mockReturnValue({
      getAllPages: {
        data: {
          data: [{ id: 'first-page-id' }],
        },
        isLoading: false,
      },
    })

    render(<ModulePageEditorPage />)

    expect(pushMock).toHaveBeenCalledWith(
      '/manage-module/pages/test-module-id?pageId=first-page-id'
    )
  })

  test('renders ErrorBoundary with custom fallback UI', () => {
    // Set environment flag to trigger error boundary fallback
    process.env.TEST_ERROR_BOUNDARY = 'true'

    render(<ModulePageEditorPage />)

    expect(
      screen.getByText('Terjadi kesalahan saat memuat editor')
    ).toBeInTheDocument()
    expect(screen.getByTestId('reload-editor-btn')).toBeInTheDocument()
    expect(screen.getByTestId('back-modules-btn')).toBeInTheDocument()

    // Reset flag after test
    delete process.env.TEST_ERROR_BOUNDARY
  })
})
