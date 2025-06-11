import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModulePageEditorPage from '../../../../app/(admin)/manage-module/[moduleId]/page'
import { useParams, useSearchParams } from 'next/navigation'

// Mock Next.js router and params
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock ModulePageView and ModulePageEdit components
jest.mock(
  '../../../../features/manage-module/components/ModulePageView',
  () => ({
    ModulePageView: ({
      moduleId,
      pageId,
    }: {
      moduleId: string
      pageId: string
    }) => (
      <div data-testid="module-page-view">
        ModulePageView Component (Module: {moduleId}, Page: {pageId})
      </div>
    ),
  })
)

jest.mock(
  '../../../../features/manage-module/components/ModulePageEdit',
  () => ({
    ModulePageEdit: ({
      moduleId,
      pageId,
    }: {
      moduleId: string
      pageId: string
    }) => (
      <div data-testid="module-page-edit">
        ModulePageEdit Component (Module: {moduleId}, Page: {pageId})
      </div>
    ),
  })
)

// Mock ErrorBoundary
jest.mock(
  '../../../../features/manage-module/components/ErrorBoundary',
  () => ({
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="error-boundary">{children}</div>
    ),
  })
)

describe('URL Routing Tests', () => {
  // Mock search params implementation
  const mockSearchParams = new Map()
  const mockGetParam = jest
    .fn()
    .mockImplementation((param) => mockSearchParams.get(param))

  beforeEach(() => {
    jest.clearAllMocks()

    // Reset mock search params
    mockSearchParams.clear()
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: mockGetParam,
    })

    // Default params
    ;(useParams as jest.Mock).mockReturnValue({
      moduleId: 'module-123',
    })
  })

  it('renders ModulePageView when mode=view', () => {
    // Set up search params for view mode
    mockSearchParams.set('pageId', 'page-123')
    mockSearchParams.set('mode', 'view')

    render(<ModulePageEditorPage />)

    // Verify ModulePageView is rendered
    expect(screen.getByTestId('module-page-view')).toBeInTheDocument()
    expect(screen.queryByTestId('module-page-edit')).not.toBeInTheDocument()
    expect(
      screen.getByText(/Module: module-123, Page: page-123/)
    ).toBeInTheDocument()
  })

  it('renders ModulePageEdit when mode=edit', () => {
    // Set up search params for edit mode
    mockSearchParams.set('pageId', 'page-123')
    mockSearchParams.set('mode', 'edit')

    render(<ModulePageEditorPage />)

    // Verify ModulePageEdit is rendered
    expect(screen.getByTestId('module-page-edit')).toBeInTheDocument()
    expect(screen.queryByTestId('module-page-view')).not.toBeInTheDocument()
    expect(
      screen.getByText(/Module: module-123, Page: page-123/)
    ).toBeInTheDocument()
  })

  it('defaults to view mode when mode parameter is not provided', () => {
    // Set up search params without mode
    mockSearchParams.set('pageId', 'page-123')

    render(<ModulePageEditorPage />)

    // Verify ModulePageView is rendered (default)
    expect(screen.getByTestId('module-page-view')).toBeInTheDocument()
    expect(screen.queryByTestId('module-page-edit')).not.toBeInTheDocument()
  })

  it('shows message when pageId is not provided', () => {
    // No pageId in search params

    render(<ModulePageEditorPage />)

    // Verify neither view nor edit components are rendered
    expect(screen.queryByTestId('module-page-view')).not.toBeInTheDocument()
    expect(screen.queryByTestId('module-page-edit')).not.toBeInTheDocument()

    // Verify message is shown - use getByRole dengan nama dan level untuk heading
    expect(
      screen.getByRole('heading', { name: /pilih halaman/i, level: 2 })
    ).toBeInTheDocument()

    // Juga verifikasi pesan paragraf
    expect(screen.getByText(/pilih halaman dari sidebar/i)).toBeInTheDocument()
  })

  it('handles hydration by showing skeleton initially', () => {
    // Force mounted state to be false initially
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [false, jest.fn()])

    render(<ModulePageEditorPage />)

    // Verify skeleton is shown
    expect(screen.queryByTestId('module-page-view')).not.toBeInTheDocument()
    expect(screen.queryByTestId('module-page-edit')).not.toBeInTheDocument()
  })
})
