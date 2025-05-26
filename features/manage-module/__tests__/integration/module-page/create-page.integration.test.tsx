import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { ModulePageCRUDProvider } from '../../../context/ModulePageCRUDContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SidebarContent from '../../../components/ModulePageEditor/sidebar/SidebarContent'
import userEvent from '@testing-library/user-event'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useParams: jest.fn().mockReturnValue({
    moduleId: 'test-module-id',
  }),
  useSearchParams: jest.fn().mockReturnValue({
    get: jest
      .fn()
      .mockImplementation((param) =>
        param === 'pageId' ? 'test-page-id' : null
      ),
  }),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Buat queryClient untuk testing
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
    },
  })

// Mock data awal
const mockInitialPages = {
  success: true,
  data: [
    {
      id: 'existing-page-1',
      moduleId: 'test-module-id',
      title: 'Halaman Awal 1',
      order: 1,
      status: 'DRAFT',
      createdAt: '2025-05-23T08:57:01.575Z',
      updatedAt: '2025-05-23T12:07:13.365Z',
      blocks: [],
    },
  ],
}

// Mock data halaman baru
const mockNewPage = {
  id: 'new-page-id',
  moduleId: 'test-module-id',
  title: 'Halaman Baru 2',
  order: 2,
  status: 'DRAFT',
  createdAt: '2025-05-24T10:00:00.000Z',
  updatedAt: '2025-05-24T10:00:00.000Z',
  blocks: [
    {
      type: 'TEXT',
      content:
        '<p>Halaman baru Anda telah dibuat. Mulai edit konten disini.</p>',
    },
  ],
}

// Setup server untuk mocking API
const server = setupServer(
  // Mock endpoint untuk mendapatkan daftar halaman
  rest.get('/api/module/:moduleId/pages', (req, res, ctx) => {
    return res(ctx.json(mockInitialPages))
  }),

  // Mock endpoint untuk create page
  rest.post('/api/module/:moduleId/pages', (req, res, ctx) => {
    return res(ctx.json({ success: true, data: mockNewPage }))
  })
)

// Render helper dengan seluruh provider yang diperlukan
const renderWithProviders = (ui, options = {}) => {
  const queryClient = createTestQueryClient()
  const moduleId = options.moduleId || 'test-module-id'

  return render(
    <QueryClientProvider client={queryClient}>
      <ModulePageCRUDProvider moduleId={moduleId}>{ui}</ModulePageCRUDProvider>
    </QueryClientProvider>,
    options
  )
}

// Setup dan cleanup server
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Create Page Integration Tests', () => {
  test('creates new page and shows loading state when Add Page button is clicked', async () => {
    // Setup user events
    const user = userEvent.setup()

    // Spy on router.push
    const mockRouterPush = jest.fn()
    const useRouter = jest.requireMock('next/navigation').useRouter
    useRouter.mockReturnValue({
      push: mockRouterPush,
    })

    // Render SidebarContent dengan expandedItems
    renderWithProviders(
      <SidebarContent
        expandedItems={{ ModuleContent: true }}
        toggleExpand={() => {}}
      />
    )

    // Tunggu hingga daftar halaman muncul
    await waitFor(() => {
      expect(screen.getByText('Halaman Awal 1')).toBeInTheDocument()
    })

    // Klik tombol tambah halaman
    const addButton = screen.getByText('Tambah Halaman')
    await user.click(addButton)

    // Verifikasi loading state muncul
    expect(screen.getByText('Membuat halaman...')).toBeInTheDocument()

    // Verifikasi router.push dipanggil setelah proses selesai
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.stringContaining('new-page-id')
      )
    })
  })

  test('handles API error during page creation', async () => {
    // Setup user events
    const user = userEvent.setup()

    // Mock toast dari sonner
    const toast = require('sonner').toast

    // Override server untuk mengembalikan error
    server.use(
      rest.post('/api/module/:moduleId/pages', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            success: false,
            message: 'Failed to create page',
          })
        )
      })
    )

    // Render SidebarContent
    renderWithProviders(
      <SidebarContent
        expandedItems={{ ModuleContent: true }}
        toggleExpand={() => {}}
      />
    )

    // Klik tombol tambah halaman
    await waitFor(() => {
      const addButton = screen.getByText('Tambah Halaman')
      return user.click(addButton)
    })

    // Verifikasi toast error dipanggil
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })

    // Verifikasi button kembali ke state normal
    await waitFor(() => {
      expect(screen.getByText('Tambah Halaman')).toBeInTheDocument()
      expect(screen.queryByText('Membuat halaman...')).not.toBeInTheDocument()
    })
  })

  test('creates page with correct data structure', async () => {
    // Setup user events
    const user = userEvent.setup()

    // Setup spy untuk melihat payload yang dikirim ke API
    let capturedRequestBody = null
    server.use(
      rest.post('/api/module/:moduleId/pages', async (req, res, ctx) => {
        capturedRequestBody = await req.json()
        return res(ctx.json({ success: true, data: mockNewPage }))
      })
    )

    // Render SidebarContent
    renderWithProviders(
      <SidebarContent
        expandedItems={{ ModuleContent: true }}
        toggleExpand={() => {}}
      />
    )

    // Klik tombol tambah halaman
    const addButton = screen.getByText('Tambah Halaman')
    await user.click(addButton)

    // Verifikasi data yang dikirim ke API
    await waitFor(() => {
      expect(capturedRequestBody).not.toBeNull()
      expect(capturedRequestBody).toHaveProperty('moduleId', 'test-module-id')
      expect(capturedRequestBody).toHaveProperty(
        'title',
        expect.stringContaining('Halaman Baru')
      )
      expect(capturedRequestBody).toHaveProperty('order', 2) // order seharusnya +1 dari halaman yang ada
      expect(capturedRequestBody).toHaveProperty('blocks')
      expect(capturedRequestBody.blocks[0]).toHaveProperty('type', 'TEXT')
    })
  })

  test('multiple page creations work correctly', async () => {
    // Setup user events
    const user = userEvent.setup()

    // Counter untuk melihat berapa kali API dipanggil
    let createCounter = 0

    // Override server untuk mengembalikan page ID yang berbeda tiap pemanggilan
    server.use(
      rest.post('/api/module/:moduleId/pages', (req, res, ctx) => {
        createCounter++
        return res(
          ctx.json({
            success: true,
            data: {
              ...mockNewPage,
              id: `new-page-id-${createCounter}`,
              title: `Halaman Baru ${createCounter + 1}`,
              order: createCounter + 1,
            },
          })
        )
      })
    )

    // Render SidebarContent
    renderWithProviders(
      <SidebarContent
        expandedItems={{ ModuleContent: true }}
        toggleExpand={() => {}}
      />
    )

    // Klik tombol tambah halaman pertama kali
    const addButton = screen.getByText('Tambah Halaman')
    await user.click(addButton)

    // Tunggu hingga proses pertama selesai
    await waitFor(() => {
      expect(createCounter).toBe(1)
    })

    // Klik lagi untuk membuat halaman kedua
    await user.click(screen.getByText('Tambah Halaman'))

    // Verifikasi create page kedua berhasil
    await waitFor(() => {
      expect(createCounter).toBe(2)
    })
  })
})
