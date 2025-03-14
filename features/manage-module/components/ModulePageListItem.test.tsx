// features/manage-module/components/ModulePageListItem.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModulePageListItem } from './ModulePageListItem'
import { ModulePageType, ProgrammingLanguage } from '../schemas/modulePageSchema'
import { ModulePage } from '../types'

// Mock hooks
jest.mock('../hooks/useModulePageMutations', () => ({
  useUpdateModulePage: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false
  })),
  useDeleteModulePage: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false
  }))
}))

// Mock ModulePageFormModal
jest.mock('./ModulePageFormModal', () => ({
  ModulePageFormModal: ({ isOpen, onOpenChange, moduleId, modulePage }: any) => (
    <div 
      data-testid="page-form-modal" 
      data-is-open={isOpen} 
      data-module-id={moduleId}
      data-page-id={modulePage?.id}
    >
      {isOpen && (
        <button data-testid="close-modal-button" onClick={() => onOpenChange(false)}>
          Close Modal
        </button>
      )}
    </div>
  )
}))

// Mock DnD Kit
jest.mock('@dnd-kit/sortable', () => ({
  ...jest.requireActual('@dnd-kit/sortable'),
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

// Import hooks setelah mock
import { useUpdateModulePage, useDeleteModulePage } from '../hooks/useModulePageMutations'

describe('ModulePageListItem', () => {
  const mockTheoryPage: ModulePage = {
    id: '1',
    moduleId: 'module-1',
    order: 1,
    type: ModulePageType.TEORI,
    content: '<p>Konten teori</p>',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02')
  }

  const mockCodePage: ModulePage = {
    id: '2',
    moduleId: 'module-1',
    order: 2,
    type: ModulePageType.KODE,
    content: 'console.log("Hello")',
    language: ProgrammingLanguage.JAVASCRIPT,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02')
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
    expect(screen.getByText('1')).toBeInTheDocument() // Order number
  })

  it('renders code page correctly', () => {
    render(
      <ModulePageListItem 
        page={mockCodePage} 
        moduleId="module-1"
      />
    )

    expect(screen.getByText('Kode')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument() // Language badge
    expect(screen.getByText('2')).toBeInTheDocument() // Order number
  })

  it('opens edit modal when edit button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ModulePageListItem 
        page={mockTheoryPage} 
        moduleId="module-1"
      />
    )

    await user.click(screen.getByLabelText('Edit'))
    
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

    await user.click(screen.getByLabelText('Hapus'))
    
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Hapus Halaman')).toBeInTheDocument()
  })

  it('calls delete mutation when confirming deletion', async () => {
    const mockDeleteMutate = jest.fn()
    ;(useDeleteModulePage as jest.Mock).mockReturnValue({
      mutate: mockDeleteMutate,
      isLoading: false
    })

    const user = userEvent.setup()
    
    render(
      <ModulePageListItem 
        page={mockTheoryPage} 
        moduleId="module-1"
      />
    )

    // Buka dialog hapus
    await user.click(screen.getByLabelText('Hapus'))
    
    // Konfirmasi hapus
    await user.click(screen.getByRole('button', { name: 'Hapus' }))
    
    expect(mockDeleteMutate).toHaveBeenCalledWith('1')
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
    await user.click(screen.getByLabelText('Hapus'))
    
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
    await user.click(screen.getByLabelText('Edit'))
    
    // Tutup modal
    await user.click(screen.getByTestId('close-modal-button'))
    
    expect(screen.getByTestId('page-form-modal')).toHaveAttribute('data-is-open', 'false')
  })
})
