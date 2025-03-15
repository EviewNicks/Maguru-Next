// features/manage-module/components/editors/CodeEditor.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeEditor } from './CodeEditor'
import React from 'react'

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

// Tipe untuk props komponen Select
interface SelectProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}

// Tipe untuk props komponen SelectContent, SelectItem, dll
interface SelectChildProps {
  children: React.ReactNode;
}

// Tipe untuk props komponen SelectItem
interface SelectItemProps extends SelectChildProps {
  value: string;
}

// Mock Select component dari shadcn/ui
jest.mock('@/components/ui/select', () => {
  return {
    Select: ({ children, value, onValueChange }: SelectProps) => (
      <div data-testid="select-mock">
        <div data-testid="current-value">{value}</div>
        <button 
          data-testid="select-trigger" 
          onClick={() => {
            // Simulasikan membuka dropdown
          }}
        >
          Open Select
        </button>
        <div data-testid="select-content">
          {/* Render children untuk mengakses SelectItem */}
          {children}
        </div>
        {/* Tombol untuk mensimulasikan pemilihan bahasa */}
        <button 
          data-testid="select-python" 
          onClick={() => onValueChange('python')}
        >
          Select Python
        </button>
      </div>
    ),
    SelectContent: ({ children }: SelectChildProps) => <div data-testid="select-content">{children}</div>,
    SelectItem: ({ children, value }: SelectItemProps) => (
      <div data-testid={`select-item-${value}`} data-value={value}>
        {children}
      </div>
    ),
    SelectTrigger: ({ children }: SelectChildProps) => <div data-testid="select-trigger">{children}</div>,
    SelectValue: ({ children }: SelectChildProps) => <div data-testid="select-value">{children}</div>,
  }
})

// Mock untuk cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
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
    const content = "const test = 'hello';";
    const maxLength = 100;
    
    const { container } = render(
      <CodeEditor 
        content={content}
        language="javascript"
        onChange={mockOnChange}
        onLanguageChange={mockOnLanguageChange}
        maxLength={maxLength}
      />
    )

    // Gunakan querySelector untuk menemukan elemen dengan data-testid="char-counter"
    const charCounter = container.querySelector('[data-testid="char-counter"]');
    expect(charCounter).toHaveTextContent(`${content.length}/${maxLength} karakter`);
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

    // Gunakan tombol simulasi yang dibuat di mock
    await user.click(screen.getByTestId('select-python'))
    
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
    const content = "const test = 'hello world this is a long string';";
    const maxLength = 50;
    
    const { container } = render(
      <CodeEditor 
        content={content}
        language="javascript"
        onChange={mockOnChange}
        onLanguageChange={mockOnLanguageChange}
        maxLength={maxLength}
      />
    )

    // Gunakan querySelector untuk menemukan elemen dengan data-testid="char-counter"
    const charCounter = container.querySelector('[data-testid="char-counter"]');
    expect(charCounter).toHaveTextContent(`${content.length}/${maxLength} karakter`);
    expect(charCounter).toHaveClass('text-amber-500');
  })

  it('shows error when exceeding character limit', () => {
    const content = "const test = 'hello world this is a very long string that exceeds the limit';";
    const maxLength = 50;
    
    const { container } = render(
      <CodeEditor 
        content={content}
        language="javascript"
        onChange={mockOnChange}
        onLanguageChange={mockOnLanguageChange}
        maxLength={maxLength}
      />
    )

    // Gunakan querySelector untuk menemukan elemen dengan data-testid="char-counter"
    const charCounter = container.querySelector('[data-testid="char-counter"]');
    expect(charCounter).toHaveTextContent(`${content.length}/${maxLength} karakter`);
    expect(charCounter).toHaveClass('text-destructive');
  })
})
