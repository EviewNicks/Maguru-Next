import { render, screen, fireEvent } from '@testing-library/react'
import ModuleActionCell from './ModuleActionCell'
import { ModuleStatus, type Module } from '../../types'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock ModuleFormModal
jest.mock('../ModuleFormModal', () => ({
  ModuleFormModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? (
      <div data-testid="module-form-modal">
        <button onClick={onClose} data-testid="close-form-modal">
          Close
        </button>
      </div>
    ) : null
  ),
}))

// Mock DeleteModuleDialog
jest.mock('../DeleteModuleDialog', () => ({
  DeleteModuleDialog: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? (
      <div data-testid="delete-module-dialog">
        <button onClick={onClose} data-testid="close-delete-dialog">
          Cancel
        </button>
      </div>
    ) : null
  ),
}))

describe('ModuleActionCell', () => {
  const mockPush = jest.fn()
  const mockModule: Module = {
    id: '1',
    title: 'Test Module',
    description: 'Test Description',
    status: ModuleStatus.ACTIVE,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('merender tombol aksi dengan benar', () => {
    render(<ModuleActionCell module={mockModule} />)
    
    expect(screen.getByTitle('Kelola Konten')).toBeInTheDocument()
    expect(screen.getByTitle('Edit Modul')).toBeInTheDocument()
    expect(screen.getByTitle('Hapus Modul')).toBeInTheDocument()
  })

  it('navigasi ke halaman konten saat tombol Kelola Konten diklik', () => {
    render(<ModuleActionCell module={mockModule} />)
    
    fireEvent.click(screen.getByTitle('Kelola Konten'))
    expect(mockPush).toHaveBeenCalledWith(`/manage-module/${mockModule.id}/pages`)
  })

  it('membuka ModuleFormModal saat tombol Edit diklik', () => {
    render(<ModuleActionCell module={mockModule} />)
    
    fireEvent.click(screen.getByTitle('Edit Modul'))
    expect(screen.getByTestId('module-form-modal')).toBeInTheDocument()
  })

  it('membuka DeleteModuleDialog saat tombol Hapus diklik', () => {
    render(<ModuleActionCell module={mockModule} />)
    
    fireEvent.click(screen.getByTitle('Hapus Modul'))
    expect(screen.getByTestId('delete-module-dialog')).toBeInTheDocument()
  })

  it('menutup ModuleFormModal saat onClose dipanggil', () => {
    render(<ModuleActionCell module={mockModule} />)
    
    // Buka modal
    fireEvent.click(screen.getByTitle('Edit Modul'))
    expect(screen.getByTestId('module-form-modal')).toBeInTheDocument()
    
    // Tutup modal dengan tombol close
    fireEvent.click(screen.getByTestId('close-form-modal'))
    expect(screen.queryByTestId('module-form-modal')).not.toBeInTheDocument()
  })

  it('menutup DeleteModuleDialog saat onClose dipanggil', () => {
    render(<ModuleActionCell module={mockModule} />)
    
    // Buka dialog
    fireEvent.click(screen.getByTitle('Hapus Modul'))
    expect(screen.getByTestId('delete-module-dialog')).toBeInTheDocument()
    
    // Tutup dialog dengan tombol cancel
    fireEvent.click(screen.getByTestId('close-delete-dialog'))
    expect(screen.queryByTestId('delete-module-dialog')).not.toBeInTheDocument()
  })
})
