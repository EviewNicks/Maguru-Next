import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ModuleTable } from '../../components/ModuleTable'
import { getModules } from '../../services/moduleClientService'
import { ModuleStatus } from '../../types'

/**
 * Mocking Axios dan MSW
 * Setup MSW untuk mock API calls di tests/integration
 */
jest.mock('../../services/moduleClientService')

// Mock ModuleFormModal agar tidak menampilkan modal dalam tes
jest.mock('../../componentsNew/ModuleFormModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>Mock Form Modal</div> : null,
}))

// Mock ErrorNotifier
jest.mock('../../componentsNew/ErrorNotifier', () => ({
  showErrorNotification: jest.fn(),
}))

// Sampel data untuk pengujian
const mockModules = {
  data: [
    {
      id: '1',
      title: 'HTML Pemula',
      description: 'Kelas pertama untuk masuk ke Programming Web Developer',
      status: ModuleStatus.DRAFT,
      createdAt: new Date('2025-05-09T07:02:43.474Z'),
      updatedAt: new Date('2025-05-09T07:02:43.474Z'),
      createdBy: 'user_123',
      updatedBy: 'user_123',
    },
    {
      id: '2',
      title: 'CSS Pemula',
      description:
        'Setelah mempelajari HTML, selanjutnya materi bagaimana cara mengubah sebuah text',
      status: ModuleStatus.DRAFT,
      createdAt: new Date('2025-05-09T07:01:14.091Z'),
      updatedAt: new Date('2025-05-09T07:01:14.091Z'),
      createdBy: 'user_123',
      updatedBy: 'user_123',
    },
    {
      id: '3',
      title: 'Javascript Pemula',
      description: 'Setelah kita belajar bagian tampilan website',
      status: ModuleStatus.ACTIVE,
      createdAt: new Date('2025-05-09T07:04:24.115Z'),
      updatedAt: new Date('2025-05-09T07:04:24.115Z'),
      createdBy: 'user_123',
      updatedBy: 'user_123',
    },
    {
      id: '4',
      title: 'HTML ES6',
      description: 'Materi lanjutan HTML',
      status: ModuleStatus.ARCHIVED,
      createdAt: new Date('2025-05-09T07:05:41.542Z'),
      updatedAt: new Date('2025-05-09T07:05:41.542Z'),
      createdBy: 'user_123',
      updatedBy: 'user_123',
    },
  ],
  meta: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 4,
  },
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  TestWrapper.displayName = 'TestQueryClientProvider'

  return TestWrapper
}

describe('Module Status Filter Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mocks before each test
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should fetch and display all modules initially', async () => {
    // Mock getModules to return all modules
    const mockGetModules = getModules as jest.MockedFunction<typeof getModules>
    mockGetModules.mockResolvedValueOnce({
      data: mockModules.data,
      meta: mockModules.meta,
    })

    render(<ModuleTable />, { wrapper: createWrapper() })

    // Verify that getModules was called correctly
    await waitFor(() => {
      expect(mockGetModules).toHaveBeenCalledWith(
        expect.objectContaining({
          status: undefined, // Expect status to be undefined for 'all'
        })
      )
    })

    // Verify all modules are displayed
    await waitFor(() => {
      expect(screen.getByText('HTML Pemula')).toBeInTheDocument()
      expect(screen.getByText('CSS Pemula')).toBeInTheDocument()
      expect(screen.getByText('Javascript Pemula')).toBeInTheDocument()
      expect(screen.getByText('HTML ES6')).toBeInTheDocument()
    })
  })

  it('should filter modules by ACTIVE status', async () => {
    // Mock getModules for initial call (all modules)
    const mockGetModules = getModules as jest.MockedFunction<typeof getModules>
    mockGetModules.mockResolvedValueOnce({
      data: mockModules.data,
      meta: mockModules.meta,
    })

    render(<ModuleTable />, { wrapper: createWrapper() })

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('HTML Pemula')).toBeInTheDocument()
    })

    // Mock the second call with filter
    mockGetModules.mockResolvedValueOnce({
      data: mockModules.data.filter((m) => m.status === ModuleStatus.ACTIVE),
      meta: {
        ...mockModules.meta,
        totalItems: 1,
      },
    })

    // Select ACTIVE filter
    const statusFilter = screen.getByText('Semua Status')
    fireEvent.click(statusFilter)
    const activeOption = screen.getByText('Aktif')
    fireEvent.click(activeOption)

    // Verify getModules was called with ACTIVE status
    await waitFor(() => {
      expect(mockGetModules).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ModuleStatus.ACTIVE,
        })
      )
    })

    // Verify only ACTIVE modules are displayed
    await waitFor(() => {
      expect(screen.getByText('Javascript Pemula')).toBeInTheDocument()
      expect(screen.queryByText('HTML Pemula')).not.toBeInTheDocument()
      expect(screen.queryByText('CSS Pemula')).not.toBeInTheDocument()
      expect(screen.queryByText('HTML ES6')).not.toBeInTheDocument()
    })
  })

  it('should filter modules by DRAFT status', async () => {
    // Mock getModules to return all modules initially
    const mockGetModules = getModules as jest.MockedFunction<typeof getModules>
    mockGetModules.mockResolvedValueOnce({
      data: mockModules.data,
      meta: mockModules.meta,
    })

    // Mock getModules to return only DRAFT modules on second call
    mockGetModules.mockResolvedValueOnce({
      data: mockModules.data.filter((m) => m.status === ModuleStatus.DRAFT),
      meta: {
        ...mockModules.meta,
        totalItems: 2,
      },
    })

    render(<ModuleTable />, { wrapper: createWrapper() })

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('HTML Pemula')).toBeInTheDocument()
    })

    // Change filter to 'Draft'
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Draft'))

    // Verify that getModules was called with correct status filter
    await waitFor(() => {
      expect(mockGetModules).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ModuleStatus.DRAFT,
        })
      )
    })

    // Verify only DRAFT modules are displayed and others are not
    await waitFor(() => {
      expect(screen.getByText('HTML Pemula')).toBeInTheDocument()
      expect(screen.getByText('CSS Pemula')).toBeInTheDocument()
      expect(screen.queryByText('Javascript Pemula')).not.toBeInTheDocument()
      expect(screen.queryByText('HTML ES6')).not.toBeInTheDocument()
    })
  })

  it('should filter modules by ARCHIVED status', async () => {
    // Mock getModules to return all modules initially
    const mockGetModules = getModules as jest.MockedFunction<typeof getModules>
    mockGetModules.mockResolvedValueOnce({
      data: mockModules.data,
      meta: mockModules.meta,
    })

    // Mock getModules to return only ARCHIVED modules on second call
    mockGetModules.mockResolvedValueOnce({
      data: mockModules.data.filter((m) => m.status === ModuleStatus.ARCHIVED),
      meta: {
        ...mockModules.meta,
        totalItems: 1,
      },
    })

    render(<ModuleTable />, { wrapper: createWrapper() })

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('HTML Pemula')).toBeInTheDocument()
    })

    // Change filter to 'Diarsipkan'
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Diarsipkan'))

    // Verify that getModules was called with correct status filter
    await waitFor(() => {
      expect(mockGetModules).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ModuleStatus.ARCHIVED,
        })
      )
    })

    // Verify only ARCHIVED modules are displayed and others are not
    await waitFor(() => {
      expect(screen.getByText('HTML ES6')).toBeInTheDocument()
      expect(screen.queryByText('HTML Pemula')).not.toBeInTheDocument()
      expect(screen.queryByText('CSS Pemula')).not.toBeInTheDocument()
      expect(screen.queryByText('Javascript Pemula')).not.toBeInTheDocument()
    })
  })

  it('should reset to all modules when filter is changed to "all"', async () => {
    // Mock getModules to return all modules initially
    const mockGetModules = getModules as jest.MockedFunction<typeof getModules>
    mockGetModules.mockResolvedValueOnce({
      data: mockModules.data,
      meta: mockModules.meta,
    })

    // Mock getModules to return only DRAFT modules on second call
    mockGetModules.mockResolvedValueOnce({
      data: mockModules.data.filter((m) => m.status === ModuleStatus.DRAFT),
      meta: {
        ...mockModules.meta,
        totalItems: 2,
      },
    })

    // Mock getModules to return all modules on third call
    mockGetModules.mockResolvedValueOnce({
      data: mockModules.data,
      meta: mockModules.meta,
    })

    render(<ModuleTable />, { wrapper: createWrapper() })

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('HTML Pemula')).toBeInTheDocument()
    })

    // Change filter to 'Draft'
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Draft'))

    // Verify only DRAFT modules are displayed
    await waitFor(() => {
      expect(mockGetModules).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ModuleStatus.DRAFT,
        })
      )
    })

    // Change filter back to 'Semua Status'
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Semua Status'))

    // Verify that getModules was called with undefined status (all)
    await waitFor(() => {
      expect(mockGetModules).toHaveBeenCalledWith(
        expect.objectContaining({
          status: undefined,
        })
      )
    })

    // Verify all modules are displayed again
    await waitFor(() => {
      expect(screen.getByText('HTML Pemula')).toBeInTheDocument()
      expect(screen.getByText('CSS Pemula')).toBeInTheDocument()
      expect(screen.getByText('Javascript Pemula')).toBeInTheDocument()
      expect(screen.getByText('HTML ES6')).toBeInTheDocument()
    })
  })
})
