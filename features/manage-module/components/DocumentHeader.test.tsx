import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import DocumentHeader from './ModulePageEditor/document/DocumentHeader'
import { toast } from 'sonner'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'
import { showErrorNotification } from './ErrorNotifier'

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('../components/ErrorNotifier', () => ({
  showErrorNotification: jest.fn(),
}))

// Mock useModulePageCRUDContext
jest.mock('../context/ModulePageCRUDContext', () => ({
  useModulePageCRUDContext: jest.fn(),
}))

describe('DocumentHeader', () => {
  // Mock data & functions
  const mockActivePage = {
    id: 'test-page-1',
    title: 'Test Page',
    moduleId: 'test-module',
    order: 0,
    blocks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockCreatePage = jest.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'new-page',
      title: 'Halaman Baru',
      moduleId: 'test-module',
      order: 1,
      blocks: [],
    },
  })

  const mockDeletePage = jest.fn().mockResolvedValue({
    success: true,
  })

  const mockSavePage = jest.fn().mockResolvedValue({
    success: true,
  })

  const mockSetActivePage = jest.fn()

  // Setup default mock implementation
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup basic mock return values
    ;(useModulePageCRUDContext as jest.Mock).mockReturnValue({
      moduleId: 'test-module',
      pages: [mockActivePage],
      activePage: mockActivePage,
      setActivePage: mockSetActivePage,
      createPage: mockCreatePage,
      deletePage: mockDeletePage,
      savePage: mockSavePage,
    })
  })

  // Test basic rendering
  test('renders title input and save status correctly', () => {
    render(<DocumentHeader title="Test Page" saveStatus="saved" />)

    // Verify title input
    const titleInput = screen.getByLabelText('Judul halaman')
    expect(titleInput).toBeInTheDocument()
    expect(titleInput).toHaveValue('Test Page')

    // Verify save status
    const savedStatus = screen.getByText('Tersimpan')
    expect(savedStatus).toBeInTheDocument()
    expect(screen.getByLabelText('Header dokumen')).toBeInTheDocument()
  })

  // Test different save statuses
  test.each([
    ['saved', 'Tersimpan'],
    ['saving', 'Menyimpan...'],
    ['unsaved', 'Belum tersimpan'],
    ['error', 'Gagal menyimpan'],
  ])('displays correct save status: %s', (status, expectedText) => {
    render(
      <DocumentHeader
        saveStatus={status as 'saved' | 'saving' | 'unsaved' | 'error'}
      />
    )
    expect(screen.getByText(expectedText)).toBeInTheDocument()
  })

  // Test title change callback
  test('calls onTitleChange when title input changes', () => {
    const mockOnTitleChange = jest.fn()
    render(
      <DocumentHeader title="Initial Title" onTitleChange={mockOnTitleChange} />
    )

    const titleInput = screen.getByLabelText('Judul halaman')
    fireEvent.change(titleInput, { target: { value: 'New Title' } })

    expect(mockOnTitleChange).toHaveBeenCalledWith('New Title')
  })

  // Test debounced save (integrasi dengan API)
  test('triggers save after input change with debounce', async () => {
    const mockOnTitleChange = jest.fn()
    jest.useFakeTimers()

    render(
      <DocumentHeader
        title="Initial Title"
        onTitleChange={mockOnTitleChange}
        saveStatus="saved"
        pageId="test-page-1"
      />
    )

    // Change the title
    const titleInput = screen.getByLabelText('Judul halaman')
    fireEvent.change(titleInput, { target: { value: 'New Title Long Enough' } })

    // Verify immediate callback
    expect(mockOnTitleChange).toHaveBeenCalledWith('New Title Long Enough')

    // Fast-forward time to simulate debounce
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Verify debounced action triggers savePage
    await waitFor(() => {
      expect(mockSavePage).toHaveBeenCalledWith({
        pageId: 'test-page-1',
        title: 'New Title Long Enough',
      })
    })

    jest.useRealTimers()
  })

  // Test autosave visual feedback
  test('provides visual feedback during autosave process', async () => {
    const mockOnTitleChange = jest.fn()

    // Initial state: saved
    const { rerender } = render(
      <DocumentHeader
        title="Initial Title"
        onTitleChange={mockOnTitleChange}
        saveStatus="saved"
      />
    )
    expect(screen.getByText('Tersimpan')).toBeInTheDocument()

    // After edit: unsaved
    rerender(
      <DocumentHeader
        title="New Title"
        onTitleChange={mockOnTitleChange}
        saveStatus="unsaved"
      />
    )
    expect(screen.getByText('Belum tersimpan')).toBeInTheDocument()

    // During save: saving
    rerender(
      <DocumentHeader
        title="New Title"
        onTitleChange={mockOnTitleChange}
        saveStatus="saving"
      />
    )
    expect(screen.getByText('Menyimpan...')).toBeInTheDocument()

    // Error state: error
    rerender(
      <DocumentHeader
        title="New Title"
        onTitleChange={mockOnTitleChange}
        saveStatus="error"
      />
    )
    expect(screen.getByText('Gagal menyimpan')).toBeInTheDocument()

    // After save: saved
    rerender(
      <DocumentHeader
        title="New Title"
        onTitleChange={mockOnTitleChange}
        saveStatus="saved"
      />
    )
    expect(screen.getByText('Tersimpan')).toBeInTheDocument()
  })

  // Test Create button functionality
  test('handles Create button click correctly', async () => {
    render(<DocumentHeader title="Test Page" pageId="test-page-1" />)

    // Click Create button
    const createButton = screen.getByText('Create')
    fireEvent.click(createButton)

    // Verify createPage is called with correct parameters
    await waitFor(() => {
      expect(mockCreatePage).toHaveBeenCalledWith({
        moduleId: 'test-module',
        title: 'Halaman Baru',
        order: 1,
        blocks: [],
      })
    })

    // Verify new page becomes active page
    await waitFor(() => {
      expect(mockSetActivePage).toHaveBeenCalled()
    })

    // Verify success toast
    expect(toast.success).toHaveBeenCalledWith('Halaman baru berhasil dibuat')
  })

  // Test error handling on create
  test('handles errors in Create operation', async () => {
    // Override createPage to reject
    const createError = new Error('Failed to create page')
    ;(useModulePageCRUDContext as jest.Mock).mockReturnValue({
      moduleId: 'test-module',
      pages: [mockActivePage],
      activePage: mockActivePage,
      setActivePage: mockSetActivePage,
      createPage: jest.fn().mockRejectedValue(createError),
      deletePage: mockDeletePage,
      savePage: mockSavePage,
    })

    render(<DocumentHeader title="Test Page" pageId="test-page-1" />)

    // Click Create button
    const createButton = screen.getByText('Create')
    fireEvent.click(createButton)

    // Verify error handling
    await waitFor(() => {
      expect(showErrorNotification).toHaveBeenCalledWith(createError)
    })
  })

  // Test Close draft button and confirmation dialog
  test('shows confirmation dialog when clicking Close draft', async () => {
    render(<DocumentHeader title="Test Page" pageId="test-page-1" />)

    // Click Close draft button
    const closeButton = screen.getByText('Close draft')
    fireEvent.click(closeButton)

    // Verify dialog appears
    await waitFor(() => {
      expect(screen.getByText('Hapus halaman?')).toBeInTheDocument()
      expect(
        screen.getByText('Tindakan ini tidak dapat dibatalkan.')
      ).toBeInTheDocument()
      expect(screen.getByText('Batal')).toBeInTheDocument()
      expect(screen.getByText('Hapus')).toBeInTheDocument()
    })

    // Confirm deletion
    const confirmButton = screen.getByText('Hapus')
    fireEvent.click(confirmButton)

    // Verify deletePage is called
    await waitFor(() => {
      expect(mockDeletePage).toHaveBeenCalledWith('test-page-1')
    })

    // Verify success toast
    expect(toast.success).toHaveBeenCalledWith('Halaman berhasil dihapus')
  })

  // Test validation for short titles
  test('shows error for titles shorter than 5 characters', async () => {
    jest.useFakeTimers()

    render(<DocumentHeader title="Test Page" pageId="test-page-1" />)

    // Enter short title
    const titleInput = screen.getByLabelText('Judul halaman')
    fireEvent.change(titleInput, { target: { value: 'Test' } })

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Verify error is shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Judul harus terdiri dari minimal 5 karakter'
      )
    })

    jest.useRealTimers()
  })
})
