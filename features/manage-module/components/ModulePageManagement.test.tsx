// features/manage-module/components/ModulePageManagement.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModulePageManagement } from './ModulePageManagement'
import { ModulePageType, ProgrammingLanguage } from '../schemas/modulePageSchema'
import { ContentType } from '../types'

// Mock hooks
jest.mock('../hooks/useModulePages', () => ({
  useModulePages: jest.fn()
}))

// Mock components
jest.mock('./ModulePageList', () => ({
  ModulePageList: ({ moduleId, pages, isLoading }: any) => (
    <div data-testid="module-page-list" data-module-id={moduleId} data-is-loading={isLoading}>
      {pages.map((page: any) => (
        <div key={page.id} data-testid={`page-item-${page.id}`}>
          {page.type} - {page.content}
        </div>
      ))}
    </div>
  )
}))

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

// Import hooks setelah mock
import { useModulePages } from '../hooks/useModulePages'

describe('ModulePageManagement', () => {
  const mockPages = [
    {
      id: '1',
      moduleId: 'module-1',
      order: 1,
      type: 'teori',
      content: '<p>Konten teori</p>',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02')
    },
    {
      id: '2',
      moduleId: 'module-1',
      order: 2,
      type: 'kode',
      content: 'console.log("Hello")',
      language: 'javascript',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02')
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useModulePages as jest.Mock).mockReturnValue({
      data: mockPages,
      isLoading: false,
      isError: false,
      error: null
    })
  })

  it('renders module page management with page list', () => {
    render(<ModulePageManagement moduleId="module-1" />)

    expect(screen.getByText('Halaman Modul')).toBeInTheDocument()
    expect(screen.getByTestId('module-page-list')).toBeInTheDocument()
    expect(screen.getByTestId('module-page-list')).toHaveAttribute('data-module-id', 'module-1')
  })

  it('shows loading state when data is loading', () => {
    ;(useModulePages as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null
    })

    render(<ModulePageManagement moduleId="module-1" />)

    expect(screen.getByTestId('module-page-list')).toHaveAttribute('data-is-loading', 'true')
  })

  it('shows error alert when there is an error', () => {
    ;(useModulePages as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch pages')
    })

    render(<ModulePageManagement moduleId="module-1" />)

    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Gagal memuat halaman modul')).toBeInTheDocument()
  })

  it('opens form modal when add theory button is clicked', async () => {
    const user = userEvent.setup()
    
    render(<ModulePageManagement moduleId="module-1" />)

    await user.click(screen.getByRole('button', { name: 'Tambah Teori' }))
    
    expect(screen.getByTestId('page-form-modal')).toHaveAttribute('data-is-open', 'true')
  })

  it('opens form modal when add code button is clicked', async () => {
    const user = userEvent.setup()
    
    render(<ModulePageManagement moduleId="module-1" />)

    await user.click(screen.getByRole('button', { name: 'Tambah Kode' }))
    
    expect(screen.getByTestId('page-form-modal')).toHaveAttribute('data-is-open', 'true')
  })

  it('closes form modal when modal is closed', async () => {
    const user = userEvent.setup()
    
    render(<ModulePageManagement moduleId="module-1" />)

    // Buka modal
    await user.click(screen.getByRole('button', { name: 'Tambah Teori' }))
    
    // Tutup modal
    await user.click(screen.getByTestId('close-modal-button'))
    
    expect(screen.getByTestId('page-form-modal')).toHaveAttribute('data-is-open', 'false')
  })

  it('converts page data types correctly', () => {
    render(<ModulePageManagement moduleId="module-1" />)

    expect(screen.getByTestId('page-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('page-item-2')).toBeInTheDocument()
  })
})
