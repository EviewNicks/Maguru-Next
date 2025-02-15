import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModeToggle from '@/components/layouts/Navbar/DarkMode'

// Mock useTheme dengan fungsi yang bisa dikontrol
const mockSetTheme = jest.fn()
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
  }),
}))

describe('DarkMode Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders toggle button with theme icons', () => {
    render(<ModeToggle />)

    // Cek button toggle theme menggunakan testid
    const toggleButton = screen.getByTestId('mock-Button')
    expect(toggleButton).toBeInTheDocument()

    // Cek keberadaan icons
    expect(screen.getByTestId('hero-icon-SunIcon')).toBeInTheDocument()
    expect(screen.getByTestId('hero-icon-MoonIcon')).toBeInTheDocument()
  })

  it('shows dropdown menu with theme options when clicked', () => {
    render(<ModeToggle />)

    // Klik button toggle menggunakan testid
    const toggleButton = screen.getByTestId('mock-Button')
    fireEvent.click(toggleButton)

    // Cek menu dropdown dan opsinya
    expect(screen.getByTestId('mock-DropdownMenuContent')).toBeInTheDocument()
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('calls setTheme with correct theme when selecting options', () => {
    render(<ModeToggle />)

    // Buka dropdown
    const toggleButton = screen.getByTestId('mock-Button')
    fireEvent.click(toggleButton)

    // Test tiap opsi theme
    const themeOptions = [
      { text: 'Light', value: 'light' },
      { text: 'Dark', value: 'dark' },
      { text: 'System', value: 'system' },
    ]

    themeOptions.forEach(({ text, value }) => {
      fireEvent.click(screen.getByText(text))
      expect(mockSetTheme).toHaveBeenCalledWith(value)
    })
  })
})
