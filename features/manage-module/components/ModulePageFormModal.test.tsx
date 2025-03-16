// features/manage-module/components/ModulePageFormModal.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModulePageFormModal } from './ModulePageFormModal'
import { ModulePageType, ProgrammingLanguage } from '../schemas/modulePageSchema'
import { ContentType, ModulePage } from '../types'

// Mock hooks
jest.mock('../hooks/useModulePageMutations', () => ({
  useCreateModulePage: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    isPending: false
  })),
  useUpdateModulePage: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    isPending: false
  }))
}))

// Mock editors
jest.mock('./editors/TheoryEditor', () => ({
  TheoryEditor: ({ content, onChange }: { content: string; onChange: (value: string) => void }) => (
    <div data-testid="theory-editor" data-content={content}>
      <button data-testid="theory-change-trigger" onClick={() => onChange('new theory content')}>
        Change Theory
      </button>
    </div>
  )
}))

jest.mock('./editors/CodeEditor', () => ({
  CodeEditor: ({ 
    content, 
    language, 
    onChange, 
    onLanguageChange 
  }: { 
    content: string; 
    language: string; 
    onChange: (value: string) => void; 
    onLanguageChange: (value: string) => void 
  }) => (
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
  const mockModulePage: ModulePage = {
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

  const mockCodeModulePage: ModulePage = {
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

  it('renders form for creating new module page when no page is provided', () => {
    render(
      <ModulePageFormModal 
        open={true} 
        onOpenChange={jest.fn()} 
        moduleId="module-1"
        contentType={ContentType.THEORY}
      />
    )

    expect(screen.getByText('Tambah Halaman Baru')).toBeInTheDocument()
  })

  it('renders form for editing module page when page is provided', () => {
    render(
      <ModulePageFormModal 
        open={true} 
        onOpenChange={jest.fn()} 
        moduleId="module-1"
        contentType={ContentType.THEORY}
        initialData={mockModulePage}
      />
    )

    expect(screen.getByText('Edit Halaman')).toBeInTheDocument()
  })

  it('shows theory editor when type is teori', () => {
    render(
      <ModulePageFormModal 
        open={true} 
        onOpenChange={jest.fn()} 
        moduleId="module-1"
        contentType={ContentType.THEORY}
      />
    )

    expect(screen.getByText('Tipe Konten')).toBeInTheDocument()
    expect(screen.getByTestId('theory-editor')).toBeInTheDocument()
  })

  it('shows code editor when type is kode', () => {
    render(
      <ModulePageFormModal 
        open={true} 
        onOpenChange={jest.fn()} 
        moduleId="module-1"
        contentType={ContentType.CODE}
      />
    )

    expect(screen.getByText('Tipe Konten')).toBeInTheDocument()
    expect(screen.getByTestId('code-editor')).toBeInTheDocument()
  })

  it('loads code page data correctly', () => {
    render(
      <ModulePageFormModal 
        open={true} 
        onOpenChange={jest.fn()} 
        moduleId="module-1"
        contentType={ContentType.CODE}
        initialData={mockCodeModulePage}
      />
    )

    const codeEditor = screen.getByTestId('code-editor')
    expect(codeEditor).toBeInTheDocument()
    expect(codeEditor.getAttribute('data-content')).toBe('console.log("Hello")')
    expect(codeEditor.getAttribute('data-language')).toBe('javascript')
  })

  it('calls create mutation when submitting new page', async () => {
    const mockCreateMutate = jest.fn()
    const mockOnOpenChange = jest.fn()
    
    ;(useCreateModulePage as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      isLoading: false,
      isPending: false
    })
    
    const user = userEvent.setup()
    
    render(
      <ModulePageFormModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        moduleId="module-1"
        contentType={ContentType.THEORY}
      />
    )
    
    // Ubah konten
    await user.click(screen.getByTestId('theory-change-trigger'))
    
    // Submit form
    await user.click(screen.getByText('Simpan'))
    
    // Verifikasi bahwa mutate dipanggil dengan parameter yang benar
    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleId: 'module-1',
        type: ModulePageType.TEORI,
        content: 'new theory content',
        order: 0
      }),
      expect.any(Object)
    )
  })

  it('calls update mutation when submitting edited page', async () => {
    const mockUpdateMutate = jest.fn()
    const mockOnOpenChange = jest.fn()
    
    ;(useUpdateModulePage as jest.Mock).mockReturnValue({
      mutate: mockUpdateMutate,
      isLoading: false,
      isPending: false
    })
    
    const user = userEvent.setup()
    
    render(
      <ModulePageFormModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        moduleId="module-1"
        contentType={ContentType.THEORY}
        initialData={mockModulePage}
      />
    )
    
    // Ubah konten
    await user.click(screen.getByTestId('theory-change-trigger'))
    
    // Submit form
    await user.click(screen.getByText('Perbarui'))
    
    // Verifikasi bahwa mutate dipanggil dengan parameter yang benar
    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        data: expect.objectContaining({
          content: 'new theory content'
        }),
        version: 1
      }),
      expect.any(Object)
    )
  })

  it('handles form reset when modal is closed', () => {
    const onOpenChange = jest.fn()
    
    const { rerender } = render(
      <ModulePageFormModal 
        open={true} 
        onOpenChange={onOpenChange} 
        moduleId="module-1"
        contentType={ContentType.THEORY}
      />
    )
    
    // Verifikasi bahwa form dirender dengan benar
    expect(screen.getByText('Tipe Konten')).toBeInTheDocument()
    
    // Re-render dengan open=false untuk memicu useEffect
    rerender(
      <ModulePageFormModal 
        open={false} 
        onOpenChange={onOpenChange} 
        moduleId="module-1"
        contentType={ContentType.THEORY}
      />
    )
  })
})
