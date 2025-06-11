import { render, screen, fireEvent } from '@testing-library/react'
import ModulePageEditor from './ModulePageEditor'
import { useRouter } from 'next/navigation'
import { useModulePageQuery } from '../hooks/useModulePageQuery'
import { useModulePagesContext } from '../context/ModulePagesContext'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock ModulePagesContext
jest.mock('../context/ModulePagesContext', () => ({
  useModulePagesContext: jest.fn(),
}))

// Mock ModulePageCRUDContext
jest.mock('../context/ModulePageCRUDContext', () => ({
useModulePageCRUDContext: jest.fn(),
  ModulePageCRUDProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// Mock the RichTextEditor
jest.mock('./RichTextEditor', () => ({
  RichTextEditor: ({
    initialContent,
    className,
    pageId,
    autosave,
  }: {
    initialContent: string
    className: string
    pageId: string
    autosave: boolean
  }) => (
    <div data-testid="mock-rich-text-editor" className={className || ''}>
      <div>Rich Text Editor</div>
      <div data-testid="editor-content">{initialContent || ''}</div>
      <div>Page ID: {pageId}</div>
      <div>Autosave: {autosave ? 'true' : 'false'}</div>
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

// Mock useRichTextAutosave
jest.mock('../hooks/useRichTextAutosave', () => ({
  useRichTextAutosave: jest.fn(() => ({
    content: '',
    saveStatus: 'saved',
    handleContentChange: jest.fn(),
    saveContent: jest.fn(),
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
  const mockSetActivePage = jest.fn()
  const mockSavePage = jest.fn()

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

  // Mock untuk navigation functions
  const mockGetPreviousPage = jest.fn((currentPageId) => {
    const currentIndex = mockPagesArray.findIndex((p) => p.id === currentPageId)
    return currentIndex > 0 ? mockPagesArray[currentIndex - 1] : null
  })

  const mockGetNextPage = jest.fn((currentPageId) => {
    const currentIndex = mockPagesArray.findIndex((p) => p.id === currentPageId)
    return currentIndex < mockPagesArray.length - 1
      ? mockPagesArray[currentIndex + 1]
      : null
  })

  const mockGetFirstPage = jest.fn(() => mockPagesArray[0] || null)

  const mockGetLastPage = jest.fn(
    () => mockPagesArray[mockPagesArray.length - 1] || null
  )

  // Struktur mock yang dikembalikan oleh useModulePageQuery
  const mockUseModulePageQueryReturnValue = {
    getAllPages: {
      data: {
        data: mockPagesArray,
      },
      isLoading: false,
      error: null,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useModulePageQuery as jest.Mock).mockReturnValue(
      mockUseModulePageQueryReturnValue
    )
    ;(useModulePagesContext as jest.Mock).mockReturnValue({
      expandedItems: {},
      toggleExpand: jest.fn(),
      isSidebarOpen: true,
      toggleSidebar: jest.fn(),
      handleSelectPage: jest.fn(),
    })
    ;(useModulePageCRUDContext as jest.Mock).mockReturnValue({
      moduleId: 'module1',
      pages: mockPagesArray,
      activePage: mockPagesArray[0],
      setActivePage: mockSetActivePage,
      savePage: mockSavePage,
      isLoading: false,
      error: null,
      createPage: jest.fn(),
      updatePage: jest.fn(),
      deletePage: jest.fn(),
      reorderPages: jest.fn(),
      getPageById: jest.fn(),
      getNextPage: mockGetNextPage,
      getPreviousPage: mockGetPreviousPage,
      getFirstPage: mockGetFirstPage,
      getLastPage: mockGetLastPage,
    })

    // Mock untuk useQuery dari @tanstack/react-query
    jest.requireMock('@tanstack/react-query').useQuery.mockReturnValue({
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

    // Juga set loading state di CRUD context
    ;(useModulePageCRUDContext as jest.Mock).mockReturnValue({
      moduleId: 'module1',
      pages: [],
      activePage: null,
      setActivePage: mockSetActivePage,
      savePage: mockSavePage,
      isLoading: true,
      error: null,
      createPage: jest.fn(),
      updatePage: jest.fn(),
      deletePage: jest.fn(),
      reorderPages: jest.fn(),
      getPageById: jest.fn(),
      getNextPage: mockGetNextPage,
      getPreviousPage: mockGetPreviousPage,
      getFirstPage: mockGetFirstPage,
      getLastPage: mockGetLastPage,
    })

    render(<ModulePageEditor moduleId="module1" />)

    // Verify loading state dengan teks yang benar
    expect(screen.getByText('Memuat halaman...')).toBeInTheDocument()
  })

  it('should setup RichTextEditor with correct props', () => {
    // Mock data
    const mockBlocks = [{ type: 'paragraph', data: { text: 'Test content' } }]
    const mockPage = {
      ...mockPagesArray[0],
      blocks: mockBlocks,
    }

    // Override mock untuk test ini
    jest.requireMock('@tanstack/react-query').useQuery.mockReturnValue({
      data: { data: mockPage },
      isLoading: false,
      error: null,
    })
    ;(useModulePageCRUDContext as jest.Mock).mockReturnValue({
      moduleId: 'module1',
      pages: mockPagesArray,
      activePage: mockPage,
      setActivePage: mockSetActivePage,
      savePage: mockSavePage,
      isLoading: false,
      error: null,
      createPage: jest.fn(),
      updatePage: jest.fn(),
      deletePage: jest.fn(),
      reorderPages: jest.fn(),
      getPageById: jest.fn(),
      getNextPage: mockGetNextPage,
      getPreviousPage: mockGetPreviousPage,
      getFirstPage: mockGetFirstPage,
      getLastPage: mockGetLastPage,
    })

    render(<ModulePageEditor moduleId="module1" initialPageId="page1" />)

    // Verify RichTextEditor is rendered with correct props
    expect(screen.getByTestId('mock-rich-text-editor')).toBeInTheDocument()
    expect(screen.getByText('Page ID: page1')).toBeInTheDocument()
    expect(screen.getByText('Autosave: true')).toBeInTheDocument()

    // Verify initialContent is correctly passed
    const expectedContent = JSON.stringify(mockBlocks)
    expect(screen.getByTestId('editor-content')).toHaveTextContent(
      expectedContent
    )
  })

  it('should navigate to previous page when footer nav clicks previous', async () => {
    // Setup initial page as the second page
    render(<ModulePageEditor moduleId="module1" initialPageId="page2" />)

    // Click previous button
    fireEvent.click(screen.getByTestId('prev-button'))

    // Verify getPreviousPage was called with the correct page ID
    expect(mockGetPreviousPage).toHaveBeenCalledWith('page2')
  })

  it('should navigate to next page when footer nav clicks next', async () => {
    // Setup initial page as the first page
    render(<ModulePageEditor moduleId="module1" initialPageId="page1" />)

    // Click next button
    fireEvent.click(screen.getByTestId('next-button'))

    // Verify getNextPage was called with the correct page ID
    expect(mockGetNextPage).toHaveBeenCalledWith('page1')
  })
})
