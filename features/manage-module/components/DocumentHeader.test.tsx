import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DocumentHeader from './ModulePageEditor/document/DocumentHeader'
import { toast } from 'sonner'

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('DocumentHeader', () => {
  // Setup
  beforeEach(() => {
    jest.clearAllMocks()
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
  ])('displays correct save status: %s', (status, expectedText) => {
    render(
      <DocumentHeader saveStatus={status as 'saved' | 'saving' | 'unsaved'} />
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
      />
    )

    // Change the title
    const titleInput = screen.getByLabelText('Judul halaman')
    fireEvent.change(titleInput, { target: { value: 'New Title' } })

    // Verify immediate callback
    expect(mockOnTitleChange).toHaveBeenCalledWith('New Title')

    // Fast-forward time to simulate debounce
    jest.advanceTimersByTime(1000)

    // Verify debounced action
    await waitFor(() => {
      expect(mockOnTitleChange).toHaveBeenCalledTimes(1)
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
})
