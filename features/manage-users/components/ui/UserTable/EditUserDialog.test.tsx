import { render, screen, waitFor } from '@testing-library/react'
import { EditUserDialogNew } from './EditUserDialog'
import userEvent from '@testing-library/user-event'
import { User } from '@/types/user'
import { useUserActions } from '@/hooks/useUserActions'

// Mock fungsi console.error
console.error = jest.fn()

// Mock the useUserActions hook
const mockMutateAsync = jest.fn(() => Promise.resolve({}))
jest.mock('@/hooks/useUserActions', () => ({
  useUserActions: jest.fn(() => ({
    updateUser: {
      mutateAsync: mockMutateAsync,
      isPending: false,
    },
  })),
}))

// Mock dialog components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode
    open: boolean
  }) => {
    if (!open) return null
    return <div data-testid="dialog">{children}</div>
  },
  DialogContent: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="dialog-title" className={className}>
      {children}
    </div>
  ),
  DialogDescription: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="dialog-description" className={className}>
      {children}
    </div>
  ),
  DialogFooter: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
  ),
}))

// Mock select components
jest.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode
    value: string
    onValueChange: (value: string) => void
  }) => (
    <div data-testid="select" data-value={value}>
      {children}
      {value === 'admin' || value === 'mahasiswa' ? (
        <button
          onClick={() => onValueChange('mahasiswa')}
          data-testid="change-role-btn-role"
        >
          Change to Mahasiswa
        </button>
      ) : (
        <button
          onClick={() => onValueChange('inactive')}
          data-testid="change-status-btn-status"
        >
          Change to Inactive
        </button>
      )}
    </div>
  ),
  SelectTrigger: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  ),
  SelectValue: ({
    children,
    placeholder,
  }: {
    children: React.ReactNode
    placeholder?: string
  }) => (
    <div data-testid="select-value" data-placeholder={placeholder}>
      {children}
    </div>
  ),
  SelectContent: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="select-content" className={className}>
      {children}
    </div>
  ),
  SelectItem: ({
    children,
    value,
    className,
  }: {
    children: React.ReactNode
    value: string
    className?: string
  }) => (
    <div data-testid={`select-item-${value}`} className={className}>
      {children}
    </div>
  ),
}))

// Mock button component
jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    className,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
    className?: string
  }) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
}))

describe('EditUserDialog', () => {
  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-20'),
  }

  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the dialog with user information when open', () => {
    render(
      <EditUserDialogNew
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Verifikasi dialog ditampilkan
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
    expect(screen.getByText('Edit User')).toBeInTheDocument()

    // Verifikasi user info ditampilkan
    expect(
      screen.getByText(/Update role dan status untuk Test User/i)
    ).toBeInTheDocument()

    // Verifikasi select untuk role dan status ada
    expect(screen.getAllByTestId('select')).toHaveLength(2)
  })

  it('does not render dialog when open is false', () => {
    render(
      <EditUserDialogNew
        user={mockUser}
        open={false}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Dialog seharusnya tidak ditampilkan
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  it('updates role when select value changes', async () => {
    const user = userEvent.setup()

    render(
      <EditUserDialogNew
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Ubah nilai role menjadi mahasiswa
    await user.click(screen.getByTestId('change-role-btn-role'))

    // Verifikasi bahwa role berubah (pengubahan state internal)
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Verifikasi bahwa updateUser dipanggil dengan role yang benar
    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: '1',
      role: 'mahasiswa',
      status: 'active',
      lastKnownUpdate: mockUser.updatedAt,
    })
  })

  it('updates status when select value changes', async () => {
    const user = userEvent.setup()

    render(
      <EditUserDialogNew
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Ubah nilai status menjadi inactive
    await user.click(screen.getByTestId('change-status-btn-status'))

    // Klik save untuk mengirim perubahan
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Verifikasi bahwa updateUser dipanggil dengan status yang benar
    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: '1',
      role: 'admin',
      status: 'inactive',
      lastKnownUpdate: mockUser.updatedAt,
    })
  })

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <EditUserDialogNew
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Klik tombol cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    // Verifikasi bahwa onOpenChange dipanggil dengan false
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('handles form submission successfully', async () => {
    const user = userEvent.setup()

    render(
      <EditUserDialogNew
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Klik tombol save
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Verifikasi bahwa updateUser dipanggil dengan data yang benar
    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: '1',
      role: 'admin',
      status: 'active',
      lastKnownUpdate: mockUser.updatedAt,
    })

    // Verifikasi bahwa dialog ditutup setelah submit berhasil
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('handles form submission error', async () => {
    const user = userEvent.setup()

    // Mock updateUser untuk mengembalikan error
    mockMutateAsync.mockRejectedValueOnce(new Error('Failed to update'))

    render(
      <EditUserDialogNew
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Klik tombol save
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Verifikasi bahwa error di-handle (ditangkap di konsol)
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled()
    })

    // Dialog tidak ditutup ketika ada error
    expect(mockOnOpenChange).not.toHaveBeenCalled()
  })

  it('shows loading state when updating', async () => {
    // Mock updateUser dengan isPending = true
    ;(useUserActions as jest.Mock).mockReturnValueOnce({
      updateUser: {
        mutateAsync: jest.fn().mockResolvedValueOnce({}),
        isPending: true,
      },
    })

    render(
      <EditUserDialogNew
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Verifikasi bahwa tombol save menampilkan "Saving..."
    expect(screen.getByText('Saving...')).toBeInTheDocument()

    // Tombol save dan cancel seharusnya disabled
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })

  it('defaults to valid role for user with invalid role', () => {
    const invalidRoleUser = {
      ...mockUser,
      role: 'invalid-role' as User['role'],
    }

    render(
      <EditUserDialogNew
        user={invalidRoleUser}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Verifikasi bahwa role default ke 'mahasiswa'
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    saveButton.click()

    // Cek secara langsung bahwa role adalah 'mahasiswa' (melalui select data-value)
    expect(screen.getAllByTestId('select')[0]).toHaveAttribute(
      'data-value',
      'mahasiswa'
    )
  })

  it('defaults to valid status for user with null status', () => {
    const nullStatusUser = {
      ...mockUser,
      status: null as unknown as User['status'],
    }

    render(
      <EditUserDialogNew
        user={nullStatusUser}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    )

    // Verifikasi bahwa status default ke 'active'
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    saveButton.click()

    // Cek secara langsung bahwa status adalah 'active' (melalui select data-value)
    expect(screen.getAllByTestId('select')[1]).toHaveAttribute(
      'data-value',
      'active'
    )
  })
})
