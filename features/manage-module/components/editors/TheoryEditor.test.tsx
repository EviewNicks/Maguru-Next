// features/manage-module/components/editors/TheoryEditor.test.tsx
import { render, screen } from '@testing-library/react'
import { TheoryEditor } from './TheoryEditor'

// Mock TipTap Editor
jest.mock('@tiptap/react', () => {
  const original = jest.requireActual('@tiptap/react')
  return {
    ...original,
    useEditor: jest.fn(() => ({
      chain: () => ({
        focus: () => ({
          run: jest.fn(),
        }),
      }),
      isActive: jest.fn(() => false),
      getHTML: jest.fn(() => '<p>Test content</p>'),
      isEmpty: jest.fn(() => false),
      getCharacterCount: jest.fn(() => 12),
      on: jest.fn(),
      off: jest.fn(),
      storage: {
        characterCount: {
          characters: () => 12
        }
      },
      commands: {
        setContent: jest.fn(),
        undo: jest.fn()
      }
    })),
    EditorContent: () => (
      <div data-testid="editor-content">
        <div contentEditable="true" data-testid="editable-content" />
      </div>
    ),
  }
})

describe('TheoryEditor', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the editor correctly', () => {
    render(
      <TheoryEditor 
        content="<p>Test content</p>" 
        onChange={mockOnChange} 
      />
    )

    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    expect(screen.getByTestId('theory-editor-toolbar')).toBeInTheDocument()
  })

  it('handles undefined content gracefully', () => {
    // @ts-expect-error - Testing edge case with undefined content
    render(<TheoryEditor content={undefined} onChange={mockOnChange} />)

    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    expect(screen.getByTestId('theory-editor-toolbar')).toBeInTheDocument()
  })

  it('handles null content gracefully', () => {
    // @ts-expect-error - Testing edge case with null content
    render(<TheoryEditor content={null} onChange={mockOnChange} />)

    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    expect(screen.getByTestId('theory-editor-toolbar')).toBeInTheDocument()
  })

  it('shows character count', () => {
    render(
      <TheoryEditor 
        content="<p>Test content</p>" 
        onChange={mockOnChange} 
        maxLength={100}
      />
    )

    expect(screen.getByText('12/100 karakter')).toBeInTheDocument()
  })

  it('renders toolbar buttons', () => {
    render(
      <TheoryEditor 
        content="<p>Test content</p>" 
        onChange={mockOnChange} 
      />
    )

    // Cek tombol-tombol toolbar
    expect(screen.getByLabelText('Bold')).toBeInTheDocument()
    expect(screen.getByLabelText('Italic')).toBeInTheDocument()
    expect(screen.getByLabelText('Bullet List')).toBeInTheDocument()
    expect(screen.getByLabelText('Ordered List')).toBeInTheDocument()
    // Link button tidak memiliki aria-label, cek dengan icon-nya
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument()
    expect(screen.getByLabelText('Heading 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Heading 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Heading 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Code Block')).toBeInTheDocument()
  })

  it('applies custom className if provided', () => {
    render(
      <TheoryEditor 
        content="<p>Test content</p>" 
        onChange={mockOnChange} 
        className="custom-class"
      />
    )

    // Cari elemen dengan class 'theory-editor custom-class'
    const editorElement = screen.getByText('12/5000 karakter').closest('div.theory-editor')
    expect(editorElement).toHaveClass('custom-class')
  })
})
