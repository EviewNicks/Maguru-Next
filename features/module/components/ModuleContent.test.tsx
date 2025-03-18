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

  // Edge Case Tests untuk ModuleContent

  it('handles extremely long content without performance issues', () => {
    const longContent = `# Long Content\n\n${Array(1000).fill('Paragraf panjang dengan banyak teks. ').join('\n')}`
    
    render(
      <ModuleContent 
        content={longContent} 
        pageNumber={1} 
        onInteraction={jest.fn()} 
        onScroll={jest.fn()} 
      />
    )

    // Pastikan konten dapat dirender tanpa error
    const markdownContent = screen.getByTestId('markdown-content')
    expect(markdownContent).toBeInTheDocument()
  })

  it('handles content with complex nested interactive elements', () => {
    const complexContent = `
# Halaman dengan Elemen Interaktif Kompleks

## Checklist Bertingkat
- [ ] Item Utama 1
  - [ ] Sub Item 1.1
  - [ ] Sub Item 1.2
- [ ] Item Utama 2
  - [ ] Sub Item 2.1

## Tombol dengan Kondisi
<div class="interactive-button button-kompleks" data-required="true">
  Tombol dengan Kondisi Kompleks
</div>

## Kode Interaktif
\`\`\`javascript
function contohFungsi() {
  // Fungsi dengan logika kompleks
  return true;
}
\`\`\`
`
    
    const mockOnInteraction = jest.fn()
    
    render(
      <ModuleContent 
        content={complexContent} 
        pageNumber={1} 
        onInteraction={mockOnInteraction} 
        onScroll={jest.fn()} 
      />
    )

    // Pastikan semua elemen dapat dirender
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument()
    expect(screen.getByTestId('syntax-highlighter')).toBeInTheDocument()
    
    // Simulasi interaksi dengan tombol kompleks
    const komplekButton = screen.getByText('Tombol dengan Kondisi Kompleks')
    fireEvent.click(komplekButton)
    
    expect(mockOnInteraction).toHaveBeenCalledWith(expect.stringContaining('button-kompleks'))
  })

  it('handles content with no interactive elements', () => {
    const plainTextContent = `
# Halaman Tanpa Elemen Interaktif

Ini adalah halaman sederhana yang hanya berisi teks biasa.
Tidak ada tombol, checklist, atau elemen interaktif lainnya.
`
    
    const mockOnInteraction = jest.fn()
    const mockOnScroll = jest.fn()
    
    render(
      <ModuleContent 
        content={plainTextContent} 
        pageNumber={1} 
        onInteraction={mockOnInteraction} 
        onScroll={mockOnScroll} 
      />
    )

    // Pastikan konten dapat dirender
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument()
    
    // Pastikan tidak ada panggilan tidak perlu ke onInteraction
    expect(mockOnInteraction).not.toHaveBeenCalled()
  })

  it('handles scroll tracking with minimal scrolling', () => {
    const shortContent = `
# Halaman Pendek

Konten yang sangat singkat untuk menguji pelacakan scroll.
`
    
    const mockOnScroll = jest.fn()
    
    render(
      <ModuleContent 
        content={shortContent} 
        pageNumber={1} 
        onInteraction={jest.fn()} 
        onScroll={mockOnScroll} 
      />
    )

    // Simulasi scroll minimal
    fireEvent.scroll(window, { target: { scrollY: 10 } })
    
    // Pastikan onScroll dipanggil dengan benar
    expect(mockOnScroll).toHaveBeenCalledWith(
      expect.objectContaining({
        pageNumber: 1,
        scrollPercentage: expect.any(Number)
      })
    )
  })

  it('handles markdown rendering errors gracefully', () => {
    // Mock ReactMarkdown untuk melempar error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    const brokenMarkdown = '# Judul\n\n```javascript\n{invalid: syntax'
    
    render(
      <ModuleContent 
        content={brokenMarkdown} 
        pageNumber={1} 
        onInteraction={jest.fn()} 
        onScroll={jest.fn()} 
      />
    )

    // Pastikan tidak ada error yang tidak tertangani
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument()
    
    // Kembalikan console.error
    consoleErrorSpy.mockRestore()
  })
})
