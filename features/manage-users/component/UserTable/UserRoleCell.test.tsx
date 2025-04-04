import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import UserRoleCell from './UserRoleCell'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import userReducer from '@/store/features/userSlice'
import type { User } from '@/types/user'
import type { ToastProps } from '@/components/ui/toast'

// Mock toast
const mockToast = jest.fn()
jest.mock('@/hooks/use-toast', () => ({
  toast: (args: ToastProps) => mockToast(args),
}))

// Mock EditUserDialog
jest.mock('./EditUserDialog', () => ({
  EditUserDialog: ({
    open,
    onOpenChange,
    user,
  }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User
  }) =>
    open ? (
      <div data-testid="edit-dialog">
        <div>Edit {user.name}</div>
        <button onClick={() => onOpenChange(false)}>Close</button>
        <button
          data-testid="save-button"
          onClick={() => {
            onOpenChange(false)
            // Trigger handleUpdateUser
            const event = new CustomEvent('update-user', {
              detail: { userId: user.id, role: 'admin', status: user.status },
            })
            window.dispatchEvent(event)
          }}
        >
          Save
        </button>
      </div>
    ) : null,
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Check: () => (
    <div
      data-testid="check-icon"
      className="h-4 w-4 text-green-500 opacity-100 transition-opacity"
    />
  ),
  ChevronDown: () => (
    <div
      data-testid="chevron-down-icon"
      className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
    />
  ),
}))

// Mock UI components
jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode
    onClick?: () => void
    className?: string
  }) => (
    <button data-testid="role-button" onClick={onClick} className={className}>
      {children}
    </button>
  ),
}))

describe('UserRoleCell', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'mahasiswa' as const,
    status: 'active' as const,
    createdAt: '2024-02-17T00:00:00.000Z',
  }

  const mockAdminUser = {
    ...mockUser,
    role: 'admin' as const,
  }

  const renderWithRedux = (component: React.ReactElement) => {
    const store = configureStore({
      reducer: {
        users: userReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    })

    return {
      store,
      ...render(<Provider store={store}>{component}</Provider>),
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders user role correctly', () => {
    renderWithRedux(<UserRoleCell user={mockUser} />)
    expect(screen.getByText(mockUser.role)).toBeInTheDocument()
  })

  it('shows tooltip content', () => {
    renderWithRedux(<UserRoleCell user={mockUser} />)
    expect(screen.getByText('Click to change role')).toBeInTheDocument()
  })

  it('opens edit dialog when clicking role button', () => {
    renderWithRedux(<UserRoleCell user={mockUser} />)

    const button = screen.getByTestId('role-button')
    fireEvent.click(button)

    expect(screen.getByTestId('edit-dialog')).toBeInTheDocument()
    expect(screen.getByText(`Edit ${mockUser.name}`)).toBeInTheDocument()
  })

  it('shows check icon for admin users', () => {
    renderWithRedux(<UserRoleCell user={mockAdminUser} />)
    expect(screen.getByTestId('check-icon')).toBeInTheDocument()
  })

  it('does not show check icon for non-admin users', () => {
    renderWithRedux(<UserRoleCell user={mockUser} />)
    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument()
  })

  it('shows chevron down icon with correct styling', () => {
    renderWithRedux(<UserRoleCell user={mockUser} />)
    const chevronIcon = screen.getByTestId('chevron-down-icon')
    expect(chevronIcon).toBeInTheDocument()
    expect(chevronIcon).toHaveClass(
      'h-4',
      'w-4',
      'opacity-0',
      'group-hover:opacity-100',
      'transition-opacity'
    )
  })

  it('handles successful role update', async () => {
    const { store } = renderWithRedux(<UserRoleCell user={mockUser} />)

    // Mock successful update
    const mockDispatch = jest.fn().mockResolvedValue({
      payload: { id: mockUser.id, role: 'admin' },
      unwrap: () => Promise.resolve({ id: mockUser.id, role: 'admin' }),
    })
    store.dispatch = mockDispatch

    // Add event listener for update-user event
    const handleUpdateUser = jest.fn(async (event: CustomEvent) => {
      const { userId, role, status } = event.detail
      await store.dispatch({
        type: 'users/updateUser/fulfilled',
        payload: { id: userId, role, status },
        meta: { arg: { id: userId, role, status } },
      })
    })
    window.addEventListener('update-user', handleUpdateUser as EventListener)

    // Open dialog
    const button = screen.getByTestId('role-button')
    fireEvent.click(button)

    // Click save button to trigger update
    const saveButton = screen.getByTestId('save-button')
    await act(async () => {
      fireEvent.click(saveButton)
    })

    // Verify toast was called
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'User role updated successfully',
    })

    // Clean up
    window.removeEventListener('update-user', handleUpdateUser as EventListener)
  })

  it('handles failed role update', async () => {
    const { store } = renderWithRedux(<UserRoleCell user={mockUser} />)

    // Mock failed update
    const mockDispatch = jest.fn().mockRejectedValue(new Error('Update failed'))
    store.dispatch = mockDispatch

    // Add event listener for update-user event
    const handleUpdateUser = jest.fn(async (event: CustomEvent) => {
      const { userId, role, status } = event.detail
      try {
        await store.dispatch({
          type: 'users/updateUser/rejected',
          error: new Error('Update failed'),
          meta: { arg: { id: userId, role, status } },
        })
      } catch (error) {
        // Error is expected
      }
    })
    window.addEventListener('update-user', handleUpdateUser as EventListener)

    // Open dialog
    const button = screen.getByTestId('role-button')
    fireEvent.click(button)

    // Click save button to trigger update
    const saveButton = screen.getByTestId('save-button')
    await act(async () => {
      fireEvent.click(saveButton)
    })

    // Verify toast was called with error message
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to update user role',
      variant: 'destructive',
    })

    // Clean up
    window.removeEventListener('update-user', handleUpdateUser as EventListener)
  })
})
