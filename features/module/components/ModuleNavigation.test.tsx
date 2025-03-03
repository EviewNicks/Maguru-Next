// features/module/components/ModuleNavigation.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ModuleNavigation from './ModuleNavigation'

// Mock the Button component from shadcn/ui
jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    variant,
    size,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    className?: string
    variant?: string
    size?: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
      data-size={size}
      data-testid="button"
    >
      {children}
    </button>
  ),
}))

// Mock the Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    className,
    variant,
  }: {
    children: React.ReactNode
    className?: string
    variant?: string
  }) => (
    <span
      className={className}
      data-variant={variant}
      data-testid="badge"
    >
      {children}
    </span>
  ),
}))

// Mock the Tooltip components
jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-provider">{children}</div>,
  TooltipTrigger: ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => (
    <div data-testid="tooltip-trigger" data-aschild={asChild}>{children}</div>
  ),
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="chevron-left">ChevronLeft</span>,
  ChevronRight: () => <span data-testid="chevron-right">ChevronRight</span>,
  AlertCircle: () => <span data-testid="alert-circle">AlertCircle</span>,
  Zap: () => <span data-testid="zap">Zap</span>,
}))

// Mock ProgressIndicator component
jest.mock('./ProgressIndicator', () => ({
  __esModule: true,
  default: ({ 
    currentPage, 
    totalPages, 
    hasVisitedPages 
  }: { 
    currentPage: number, 
    totalPages: number, 
    hasVisitedPages?: number[] 
  }) => (
    <div 
      data-testid="progress-indicator" 
      data-current-page={currentPage} 
      data-total-pages={totalPages}
      data-visited-pages={hasVisitedPages?.join(',')}
    >
      Progress Indicator
    </div>
  )
}))


describe('ModuleNavigation', () => {
  const mockOnPrevPage = jest.fn()
  const mockOnNextPage = jest.fn()
  const mockOnToggleQuickViewMode = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders navigation buttons correctly', () => {
    render(
      <ModuleNavigation
        currentPage={2}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
      />
    )

    const buttons = screen.getAllByTestId('button')
    expect(buttons).toHaveLength(2) // Prev and Next buttons
    
    expect(buttons[0]).toHaveTextContent('Sebelumnya')
    expect(screen.getByTestId('tooltip-trigger')).toHaveTextContent('Selanjutnya')
    
    expect(screen.getByTestId('chevron-left')).toBeInTheDocument()
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    render(
      <ModuleNavigation
        currentPage={1}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
      />
    )

    const buttons = screen.getAllByTestId('button')
    expect(buttons[0]).toBeDisabled()
    expect(buttons[1]).not.toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(
      <ModuleNavigation
        currentPage={5}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={true}
      />
    )

    const buttons = screen.getAllByTestId('button')
    expect(buttons[0]).not.toBeDisabled()
    expect(buttons[1]).toBeDisabled()
  })

  it('shows "Selesai" text instead of "Selanjutnya" on last page', () => {
    render(
      <ModuleNavigation
        currentPage={5}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={true}
      />
    )

    expect(screen.getByTestId('tooltip-trigger')).toHaveTextContent('Selesai')
    expect(screen.queryByTestId('chevron-right')).not.toBeInTheDocument()
  })

  it('calls onPrevPage when previous button is clicked', () => {
    render(
      <ModuleNavigation
        currentPage={2}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
      />
    )

    const buttons = screen.getAllByTestId('button')
    fireEvent.click(buttons[0])
    expect(mockOnPrevPage).toHaveBeenCalledTimes(1)
  })

  it('calls onNextPage when next button is clicked', () => {
    render(
      <ModuleNavigation
        currentPage={2}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
      />
    )

    const nextButton = screen.getByTestId('tooltip-trigger').querySelector('button')
    fireEvent.click(nextButton!)
    expect(mockOnNextPage).toHaveBeenCalledTimes(1)
  })

  it('disables next button when page is not completed', () => {
    render(
      <ModuleNavigation
        currentPage={2}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
        isPageCompleted={false}
      />
    )

    const nextButton = screen.getByTestId('tooltip-trigger').querySelector('button')
    expect(nextButton).toBeDisabled()
  })

  it('enables next button when in quick view mode even if page is not completed', () => {
    render(
      <ModuleNavigation
        currentPage={2}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
        isPageCompleted={false}
        quickViewMode={true}
      />
    )

    const buttons = screen.getAllByTestId('button')
    expect(buttons[1]).not.toBeDisabled()
  })

  it('displays quick view mode badge when in quick view mode', () => {
    render(
      <ModuleNavigation
        currentPage={2}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
        quickViewMode={true}
      />
    )

    expect(screen.getByTestId('badge')).toBeInTheDocument()
    expect(screen.getByTestId('badge')).toHaveTextContent('Mode Eksplorasi Cepat')
  })

  it('displays quick view mode toggle button when onToggleQuickViewMode is provided', () => {
    render(
      <ModuleNavigation
        currentPage={2}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
        onToggleQuickViewMode={mockOnToggleQuickViewMode}
      />
    )

    const buttons = screen.getAllByTestId('button')
    expect(buttons.length).toBeGreaterThan(2) // Should have prev, next, and toggle buttons
    
    const toggleButton = buttons.find(button => 
      button.textContent?.includes('Aktifkan Mode Eksplorasi Cepat')
    )
    expect(toggleButton).toBeInTheDocument()
    
    fireEvent.click(toggleButton!)
    expect(mockOnToggleQuickViewMode).toHaveBeenCalledTimes(1)
  })

  it('shows warning message when in quick view mode', () => {
    render(
      <ModuleNavigation
        currentPage={2}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
        quickViewMode={true}
        onToggleQuickViewMode={mockOnToggleQuickViewMode}
      />
    )

    expect(screen.getByText('Progres tidak akan disimpan dalam mode ini')).toBeInTheDocument()
  })

  
  it('renders ProgressIndicator with correct props', () => {
    const visitedPages = [1, 2, 3]
    
    render(
      <ModuleNavigation
        currentPage={3}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
        visitedPages={visitedPages}
      />
    )

    const progressIndicator = screen.getByTestId('progress-indicator')
    expect(progressIndicator).toBeInTheDocument()
    expect(progressIndicator).toHaveAttribute('data-current-page', '3')
    expect(progressIndicator).toHaveAttribute('data-total-pages', '5')
    expect(progressIndicator).toHaveAttribute('data-visited-pages', '1,2,3')
  })

  it('passes empty array for visitedPages when not provided', () => {
    render(
      <ModuleNavigation
        currentPage={2}
        totalPages={5}
        onPrevPage={mockOnPrevPage}
        onNextPage={mockOnNextPage}
        isLastPage={false}
      />
    )

    const progressIndicator = screen.getByTestId('progress-indicator')
    expect(progressIndicator).toHaveAttribute('data-visited-pages', '')
  })

  // Edge Case Tests untuk ModuleNavigation

  it('handles navigation with strict page completion requirements', () => {
    const strictModule = {
      totalPages: 5,
      currentPage: 2,
      pagesCompletionStatus: {
        1: true,   // Halaman 1 selesai
        2: false,  // Halaman 2 belum selesai
        3: false,  // Halaman 3 belum terbuka
        4: false,
        5: false
      }
    }

    const mockOnNextPage = jest.fn()
    const mockOnPrevPage = jest.fn()

    render(
      <ModuleNavigation 
        totalPages={strictModule.totalPages}
        currentPage={strictModule.currentPage}
        pagesCompletionStatus={strictModule.pagesCompletionStatus}
        onNextPage={mockOnNextPage}
        onPrevPage={mockOnPrevPage}
      />
    )

    // Coba navigasi ke halaman selanjutnya
    const nextButton = screen.getByText('Selanjutnya')
    fireEvent.click(nextButton)

    // Pastikan navigasi ditolak karena halaman belum selesai
    expect(mockOnNextPage).not.toHaveBeenCalled()
    expect(screen.getByText('Selesaikan halaman saat ini')).toBeInTheDocument()
  })

  it('handles extreme page count scenarios', () => {
    const extremeModule = {
      totalPages: 50,  // Modul dengan sangat banyak halaman
      currentPage: 25, // Berada di tengah modul
      pagesCompletionStatus: {}
    }

    // Inisialisasi status penyelesaian untuk semua halaman
    extremeModule.pagesCompletionStatus = Array.from({length: 50}, (_, i) => i + 1)
      .reduce((acc, page) => ({...acc, [page]: page <= 25}), {})

    const mockOnNextPage = jest.fn()
    const mockOnPrevPage = jest.fn()

    render(
      <ModuleNavigation 
        totalPages={extremeModule.totalPages}
        currentPage={extremeModule.currentPage}
        pagesCompletionStatus={extremeModule.pagesCompletionStatus}
        onNextPage={mockOnNextPage}
        onPrevPage={mockOnPrevPage}
      />
    )

    // Periksa rendering tombol navigasi
    expect(screen.getByText('Sebelumnya')).toBeInTheDocument()
    expect(screen.getByText('Selanjutnya')).toBeInTheDocument()

    // Pastikan indikator halaman dapat di-render
    const pageIndicators = screen.getAllByTestId('page-indicator')
    expect(pageIndicators.length).toBe(50)
  })

  it('handles disabled navigation at module boundaries', () => {
    const boundaryScenarios = [
      { 
        currentPage: 1,  // Halaman pertama
        totalPages: 5,
        expectedPrevDisabled: true,
        expectedNextEnabled: true
      },
      { 
        currentPage: 5,  // Halaman terakhir
        totalPages: 5,
        expectedPrevDisabled: false,
        expectedNextEnabled: false
      }
    ]

    boundaryScenarios.forEach(scenario => {
      const mockOnNextPage = jest.fn()
      const mockOnPrevPage = jest.fn()

      render(
        <ModuleNavigation 
          totalPages={scenario.totalPages}
          currentPage={scenario.currentPage}
          pagesCompletionStatus={{}}
          onNextPage={mockOnNextPage}
          onPrevPage={mockOnPrevPage}
        />
      )

      const prevButton = screen.getByText('Sebelumnya')
      const nextButton = screen.getByText('Selanjutnya')

      if (scenario.expectedPrevDisabled) {
        expect(prevButton).toBeDisabled()
      } else {
        expect(prevButton).not.toBeDisabled()
      }

      if (scenario.expectedNextEnabled) {
        expect(nextButton).not.toBeDisabled()
      } else {
        expect(nextButton).toBeDisabled()
      }
    })
  })

  it('handles rapid navigation attempts', () => {
    const rapidNavigationModule = {
      totalPages: 10,
      currentPage: 5,
      pagesCompletionStatus: {}
    }

    const mockOnNextPage = jest.fn()
    const mockOnPrevPage = jest.fn()

    render(
      <ModuleNavigation 
        totalPages={rapidNavigationModule.totalPages}
        currentPage={rapidNavigationModule.currentPage}
        pagesCompletionStatus={rapidNavigationModule.pagesCompletionStatus}
        onNextPage={mockOnNextPage}
        onPrevPage={mockOnPrevPage}
      />
    )

    const nextButton = screen.getByText('Selanjutnya')

    // Simulasi klik berulang dengan cepat
    fireEvent.click(nextButton)
    fireEvent.click(nextButton)
    fireEvent.click(nextButton)

    // Pastikan hanya satu kali navigasi yang diproses
    expect(mockOnNextPage).toHaveBeenCalledTimes(1)
  })
})
