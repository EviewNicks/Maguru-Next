// features/manage-module/components/editors/CodeEditor.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeEditor } from './CodeEditor'

// Mock next/dynamic
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = ({ value, language, onChange }: {
    value: string;
    language: string;
    onChange: (value: string) => void;
  }) => (
    <div data-testid="monaco-editor" data-language={language} data-value={value}>
      <button data-testid="mock-change-trigger" onClick={() => onChange('new content')}>
        Trigger Change
      </button>
    </div>
  )
  DynamicComponent.displayName = 'MonacoEditor'
  return DynamicComponent
})

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({ theme: 'light', setTheme: jest.fn() })),
}))

describe('CodeEditor', () => {
  const mockOnChange = jest.fn()
  const mockOnLanguageChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the editor correctly', () => {
    render(
      <CodeEditor 
        content="const test = 'hello';" 
        language="javascript"
        onChange={mockOnChange}
        onLanguageChange={mockOnLanguageChange}
      />
    )

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    expect(screen.getByTestId('monaco-editor')).toHaveAttribute('data-language', 'javascript')
    expect(screen.getByTestId('monaco-editor')).toHaveAttribute('data-value', "const test = 'hello';")
  })

  it('shows character count', () => {
    render(
      <CodeEditor 
        content="const test = 'hello';" 
        language="javascript"
        onChange={mockOnChange}
        onLanguageChange={mockOnLanguageChange}
        maxLength={100}
      />
    )

    expect(screen.getByText('19/100 karakter')).toBeInTheDocument()
  })

  it('calls onChange when content changes', async () => {
    const user = userEvent.setup()
    
    render(
      <CodeEditor 
        content="const test = 'hello';" 
        language="javascript"
        onChange={mockOnChange}
        onLanguageChange={mockOnLanguageChange}
      />
    )

    await user.click(screen.getByTestId('mock-change-trigger'))
    expect(mockOnChange).toHaveBeenCalledWith('new content')
  })

  it('calls onLanguageChange when language changes', async () => {
    const user = userEvent.setup()
    
    render(
      <CodeEditor 
        content="const test = 'hello';" 
        language="javascript"
        onChange={mockOnChange}
        onLanguageChange={mockOnLanguageChange}
      />
    )

    // Buka dropdown bahasa
    await user.click(screen.getByRole('combobox'))
    
    // Pilih bahasa Python
    const pythonOption = screen.getByRole('option', { name: 'Python' })
    await user.click(pythonOption)
    
    expect(mockOnLanguageChange).toHaveBeenCalledWith('python')
  })

  it('applies custom className if provided', () => {
    render(
      <CodeEditor 
        content="const test = 'hello';" 
        language="javascript"
        onChange={mockOnChange}
        onLanguageChange={mockOnLanguageChange}
        className="custom-class"
      />
    )

    expect(screen.getByTestId('code-editor')).toHaveClass('custom-class')
  })

  it('shows warning when approaching character limit', () => {
    render(
      <CodeEditor 
        content="const test = 'hello world this is a long string';" 
        language="javascript"
        onChange={mockOnChange}
        onLanguageChange={mockOnLanguageChange}
        maxLength={50}
      />
    )

    // Karakter count lebih dari 80% dari maxLength
    expect(screen.getByText('45/50 karakter')).toHaveClass('text-amber-500')
  })

  it('shows error when exceeding character limit', () => {
    render(
      <CodeEditor 
        content="const test = 'hello world this is a very long string that exceeds the limit';" 
        language="javascript"
        onChange={mockOnChange}
        onLanguageChange={mockOnLanguageChange}
        maxLength={50}
      />
    )

    // Karakter count lebih dari maxLength
    expect(screen.getByText('70/50 karakter')).toHaveClass('text-destructive')
  })
})
