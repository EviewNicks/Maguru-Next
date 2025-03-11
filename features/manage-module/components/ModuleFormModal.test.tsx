import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModuleFormModal } from './ModuleFormModal'
import { ModuleStatus } from '../types'

// Mock hooks
jest.mock('../hooks/useModuleMutations', () => ({
  useCreateModule: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false
  })),
  useUpdateModule: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false
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

  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form for creating new module when no module is provided', () => {
    render(
      <ModuleFormModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )

    expect(screen.getByText('Tambah Modul')).toBeInTheDocument()
    expect(screen.getByLabelText('Judul')).toBeInTheDocument()
    expect(screen.getByLabelText('Deskripsi')).toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeInTheDocument()
  })

  it('renders form for editing module when module is provided', () => {
    render(
      <ModuleFormModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        module={mockModule}
      />
    )

    expect(screen.getByText('Edit Modul')).toBeInTheDocument()
    
    // Cek apakah form terisi dengan data modul
    expect(screen.getByLabelText('Judul')).toHaveValue('Modul Matematika')
    expect(screen.getByLabelText('Deskripsi')).toHaveValue('Deskripsi modul matematika')
  })

  it('calls onOpenChange when cancel button is clicked', async () => {
    render(
      <ModuleFormModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Batal' }))
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls createModule when form is submitted for new module', async () => {
    const mockCreateMutate = jest.fn()
    ;(useCreateModule as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      isLoading: false
    })

    render(
      <ModuleFormModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )

    const user = userEvent.setup()
    
    // Isi form
    await user.type(screen.getByLabelText('Judul'), 'Modul Baru')
    await user.type(screen.getByLabelText('Deskripsi'), 'Deskripsi modul baru')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Simpan' }))
    
    // Verifikasi createModule dipanggil dengan data yang benar
    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith({
        title: 'Modul Baru',
        description: 'Deskripsi modul baru',
        status: ModuleStatus.DRAFT, // Default status
        createdBy: expect.any(String)
      }, expect.any(Object))
    })
  })

  it('calls updateModule when form is submitted for existing module', async () => {
    const mockUpdateMutate = jest.fn()
    ;(useUpdateModule as jest.Mock).mockReturnValue({
      mutate: mockUpdateMutate,
      isLoading: false
    })

    render(
      <ModuleFormModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        module={mockModule}
      />
    )

    const user = userEvent.setup()
    
    // Edit form
    await user.clear(screen.getByLabelText('Judul'))
    await user.type(screen.getByLabelText('Judul'), 'Modul Matematika Updated')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Simpan' }))
    
    // Verifikasi updateModule dipanggil dengan data yang benar
    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: '1',
        title: 'Modul Matematika Updated',
        description: 'Deskripsi modul matematika',
        status: ModuleStatus.ACTIVE,
        updatedBy: expect.any(String)
      }, expect.any(Object))
    })
  })

  it('shows validation error for title with less than 5 characters', async () => {
    render(
      <ModuleFormModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )

    const user = userEvent.setup()
    
    // Isi judul dengan teks pendek
    await user.type(screen.getByLabelText('Judul'), 'Test')
    
    // Klik di luar input untuk trigger validasi
    await user.click(document.body)
    
    // Cek pesan error
    expect(screen.getByText('Judul harus minimal 5 karakter')).toBeInTheDocument()
  })
})
