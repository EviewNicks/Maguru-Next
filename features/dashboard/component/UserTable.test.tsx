import { render, screen, waitFor } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UsersPage from '@/features/dashboard/component/UserTable'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import userReducer from '@/store/features/userSlice'
import modalReducer, { openModal } from '@/store/features/modalSlice'
import { User } from '@/types/user'

// Mock fetch globally
global.fetch = jest.fn()

// Mock child components
jest.mock('./UserTable/DataTable', () => ({
  DataTable: ({ data, isLoading }: { data: User[]; isLoading: boolean }) => (
    <div data-testid="data-table">
      {isLoading ? (
        'Loading...'
      ) : (
        <div>
          {data?.map((user) => (
            <div key={user.id} data-testid="user-row">
              <span>{user.name}</span>
              <button
                data-testid="role-button"
                onClick={() => {
                  const event = new CustomEvent('edit-role', { detail: user })
                  window.dispatchEvent(event)
                }}
              >
                {user.role}
              </button>
              <button
                data-testid="delete-button"
                onClick={() => {
                  const event = new CustomEvent('delete-user', { detail: user })
                  window.dispatchEvent(event)
                  // Trigger modal open
                  ;(window as any).store?.dispatch(
                    openModal({
                      title: 'Konfirmasi Hapus',
                      message: `Apakah Anda yakin ingin menghapus ${user.name}?`,
                      onConfirm: () => {},
                    })
                  )
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  ),
}))

// Mock dialog components
jest.mock('@/components/ui/dialog', () => {
  let dialogOpen = false
  let onOpenChange = (open: boolean) => {
    dialogOpen = open
  }

  return {
    Dialog: ({
      children,
      open,
      onOpenChange: onChange,
    }: {
      children: React.ReactNode
      open: boolean
      onOpenChange: (open: boolean) => void
    }) => {
      dialogOpen = open
      onOpenChange = onChange
      return dialogOpen ? <div data-testid="dialog">{children}</div> : null
    },
    DialogContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-content">{children}</div>
    ),
    DialogHeader: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-header">{children}</div>
    ),
    DialogTitle: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-title">{children}</div>
    ),
    DialogDescription: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-description">{children}</div>
    ),
    DialogFooter: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dialog-footer">{children}</div>
    ),
  }
})

// Mock select component
jest.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    onValueChange,
  }: {
    children: React.ReactNode
    onValueChange: (value: string) => void
  }) => (
    <div data-testid="select">
      {children}
      <select
        data-testid="select-input"
        onChange={(e) => onValueChange(e.target.value)}
      >
        <option value="admin">Admin</option>
        <option value="dosen">Dosen</option>
        <option value="mahasiswa">Mahasiswa</option>
      </select>
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="select-trigger">{children}</button>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode
    value: string
  }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
}))

// Mock EditUserDialog
jest.mock('./UserTable/EditUserDialog', () => ({
  EditUserDialog: ({
    user,
    open,
    onOpenChange,
  }: {
    user: User
    open: boolean
    onOpenChange: (open: boolean) => void
  }) => {
    // Listen for edit-role event
    React.useEffect(() => {
      const handleEditRole = (event: CustomEvent<User>) => {
        if (event.detail.id === user.id) {
          onOpenChange(true)
        }
      }
      window.addEventListener('edit-role', handleEditRole as EventListener)
      return () => {
        window.removeEventListener('edit-role', handleEditRole as EventListener)
      }
    }, [user.id, onOpenChange])

    return open ? (
      <div data-testid="edit-dialog">
        <div data-testid="dialog-title">Edit User</div>
        <select
          data-testid="role-select"
          onChange={(e) => {
            onOpenChange(false)
            window.dispatchEvent(
              new CustomEvent('role-updated', {
                detail: { userId: user.id, role: e.target.value },
              })
            )
          }}
        >
          <option value="admin">Admin</option>
          <option value="dosen">Dosen</option>
          <option value="mahasiswa">Mahasiswa</option>
        </select>
        <button onClick={() => onOpenChange(false)}>Cancel</button>
        <button
          onClick={() => {
            onOpenChange(false)
            window.dispatchEvent(
              new CustomEvent('role-updated', {
                detail: { userId: user.id, role: 'admin' },
              })
            )
          }}
        >
          Save changes
        </button>
      </div>
    ) : null
  },
}))

// Mock GlobalModal
jest.mock('@/components/layouts/GlobalModal', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => {
    const modalState = (window as any).modalState || {
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
    }
    return modalState.isOpen ? (
      <div data-testid="dialog">
        <div data-testid="dialog-title">{modalState.title}</div>
        <div data-testid="dialog-content">{modalState.message}</div>
        <button data-testid="dialog-confirm" onClick={modalState.onConfirm}>
          Delete
        </button>
      </div>
    ) : null
  },
}))

// Setup test data
const mockUsers = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'mahasiswa' as const,
    status: 'active' as const,
    createdAt: '2024-02-17T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as const,
    status: 'active' as const,
    createdAt: '2024-02-16T00:00:00.000Z',
  },
]

// Setup test utilities
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  const store = configureStore({
    reducer: {
      users: userReducer,
      modal: modalReducer,
    },
    preloadedState: {
      users: {
        data: mockUsers,
      },
      modal: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
      },
    },
  })

  // Set global references for testing
  ;(window as any).modalState = store.getState().modal
  ;(window as any).store = store

  store.subscribe(() => {
    ;(window as any).modalState = store.getState().modal
  })

  return {
    store,
    ...render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </Provider>
    ),
  }
}

describe('UsersPage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    delete (window as any).modalState
    delete (window as any).store
  })

  it('shows loading state initially', async () => {
    // Setup fetch mock to never resolve
    ;(fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    renderWithProviders(<UsersPage />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state when fetch fails', async () => {
    // Setup fetch mock to reject
    const errorMessage = 'Failed to fetch users'
    ;(fetch as jest.Mock).mockRejectedValue(new Error(errorMessage))

    renderWithProviders(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument()
    })
  })

  it('renders users data successfully', async () => {
    // Setup fetch mock to resolve with mock data
    ;(fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ users: mockUsers }),
    })

    renderWithProviders(<UsersPage />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Verify title is rendered
    expect(screen.getByText('Daftar Pengguna')).toBeInTheDocument()

    // Verify DataTable is rendered with correct props
    const dataTable = screen.getByTestId('data-table')
    expect(dataTable).toBeInTheDocument()

    // Verify user rows are rendered
    const userRows = screen.getAllByTestId('user-row')
    expect(userRows).toHaveLength(mockUsers.length)
    expect(userRows[0]).toHaveTextContent(mockUsers[0].name)
    expect(userRows[1]).toHaveTextContent(mockUsers[1].name)
  })

  it('handles empty data', async () => {
    // Setup fetch mock to resolve with empty data
    ;(fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ users: [] }),
    })

    renderWithProviders(<UsersPage />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const dataTable = screen.getByTestId('data-table')
    expect(dataTable).toBeInTheDocument()
    expect(screen.queryByTestId('user-row')).not.toBeInTheDocument()
  })

  it('handles malformed response data', async () => {
    // Setup fetch mock to resolve with invalid data
    ;(fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({}),
    })

    renderWithProviders(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument()
    })
  })

  describe('User Role Updates', () => {
    it('opens edit dialog when clicking role button', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ users: mockUsers }),
      })

      renderWithProviders(<UsersPage />)

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })

      // Click role button
      const roleButton = screen.getAllByTestId('role-button')[0]
      fireEvent.click(roleButton)

      // Verify dialog opens
      await waitFor(() => {
        expect(screen.getByTestId('edit-dialog')).toBeInTheDocument()
        expect(screen.getByTestId('dialog-title')).toHaveTextContent(
          'Edit User'
        )
      })
    })

    it('handles role update through dialog', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ users: mockUsers }),
      })

      renderWithProviders(<UsersPage />)

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })

      // Open dialog
      const roleButton = screen.getAllByTestId('role-button')[0]
      fireEvent.click(roleButton)

      // Change role
      const roleSelect = screen.getByTestId('role-select')
      fireEvent.change(roleSelect, { target: { value: 'admin' } })

      // Mock successful update
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
      })

      // Verify role is updated
      await waitFor(() => {
        expect(screen.queryByText('mahasiswa')).not.toBeInTheDocument()
      })
    })
  })

  describe('User Deletion', () => {
    it('opens confirmation modal when clicking delete', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ users: mockUsers }),
      })

      const { store } = renderWithProviders(<UsersPage />)

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })

      // Click delete button
      const deleteButton = screen.getAllByTestId('delete-button')[0]
      fireEvent.click(deleteButton)

      // Verify confirmation dialog opens
      await waitFor(() => {
        const modalState = store.getState().modal
        expect(modalState.isOpen).toBe(true)
        expect(modalState.title).toBe('Konfirmasi Hapus')
        expect(screen.getByTestId('dialog')).toBeInTheDocument()
        expect(screen.getByTestId('dialog-title')).toHaveTextContent(
          'Konfirmasi Hapus'
        )
      })
    })

    it('handles user deletion', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ users: mockUsers }),
      })

      const { store } = renderWithProviders(<UsersPage />)

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })

      // Click delete button
      const deleteButton = screen.getAllByTestId('delete-button')[0]
      fireEvent.click(deleteButton)

      // Mock successful deletion
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
      })

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByTestId('dialog-confirm')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('dialog-confirm'))

      // Verify user is removed
      await waitFor(() => {
        const userRows = screen.getAllByTestId('user-row')
        expect(userRows).toHaveLength(mockUsers.length - 1)
      })
    })
  })
})
