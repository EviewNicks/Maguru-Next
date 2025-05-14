import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShortcutHelp from './ShortcutHelp'
// Import necesitas komponen yang diuji

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  key: jest.fn(),
  length: 0,
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('ShortcutHelp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the dialog when isOpen is true', () => {
    render(<ShortcutHelp isOpen={true} onClose={() => {}} />)

    expect(screen.getByText('Shortcut Keyboard')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Gunakan shortcut keyboard untuk meningkatkan produktivitas dalam editor.'
      )
    ).toBeInTheDocument()
  })

  it('does not render the dialog when isOpen is false', () => {
    render(<ShortcutHelp isOpen={false} onClose={() => {}} />)

    expect(screen.queryByText('Shortcut Keyboard')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnClose = jest.fn()
    render(<ShortcutHelp isOpen={true} onClose={mockOnClose} />)

    const closeButton = screen.getByRole('button', { name: /tutup/i })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('filters shortcuts based on search query', async () => {
    const user = userEvent.setup()
    render(<ShortcutHelp isOpen={true} onClose={() => {}} />)

    // Filter untuk shortcut "bold"
    const searchInput = screen.getByPlaceholderText('Cari shortcut...')
    await user.type(searchInput, 'bold')

    // Pastikan shortcut bold ada dalam hasil
    expect(screen.getByText('Format teks menjadi bold')).toBeInTheDocument()

    // Clear search
    const clearButton = screen.getByRole('button', { name: 'Hapus pencarian' })
    await user.click(clearButton)
  })

  it('filters shortcuts based on category tab', async () => {
    const user = userEvent.setup()
    render(<ShortcutHelp isOpen={true} onClose={() => {}} />)

    // Pilih tab navigasi
    const navigationTab = screen.getByRole('tab', { name: /navigasi/i })
    await user.click(navigationTab)

    // Pastikan shortcut navigasi ada dalam hasil
    expect(
      screen.getByText('Navigasi ke halaman sebelumnya dalam modul')
    ).toBeInTheDocument()

    // Pilih tab editing
    const editingTab = screen.getByRole('tab', { name: /editing/i })
    await user.click(editingTab)

    // Pastikan shortcut editing ada dalam hasil
    expect(screen.getByText('Format teks menjadi bold')).toBeInTheDocument()
  })

  it('saves preference to localStorage when "dont show again" is checked', async () => {
    const user = userEvent.setup()
    render(<ShortcutHelp isOpen={true} onClose={() => {}} />)

    const checkbox = screen.getByLabelText('Jangan tampilkan lagi')
    await user.click(checkbox)

    // Check bahwa localStorage diset
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'shortcutHelpDontShow',
      'true'
    )
  })
})
