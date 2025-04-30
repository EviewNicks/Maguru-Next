import { render, screen } from '@testing-library/react'
import { UserActionCellNew } from './UserActionCell'
import userEvent from '@testing-library/user-event'
import { User } from '@/types/user'

// Mock untuk store dan action
const mockDispatch = jest.fn(() => Promise.resolve())
const mockOpenModal = jest.fn()
const mockDeleteUser = jest.fn()
const mockUnwrap = jest.fn(() => Promise.resolve())
const mockToast = jest.fn()

// Setup mocks
jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/store/features/modalSlice', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    openModal: (payload: any) => ({ type: 'modal/openModal', payload }),
  }
})

jest.mock('@/store/features/userSlice', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deleteUser: (id: any) => ({ type: 'user/deleteUser', payload: id }),
  }
})

jest.mock('@/hooks/use-toast', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: (args: any) => mockToast(args),
}))

describe('UserActionCell', () => {
  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2023-01-15'),
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup dispatch untuk memanggil mockOpenModal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockDispatch.mockImplementation((action: any ) => {
      if (action.type === 'modal/openModal') {
        mockOpenModal(action.payload)
        return Promise.resolve()
      }
      if (action.type === 'user/deleteUser') {
        mockDeleteUser(action.payload)
        return { unwrap: mockUnwrap }
      }
      return Promise.resolve()
    })
  })

  it('renders the delete button', () => {
    render(<UserActionCellNew user={mockUser} />)

    // Verify delete button is rendered
    const deleteButton = screen.getByRole('button')
    expect(deleteButton).toBeInTheDocument()

    // Verify Trash2 icon classes
    const icon = deleteButton.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('opens confirmation modal when delete button is clicked', async () => {
    const user = userEvent.setup()

    render(<UserActionCellNew user={mockUser} />)

    // Click the delete button
    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    // Verify openModal is called with correct message
    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Konfirmasi Hapus',
        message: expect.stringContaining('Test User'),
      })
    )
  })

  it('calls deleteUser when modal confirmation is triggered', async () => {
    const user = userEvent.setup()

    render(<UserActionCellNew user={mockUser} />)

    // Click the delete button
    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    // Extract the onConfirm callback from the openModal call
    const modalConfig = mockOpenModal.mock.calls[0][0]
    const { onConfirm } = modalConfig

    // Trigger the onConfirm callback
    await onConfirm()

    // Verify deleteUser is called with correct ID
    expect(mockDeleteUser).toHaveBeenCalledWith('1')
  })

  it('shows success toast when delete is successful', async () => {
    const user = userEvent.setup()

    render(<UserActionCellNew user={mockUser} />)

    // Click the delete button
    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    // Extract the onConfirm callback from the openModal call
    const modalConfig = mockOpenModal.mock.calls[0][0]
    const { onConfirm } = modalConfig

    // Trigger the onConfirm callback
    await onConfirm()

    // Verify success toast is shown
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Success',
        description: 'User deleted successfully',
      })
    )
  })

  it('shows error toast when delete fails', async () => {
    const user = userEvent.setup()

    // Mock the unwrap function to throw an error
    mockUnwrap.mockRejectedValueOnce('Error')

    render(<UserActionCellNew user={mockUser} />)

    // Click the delete button
    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)

    // Extract the onConfirm callback from the openModal call
    const modalConfig = mockOpenModal.mock.calls[0][0]
    const { onConfirm } = modalConfig

    // Trigger the onConfirm callback
    await onConfirm()

    // Verify error toast is shown
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      })
    )
  })

  it('applies correct styling to delete button', () => {
    render(<UserActionCellNew user={mockUser} />)

    const button = screen.getByRole('button')

    // Verify styling classes
    expect(button).toHaveClass('text-red-400')
    expect(button).toHaveClass('hover:text-red-300')
    expect(button).toHaveClass('hover:bg-red-500/10')
  })
})
