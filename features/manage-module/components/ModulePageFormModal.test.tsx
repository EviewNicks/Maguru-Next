// features/manage-module/components/ModulePageFormModal.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModulePageFormModal } from './ModulePageFormModal'
import { ModulePageType, ProgrammingLanguage } from '../schemas/modulePageSchema'

// Mock hooks
jest.mock('../hooks/useModulePageMutations', () => ({
  useCreateModulePage: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false
  })),
  useUpdateModulePage: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false
  }))
}))

// Mock editors
jest.mock('./editors/TheoryEditor', () => ({
  TheoryEditor: ({ content, onChange }: any) => (
    <div data-testid="theory-editor" data-content={content}>
      <button data-testid="theory-change-trigger" onClick={() => onChange('new theory content')}>
        Change Theory
      </button>
    </div>
  )
}))

jest.mock('./editors/CodeEditor', () => ({
  CodeEditor: ({ content, language, onChange, onLanguageChange }: any) => (
    <div data-testid="code-editor" data-content={content} data-language={language}>
      <button data-testid="code-change-trigger" onClick={() => onChange('new code content')}>
        Change Code
      </button>
      <button data-testid="language-change-trigger" onClick={() => onLanguageChange('python')}>
        Change Language
      </button>
    </div>
  )
}))

// Import hooks setelah mock
import { useCreateModulePage, useUpdateModulePage } from '../hooks/useModulePageMutations'

describe('ModulePageFormModal', () => {
  const mockModulePage = {
    id: '1',
    moduleId: 'module-1',
    order: 1,
    type: ModulePageType.TEORI,
    content: '<p>Konten teori</p>',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02')
  }

  const mockCodeModulePage = {
    id: '2',
    moduleId: 'module-1',
    order: 2,
    type: ModulePageType.KODE,
    content: 'console.log("Hello")',
    language: ProgrammingLanguage.JAVASCRIPT,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02')
  }

  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form for creating new module page when no page is provided', () => {
    render(
      <ModulePageFormModal 
        isOpen={true} 
        onOpenChange={mockOnOpenChange} 
        moduleId="module-1"
      />
    )

    expect(screen.getByText('Tambah Halaman')).toBeInTheDocument()
    expect(screen.getByLabelText('Tipe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeInTheDocument()
  })

  it('renders form for editing module page when page is provided', () => {
    render(
      <ModulePageFormModal 
        isOpen={true} 
        onOpenChange={mockOnOpenChange} 
        moduleId="module-1"
        modulePage={mockModulePage}
      />
    )

    expect(screen.getByText('Edit Halaman')).toBeInTheDocument()
    expect(screen.getByLabelText('Tipe')).toBeInTheDocument()
    expect(screen.getByTestId('theory-editor')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeInTheDocument()
  })

  it('shows theory editor when type is teori', async () => {
    const user = userEvent.setup()
    
    render(
      <ModulePageFormModal 
        isOpen={true} 
        onOpenChange={mockOnOpenChange} 
        moduleId="module-1"
      />
    )

    // Pilih tipe teori
    await user.click(screen.getByLabelText('Tipe'))
    await user.click(screen.getByRole('option', { name: 'Teori' }))

    expect(screen.getByTestId('theory-editor')).toBeInTheDocument()
    expect(screen.queryByTestId('code-editor')).not.toBeInTheDocument()
  })

  it('shows code editor when type is kode', async () => {
    const user = userEvent.setup()
    
    render(
      <ModulePageFormModal 
        isOpen={true} 
        onOpenChange={mockOnOpenChange} 
        moduleId="module-1"
      />
    )

    // Pilih tipe kode
    await user.click(screen.getByLabelText('Tipe'))
    await user.click(screen.getByRole('option', { name: 'Kode' }))

    expect(screen.getByTestId('code-editor')).toBeInTheDocument()
    expect(screen.queryByTestId('theory-editor')).not.toBeInTheDocument()
  })

  it('loads code page data correctly', () => {
    render(
      <ModulePageFormModal 
        isOpen={true} 
        onOpenChange={mockOnOpenChange} 
        moduleId="module-1"
        modulePage={mockCodeModulePage}
      />
    )

    expect(screen.getByTestId('code-editor')).toBeInTheDocument()
    expect(screen.getByTestId('code-editor')).toHaveAttribute('data-content', 'console.log("Hello")')
    expect(screen.getByTestId('code-editor')).toHaveAttribute('data-language', 'javascript')
  })

  it('calls create mutation when submitting new page', async () => {
    const mockCreateMutate = jest.fn()
    ;(useCreateModulePage as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      isLoading: false
    })

    const user = userEvent.setup()
    
    render(
      <ModulePageFormModal 
        isOpen={true} 
        onOpenChange={mockOnOpenChange} 
        moduleId="module-1"
      />
    )

    // Pilih tipe teori
    await user.click(screen.getByLabelText('Tipe'))
    await user.click(screen.getByRole('option', { name: 'Teori' }))

    // Ubah konten
    await user.click(screen.getByTestId('theory-change-trigger'))

    // Submit form
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(mockCreateMutate).toHaveBeenCalledWith({
      moduleId: 'module-1',
      type: 'teori',
      content: 'new theory content'
    })
  })

  it('calls update mutation when submitting edited page', async () => {
    const mockUpdateMutate = jest.fn()
    ;(useUpdateModulePage as jest.Mock).mockReturnValue({
      mutate: mockUpdateMutate,
      isLoading: false
    })

    const user = userEvent.setup()
    
    render(
      <ModulePageFormModal 
        isOpen={true} 
        onOpenChange={mockOnOpenChange} 
        moduleId="module-1"
        modulePage={mockModulePage}
      />
    )

    // Ubah konten
    await user.click(screen.getByTestId('theory-change-trigger'))

    // Submit form
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(mockUpdateMutate).toHaveBeenCalledWith({
      id: '1',
      moduleId: 'module-1',
      type: 'teori',
      content: 'new theory content'
    })
  })

  it('handles form reset when modal is closed', async () => {
    const user = userEvent.setup()
    
    render(
      <ModulePageFormModal 
        isOpen={true} 
        onOpenChange={mockOnOpenChange} 
        moduleId="module-1"
      />
    )

    // Pilih tipe kode
    await user.click(screen.getByLabelText('Tipe'))
    await user.click(screen.getByRole('option', { name: 'Kode' }))

    // Tutup modal
    await user.click(screen.getByRole('button', { name: 'Batal' }))

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
