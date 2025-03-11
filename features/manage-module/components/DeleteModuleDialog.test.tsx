import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DeleteModuleDialog } from './DeleteModuleDialog'
import { useDeleteModule } from '../hooks/useModuleMutations'
import { ModuleStatus } from '../types'
import DOMPurify from 'dompurify'

// Mock the useDeleteModule hook
jest.mock('../hooks/useModuleMutations', () => ({
  useDeleteModule: jest.fn(),
}))

// Mock DOMPurify
jest.mock('dompurify', () => ({
  sanitize: jest.fn((content) => content),
}))

describe('DeleteModuleDialog', () => {
  const mockOnClose = jest.fn()
  const mockMutateAsync = jest.fn()
  
  const mockModule = {
    id: '1',
    title: 'Modul Test',
    description: 'Deskripsi modul test',
    status: ModuleStatus.ACTIVE,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-02'),
    createdBy: 'user1',
    updatedBy: 'user1'
  }
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    ;(useDeleteModule as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
  })
  
  it('renders the delete confirmation dialog correctly', () => {
    render(
      <DeleteModuleDialog
        isOpen={true}
        onClose={mockOnClose}
        module={mockModule}
      />
    )
    
    // Check if title and description are rendered
    expect(screen.getByText('Hapus Modul')).toBeInTheDocument()
    expect(screen.getByText(/Apakah Anda yakin ingin menghapus modul/)).toBeInTheDocument()
    expect(screen.getByText(/Modul Test/)).toBeInTheDocument()
    
    // Check buttons
    expect(screen.getByRole('button', { name: /batal/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hapus/i })).toBeInTheDocument()
  })
  
  it('sanitizes module title using DOMPurify', () => {
    render(
      <DeleteModuleDialog
        isOpen={true}
        onClose={mockOnClose}
        module={mockModule}
      />
    )
    
    // Check if DOMPurify.sanitize was called with the module title
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(mockModule.title)
  })
  
  it('calls deleteModule when delete button is clicked', async () => {
    mockMutateAsync.mockResolvedValueOnce({})
    
    render(
      <DeleteModuleDialog
        isOpen={true}
        onClose={mockOnClose}
        module={mockModule}
      />
    )
    
    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: /hapus/i }))
    
    // Check if mutation was called with correct module id
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(mockModule.id)
    })
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled()
  })
  
  it('shows loading state when deleting', () => {
    // Mock loading state
    ;(useDeleteModule as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000))),
      isPending: true,
    })
    
    render(
      <DeleteModuleDialog
        isOpen={true}
        onClose={mockOnClose}
        module={mockModule}
      />
    )
    
    // Check if buttons are disabled during loading
    expect(screen.getByRole('button', { name: /hapus/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /batal/i })).toBeDisabled()
    
    // Check if loading spinner is shown
    expect(screen.getByText(/hapus/i).parentElement?.querySelector('svg')).toBeInTheDocument()
  })
  
  it('handles errors when delete fails', async () => {
    // Mock console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock error when deleting
    const error = new Error('Failed to delete')
    mockMutateAsync.mockRejectedValueOnce(error)
    
    render(
      <DeleteModuleDialog
        isOpen={true}
        onClose={mockOnClose}
        module={mockModule}
      />
    )
    
    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: /hapus/i }))
    
    // Check if error was logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error deleting module:',
        error
      )
    })
    
    // Check that onClose was not called
    expect(mockOnClose).not.toHaveBeenCalled()
    
    // Restore console.error
    consoleErrorSpy.mockRestore()
  })
})
