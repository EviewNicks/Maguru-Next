import { render, screen, fireEvent } from '@testing-library/react'
import ModulePageSidebar from './ModulePageSidebar'
import { ModulePage } from '../types/modulePageSchema'
import { useModulePagesContext } from '../context/ModulePagesContext'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'
import React from 'react'

// Mock context
jest.mock('../context/ModulePagesContext', () => ({
  useModulePagesContext: jest.fn(),
}))

// Mock CRUD context
jest.mock('../context/ModulePageCRUDContext', () => {
  const actual = jest.requireActual('../context/ModulePageCRUDContext')
  return {
    ...actual,
    useModulePageCRUDContext: jest.fn(),
  }
})

// Mock sub-komponen
jest.mock('./ModulePageEditor/sidebar/SidebarHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-sidebar-header">Sidebar Header</div>,
}))

jest.mock('./ModulePageEditor/sidebar/SidebarShortcuts', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mock-sidebar-shortcuts">Sidebar Shortcuts</div>
  ),
}))

jest.mock('./ModulePageEditor/sidebar/SidebarContent', () => ({
  __esModule: true,
  default: ({
    pages,
    activePage,
    onSelectPage,
  }: {
    pages?: ModulePage[]
    activePage?: ModulePage | null
    onSelectPage?: (page: ModulePage) => void
    expandedItems?: Record<string, boolean>
    toggleExpand?: (item: string) => void
  }) => (
    <div data-testid="mock-sidebar-content">
      Sidebar Content
      <span data-testid="pages-count">{pages?.length || 0}</span>
      <span data-testid="active-page-id">{activePage?.id || 'none'}</span>
      <button
        data-testid="select-page-button"
        onClick={() =>
          onSelectPage && pages && pages.length > 0 && onSelectPage(pages[0])
        }
      >
        Select Page
      </button>
    </div>
  ),
}))

jest.mock('./ModulePageEditor/sidebar/SidebarBlogs', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-sidebar-blogs">Sidebar Blogs</div>,
}))

// Mock icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="mock-chevron-left">ChevronLeft</span>,
  ChevronRight: () => (
    <span data-testid="mock-chevron-right">ChevronRight</span>
  ),
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

describe('ModulePageSidebar', () => {
  const mockPages: ModulePage[] = [
    {
      id: 'page1',
      title: 'Page 1',
      moduleId: 'module1',
      order: 0,
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'page2',
      title: 'Page 2',
      moduleId: 'module1',
      order: 1,
      status: 'PUBLISHED',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const mockActivePage = mockPages[0]
  const mockHandleSelectPage = jest.fn()
  const mockExpandedItems = { SPRINT: true, ModulePages: true }
  const mockToggleExpand = jest.fn()
  const mockToggleSidebar = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock
      .clear()(
        // Default mocks for both contexts
        useModulePagesContext as jest.Mock
      )
      .mockReturnValue({
        isSidebarOpen: false,
        toggleSidebar: mockToggleSidebar,
        expandedItems: mockExpandedItems,
        toggleExpand: mockToggleExpand,
        handleSelectPage: mockHandleSelectPage,
      })(useModulePageCRUDContext as jest.Mock)
      .mockReturnValue({
        moduleId: 'module1',
        pages: mockPages,
        activePage: mockActivePage,
        setActivePage: jest.fn(),
        isLoading: false,
        error: null,
        createPage: jest.fn(),
        updatePage: jest.fn(),
        deletePage: jest.fn(),
        reorderPages: jest.fn(),
        savePage: jest.fn(),
        getPageById: jest.fn(),
        getNextPage: jest.fn(),
        getPreviousPage: jest.fn(),
        getFirstPage: jest.fn(),
        getLastPage: jest.fn(),
      })
  })

  const renderWithWrapper = (ui: React.ReactElement) => {
    return render(ui, { wrapper: TestWrapper })
  }

  it('should render with isOpen=false by default', () => {
    // Mock context untuk sidebar tertutup
    ;(useModulePagesContext as jest.Mock).mockReturnValue({
      isSidebarOpen: false,
      toggleSidebar: mockToggleSidebar,
      expandedItems: mockExpandedItems,
      toggleExpand: mockToggleExpand,
      handleSelectPage: mockHandleSelectPage,
    })

    renderWithWrapper(<ModulePageSidebar />)

    // Verify sidebar is rendered
    expect(screen.getByTestId('mock-chevron-left')).toBeInTheDocument()

    // Verify sidebar content is not visible when closed
    expect(screen.queryByTestId('mock-sidebar-header')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-sidebar-content')).not.toBeInTheDocument()
  })

  it('should toggle open/close when button is clicked', () => {
    // Mock context untuk sidebar tertutup awalnya
    const mockToggleSidebarFn = jest.fn()

    ;(useModulePagesContext as jest.Mock).mockReturnValue({
      isSidebarOpen: false,
      toggleSidebar: mockToggleSidebarFn,
      expandedItems: mockExpandedItems,
      toggleExpand: mockToggleExpand,
      handleSelectPage: mockHandleSelectPage,
    })

    renderWithWrapper(<ModulePageSidebar />)

    // Initially closed
    expect(screen.getByTestId('mock-chevron-left')).toBeInTheDocument()
    expect(screen.queryByTestId('mock-sidebar-header')).not.toBeInTheDocument()

    // Click toggle button
    const toggleButton = screen.getByLabelText('Buka sidebar')
    fireEvent.click(toggleButton)

    // Verify toggleSidebar was called
    expect(mockToggleSidebarFn).toHaveBeenCalled()

    // Mock context untuk sidebar terbuka setelah klik
    ;(useModulePagesContext as jest.Mock).mockReturnValue({
      isSidebarOpen: true,
      toggleSidebar: mockToggleSidebarFn,
      expandedItems: mockExpandedItems,
      toggleExpand: mockToggleExpand,
      handleSelectPage: mockHandleSelectPage,
    })

    // Re-render with updated context
    renderWithWrapper(<ModulePageSidebar />)

    // Now sidebar should be open
    expect(screen.getByTestId('mock-chevron-right')).toBeInTheDocument()
    expect(screen.getByTestId('mock-sidebar-header')).toBeInTheDocument()
    expect(screen.getByTestId('mock-sidebar-content')).toBeInTheDocument()
  })

  it('should save preference to localStorage', () => {
    // Mock context untuk sidebar tertutup awalnya
    const mockToggleSidebarFn = jest.fn()

    ;(useModulePagesContext as jest.Mock).mockReturnValue({
      isSidebarOpen: false,
      toggleSidebar: mockToggleSidebarFn,
      expandedItems: mockExpandedItems,
      toggleExpand: mockToggleExpand,
      handleSelectPage: mockHandleSelectPage,
    })

    renderWithWrapper(<ModulePageSidebar />)

    // Click toggle button
    const toggleButton = screen.getByLabelText('Buka sidebar')
    fireEvent.click(toggleButton)

    // Verify toggleSidebar was called
    expect(mockToggleSidebarFn).toHaveBeenCalled()
  })

  it('should load preference from localStorage', () => {
    // Mock context untuk sidebar terbuka
    ;(useModulePagesContext as jest.Mock).mockReturnValue({
      isSidebarOpen: true,
      toggleSidebar: mockToggleSidebar,
      expandedItems: mockExpandedItems,
      toggleExpand: mockToggleExpand,
      handleSelectPage: mockHandleSelectPage,
    })

    renderWithWrapper(<ModulePageSidebar />)

    // Should be open based on context value
    expect(screen.getByTestId('mock-chevron-right')).toBeInTheDocument()
    expect(screen.getByTestId('mock-sidebar-header')).toBeInTheDocument()
    expect(screen.getByTestId('mock-sidebar-content')).toBeInTheDocument()
  })

  it('should pass props to SidebarContent', () => {
    // Mock context untuk sidebar terbuka
    ;(useModulePagesContext as jest.Mock).mockReturnValue({
      isSidebarOpen: true,
      toggleSidebar: mockToggleSidebar,
      expandedItems: mockExpandedItems,
      toggleExpand: mockToggleExpand,
      handleSelectPage: mockHandleSelectPage,
    })

    renderWithWrapper(<ModulePageSidebar />)

    // Verify sidebar content is rendered with correct props
    expect(screen.getByTestId('mock-sidebar-content')).toBeInTheDocument()
    expect(screen.getByTestId('pages-count')).toHaveTextContent('2')
    expect(screen.getByTestId('active-page-id')).toHaveTextContent('page1')
  })
})
