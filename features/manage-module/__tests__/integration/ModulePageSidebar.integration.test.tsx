import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModulePageSidebar from '../../components/ModulePageSidebar'
import { ModulePageCRUDProvider } from '../../context/ModulePageCRUDContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ModulePage } from '../../types'
import { mockModulePages } from '../__tests__/__mocks__/mockData'
import { modulePageService } from '../../services/modulePageService'
import { toast } from 'sonner'

// Mock useModulePagesContext to provide necessary functionality
jest.mock('../context/ModulePagesContext', () => ({
  useModulePagesContext: () => ({
    isSidebarOpen: true,
    toggleSidebar: jest.fn(),
    setPages: jest.fn(),
    setActivePage: jest.fn(),
  }),
}))

// Mock modulePageService
jest.mock('../services/modulePageService', () => ({
  modulePageService: {
    getModulePages: jest.fn(),
    createModulePage: jest.fn(),
    deleteModulePage: jest.fn(),
  },
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

// Wrap component with necessary providers
const renderWithProviders = (
  ui: React.ReactElement,
  { moduleId = 'mock-module-id' } = {}
) => {
  return render(
    <QueryClientProvider client={mockQueryClient}>
      <ModulePageCRUDProvider moduleId={moduleId}>{ui}</ModulePageCRUDProvider>
    </QueryClientProvider>
  )
}

describe('ModulePageSidebar Integration', () => {
  const moduleId = 'mock-module-id'
  const mockPages = mockModulePages as ModulePage[]

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock getModulePages to return mock data
    ;(modulePageService.getModulePages as jest.Mock).mockResolvedValue({
      data: mockPages,
      success: true,
    })
  })

  it('renders module pages list', async () => {
    renderWithProviders(<ModulePageSidebar pages={mockPages} />, {
      moduleId,
    })

    // Verify that pages are displayed
    await waitFor(() => {
      expect(screen.getByText(mockPages[0].title)).toBeInTheDocument()
      expect(screen.getByText(mockPages[1].title)).toBeInTheDocument()
    })
  })

  it('displays create page dialog when "Add New Page" button is clicked', async () => {
    renderWithProviders(<ModulePageSidebar pages={mockPages} />, {
      moduleId,
    })

    // Open ModulePages section first (if it's not already expanded)
    const modulePagesSection = screen.getByText('Module Pages')
    fireEvent.click(modulePagesSection)

    // Click "Add New Page" button
    const addButton = screen.getByText('Add New Page')
    fireEvent.click(addButton)

    // Verify dialog is displayed
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Tambah Halaman Baru')).toBeInTheDocument()
      expect(screen.getByLabelText('Judul Halaman')).toBeInTheDocument()
    })
  })

  it('creates a new page successfully', async () => {
    // Mock the createModulePage to return success
    ;(modulePageService.createModulePage as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 'new-page-id',
        title: 'Halaman Baru',
        moduleId,
        order: 3,
      },
    })

    renderWithProviders(<ModulePageSidebar pages={mockPages} />, {
      moduleId,
    })

    // Open ModulePages section
    const modulePagesSection = screen.getByText('Module Pages')
    fireEvent.click(modulePagesSection)

    // Click "Add New Page" button
    const addButton = screen.getByText('Add New Page')
    fireEvent.click(addButton)

    // Fill form and submit
    const titleInput = screen.getByLabelText('Judul Halaman')
    fireEvent.change(titleInput, { target: { value: 'Halaman Baru' } })

    const submitButton = screen.getByText('Tambah Halaman')
    fireEvent.click(submitButton)

    // Verify service was called with correct data
    await waitFor(() => {
      expect(modulePageService.createModulePage).toHaveBeenCalledWith({
        title: 'Halaman Baru',
        moduleId,
        order: expect.any(Number),
        blocks: [{ type: 'text', content: '<p>Halaman baru Anda</p>' }],
      })

      // Verify success toast was shown
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringMatching(/halaman berhasil dibuat/i)
      )
    })
  })

  it('shows validation error if title is too short', async () => {
    renderWithProviders(<ModulePageSidebar pages={mockPages} />, {
      moduleId,
    })

    // Open ModulePages section
    const modulePagesSection = screen.getByText('Module Pages')
    fireEvent.click(modulePagesSection)

    // Click "Add New Page" button
    const addButton = screen.getByText('Add New Page')
    fireEvent.click(addButton)

    // Fill form with invalid title and submit
    const titleInput = screen.getByLabelText('Judul Halaman')
    fireEvent.change(titleInput, { target: { value: 'Hi' } }) // Too short

    const submitButton = screen.getByText('Tambah Halaman')
    fireEvent.click(submitButton)

    // Verify validation error is shown
    await waitFor(() => {
      expect(
        screen.getByText('Judul harus minimal 5 karakter')
      ).toBeInTheDocument()
    })

    // Verify service was not called
    expect(modulePageService.createModulePage).not.toHaveBeenCalled()
  })

  it('displays delete confirmation dialog when delete button is clicked', async () => {
    renderWithProviders(<ModulePageSidebar pages={mockPages} />, {
      moduleId,
    })

    // Open ModulePages section
    const modulePagesSection = screen.getByText('Module Pages')
    fireEvent.click(modulePagesSection)

    // Find the first page and click its context menu
    const pageItem = screen.getByText(mockPages[0].title).closest('.flex')

    // Hover on the page item to show the context menu button
    fireEvent.mouseEnter(pageItem as HTMLElement)

    // Find and click the context menu button (it might be shown on hover)
    const contextMenuButton = screen.getByLabelText('Opsi halaman')
    fireEvent.click(contextMenuButton)

    // Click the delete option in the context menu
    const deleteOption = screen.getByText('Hapus Halaman')
    fireEvent.click(deleteOption)

    // Verify delete confirmation dialog is shown
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      expect(
        screen.getByText('Anda yakin ingin menghapus halaman ini?')
      ).toBeInTheDocument()
    })
  })

  it('deletes a page successfully when confirmed', async () => {
    // Mock the deleteModulePage to return success
    ;(modulePageService.deleteModulePage as jest.Mock).mockResolvedValue(true)

    renderWithProviders(<ModulePageSidebar pages={mockPages} />, {
      moduleId,
    })

    // Open ModulePages section
    const modulePagesSection = screen.getByText('Module Pages')
    fireEvent.click(modulePagesSection)

    // Find the first page and click its context menu
    const pageItem = screen.getByText(mockPages[0].title).closest('.flex')

    // Hover on the page item to show the context menu button
    fireEvent.mouseEnter(pageItem as HTMLElement)

    // Find and click the context menu button
    const contextMenuButton = screen.getByLabelText('Opsi halaman')
    fireEvent.click(contextMenuButton)

    // Click the delete option in the context menu
    const deleteOption = screen.getByText('Hapus Halaman')
    fireEvent.click(deleteOption)

    // Confirm deletion
    const confirmButton = screen.getByText('Hapus')
    fireEvent.click(confirmButton)

    // Verify service was called with correct data
    await waitFor(() => {
      expect(modulePageService.deleteModulePage).toHaveBeenCalledWith(
        mockPages[0].id
      )

      // Verify success toast was shown
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringMatching(/halaman berhasil dihapus/i)
      )
    })
  })

  it('does not delete the page when cancel is clicked', async () => {
    renderWithProviders(<ModulePageSidebar pages={mockPages} />, {
      moduleId,
    })

    // Open ModulePages section
    const modulePagesSection = screen.getByText('Module Pages')
    fireEvent.click(modulePagesSection)

    // Find the first page and click its context menu
    const pageItem = screen.getByText(mockPages[0].title).closest('.flex')

    // Hover on the page item to show the context menu button
    fireEvent.mouseEnter(pageItem as HTMLElement)

    // Find and click the context menu button
    const contextMenuButton = screen.getByLabelText('Opsi halaman')
    fireEvent.click(contextMenuButton)

    // Click the delete option in the context menu
    const deleteOption = screen.getByText('Hapus Halaman')
    fireEvent.click(deleteOption)

    // Click cancel button
    const cancelButton = screen.getByText('Batal')
    fireEvent.click(cancelButton)

    // Verify service was not called
    await waitFor(() => {
      expect(modulePageService.deleteModulePage).not.toHaveBeenCalled()
    })
  })
})
