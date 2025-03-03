// features/module/components/ModuleContent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import ModuleContent from './ModuleContent'

// Mock ReactMarkdown
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children, components }: { children: React.ReactNode; components: Record<string, (props: React.ComponentPropsWithoutRef<'div'> & { className?: string; children?: React.ReactNode }) => JSX.Element> }) => {
    return (
      <div data-testid="markdown-content">
        {children}
        {components.h3 && (
          <div data-testid="markdown-h3">
            {components.h3({ children: 'Test Heading' })}
          </div>
        )}
        {components.div && (
          <div data-testid="markdown-div-checklist">
            {components.div({ 
              className: 'interactive-checklist',
              children: '- Item 1\n- Item 2'
            })}
          </div>
        )}
        {components.div && (
          <div data-testid="markdown-div-button">
            {components.div({ 
              className: 'interactive-button button-id',
              children: 'Klik Saya'
            })}
          </div>
        )}
      </div>
    )
  }
}))

// Mock SyntaxHighlighter
jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: string }) => (
    <pre data-testid="syntax-highlighter">{children}</pre>
  )
}))

// Mock styles
jest.mock('react-syntax-highlighter/dist/cjs/styles/prism', () => ({
  vscDarkPlus: {}
}))

// Mock komponen UI dari shadcn
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  )
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ 
    children, 
    onClick, 
    variant, 
    size, 
    className 
  }: { 
    children: React.ReactNode
    onClick?: () => void
    variant?: string
    size?: string
    className?: string
  }) => (
    <button 
      onClick={onClick} 
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  )
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  CheckCircle: () => <span data-testid="check-circle">CheckCircle</span>,
  Circle: () => <span data-testid="circle">Circle</span>
}))

describe('ModuleContent', () => {
  const mockOnInteraction = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  it('renders the component with title and content', () => {
    render(
      <ModuleContent
        title="Test Title"
        content="Test content"
      />
    )
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-content')).toHaveTextContent('Test content')
  })
  
  it('renders media when provided', () => {
    render(
      <ModuleContent
        title="Test Title"
        content="Test content"
        media="test-image.jpg"
      />
    )
    
    const image = screen.getByAltText('Test Title')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'test-image.jpg')
  })
  
  it('calls onInteraction when media is loaded', () => {
    render(
      <ModuleContent
        title="Test Title"
        content="Test content"
        media="test-image.jpg"
        onInteraction={mockOnInteraction}
      />
    )
    
    const image = screen.getByAltText('Test Title')
    fireEvent.load(image)
    
    expect(mockOnInteraction).toHaveBeenCalledWith('media-viewed')
  })
  
  it('renders interactive heading with click handler', () => {
    render(
      <ModuleContent
        title="Test Title"
        content="Test content"
        onInteraction={mockOnInteraction}
      />
    )
    
    const heading = screen.getByTestId('markdown-h3').querySelector('h3')
    expect(heading).toBeInTheDocument()
    
    fireEvent.click(heading!)
    expect(mockOnInteraction).toHaveBeenCalledWith('view-heading-test-heading')
  })
  
  it('renders interactive checklist', () => {
    render(
      <ModuleContent
        title="Test Title"
        content="Test content"
        onInteraction={mockOnInteraction}
      />
    )
    
    const checklist = screen.getByTestId('markdown-div-checklist')
    expect(checklist).toBeInTheDocument()
    
    // Verifikasi bahwa checklist item dirender
    const listItems = screen.getAllByRole('listitem')
    expect(listItems.length).toBeGreaterThan(0)
    
    // Klik pada tombol checklist
    const buttons = screen.getAllByTestId('button')
    const checklistButton = buttons.find(button => 
      button.parentElement?.parentElement?.tagName.toLowerCase() === 'li'
    )
    
    fireEvent.click(checklistButton!)
    expect(mockOnInteraction).toHaveBeenCalled()
  })
  
  it('renders interactive button', () => {
    render(
      <ModuleContent
        title="Test Title"
        content="Test content"
        onInteraction={mockOnInteraction}
      />
    )
    
    const buttonContainer = screen.getByTestId('markdown-div-button')
    expect(buttonContainer).toBeInTheDocument()
    
    // Cari tombol dengan teks "Klik Saya"
    const button = screen.getByText('Klik Saya')
    expect(button).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(mockOnInteraction).toHaveBeenCalledWith('button-id')
  })
  
  it('renders "Tandai Telah Dibaca" button', () => {
    render(
      <ModuleContent
        title="Test Title"
        content="Test content"
        onInteraction={mockOnInteraction}
      />
    )
    
    const markAsReadButton = screen.getByText('Tandai Telah Dibaca')
    expect(markAsReadButton).toBeInTheDocument()
    
    fireEvent.click(markAsReadButton)
    expect(mockOnInteraction).toHaveBeenCalledWith('mark-as-read')
  })
})
