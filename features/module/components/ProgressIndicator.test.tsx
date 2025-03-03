// features/module/components/ProgressIndicator.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
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
})
