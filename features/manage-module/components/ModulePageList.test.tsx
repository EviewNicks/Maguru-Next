// features/manage-module/components/ModulePageList.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModulePageList } from './ModulePageList'
import { ModulePageType, ProgrammingLanguage } from '../schemas/modulePageSchema'
import { ModulePage } from '../types'

// Mock hooks
jest.mock('../hooks/useModulePageMutations', () => ({
  useCreateModulePage: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false
  })),
  useReorderModulePages: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false
  }))
}))

// Mock ModulePageListItem
jest.mock('./ModulePageListItem', () => ({
  ModulePageListItem: ({ page, moduleId }: any) => (
    <div data-testid={`page-item-${page.id}`} data-page-id={page.id} data-module-id={moduleId}>
      {page.type === 'teori' ? 'Teori' : 'Kode'} - Order: {page.order}
    </div>
  )
}))

// Mock ModulePageFormModal
jest.mock('./ModulePageFormModal', () => ({
  ModulePageFormModal: ({ isOpen, onOpenChange, moduleId }: any) => (
    <div data-testid="page-form-modal" data-is-open={isOpen} data-module-id={moduleId}>
      {isOpen && (
        <button data-testid="close-modal-button" onClick={() => onOpenChange(false)}>
          Close Modal
        </button>
      )}
    </div>
  )
}))

// Mock DnD Kit
jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  DndContext: ({ children }: any) => <div data-testid="dnd-context">{children}</div>,
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
  PointerSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
  closestCenter: jest.fn()
}))

jest.mock('@dnd-kit/sortable', () => ({
  ...jest.requireActual('@dnd-kit/sortable'),
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  verticalListSortingStrategy: 'vertical',
  arrayMove: jest.fn((array, from, to) => {
    const result = [...array]
    const [removed] = result.splice(from, 1)
    result.splice(to, 0, removed)
    return result
  })
}))

// Import hooks setelah mock
import { useCreateModulePage, useReorderModulePages } from '../hooks/useModulePageMutations'

describe('ModulePageList', () => {
  const mockPages: ModulePage[] = [
    {
      id: '1',
      moduleId: 'module-1',
      order: 1,
      type: ModulePageType.TEORI,
      content: '<p>Konten teori</p>',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02')
    },
    {
      id: '2',
      moduleId: 'module-1',
      order: 2,
      type: ModulePageType.KODE,
      content: 'console.log("Hello")',
      language: ProgrammingLanguage.JAVASCRIPT,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02')
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading skeletons when isLoading is true', () => {
    render(
      <ModulePageList 
        moduleId="module-1" 
        pages={[]}
        isLoading={true}
      />
    )

    expect(screen.getAllByTestId('page-skeleton')).toHaveLength(3)
  })

  it('renders empty state when no pages are available', () => {
    render(
      <ModulePageList 
        moduleId="module-1" 
        pages={[]}
        isLoading={false}
      />
    )

    expect(screen.getByText('Belum ada halaman')).toBeInTheDocument()
    expect(screen.getByText('Klik tombol "Tambah Halaman" untuk membuat halaman baru.')).toBeInTheDocument()
  })

  it('renders list of pages when pages are available', () => {
    render(
      <ModulePageList 
        moduleId="module-1" 
        pages={mockPages}
        isLoading={false}
      />
    )

    expect(screen.getByTestId('page-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('page-item-2')).toBeInTheDocument()
  })

  it('opens form modal when add button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ModulePageList 
        moduleId="module-1" 
        pages={mockPages}
        isLoading={false}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Tambah Halaman' }))
    
    expect(screen.getByTestId('page-form-modal')).toHaveAttribute('data-is-open', 'true')
  })

  it('closes form modal when modal is closed', async () => {
    const user = userEvent.setup()
    
    render(
      <ModulePageList 
        moduleId="module-1" 
        pages={mockPages}
        isLoading={false}
      />
    )

    // Buka modal
    await user.click(screen.getByRole('button', { name: 'Tambah Halaman' }))
    
    // Tutup modal
    await user.click(screen.getByTestId('close-modal-button'))
    
    expect(screen.getByTestId('page-form-modal')).toHaveAttribute('data-is-open', 'false')
  })

  it('sorts pages by order', () => {
    // Buat pages dengan urutan terbalik
    const reversedPages = [...mockPages].reverse()
    
    render(
      <ModulePageList 
        moduleId="module-1" 
        pages={reversedPages}
        isLoading={false}
      />
    )

    // Pastikan pages diurutkan berdasarkan order
    const pageItems = screen.getAllByTestId(/page-item-/);
    expect(pageItems[0]).toHaveAttribute('data-page-id', '1'); // order 1
    expect(pageItems[1]).toHaveAttribute('data-page-id', '2'); // order 2
  })
})
