import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModuleFormModal } from './ModuleFormModal'
import { ModuleStatus } from '../types'

// Mock hooks
jest.mock('../hooks/useModuleMutations', () => ({
  useCreateModule: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    mutateAsync: jest.fn().mockResolvedValue({})
  })),
  useUpdateModule: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    mutateAsync: jest.fn().mockResolvedValue({})
  }))
}))

// Import hooks setelah mock
import { useCreateModule, useUpdateModule } from '../hooks/useModuleMutations'

describe('ModuleFormModal', () => {
  const mockModule = {
    id: '1',
    title: 'Modul Matematika',
    description: 'Deskripsi modul matematika',
    status: ModuleStatus.ACTIVE,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    createdBy: 'user1',
    updatedBy: 'user1'
  }

  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form for creating new module when no module is provided', () => {
    render(
      <ModuleFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    )

    expect(screen.getByText('Tambah Modul Baru')).toBeInTheDocument()
    expect(screen.getByLabelText('Judul Modul')).toBeInTheDocument()
    expect(screen.getByLabelText('Deskripsi')).toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tambah Modul' })).toBeInTheDocument()
  })

  it('renders form for editing module when module is provided', () => {
    render(
      <ModuleFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
        module={mockModule}
      />
    )

    expect(screen.getByText('Edit Modul')).toBeInTheDocument()
    
    // Cek apakah form terisi dengan data modul
    expect(screen.getByLabelText('Judul Modul')).toHaveValue('Modul Matematika')
    expect(screen.getByLabelText('Deskripsi')).toHaveValue('Deskripsi modul matematika')
  })

  it('calls onClose when cancel button is clicked', async () => {
    render(
      <ModuleFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Batal' }))
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls createModule when form is submitted for new module', async () => {
    const mockCreateMutate = jest.fn().mockResolvedValue({})
    ;(useCreateModule as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      mutateAsync: mockCreateMutate
    })

    render(
      <ModuleFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    )

    const user = userEvent.setup()
    
    // Isi form
    await user.type(screen.getByLabelText('Judul Modul'), 'Modul Baru')
    await user.type(screen.getByLabelText('Deskripsi'), 'Deskripsi modul baru')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Tambah Modul' }))
    
    // Verifikasi createModule dipanggil dengan data yang benar
    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith({
        title: 'Modul Baru',
        description: 'Deskripsi modul baru',
        status: ModuleStatus.DRAFT, // Default status
        createdBy: 'current-user-id'
      })
    })
  })

  it('calls updateModule when form is submitted for existing module', async () => {
    const mockUpdateMutate = jest.fn().mockResolvedValue({})
    ;(useUpdateModule as jest.Mock).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      mutateAsync: mockUpdateMutate
    })

    render(
      <ModuleFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
        module={mockModule}
      />
    )

    const user = userEvent.setup()
    
    // Edit form
    await user.clear(screen.getByLabelText('Judul Modul'))
    await user.type(screen.getByLabelText('Judul Modul'), 'Modul Matematika Updated')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Simpan Perubahan' }))
    
    // Verifikasi updateModule dipanggil dengan data yang benar
    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: '1',
        title: 'Modul Matematika Updated',
        description: 'Deskripsi modul matematika',
        status: ModuleStatus.ACTIVE,
        updatedBy: 'current-user-id'
      })
    })
  })

  it('shows validation error for title with less than 5 characters', async () => {
    render(
      <ModuleFormModal 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    )

    const user = userEvent.setup()
    
    // Isi judul dengan teks pendek
    await user.type(screen.getByLabelText('Judul Modul'), 'Test')
    
    // Submit form untuk memicu validasi
    await user.click(screen.getByRole('button', { name: 'Tambah Modul' }))
    
    // Cek pesan error
    expect(screen.getByText('Judul minimal 5 karakter')).toBeInTheDocument()
  })
})
