import { render, screen, fireEvent } from '@testing-library/react'
import ModuleManagementError from './error'

// Mock for console.error to avoid test output pollution
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})
afterAll(() => {
  console.error = originalConsoleError
})

// Mock for Button and AlertCircle components
jest.mock('@/components/ui/button', () => ({
  Button: ({
    onClick,
    children,
  }: {
    onClick: () => void
    children: React.ReactNode
  }) => (
    <button data-testid="mock-button" onClick={onClick}>
      {children}
    </button>
  ),
}))

jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="mock-alert-circle">Alert Icon</div>,
}))

describe('ModuleManagementError', () => {
  const mockError = new Error('Test error message')
  const mockReset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render error message correctly', () => {
    render(<ModuleManagementError error={mockError} reset={mockReset} />)

    // Verify error message is displayed
    expect(screen.getByText('Test error message')).toBeInTheDocument()

    // Verify title and description are displayed
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument()
    expect(
      screen.getByText(
        /Maaf, terjadi kesalahan saat menampilkan halaman manajemen modul/
      )
    ).toBeInTheDocument()
  })

  it('should call reset function when "Coba Lagi" button is clicked', () => {
    render(<ModuleManagementError error={mockError} reset={mockReset} />)

    // Click the "Coba Lagi" button
    fireEvent.click(screen.getByText('Coba Lagi'))

    // Verify reset function was called
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('should log error to console', () => {
    render(<ModuleManagementError error={mockError} reset={mockReset} />)

    // Verify console.error was called with the error
    expect(console.error).toHaveBeenCalledWith(
      'Module Management Error:',
      mockError
    )
  })

  it('should show "Unknown error occurred" when error has no message', () => {
    const errorWithoutMessage = new Error()
    render(
      <ModuleManagementError error={errorWithoutMessage} reset={mockReset} />
    )

    // Verify fallback message is displayed
    expect(screen.getByText('Unknown error occurred')).toBeInTheDocument()
  })
})
