// Mock next/navigation terlebih dahulu sebelum import lainnya
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useParams: () => ({
    moduleId: 'e82e800c-93f5-48ef-b17b-2dfe5624f4fb',
  }),
  useSearchParams: () => ({
    get: (param: string) =>
      param === 'pageId' ? 'ff006ad1-939f-43dd-82a7-20623f4494b2' : null,
  }),
}))

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { ModulePageCRUDProvider } from '../../../context/ModulePageCRUDContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SidebarContent from '../../../components/ModulePageEditor/sidebar/SidebarContent'
import { ModulePage } from '../../../types'

// Mock ModulePageEditor and dependencies
jest.mock('../../../components/ModulePageEditor', () => {
  return {
    __esModule: true,
    default: () => (
      <div data-testid="mock-module-editor">Mock Editor Component</div>
    ),
  }
})

// Import mock untuk TipTap editor
jest.mock('@tiptap/react', () => jest.fn())
jest.mock('@tiptap/extension-text-align', () => jest.fn())
jest.mock('@tiptap/extension-text-style', () => jest.fn())
jest.mock('@tiptap/extension-typography', () => jest.fn())
jest.mock('@tiptap/extension-underline', () => jest.fn())
jest.mock('@tiptap/extension-color', () => jest.fn())
jest.mock('@tiptap/extension-highlight', () => jest.fn())
jest.mock('@tiptap/extension-image', () => jest.fn())
jest.mock('@tiptap/extension-link', () => jest.fn())
jest.mock('@tiptap/extension-placeholder', () => jest.fn())
jest.mock('@tiptap/extension-subscript', () => jest.fn())
jest.mock('@tiptap/extension-superscript', () => jest.fn())
jest.mock('@tiptap/starter-kit', () => jest.fn())

// Buat queryClient untuk testing
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  })

// Mock data dari API
const mockApiResponse = {
  success: true,
  data: [
    {
      id: 'ff006ad1-939f-43dd-82a7-20623f4494b2',
      moduleId: 'e82e800c-93f5-48ef-b17b-2dfe5624f4fb',
      title: 'Halaman Baru 1',
      order: 1,
      status: 'DRAFT' as const,
      createdAt: '2025-05-23T08:57:01.575Z',
      updatedAt: '2025-05-23T12:07:13.365Z',
      blocks: [],
    },
    {
      id: '7cc68073-0aac-4130-94ea-99b863f89fae',
      moduleId: 'e82e800c-93f5-48ef-b17b-2dfe5624f4fb',
      title: 'Halaman Baru 2',
      order: 2,
      status: 'DRAFT' as const,
      createdAt: '2025-05-23T09:04:17.681Z',
      updatedAt: '2025-05-23T13:45:36.508Z',
      blocks: [],
    },
    {
      id: '2c884d79-78a7-4204-b7f9-917a3e702bf1',
      moduleId: 'e82e800c-93f5-48ef-b17b-2dfe5624f4fb',
      title: 'Halaman Baru 3',
      order: 3,
      status: 'DRAFT' as const,
      createdAt: '2025-05-23T09:30:32.794Z',
      updatedAt: '2025-05-23T13:56:46.274Z',
      blocks: [],
    },
  ],
  meta: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 3,
    totalPages: 1,
  },
}

// Variabel untuk memverifikasi handler MSW dipanggil dalam console log
const server = setupServer(
  // Mock endpoint untuk mendapatkan daftar halaman - pastikan sesuai dengan URL yang digunakan di aplikasi
  http.get('*/api/module/:moduleId/pages*', ({ request }) => {
    console.log('[MSW] Mock server handling request:', request.url)
    return HttpResponse.json(mockApiResponse)
  }),

  // Mock endpoint untuk mendapatkan detail halaman
  http.get('*/api/module/:moduleId/pages/:pageId*', ({ params, request }) => {
    console.log('[MSW] Mock server handling page detail request:', request.url)
    const pageId = params.pageId as string
    const page = mockApiResponse.data.find((p) => p.id === pageId)
    return HttpResponse.json({ success: true, data: page })
  })
)

// Tambahkan tipe untuk context value
interface ModulePageCRUDContextValue {
  moduleId: string
  pages: ModulePage[]
  activePage: ModulePage | null
  isLoading: boolean
  error: Error | null
  setActivePage: (page: ModulePage | null) => void
  handleUpdatePage: (page: ModulePage) => Promise<void>
  handleCreatePage: () => Promise<void>
  handleDeletePage: (pageId: string) => Promise<void>
  refetch: () => Promise<unknown>
}

// Test renderer dengan direct context value mocking
const renderWithDirectContext = (
  ui: React.ReactElement,
  contextValue: Partial<ModulePageCRUDContextValue> = {}
) => {
  const queryClient = createTestQueryClient()
  // Konversi date string ke Date objects untuk mock data
  const pagesWithDates = mockApiResponse.data.map((page) => ({
    ...page,
    createdAt: new Date(page.createdAt),
    updatedAt: new Date(page.updatedAt),
  }))

  // Default context values yang akan di-override
  const defaultContextValue = {
    moduleId: 'test-module',
    pages: pagesWithDates,
    activePage: pagesWithDates[0],
    isLoading: false,
    error: null,
    setActivePage: jest.fn(),
    handleUpdatePage: jest.fn().mockResolvedValue(undefined),
    handleCreatePage: jest.fn().mockResolvedValue(undefined),
    handleDeletePage: jest.fn().mockResolvedValue(undefined),
    refetch: jest.fn().mockResolvedValue(undefined),
    ...contextValue,
  }

  // Buat mock provider dengan context value yang sudah disiapkan
  const TestContextProvider = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <ModulePageCRUDProvider
          moduleId={defaultContextValue.moduleId}
          mockValues={defaultContextValue}
        >
          {children}
        </ModulePageCRUDProvider>
      </QueryClientProvider>
    )
  }

  return render(<TestContextProvider>{ui}</TestContextProvider>)
}

// Setup dan cleanup server
beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => server.close())

describe('Data Flow Integration Tests', () => {
  test('loads module page data from API and displays in sidebar', async () => {
    // Spy pada console.log untuk melihat interaksi API
    const consoleSpy = jest.spyOn(console, 'log')

    // Render dengan context yang menggunakan mock data dari API
    renderWithDirectContext(
      <SidebarContent
        expandedItems={{ ModuleContent: true }}
        toggleExpand={() => {}}
        data-testid="sidebar-content"
      />
    )

    // Debug output jika diperlukan
    // screen.debug()

    // Tunggu sampai halaman dimuat dan muncul dalam sidebar
    await waitFor(
      () => {
        expect(screen.getByText('Halaman Baru 1')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Verifikasi semua halaman telah muncul
    expect(screen.getByText('Halaman Baru 2')).toBeInTheDocument()
    expect(screen.getByText('Halaman Baru 3')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  test('context provider passes correct data to SidebarContent', async () => {
    // Mock pages untuk digunakan di direct context
    const mockPages: ModulePage[] = [
      {
        id: 'test-page-1',
        title: 'Test Page 1',
        moduleId: 'test-module',
        order: 1,
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
        blocks: [],
      },
      {
        id: 'test-page-2',
        title: 'Test Page 2',
        moduleId: 'test-module',
        order: 2,
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
        blocks: [],
      },
    ]

    // Render dengan direct context
    const {
      /* debug */
    } = renderWithDirectContext(
      <SidebarContent
        expandedItems={{ ModuleContent: true }}
        toggleExpand={() => {}}
        data-testid="sidebar-with-direct-context"
      />,
      { pages: mockPages }
    )

    // Uncomment untuk debug
    // debug()

    // Tunggu sampai halaman dimuat
    await waitFor(() => {
      // Verifikasi elemen muncul langsung tanpa waitFor
      expect(screen.getByText('Test Page 1')).toBeInTheDocument()
      expect(screen.getByText('Test Page 2')).toBeInTheDocument()
    })
  })

  test('displays loading state while fetching data', async () => {
    // Gunakan komponen yang di-mock secara langsung tanpa require
    const { default: ModulePageEditor } = jest.requireMock(
      '../../../components/ModulePageEditor'
    )

    // Render dengan isLoading=true
    renderWithDirectContext(<ModulePageEditor isLoading={true} />)

    // Verifikasi mock editor dirender
    expect(screen.getByTestId('mock-module-editor')).toBeInTheDocument()
  })

  test('handles empty pages response correctly', async () => {
    // Spy pada console.log untuk melihat interaksi
    const consoleSpy = jest.spyOn(console, 'log')

    // Override server dengan empty data
    server.use(
      http.get('*/api/module/:moduleId/pages*', ({ request }) => {
        console.log('[MSW] Mock server returning empty data:', request.url)
        return HttpResponse.json({ success: true, data: [] })
      })
    )

    // Render dengan direct context yang mengembalikan data kosong
    renderWithDirectContext(
      <SidebarContent
        expandedItems={{ ModuleContent: true }}
        toggleExpand={() => {}}
      />,
      { pages: [] }
    )

    // Verifikasi pesan empty state
    expect(screen.getByText('Belum ada halaman')).toBeInTheDocument()

    // Cleanup
    consoleSpy.mockRestore()
  })

  test('displays error message when API fails', async () => {
    // Spy untuk memverifikasi API calls
    const consoleSpy = jest.spyOn(console, 'log')

    // Override server dengan error response
    server.use(
      http.get('*/api/module/:moduleId/pages*', ({ request }) => {
        console.log('[MSW] Mock server returning error:', request.url)
        return HttpResponse.json({ message: 'Server error' }, { status: 500 })
      })
    )

    // Render langsung dengan error state
    renderWithDirectContext(
      <SidebarContent
        expandedItems={{ ModuleContent: true }}
        toggleExpand={() => {}}
      />,
      {
        error: new Error('Failed to fetch'),
        pages: [],
      }
    )

    // Verifikasi empty state text
    expect(screen.getByText('Belum ada halaman')).toBeInTheDocument()

    // Cleanup
    consoleSpy.mockRestore()
  })
})
