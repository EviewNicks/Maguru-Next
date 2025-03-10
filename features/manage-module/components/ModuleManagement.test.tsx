// features/manage-module/components/ModuleManagement.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModuleManagement } from './ModuleManagement'
import { useModules } from '../hooks/useModules'

// Mock hooks
jest.mock('../hooks/useModules', () => ({
  useModules: jest.fn()
}))

describe('ModuleManagement', () => {
  beforeEach(() => {
    (useModules as jest.Mock).mockReturnValue({
      data: {
        modules: [],
        pagination: {
          count: 0,
          hasMore: false,
          nextCursor: undefined
        }
      },
      isLoading: false,
      isError: false
    })
  })
  
  it('renders the component with filter and add button', () => {
    render(<ModuleManagement />)
    
    expect(screen.getByText('Tambah Modul')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tambah modul/i })).toBeInTheDocument()
  })
  
  it('opens the form modal when add button is clicked', async () => {
    render(<ModuleManagement />)
    
    await userEvent.click(screen.getByRole('button', { name: /tambah modul/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Tambah Modul Baru')).toBeInTheDocument()
    })
  })
})