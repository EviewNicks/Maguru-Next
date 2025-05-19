import { render, renderHook, act } from '@testing-library/react'
import {
  ModulePagesProvider,
  useModulePagesContext,
} from './ModulePagesContext'
import { useModulePageCRUDContext } from './ModulePageCRUDContext'
import { ModulePage } from '../types/modulePageSchema'

// Mock useModulePageCRUDContext
jest.mock('./ModulePageCRUDContext', () => ({
  useModulePageCRUDContext: jest.fn(),
}))

describe('ModulePagesContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Set up localStorage mock
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    }

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    })

    // Mock CRUD context
    ;(useModulePageCRUDContext as jest.Mock).mockReturnValue({
      setActivePage: jest.fn(),
    })
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useModulePagesContext(), {
      wrapper: ({ children }) => (
        <ModulePagesProvider>{children}</ModulePagesProvider>
      ),
    })

    expect(result.current.expandedItems).toEqual({
      SPRINT: true,
      ModulePages: true,
    })
    expect(result.current.isSidebarOpen).toBe(true)
    expect(typeof result.current.handleSelectPage).toBe('function')
    expect(typeof result.current.toggleExpand).toBe('function')
    expect(typeof result.current.toggleSidebar).toBe('function')
  })

  it('should toggle expanded items', () => {
    const { result } = renderHook(() => useModulePagesContext(), {
      wrapper: ({ children }) => (
        <ModulePagesProvider>{children}</ModulePagesProvider>
      ),
    })

    act(() => {
      result.current.toggleExpand('TestItem')
    })

    expect(result.current.expandedItems.TestItem).toBe(true)

    act(() => {
      result.current.toggleExpand('TestItem')
    })

    expect(result.current.expandedItems.TestItem).toBe(false)
  })

  it('should toggle sidebar and save to localStorage', () => {
    const { result } = renderHook(() => useModulePagesContext(), {
      wrapper: ({ children }) => (
        <ModulePagesProvider>{children}</ModulePagesProvider>
      ),
    })

    expect(result.current.isSidebarOpen).toBe(true)

    act(() => {
      result.current.toggleSidebar()
    })

    expect(result.current.isSidebarOpen).toBe(false)
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'moduleSidebarOpen',
      'false'
    )
  })

  it('should handle page selection when CRUD context is available', () => {
    const mockSetActivePage = jest.fn()
    ;(useModulePageCRUDContext as jest.Mock).mockReturnValue({
      setActivePage: mockSetActivePage,
    })

    const { result } = renderHook(() => useModulePagesContext(), {
      wrapper: ({ children }) => (
        <ModulePagesProvider>{children}</ModulePagesProvider>
      ),
    })

    const mockPage: ModulePage = {
      id: 'test-id',
      title: 'Test Page',
      moduleId: 'module-1',
      order: 0,
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    act(() => {
      result.current.handleSelectPage(mockPage)
    })

    expect(mockSetActivePage).toHaveBeenCalledWith(mockPage)
  })

  it('should handle page selection when CRUD context is not available', () => {
    // Mock context as null (unavailable)
    ;(useModulePageCRUDContext as jest.Mock).mockImplementation(() => {
      throw new Error('Context not available')
    })

    // Spy on console.warn
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

    const { result } = renderHook(() => useModulePagesContext(), {
      wrapper: ({ children }) => (
        <ModulePagesProvider>{children}</ModulePagesProvider>
      ),
    })

    const mockPage: ModulePage = {
      id: 'test-id',
      title: 'Test Page',
      moduleId: 'module-1',
      order: 0,
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    act(() => {
      result.current.handleSelectPage(mockPage)
    })

    // Should warn but not crash
    expect(consoleWarnSpy).toHaveBeenCalled()

    // Clean up
    consoleWarnSpy.mockRestore()
  })

  it('should load sidebar state from localStorage on mount', () => {
    // Mock localStorage to return saved state
    ;(window.localStorage.getItem as jest.Mock).mockReturnValue('false')

    const { result } = renderHook(() => useModulePagesContext(), {
      wrapper: ({ children }) => (
        <ModulePagesProvider>{children}</ModulePagesProvider>
      ),
    })

    // Should initialize with value from localStorage
    expect(result.current.isSidebarOpen).toBe(false)
  })
})
