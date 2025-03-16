// features/manage-module/components/ModulePageListItem.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModulePageListItem } from './ModulePageListItem'
import { ModulePageType, ProgrammingLanguage } from '../schemas/modulePageSchema'
import { ModulePage } from '../types'

// Mock hooks
jest.mock('../hooks/useModulePageMutations', () => ({
  useUpdateModulePage: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false
  })),
  useDeleteModulePage: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false
  }))
}))

// Mock ModulePageFormModal
jest.mock('./ModulePageFormModal', () => ({
  ModulePageFormModal: ({ open, onOpenChange, moduleId, initialData }: {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    moduleId: string;
    initialData?: { id: string };
  }) => (
    <div 
      data-testid="page-form-modal" 
      data-is-open={open} 
      data-module-id={moduleId}
      data-page-id={initialData?.id}
    >
      {open && (
        <button data-testid="close-modal-button" onClick={() => onOpenChange(false)}>
          Close Modal
        </button>
      )}
    </div>
  )
}))

// Mock DnD Kit
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: jest.fn(() => ({
    attributes: { 'data-test': 'sortable-attributes' },
    listeners: { 'data-test': 'sortable-listeners' },
    setNodeRef: jest.fn(),
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
    transition: 'transform 250ms ease',
    isDragging: false
  }))
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => 'transform: translate3d(0px, 0px, 0px)')
    }
  }
}))

// Mock Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="badge" {...props}>
      {children}
    </div>
  )
}))

// Import hooks setelah mock
import { useDeleteModulePage } from '../hooks/useModulePageMutations'

describe('ModulePageListItem', () => {
  const mockTheoryPage: ModulePage = {
    id: '1',
    moduleId: 'module-1',
    order: 1,
    type: ModulePageType.TEORI,
    content: '<p>Konten teori</p>',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    version: 1, 
    language: null
  }

  const mockCodePage: ModulePage = {
    id: '2',
    moduleId: 'module-1',
    order: 2,
    type: ModulePageType.KODE,
    content: 'console.log("Hello")',
    language: ProgrammingLanguage.JAVASCRIPT,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    version: 1
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders theory page correctly', () => {
    render(
      <ModulePageListItem 
        page={mockTheoryPage} 
        moduleId="module-1"
      />
    )

    expect(screen.getByText('Teori')).toBeInTheDocument()
  })

  it('renders code page correctly', () => {
    render(
      <ModulePageListItem 
        page={mockCodePage} 
        moduleId="module-1"
      />
    )

    // Verifikasi bahwa badge ada dalam DOM
    const badgeElement = screen.getByTestId('badge');
    expect(badgeElement).toBeInTheDocument();
    
    // Verifikasi bahwa konten badge berisi teks yang diharapkan
    // Gunakan regex untuk lebih fleksibel dalam mencocokkan teks
    expect(badgeElement.textContent).toMatch(/Kode/);
    expect(badgeElement.textContent).toMatch(/JavaScript/);
    
    // Verifikasi bahwa konten kode dirender
    expect(screen.getByText('console.log("Hello")')).toBeInTheDocument();
  })

  it('opens edit modal when edit button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ModulePageListItem 
        page={mockTheoryPage} 
        moduleId="module-1"
      />
    )

    // Menggunakan SVG icon, jadi kita perlu mencari button yang berisi icon Pencil
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons[0]; // Pencil button adalah yang pertama
    await user.click(editButton);
    
    expect(screen.getByTestId('page-form-modal')).toHaveAttribute('data-is-open', 'true')
    expect(screen.getByTestId('page-form-modal')).toHaveAttribute('data-page-id', '1')
  })

  it('opens delete dialog when delete button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ModulePageListItem 
        page={mockTheoryPage} 
        moduleId="module-1"
      />
    )

    // Menggunakan SVG icon, jadi kita perlu mencari button yang berisi icon Trash2
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons[1]; // Trash2 button adalah yang kedua
    await user.click(deleteButton);
    
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Hapus Halaman')).toBeInTheDocument()
  })

  it('calls delete mutation when confirming deletion', async () => {
    // Definisikan mock untuk useDeleteModulePage
    const mockDeleteMutate = jest.fn();
    (useDeleteModulePage as jest.Mock).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false
    });

    const user = userEvent.setup()
    
    render(
      <ModulePageListItem 
        page={mockTheoryPage} 
        moduleId="module-1"
      />
    )

    // Buka dialog hapus
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons[1]; // Trash2 button adalah yang kedua
    await user.click(deleteButton);
    
    // Konfirmasi hapus
    await user.click(screen.getByRole('button', { name: 'Hapus' }))
    
    expect(mockDeleteMutate).toHaveBeenCalledWith(expect.any(String), expect.any(Object))
  })

  it('closes delete dialog when canceling deletion', async () => {
    const user = userEvent.setup()
    
    render(
      <ModulePageListItem 
        page={mockTheoryPage} 
        moduleId="module-1"
      />
    )

    // Buka dialog hapus
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons[1]; // Trash2 button adalah yang kedua
    await user.click(deleteButton);
    
    // Batal hapus
    await user.click(screen.getByRole('button', { name: 'Batal' }))
    
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('closes edit modal when modal is closed', async () => {
    const user = userEvent.setup()
    
    render(
      <ModulePageListItem 
        page={mockTheoryPage} 
        moduleId="module-1"
      />
    )

    // Buka modal edit
    const buttons = screen.getAllByRole('button');
    const editButton = buttons[0]; // Pencil button adalah yang pertama
    await user.click(editButton);
    
    // Tutup modal
    await user.click(screen.getByTestId('close-modal-button'))
    
    expect(screen.getByTestId('page-form-modal')).toHaveAttribute('data-is-open', 'false')
  })
})
