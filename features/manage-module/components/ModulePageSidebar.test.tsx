import { render, screen, fireEvent } from '@testing-library/react'
import ModulePageSidebar from './ModulePageSidebar'
import { ModulePage } from '../types/modulePageSchema'

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
    expandedItems,
    toggleExpand,
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
  const mockOnSelectPage = jest.fn()
  const mockExpandedItems = { SPRINT: true, ModulePages: true }
  const mockToggleExpand = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  it('should render with isOpen=false by default', () => {
    render(
      <ModulePageSidebar
        pages={mockPages}
        activePage={mockActivePage}
        onSelectPage={mockOnSelectPage}
        expandedItems={mockExpandedItems}
        toggleExpand={mockToggleExpand}
      />
    )

    // Verify sidebar is rendered
    expect(screen.getByTestId('mock-chevron-left')).toBeInTheDocument()

    // Verify sidebar content is not visible when closed
    expect(screen.queryByTestId('mock-sidebar-header')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-sidebar-content')).not.toBeInTheDocument()
  })

  it('should toggle open/close when button is clicked', () => {
    render(
      <ModulePageSidebar
        pages={mockPages}
        activePage={mockActivePage}
        onSelectPage={mockOnSelectPage}
      />
    )

    // Initially closed
    expect(screen.getByTestId('mock-chevron-left')).toBeInTheDocument()
    expect(screen.queryByTestId('mock-sidebar-header')).not.toBeInTheDocument()

    // Click toggle button (using aria-label to find it uniquely)
    const toggleButton = screen.getByLabelText('Buka sidebar')
    fireEvent.click(toggleButton)

    // Now sidebar should be open
    expect(screen.getByTestId('mock-chevron-right')).toBeInTheDocument()
    expect(screen.getByTestId('mock-sidebar-header')).toBeInTheDocument()
    expect(screen.getByTestId('mock-sidebar-content')).toBeInTheDocument()
    expect(screen.getByTestId('mock-sidebar-shortcuts')).toBeInTheDocument()
    expect(screen.getByTestId('mock-sidebar-blogs')).toBeInTheDocument()

    // Click toggle button again (now it has different aria-label)
    const closeButton = screen.getByLabelText('Tutup sidebar')
    fireEvent.click(closeButton)

    // Sidebar should be closed again
    expect(screen.getByTestId('mock-chevron-left')).toBeInTheDocument()
    expect(screen.queryByTestId('mock-sidebar-header')).not.toBeInTheDocument()
  })

  it('should save preference to localStorage', () => {
    render(
      <ModulePageSidebar
        pages={mockPages}
        activePage={mockActivePage}
        onSelectPage={mockOnSelectPage}
      />
    )

    // Click toggle button
    const toggleButton = screen.getByLabelText('Buka sidebar')
    fireEvent.click(toggleButton)

    // Should save to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'moduleSidebarOpen',
      'true'
    )

    // Click toggle button again
    const closeButton = screen.getByLabelText('Tutup sidebar')
    fireEvent.click(closeButton)

    // Should update localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'moduleSidebarOpen',
      'false'
    )
  })

  it('should load preference from localStorage', () => {
    // Set localStorage value before rendering
    localStorageMock.getItem.mockReturnValue('true')

    render(
      <ModulePageSidebar
        pages={mockPages}
        activePage={mockActivePage}
        onSelectPage={mockOnSelectPage}
      />
    )

    // Should be open based on localStorage value
    expect(screen.getByTestId('mock-chevron-right')).toBeInTheDocument()
    expect(screen.getByTestId('mock-sidebar-header')).toBeInTheDocument()
    expect(screen.getByTestId('mock-sidebar-content')).toBeInTheDocument()
  })

  it('should pass props to SidebarContent', () => {
    // Mock localStorage to open sidebar
    localStorageMock.getItem.mockReturnValue('true')

    render(
      <ModulePageSidebar
        pages={mockPages}
        activePage={mockActivePage}
        onSelectPage={mockOnSelectPage}
        expandedItems={mockExpandedItems}
        toggleExpand={mockToggleExpand}
      />
    )

    // Verify props passed to SidebarContent
    expect(screen.getByTestId('pages-count').textContent).toBe('2')
    expect(screen.getByTestId('active-page-id').textContent).toBe('page1')

    // Test onSelectPage callback
    fireEvent.click(screen.getByTestId('select-page-button'))
    expect(mockOnSelectPage).toHaveBeenCalledWith(mockPages[0])
  })
})
