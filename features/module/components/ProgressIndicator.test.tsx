// features/module/components/ProgressIndicator.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import progressReducer from '@/store/features/progressSlice'
import ProgressIndicator from './ProgressIndicator'

// Mock Redux store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      progress: progressReducer
    },
    preloadedState: {
      progress: {
        currentPage: 1,
        isModuleCompleted: false,
        moduleId: 'test-module',
        userId: 'test-user',
        progressPercentage: 0,
        ...initialState
      }
    }
  })
}

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock Progress component from shadcn/ui
jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: { value: number, className?: string }) => (
    <div data-testid="progress-bar" data-value={value} className={className}>
      Progress: {value}%
    </div>
  )
}))

// Mock Tooltip component from shadcn/ui
jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-trigger">{children}</div>
  )
}))

describe('ProgressIndicator', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    jest.clearAllMocks()
  })

  it('renders the progress bar with correct percentage', () => {
    const store = createTestStore({ progressPercentage: 50 })
    
    render(
      <Provider store={store}>
        <ProgressIndicator currentPage={2} totalPages={4} />
      </Provider>
    )
    
    const progressBar = screen.getByTestId('progress-bar')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveAttribute('data-value', '50')
  })

  it('displays the correct page information', () => {
    const store = createTestStore()
    
    render(
      <Provider store={store}>
        <ProgressIndicator currentPage={2} totalPages={5} />
      </Provider>
    )
    
    expect(screen.getByText('Halaman 2 dari 5')).toBeInTheDocument()
  })

  it('calculates progress based on visited pages', () => {
    const store = createTestStore()
    const visitedPages = [1, 2]
    
    render(
      <Provider store={store}>
        <ProgressIndicator 
          currentPage={2} 
          totalPages={5} 
          hasVisitedPages={visitedPages} 
        />
      </Provider>
    )
    
    // 2 visited pages out of 5 = 40%
    const progressBar = screen.getByTestId('progress-bar')
    expect(progressBar).toHaveAttribute('data-value', '40')
  })

  it('shows tooltip with progress percentage', () => {
    const store = createTestStore({ progressPercentage: 60 })
    
    render(
      <Provider store={store}>
        <ProgressIndicator currentPage={3} totalPages={5} />
      </Provider>
    )
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    expect(screen.getByText('60% selesai')).toBeInTheDocument()
  })

  it('uses different color based on progress', () => {
    const store = createTestStore({ progressPercentage: 80 })
    
    render(
      <Provider store={store}>
        <ProgressIndicator currentPage={4} totalPages={5} />
      </Provider>
    )
    
    const progressBar = screen.getByTestId('progress-bar')
    expect(progressBar).toHaveClass('progress-high')
  })

  it('shows completed status when module is completed', () => {
    const store = createTestStore({ 
      progressPercentage: 100,
      isModuleCompleted: true
    })
    
    render(
      <Provider store={store}>
        <ProgressIndicator currentPage={5} totalPages={5} />
      </Provider>
    )
    
    expect(screen.getByText('Modul Selesai!')).toBeInTheDocument()
  })

  it('syncs with localStorage when progress changes', () => {
    const store = createTestStore({ 
      progressPercentage: 40,
      moduleId: 'test-module-123'
    })
    
    render(
      <Provider store={store}>
        <ProgressIndicator currentPage={2} totalPages={5} />
      </Provider>
    )
    
    // Check if localStorage was updated
    const storedProgress = mockLocalStorage.getItem('module_progress_test-module-123')
    expect(storedProgress).not.toBeNull()
    
    const parsedProgress = JSON.parse(storedProgress || '{}')
    expect(parsedProgress.progressPercentage).toBe(40)
  })

  // Edge Case Tests untuk ProgressIndicator

  it('handles extreme progress percentages', () => {
    const extremeScenarios = [
      { 
        progressPercentage: 0,   // Tidak ada progress
        expectedColor: 'bg-red-500',
        expectedText: '0%'
      },
      { 
        progressPercentage: 100, // Progress sempurna
        expectedColor: 'bg-green-500',
        expectedText: '100%'
      },
      { 
        progressPercentage: -10, // Persentase negatif (edge case)
        expectedColor: 'bg-red-500',
        expectedText: '0%'
      },
      { 
        progressPercentage: 110, // Persentase melebihi 100 (edge case)
        expectedColor: 'bg-green-500',
        expectedText: '100%'
      }
    ]

    extremeScenarios.forEach(scenario => {
      render(
        <ProgressIndicator 
          progressPercentage={scenario.progressPercentage} 
          totalPages={5} 
          currentPage={3} 
        />
      )

      // Periksa warna progress bar
      const progressBar = screen.getByTestId('progress-bar')
      expect(progressBar).toHaveClass(scenario.expectedColor)

      // Periksa teks persentase
      const percentageText = screen.getByTestId('percentage-text')
      expect(percentageText).toHaveTextContent(scenario.expectedText)
    })
  })

  it('handles localStorage synchronization errors', () => {
    // Mock localStorage untuk mensimulasikan error
    const errorStorageMock = {
      getItem: jest.fn(() => { throw new Error('Storage error') }),
      setItem: jest.fn(() => { throw new Error('Storage error') })
    }
    Object.defineProperty(window, 'localStorage', { value: errorStorageMock })

    // Spy console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ProgressIndicator 
        progressPercentage={50} 
        totalPages={5} 
        currentPage={3} 
      />
    )

    // Pastikan komponen tetap dapat dirender
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument()
    
    // Periksa error logging
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Gagal sinkronisasi progress')
    )

    // Kembalikan console.error
    consoleErrorSpy.mockRestore()
  })

  it('menampilkan status interaksi halaman dengan benar', () => {
    render(
      <ProgressIndicator
        currentPage={2}
        totalPages={5}
        pagesInteractionStatus={[
          { 
            pageNumber: 1, // <-- tambahkan ini
            completed: true, 
            interactive: true 
          },
          { 
            pageNumber: 2, // <-- tambahkan ini
            completed: false, 
            interactive: true 
          }
        ]}
      />
    )
    

    // Periksa rendering tooltip
    const tooltipTrigger = screen.getByTestId('progress-tooltip-trigger')
    fireEvent.mouseEnter(tooltipTrigger)

    // Pastikan tooltip menampilkan detail interaksi
    const tooltipContent = screen.getByTestId('progress-tooltip')
    expect(tooltipContent).toHaveTextContent('Halaman belum diselesaikan')
    expect(tooltipContent).toHaveTextContent('Terdapat elemen interaktif')
  })

  it('handles pulsating animation with progress changes', () => {
    const { rerender } = render(
      <ProgressIndicator 
        progressPercentage={0} 
        totalPages={5} 
        currentPage={1} 
      />
    )

    // Periksa tidak ada animasi pulsasi di awal
    const initialProgressBar = screen.getByTestId('progress-bar')
    expect(initialProgressBar).not.toHaveClass('animate-pulse')

    // Perubahan progress
    rerender(
      <ProgressIndicator 
        progressPercentage={20} 
        totalPages={5} 
        currentPage={2} 
      />
    )

    // Periksa animasi pulsasi setelah perubahan
    const updatedProgressBar = screen.getByTestId('progress-bar')
    expect(updatedProgressBar).toHaveClass('animate-pulse')
  })
})
