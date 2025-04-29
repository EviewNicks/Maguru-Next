import { render, screen } from '@testing-library/react'
import { UserRoleCellNew } from './UserRoleCell'
import userEvent from '@testing-library/user-event'
import { User } from '@/types/user'

// Mock EditUserDialogNew component
jest.mock('./EditUserDialog', () => ({
  EditUserDialogNew: jest.fn(({ user, open, onOpenChange }) =>
    open ? (
      <div data-testid="mock-edit-dialog">
        <div>Editing: {user.name}</div>
        <div>Role: {user.role}</div>
        <button onClick={() => onOpenChange(false)}>Close Dialog</button>
      </div>
    ) : null
  ),
}))

describe('UserRoleCell', () => {
  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2023-01-15'),
  }

  const mockMahasiswaUser: User = {
    id: '2',
    name: 'Student',
    email: 'student@example.com',
    role: 'mahasiswa',
    status: 'active',
    createdAt: new Date('2023-02-20'),
  }

  it('renders admin badge correctly', () => {
    render(<UserRoleCellNew user={mockUser} />)

    // Verify badge text
    expect(screen.getByText('Admin')).toBeInTheDocument()

    // Verify badge styling for admin
    const badge = screen.getByText('Admin').closest('div')
    expect(badge).toHaveClass('bg-cyan-500/10')
    expect(badge).toHaveClass('text-cyan-400')
    expect(badge).toHaveClass('border-cyan-500/30')
  })

  it('renders mahasiswa badge correctly', () => {
    render(<UserRoleCellNew user={mockMahasiswaUser} />)

    // Verify badge text
    expect(screen.getByText('Mahasiswa')).toBeInTheDocument()

    // Verify badge styling for mahasiswa
    const badge = screen.getByText('Mahasiswa').closest('div')
    expect(badge).toHaveClass('bg-blue-500/10')
    expect(badge).toHaveClass('text-blue-400')
    expect(badge).toHaveClass('border-blue-500/30')
  })

  it('opens edit dialog when badge is clicked', async () => {
    const user = userEvent.setup()
    render(<UserRoleCellNew user={mockUser} />)

    // Click on the badge
    const button = screen.getByRole('button')
    await user.click(button)

    // Verify dialog is opened
    expect(screen.getByTestId('mock-edit-dialog')).toBeInTheDocument()
    expect(screen.getByText('Editing: Test User')).toBeInTheDocument()
  })

  it('closes edit dialog when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<UserRoleCellNew user={mockUser} />)

    // Open the dialog
    const button = screen.getByRole('button')
    await user.click(button)

    // Verify dialog is opened
    expect(screen.getByTestId('mock-edit-dialog')).toBeInTheDocument()

    // Close the dialog
    const closeButton = screen.getByText('Close Dialog')
    await user.click(closeButton)

    // Verify dialog is closed
    expect(screen.queryByTestId('mock-edit-dialog')).not.toBeInTheDocument()
  })

  it('handles missing user data gracefully', () => {
    // Testing with invalid input
    render(<UserRoleCellNew user={null as unknown as User} />)

    // Should default to showing Mahasiswa
    expect(screen.getByText('Mahasiswa')).toBeInTheDocument()
  })

  it('handles invalid role data gracefully', () => {
    const invalidRoleUser = {
      ...mockUser,
      role: 'invalid-role' as 'admin' | 'mahasiswa',
    }

    render(<UserRoleCellNew user={invalidRoleUser} />)

    // Should default to showing Mahasiswa
    expect(screen.getByText('Mahasiswa')).toBeInTheDocument()
  })

  it('has correct icon for each role', () => {
    const { rerender } = render(<UserRoleCellNew user={mockUser} />)

    // Admin should have Shield icon
    let svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()

    // Rerender with mahasiswa user
    rerender(<UserRoleCellNew user={mockMahasiswaUser} />)

    // Mahasiswa should have User icon
    svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should render admin badge with correct icon and text', () => {
    const adminUser: User = {
      ...mockUser,
      role: 'admin',
    }
    render(<UserRoleCellNew user={adminUser} />)

    // Verify icon and text
    expect(screen.getByText('Admin')).toBeInTheDocument()
    const shieldIcon = document.querySelector('.lucide-shield')
    expect(shieldIcon).toBeInTheDocument()
  })

  it('should render mahasiswa badge with correct icon and text', () => {
    const studentUser: User = {
      ...mockUser,
      role: 'mahasiswa',
    }
    render(<UserRoleCellNew user={studentUser} />)

    // Verify icon and text
    expect(screen.getByText('Mahasiswa')).toBeInTheDocument()
    const userIcon = document.querySelector('.lucide-user')
    expect(userIcon).toBeInTheDocument()
  })

  it('should handle uppercase role values', () => {
    // TypeScript akan memperlakukan ini sebagai string yang tidak valid untuk Union Type
    // tetapi kita tahu bahwa komponen akan menanganinya sebagai 'mahasiswa'
    const uppercaseRoleUser = {
      ...mockUser,
      role: 'ADMIN',
    }
    render(<UserRoleCellNew user={uppercaseRoleUser} />)

    // Should default to showing Mahasiswa since role isn't recognized (case sensitive)
    expect(screen.getByText('Mahasiswa')).toBeInTheDocument()
  })

  it('should handle empty role value', () => {
    const emptyRoleUser = {
      ...mockUser,
      role: '',
    }
    render(<UserRoleCellNew user={emptyRoleUser} />)

    // Should default to showing Mahasiswa
    expect(screen.getByText('Mahasiswa')).toBeInTheDocument()
  })
})
