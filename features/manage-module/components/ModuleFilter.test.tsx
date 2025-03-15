import { render, screen, fireEvent} from '@testing-library/react'
import { ModuleFilter } from './ModuleFilter'
import { ModuleStatus } from '../types'

// Mock useDebounce hook
jest.mock('../hooks/useDebounce', () => ({
  useDebounce: jest.fn((value) => value) // Tidak ada debounce dalam test
}))

describe('ModuleFilter', () => {
  const mockOnFilterChange = jest.fn()
  const defaultFilter = {
    status: undefined,
    search: '',
    limit: 10,
    cursor: undefined
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the search input and status filter', () => {
    render(
      <ModuleFilter
        filter={defaultFilter}
        onFilterChange={mockOnFilterChange}
      />
    )

    expect(screen.getByPlaceholderText('Cari modul...')).toBeInTheDocument()
    expect(screen.getByText('Semua Status')).toBeInTheDocument()
  })

  it('updates search filter when input changes', async () => {
    render(
      <ModuleFilter
        filter={defaultFilter}
        onFilterChange={mockOnFilterChange}
      />
    )

    const searchInput = screen.getByPlaceholderText('Cari modul...')
    
    // Simulate typing in search input
    fireEvent.change(searchInput, { target: { value: 'matematika' } })
    
    // Since we mocked useDebounce to return immediately, we can check right away
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...defaultFilter,
      search: 'matematika',
      cursor: undefined
    })
  })

  it('updates status filter when selection changes', async () => {
    render(
      <ModuleFilter
        filter={defaultFilter}
        onFilterChange={mockOnFilterChange}
      />
    )

    // Open the select dropdown
    fireEvent.click(screen.getByRole('combobox'))
    
    // Select "Aktif" option
    fireEvent.click(screen.getByText('Aktif'))
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...defaultFilter,
      status: ModuleStatus.ACTIVE,
      cursor: undefined
    })
  })

  it('resets status filter when "Semua Status" is selected', async () => {
    // Start with ACTIVE status filter
    render(
      <ModuleFilter
        filter={{
          ...defaultFilter,
          status: ModuleStatus.ACTIVE
        }}
        onFilterChange={mockOnFilterChange}
      />
    )

    // Open the select dropdown
    fireEvent.click(screen.getByRole('combobox'))
    
    // Select "Semua Status" option
    fireEvent.click(screen.getByText('Semua Status'))
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...defaultFilter,
      status: 'ALL',
      cursor: undefined
    })
  })
})
