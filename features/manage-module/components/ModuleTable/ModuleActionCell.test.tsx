import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ModuleActionCell from './ModuleActionCell'
import { Module, ModuleStatus } from '../../types/index'
import { useModuleMutation } from '../../hooks/useModuleMutation'

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

// Mock ModuleFormModal
jest.mock('@/features/manage-module/components/ModuleFormModal', () => {
  return jest.fn().mockImplementation(({ isOpen }) => {
    return isOpen ? <div data-testid="edit-modal">Edit Modal</div> : null
  })
})

// Mock dialog
jest.mock('@/components/ui/dialog', () => {
  const MockDialog = ({ children, open, onOpenChange }: { 
    children: React.ReactNode, 
    open?: boolean, 
    onOpenChange?: (open: boolean) => void 
  }) => {
    const [isOpen, setIsOpen] = React.useState(open)

    React.useEffect(() => {
      setIsOpen(open)
      if (onOpenChange) {
        onOpenChange(!!open)
      }
    }, [open, onOpenChange])

    return isOpen ? (
      <div data-testid="dialog">
        <div data-testid="dialog-content">{children}</div>
      </div>
    ) : null
  }

  return {
    Dialog: MockDialog,
    DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-description">{children}</div>,
    DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-footer">{children}</div>,
    DialogClose: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }
})

// Mock useModuleMutation
jest.mock('../../hooks/useModuleMutation', () => ({
  useModuleMutation: jest.fn()
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  PencilIcon: () => <div data-testid="edit-icon">Edit Icon</div>,
  TrashIcon: () => <div data-testid="trash-icon">Delete Icon</div>
}))

// Mock Button component
jest.mock('@/components/ui/button', () => {
  return {
    Button: ({ 
      children, 
      onClick, 
      variant, 
      disabled 
    }: { 
      children: React.ReactNode, 
      onClick?: () => void, 
      variant?: string, 
      disabled?: boolean 
    }) => (
      <button 
        onClick={onClick} 
        disabled={disabled}
        data-variant={variant}
        data-testid={variant === 'destructive' ? 'delete-button' : 'edit-button'}
      >
        {children}
      </button>
    )
  }
})

describe('ModuleActionCell', () => {
  const mockModule: Module = {
    id: '1',
    title: 'Modul Test',
    description: 'Deskripsi test',
    status: ModuleStatus.ACTIVE,
    createdBy: '1',
    updatedBy: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // Buat QueryClient untuk testing
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  // Wrapper untuk QueryClientProvider
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock implementasi useModuleMutation
    (useModuleMutation as jest.Mock).mockReturnValue({
      deleteModuleMutation: {
        mutate: jest.fn(),
        isPending: false,
      },
      createModuleMutation: {
        mutate: jest.fn(),
        isPending: false,
      },
      updateModuleMutation: {
        mutate: jest.fn(),
        isPending: false,
      }
    })
  })

  it('should render edit and delete buttons', () => {
    render(
      <ModuleActionCell 
        module={mockModule} 
      />,
      { wrapper }
    )
    
    // Verifikasi tombol edit dan delete ditampilkan menggunakan test-id
    const editButton = screen.getByTestId('edit-button')
    const deleteButton = screen.getByTestId('delete-button')
    
    expect(editButton).toBeInTheDocument()
    expect(deleteButton).toBeInTheDocument()
  })

  it('should open edit modal when edit button is clicked', () => {
    render(
      <ModuleActionCell 
        module={mockModule} 
      />,
      { wrapper }
    )

    // Klik tombol edit
    const editButton = screen.getByTestId('edit-button')
    fireEvent.click(editButton)

    // Verifikasi modal edit terbuka
    const editModal = screen.getByTestId('edit-modal')
    expect(editModal).toBeInTheDocument()
  })

  it('should open delete confirmation modal when delete button is clicked', () => {
    render(
      <ModuleActionCell 
        module={mockModule} 
      />,
      { wrapper }
    )

    // Klik tombol delete
    const deleteButton = screen.getByTestId('delete-button')
    fireEvent.click(deleteButton)

    // Verifikasi modal konfirmasi delete terbuka
    const deleteModal = screen.getByTestId('dialog')
    expect(deleteModal).toBeInTheDocument()
    
    // Verifikasi judul dialog
    expect(screen.getByText('Konfirmasi Hapus Modul')).toBeInTheDocument()
    
    // Verifikasi deskripsi dialog menggunakan testid
    const dialogDescription = screen.getByTestId('dialog-description')
    expect(dialogDescription).toHaveTextContent(`Apakah Anda yakin ingin menghapus modul`)
    expect(dialogDescription).toHaveTextContent(`${mockModule.title}`)
  })

  it('should call delete mutation when delete is confirmed', async () => {
    // Buat mock function terlebih dahulu
    const mockDeleteFn = jest.fn();
    
    // Setup mock untuk useModuleMutation
    (useModuleMutation as jest.Mock).mockReturnValue({
      deleteModuleMutation: {
        mutate: mockDeleteFn,
        isPending: false,
      },
      createModuleMutation: {
        mutate: jest.fn(),
        isPending: false,
      },
      updateModuleMutation: {
        mutate: jest.fn(),
        isPending: false,
      }
    });

    render(
      <ModuleActionCell 
        module={mockModule} 
      />,
      { wrapper }
    )

    // Buka modal konfirmasi delete
    const deleteButton = screen.getByTestId('delete-button')
    fireEvent.click(deleteButton)

    // Cari tombol konfirmasi hapus di dalam dialog
    const confirmDeleteButton = screen.getByText('Hapus', { selector: 'button[data-variant="destructive"]' })
    fireEvent.click(confirmDeleteButton)

    // Verifikasi mutate dipanggil dengan ID modul
    await waitFor(() => {
      expect(mockDeleteFn).toHaveBeenCalledWith(mockModule.id)
    })
  })

  it('should disable delete button when mutation is pending', () => {
    // Mock mutation sedang berlangsung
    (useModuleMutation as jest.Mock).mockReturnValue({
      deleteModuleMutation: {
        mutate: jest.fn(),
        isPending: true,
      },
      createModuleMutation: {
        mutate: jest.fn(),
        isPending: false,
      },
      updateModuleMutation: {
        mutate: jest.fn(),
        isPending: false,
      }
    })

    render(
      <ModuleActionCell 
        module={mockModule} 
      />,
      { wrapper }
    )

    // Verifikasi tombol delete ter-disable
    const deleteButton = screen.getByTestId('delete-button')
    expect(deleteButton).toBeDisabled()
  })
})
