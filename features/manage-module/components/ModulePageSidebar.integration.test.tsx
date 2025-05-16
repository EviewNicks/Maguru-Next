import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModulePageSidebar from './ModulePageSidebar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ModulePageCRUDProvider } from '../context/ModulePageCRUDContext'
import { ModulePagesProvider } from '../context/ModulePagesContext'
import { modulePageService } from '../services/modulePageService'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

// Mock services
jest.mock('../services/modulePageService', () => ({
  modulePageService: {
    getModulePages: jest.fn(),
    createModulePage: jest.fn(),
    deleteModulePage: jest.fn(),
    updateModulePage: jest.fn(),
    reorderModulePages: jest.fn(),
  },
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Test wrapper
const createWrapper = (moduleId = 'test-module') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ModulePagesProvider>
        <ModulePageCRUDProvider moduleId={moduleId}>
          {children}
        </ModulePageCRUDProvider>
      </ModulePagesProvider>
    </QueryClientProvider>
  )
}

describe('ModulePageSidebar Integration', () => {
  const mockPages = [
    {
      id: 'page-1',
      title: 'First Page',
      moduleId: 'test-module',
      order: 0,
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'page-2',
      title: 'Second Page',
      moduleId: 'test-module',
      order: 1,
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const mockActivePage = mockPages[0]

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mockImplementations
    ;(modulePageService.getModulePages as jest.Mock).mockResolvedValue({
      success: true,
      data: mockPages,
      meta: { totalItems: 2 },
    })
    ;(modulePageService.createModulePage as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 'new-page',
        title: 'New Page',
        moduleId: 'test-module',
        order: 2,
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    ;(modulePageService.deleteModulePage as jest.Mock).mockResolvedValue(true)
  })

  test('renders sidebar with pages from API', async () => {
    render(
      <ModulePageSidebar
        pages={mockPages}
        activePage={mockActivePage}
        onSelectPage={jest.fn()}
        expandedItems={{ ModulePages: true }}
        toggleExpand={jest.fn()}
      />,
      { wrapper: createWrapper() }
    )

    // Verify pages are rendered
    await waitFor(() => {
      expect(screen.getByText('First Page')).toBeInTheDocument()
      expect(screen.getByText('Second Page')).toBeInTheDocument()
    })
  })

  test('add new page button should create a new page via API', async () => {
    // Setup user event
    const user = userEvent.setup()

    const onSelectPage = jest.fn()

    render(
      <ModulePageSidebar
        pages={mockPages}
        activePage={mockActivePage}
        onSelectPage={onSelectPage}
        expandedItems={{ ModulePages: true }}
        toggleExpand={jest.fn()}
      />,
      { wrapper: createWrapper() }
    )

    // Find and click the add page button
    const addButton = screen.getByRole('button', { name: /add page/i })
    await user.click(addButton)

    // Wait for create dialog to appear and submit form
    const titleInput = await screen.findByLabelText(/judul halaman/i)
    await user.type(titleInput, 'New Page')

    const submitButton = screen.getByRole('button', { name: /buat halaman/i })
    await user.click(submitButton)

    // Verify service was called
    await waitFor(() => {
      expect(modulePageService.createModulePage).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Page',
          moduleId: 'test-module',
        })
      )
    })

    // Verify toast was shown
    expect(toast.success).toHaveBeenCalledWith('Halaman berhasil dibuat')
  })

  test('delete page button should delete a page via API', async () => {
    // Setup user event
    const user = userEvent.setup()

    const onSelectPage = jest.fn()

    render(
      <ModulePageSidebar
        pages={mockPages}
        activePage={mockActivePage}
        onSelectPage={onSelectPage}
        expandedItems={{ ModulePages: true }}
        toggleExpand={jest.fn()}
      />,
      { wrapper: createWrapper() }
    )

    // Find and click the delete button on the first page
    const pageItem = screen.getByText('First Page').closest('div')
    expect(pageItem).toBeInTheDocument()

    // Hover and click delete button (needs to be visible or triggered)
    const deleteButton = await screen.findByRole('button', {
      name: /delete page/i,
    })
    await user.click(deleteButton)

    // Confirm deletion
    const confirmButton = await screen.findByRole('button', { name: /hapus/i })
    await user.click(confirmButton)

    // Verify service was called
    await waitFor(() => {
      expect(modulePageService.deleteModulePage).toHaveBeenCalledWith('page-1')
    })

    // Verify toast was shown
    expect(toast.success).toHaveBeenCalledWith('Halaman berhasil dihapus')
  })

  test('clicking a page in sidebar should select it', async () => {
    // Setup user event
    const user = userEvent.setup()

    const onSelectPage = jest.fn()

    render(
      <ModulePageSidebar
        pages={mockPages}
        activePage={mockActivePage}
        onSelectPage={onSelectPage}
        expandedItems={{ ModulePages: true }}
        toggleExpand={jest.fn()}
      />,
      { wrapper: createWrapper() }
    )

    // Find and click the second page
    const secondPage = screen.getByText('Second Page')
    await user.click(secondPage)

    // Verify onSelectPage was called with the right page
    expect(onSelectPage).toHaveBeenCalledWith(mockPages[1])
  })

  test('toggle sidebar button should change sidebar visibility', async () => {
    // Setup user event
    const user = userEvent.setup()

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    })

    render(
      <ModulePageSidebar
        pages={mockPages}
        activePage={mockActivePage}
        onSelectPage={jest.fn()}
        expandedItems={{ ModulePages: true }}
        toggleExpand={jest.fn()}
      />,
      { wrapper: createWrapper() }
    )

    // Find toggle button
    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i })

    // Click to close
    await user.click(toggleButton)

    // Check localStorage was called to save preference
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })
})
