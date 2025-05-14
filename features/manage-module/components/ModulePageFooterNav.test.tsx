import { render, screen, fireEvent } from '@testing-library/react'
import ModulePageFooterNav from './ModulePageFooterNav'

// Mock Button dari UI components jika diperlukan
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid="mock-button"
    >
      {children}
    </button>
  ),
}))

describe('ModulePageFooterNav', () => {
  const defaultProps = {
    currentPage: 2,
    totalPages: 5,
    onPrevious: jest.fn(),
    onNext: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with correct page information', () => {
    render(<ModulePageFooterNav {...defaultProps} />)

    // Verifikasi informasi halaman ditampilkan dengan benar
    expect(screen.getByText('Halaman 2 dari 5')).toBeInTheDocument()
  })

  it('should call onPrevious when previous button is clicked', () => {
    render(<ModulePageFooterNav {...defaultProps} />)

    // Cari tombol Previous dan klik
    const prevButton = screen.getByText('Halaman Sebelumnya').closest('button')
    fireEvent.click(prevButton)

    // Verifikasi fungsi onPrevious dipanggil
    expect(defaultProps.onPrevious).toHaveBeenCalledTimes(1)
  })

  it('should call onNext when next button is clicked', () => {
    render(<ModulePageFooterNav {...defaultProps} />)

    // Cari tombol Next dan klik
    const nextButton = screen.getByText('Halaman Berikutnya').closest('button')
    fireEvent.click(nextButton)

    // Verifikasi fungsi onNext dipanggil
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1)
  })

  it('should disable previous button on first page', () => {
    render(
      <ModulePageFooterNav {...defaultProps} currentPage={1} totalPages={5} />
    )

    // Cari tombol Previous dan verifikasi disabled
    const prevButtons = screen.getAllByTestId('mock-button')
    const prevButton = prevButtons.find((button) =>
      button.textContent.includes('Halaman Sebelumnya')
    )

    expect(prevButton).toHaveAttribute('disabled')
  })

  it('should disable next button on last page', () => {
    render(
      <ModulePageFooterNav {...defaultProps} currentPage={5} totalPages={5} />
    )

    // Cari tombol Next dan verifikasi disabled
    const nextButtons = screen.getAllByTestId('mock-button')
    const nextButton = nextButtons.find((button) =>
      button.textContent.includes('Halaman Berikutnya')
    )

    expect(nextButton).toHaveAttribute('disabled')
  })

  it('should enable both buttons when on middle page', () => {
    render(
      <ModulePageFooterNav {...defaultProps} currentPage={3} totalPages={5} />
    )

    // Cari kedua tombol dan verifikasi tidak disabled
    const buttons = screen.getAllByTestId('mock-button')

    const prevButton = buttons.find((button) =>
      button.textContent.includes('Halaman Sebelumnya')
    )
    const nextButton = buttons.find((button) =>
      button.textContent.includes('Halaman Berikutnya')
    )

    expect(prevButton).not.toHaveAttribute('disabled')
    expect(nextButton).not.toHaveAttribute('disabled')
  })
})
