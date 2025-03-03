// features/module/components/SummaryCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SummaryCard from './SummaryCard'
import { ModuleData } from '@/features/module/types'
import { toast } from '@/hooks/use-toast'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('SummaryCard Component', () => {
  const mockModuleData: ModuleData = {
    id: 'module-1',
    title: 'Test Module',
    description: 'This is a test module. It contains important information. Learn about testing',
    pages: [
      {
        id: 'page-1',
        title: 'Introduction',
        content: 'Introduction content',
        pageNumber: 1,
        isLastPage: false,
      },
      {
        id: 'page-2',
        title: 'Main Content',
        content: 'Main content',
        pageNumber: 2,
        isLastPage: false,
        interactiveElements: [
          {
            id: 'interactive-1',
            type: 'button',
            content: 'Click me',
            required: true,
          },
        ],
      },
      {
        id: 'page-3',
        title: 'Summary',
        content: 'Summary content',
        pageNumber: 3,
        isLastPage: true,
      },
    ],
    totalPages: 3,
    progressPercentage: 100,
    isCompleted: true,
  }

  const mockProps = {
    moduleData: mockModuleData,
    visitedPages: [1, 2, 3],
    currentPage: 3,
    totalPages: 3,
    onNavigateToPage: jest.fn(),
    progressPercentage: 100,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  it('renders correctly with all pages visited', () => {
    render(<SummaryCard {...mockProps} />)
    
    // Check if title is rendered
    expect(screen.getByText('Ringkasan Modul')).toBeInTheDocument()
    
    // Check if status shows ready for quiz
    expect(screen.getByText('Siap untuk Quiz')).toBeInTheDocument()
    
    // Check if main points are rendered
    expect(screen.getByText('This is a test module')).toBeInTheDocument()
    expect(screen.getByText('It contains important information')).toBeInTheDocument()
    expect(screen.getByText('Learn about testing')).toBeInTheDocument()
    
    // Check if buttons are rendered
    expect(screen.getByText('Ulang Materi')).toBeInTheDocument()
    expect(screen.getByText('Lanjut ke Quiz')).toBeInTheDocument()
    expect(screen.getByText('Lanjut ke Quiz')).not.toBeDisabled()
  })

  it('shows recommendations when not all pages are visited', () => {
    const partiallyVisitedProps = {
      ...mockProps,
      visitedPages: [1, 2],
      progressPercentage: 66,
    }
    
    render(<SummaryCard {...partiallyVisitedProps} />)
    
    // Check if recommendations section is rendered
    expect(screen.getByText('Rekomendasi Halaman untuk Diulang')).toBeInTheDocument()
    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('Halaman belum dikunjungi')).toBeInTheDocument()
    
    // Check if quiz button is disabled
    expect(screen.getByText('66% Selesai')).toBeInTheDocument()
  })

  it('navigates to recommended page when "Buka" button is clicked', () => {
    const partiallyVisitedProps = {
      ...mockProps,
      visitedPages: [1, 2],
      progressPercentage: 66,
    }
    
    render(<SummaryCard {...partiallyVisitedProps} />)
    
    // Click on "Buka" button
    fireEvent.click(screen.getByText('Buka'))
    
    // Check if onNavigateToPage was called with the correct page number
    expect(mockProps.onNavigateToPage).toHaveBeenCalledWith(3)
  })

  it('shows toast and does not navigate to quiz when not ready', () => {
    const notReadyProps = {
      ...mockProps,
      visitedPages: [1],
      progressPercentage: 33,
    }
    
    render(<SummaryCard {...notReadyProps} />)
    
    // Click on "Lanjut ke Quiz" button
    fireEvent.click(screen.getByText('Lanjut ke Quiz'))
    
    // Check if toast was called with the correct message
    expect(toast).toHaveBeenCalledWith({
      title: "Belum siap untuk quiz",
      description: "Selesaikan semua halaman modul terlebih dahulu",
      variant: "destructive"
    })
  })

  it('navigates to first page when "Ulang Materi" button is clicked', () => {
    render(<SummaryCard {...mockProps} />)
    
    // Click on "Ulang Materi" button
    fireEvent.click(screen.getByText('Ulang Materi'))
    
    // Check if toast was called
    expect(toast).toHaveBeenCalledWith({
      title: "Mengulang materi",
      description: "Kembali ke halaman pertama",
    })
    
    // Check if onNavigateToPage was called with page 1
    expect(mockProps.onNavigateToPage).toHaveBeenCalledWith(1)
  })

  it('saves module completion data to localStorage when navigating to quiz', async () => {
    // Mock Date.now untuk timestamp konsisten
    const mockDate = new Date('2025-03-03T12:00:00Z')
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date)
    
    render(<SummaryCard {...mockProps} />)
    
    // Klik tombol "Lanjut ke Quiz"
    fireEvent.click(screen.getByText('Lanjut ke Quiz'))
    
    // Tunggu status loading
    await waitFor(() => {
      expect(screen.getByText('Memuat...')).toBeInTheDocument()
    })

    // Periksa data yang disimpan di localStorage
    const savedProgress = JSON.parse(localStorage.getItem(`module_completion_${mockProps.moduleData.id}`) || '{}')
    
    expect(savedProgress).toEqual(
      expect.objectContaining({
        moduleId: mockProps.moduleData.id,
        completionStatus: mockProps.progressPercentage,
        visitedPages: expect.any(Array),
        lastVisitedPage: mockProps.currentPage,
        timestamp: mockDate.toISOString()
      })
    )
  })
})
