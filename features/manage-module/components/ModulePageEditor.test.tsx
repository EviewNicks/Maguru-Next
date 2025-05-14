import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ModulePageEditor from './ModulePageEditor'
import { useRouter } from 'next/navigation'
import { useModulePageQuery } from '../hooks/useModulePageQuery'
import { modulePageService } from '../services/modulePageService'
import { ModulePage } from '../types'
import { useModulePagesContext } from '../context/ModulePagesContext'

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock ModulePagesContext
jest.mock('../context/ModulePagesContext', () => ({
  useModulePagesContext: jest.fn(),
}))

// Mock the RichTextEditor
jest.mock('./RichTextEditor', () => ({
  RichTextEditor: ({
    initialContent,
    onChange,
    className,
  }: {
    initialContent?: string
    onChange?: (newContent: string) => void
    className?: string
  }) => (
    <div data-testid="mock-rich-text-editor" className={className || ''}>
      <div>Rich Text Editor</div>
      <div data-testid="editor-content">{initialContent || ''}</div>
      <button
        data-testid="change-content-button"
        onClick={() => onChange && onChange('<p>Changed content</p>')}
      >
        Change Content
      </button>
    </div>
  ),
}))

// Mock the footer navigation
jest.mock('./ModulePageFooterNav', () => ({
  __esModule: true,
  default: ({
    currentPage,
    totalPages,
    onPrevious,
    onNext,
  }: {
    currentPage: number
    totalPages: number
    onPrevious: () => void
    onNext: () => void
  }) => (
    <div data-testid="mock-footer-nav">
      <div>
        Halaman {currentPage} dari {totalPages}
      </div>
      <button
        data-testid="prev-button"
        onClick={onPrevious}
        disabled={currentPage <= 1}
      >
        Halaman Sebelumnya
      </button>
      <button
        data-testid="next-button"
        onClick={onNext}
        disabled={currentPage >= totalPages}
      >
        Halaman Berikutnya
      </button>
    </div>
  ),
}))

// Mock the API hook
jest.mock('../hooks/useModulePageQuery', () => ({
  useModulePageQuery: jest.fn(),
}))

// Mock useModulePageEditor
jest.mock('../hooks/useModulePageEditor', () => ({
  useModulePageEditor: jest.fn(() => ({
    title: 'Mock Title',
    saveStatus: 'saved',
    handleContentChange: jest.fn(),
    handleTitleChange: jest.fn(),
  })),
}))

// Mock useQuery
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: { data: null },
    isLoading: false,
    error: null,
  })),
}))

describe('ModulePageEditor', () => {
  // Mock data and implementations
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }

  // Mock context functions
  const mockSetPages = jest.fn()
  const mockSetActivePage = jest.fn()

  // Definisikan mock data untuk halaman
  const mockPagesArray = [
    {
      id: 'page1',
      title: 'Mock Page 1',
      moduleId: 'module1',
      content: '<p>Content for page 1</p>',
      order: 0,
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
      blocks: [{ type: 'paragraph', data: { text: 'Content for page 1' } }],
    },
    {
      id: 'page2',
      title: 'Mock Page 2',
      moduleId: 'module1',
      content: '<p>Content for page 2</p>',
      order: 1,
      status: 'PUBLISHED',
      createdAt: new Date(),
      updatedAt: new Date(),
      blocks: [{ type: 'paragraph', data: { text: 'Content for page 2' } }],
    },
  ]

  // Mock untuk getAdjacentPages
  const mockGetAdjacentPages = jest.fn((currentPageId) => {
    const currentIndex = mockPagesArray.findIndex((p) => p.id === currentPageId)
    return {
      previousPage: currentIndex > 0 ? mockPagesArray[currentIndex - 1] : null,
      nextPage:
        currentIndex < mockPagesArray.length - 1
          ? mockPagesArray[currentIndex + 1]
          : null,
    }
  })

  // Struktur mock yang dikembalikan oleh useModulePageQuery
  const mockUseModulePageQueryReturnValue = {
    getAllPages: {
      data: {
        data: mockPagesArray,
      },
      isLoading: false,
      error: null,
    },
    getAdjacentPages: mockGetAdjacentPages,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useModulePageQuery as jest.Mock).mockReturnValue(
      mockUseModulePageQueryReturnValue
    )
    ;(useModulePagesContext as jest.Mock).mockReturnValue({
      setPages: mockSetPages,
      setActivePage: mockSetActivePage,
      pages: [],
      activePage: null,
      expandedItems: {},
      toggleExpand: jest.fn(),
    })

    // Mock untuk useQuery dari @tanstack/react-query
    require('@tanstack/react-query').useQuery.mockReturnValue({
      data: { data: mockPagesArray[0] },
      isLoading: false,
      error: null,
    })
  })

  it('should render with data from query', async () => {
    render(<ModulePageEditor moduleId="module1" />)

    // Verify main components are rendered
    expect(screen.getByTestId('mock-rich-text-editor')).toBeInTheDocument()
    expect(screen.getByTestId('mock-footer-nav')).toBeInTheDocument()
  })

  it('should show loading state when data is loading', () => {
    // Override mock untuk tes spesifik ini
    ;(useModulePageQuery as jest.Mock).mockReturnValue({
      ...mockUseModulePageQueryReturnValue,
      getAllPages: {
        ...mockUseModulePageQueryReturnValue.getAllPages,
        isLoading: true,
      },
    })

    render(<ModulePageEditor moduleId="module1" />)

    // Verify loading state dengan teks yang benar
    expect(screen.getByText('Memuat halaman...')).toBeInTheDocument()
  })

  it('should update content when editor content changes', async () => {
    const mockHandleContentChange = jest.fn()

    // Override useModulePageEditor mock untuk test ini
    require('../hooks/useModulePageEditor').useModulePageEditor.mockReturnValue(
      {
        title: 'Mock Title',
        saveStatus: 'saved',
        handleContentChange: mockHandleContentChange,
        handleTitleChange: jest.fn(),
      }
    )

    render(<ModulePageEditor moduleId="module1" />)

    // Simulate content change
    fireEvent.click(screen.getByTestId('change-content-button'))

    // Verify handleContentChange was called with correct content
    expect(mockHandleContentChange).toHaveBeenCalledWith(
      '<p>Changed content</p>'
    )
  })

  it('should navigate to previous page when footer nav clicks previous', async () => {
    // Setup initial page as the second page
    render(<ModulePageEditor moduleId="module1" initialPageId="page2" />)

    // Click previous button
    fireEvent.click(screen.getByTestId('prev-button'))

    // Verify getAdjacentPages was called with the correct page ID
    expect(mockGetAdjacentPages).toHaveBeenCalledWith('page2')
  })

  it('should navigate to next page when footer nav clicks next', async () => {
    // Setup initial page as the first page
    render(<ModulePageEditor moduleId="module1" initialPageId="page1" />)

    // Click next button
    fireEvent.click(screen.getByTestId('next-button'))

    // Verify getAdjacentPages was called with the correct page ID
    expect(mockGetAdjacentPages).toHaveBeenCalledWith('page1')
  })
})
