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

  // Edge Case Tests untuk SummaryCard

  it('handles module with empty description', () => {
    const emptyDescriptionModule: ModuleData = {
      ...mockModuleData,
      description: '',
    }

    const emptyDescProps = {
      ...mockProps,
      moduleData: emptyDescriptionModule,
    }

    render(<SummaryCard {...emptyDescProps} />)
    
    // Pastikan komponen masih dapat dirender tanpa error
    expect(screen.getByText('Ringkasan Modul')).toBeInTheDocument()
    expect(screen.getByText('Siap untuk Quiz')).toBeInTheDocument()
  })

  it('handles module with many pages', () => {
    const manyPagesModule: ModuleData = {
      ...mockModuleData,
      pages: Array.from({ length: 20 }, (_, index) => ({
        id: `page-${index + 1}`,
        title: `Page ${index + 1}`,
        content: `Content for page ${index + 1}`,
        pageNumber: index + 1,
        isLastPage: index === 19
      })),
      totalPages: 20,
    }

    const manyPagesProps = {
      ...mockProps,
      moduleData: manyPagesModule,
      visitedPages: Array.from({ length: 20 }, (_, i) => i + 1),
      totalPages: 20,
    }

    render(<SummaryCard {...manyPagesProps} />)
    
    // Pastikan semua halaman dapat ditampilkan
    expect(screen.getByText('Siap untuk Quiz')).toBeInTheDocument()
    expect(screen.getByText('Lanjut ke Quiz')).not.toBeDisabled()
  })

  it('handles module with interactive pages not completed', () => {
    const incompleteInteractiveModule: ModuleData = {
      ...mockModuleData,
      pages: [
        {
          id: 'page-1',
          title: 'Interactive Page',
          content: 'Page with required interactions',
          pageNumber: 1,
          isLastPage: false,
          interactiveElements: [
            {
              id: 'interactive-1',
              type: 'button',
              content: 'Required Button',
              required: true
            }
          ]
        },
        ...mockModuleData.pages.slice(1)
      ]
    }

    const incompleteProps = {
      ...mockProps,
      moduleData: incompleteInteractiveModule,
      visitedPages: [1, 2],
      progressPercentage: 66,
    }

    render(<SummaryCard {...incompleteProps} />)
    
    // Pastikan tombol quiz dinonaktifkan
    expect(screen.getByText('66% Selesai')).toBeInTheDocument()
    expect(screen.getByText('Lanjut ke Quiz')).toBeDisabled()
  })

  it('handles localStorage storage limit error', () => {
    // Mock localStorage untuk mensimulasikan storage penuh
    const fullStorageMock = {
      ...localStorageMock,
      setItem: jest.fn(() => {
        throw new Error('Storage quota exceeded')
      })
    }
    Object.defineProperty(window, 'localStorage', { value: fullStorageMock })

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(<SummaryCard {...mockProps} />)
    
    // Klik tombol "Lanjut ke Quiz"
    fireEvent.click(screen.getByText('Lanjut ke Quiz'))

    // Pastikan error ditangani dengan baik
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Gagal menyimpan data penyelesaian modul')
    )
    expect(toast).toHaveBeenCalledWith({
      title: 'Kesalahan Penyimpanan',
      description: 'Tidak dapat menyimpan progres modul. Coba lagi nanti.',
      variant: 'destructive'
    })

    // Restore console.error
    consoleErrorSpy.mockRestore()
  })

  it('handles module with minimal pages', () => {
    const minimalPagesModule: ModuleData = {
      ...mockModuleData,
      pages: [
        {
          id: 'page-1',
          title: 'Single Page',
          content: 'Only one page in this module',
          pageNumber: 1,
          isLastPage: true
        }
      ],
      totalPages: 1,
    }

    const minimalPagesProps = {
      ...mockProps,
      moduleData: minimalPagesModule,
      visitedPages: [1],
      totalPages: 1,
      currentPage: 1,
    }

    render(<SummaryCard {...minimalPagesProps} />)
    
    // Pastikan komponen dapat merender dengan satu halaman
    expect(screen.getByText('Ringkasan Modul')).toBeInTheDocument()
    expect(screen.getByText('Siap untuk Quiz')).toBeInTheDocument()
  })
})
