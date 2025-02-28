import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModeToggle from '@/components/layouts/Navbar/DarkMode'

// Mock useTheme hook
const mockSetTheme = jest.fn()
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
  }),
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid="mock-Button" {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => (
    <div data-testid="mock-DropdownMenu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: any) => (
    <div data-testid="mock-DropdownMenuTrigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: any) => (
    <div data-testid="mock-DropdownMenuContent">{children}</div>
  ),
  DropdownMenuItem: ({ children, ...props }: any) => (
    <div data-testid="mock-DropdownMenuItem" {...props}>
      {children}
    </div>
  ),
}))

// Mock icons
jest.mock('@heroicons/react/24/outline', () => ({
  SunIcon: () => <div data-testid="hero-icon-SunIcon" />,
  MoonIcon: () => <div data-testid="hero-icon-MoonIcon" />,
}))

describe('DarkMode Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders toggle button with theme icons', () => {
    render(<ModeToggle />)
    expect(screen.getByTestId('mock-Button')).toBeInTheDocument()
    expect(screen.getByTestId('hero-icon-SunIcon')).toBeInTheDocument()
    expect(screen.getByTestId('hero-icon-MoonIcon')).toBeInTheDocument()
  })

  it('shows dropdown menu with theme options when clicked', () => {
    render(<ModeToggle />)
    const button = screen.getByTestId('mock-Button')
    fireEvent.click(button)

    expect(screen.getByTestId('mock-DropdownMenuContent')).toBeInTheDocument()
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('calls setTheme with correct theme when selecting options', () => {
    render(<ModeToggle />)
    const button = screen.getByTestId('mock-Button')
    fireEvent.click(button)

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
