import {
  render,
  RenderOptions,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { setupServer } from 'msw/node'
import { ReactElement, ReactNode } from 'react'
import { ModulePagesProvider } from '../../context/ModulePagesContext'
import { ModulePageCRUDProvider } from '../../context/ModulePageCRUDContext'
import { handlers } from '../__mocks__/mockHandlers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'

// Setup mock server
export const server = setupServer(...handlers)

// Setup & teardown server for tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
  useParams: () => ({
    moduleId: 'module-1',
  }),
}))

// Mock sonner toast untuk mencegah warning dalam test
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

// Mock window.getSelection and DOMRect for TipTap editor
beforeAll(() => {
  // Mock getSelection
  Object.defineProperty(window, 'getSelection', {
    value: () => ({
      getRangeAt: () => {
        const range = new Range()
        range.getBoundingClientRect = jest.fn()
        range.getClientRects = jest.fn(
          () =>
            ({
              item: () => null,
              length: 0,
            }) as unknown as DOMRectList
        )
        return range
      },
      addRange: jest.fn(),
      removeAllRanges: jest.fn(),
    }),
    writable: true,
  })
})

// Fungsi bantuan untuk fast-forward timer
export function advanceTimersByTime(ms: number) {
  act(() => {
    jest.advanceTimersByTime(ms)
  })
}

// Fungsi yang lebih baik untuk menangani debounce dan timer asinkron
export async function advanceTimersAndFlushPromises(ms: number) {
  // Advance timers
  act(() => {
    jest.advanceTimersByTime(ms)
  })

  // Flush microtasks/promises - implementasi yang lebih reliable
  await act(async () => {
    // Gunakan setTimeout untuk memastikan semua promises di-resolve
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
    // Tambahkan timeout dengan 0ms untuk memastikan semua event loop cycles dijalankan
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
  })
}

// Wrapper untuk menghasilkan QueryClient baru untuk tiap test
// agar tidak ada state yang terpengaruh antar test
const generateTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity, // React Query v4+ menggunakan gcTime bukan cacheTime
        staleTime: Infinity,
        refetchOnWindowFocus: false,
      },
    },
  })

// Tipe untuk opsi render kustom
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  moduleId?: string
  mockValues?: Record<string, any>
}

// Render komponen dengan semua providers yang diperlukan
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { moduleId = 'module-1', mockValues = {}, ...renderOptions } = options
  const queryClient = generateTestQueryClient()

  const AllTheProviders = ({ children }: { children: ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <ModulePageCRUDProvider moduleId={moduleId} mockValues={mockValues}>
          <ModulePagesProvider>{children}</ModulePagesProvider>
        </ModulePageCRUDProvider>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: AllTheProviders, ...renderOptions })
}

/**
 * Utility function untuk menunggu loading selesai
 * @param getByText - Test query function dari testing library
 * @param queryByText - Test query function dari testing library
 */
export const waitForLoadingToFinish = async (
  getByText: (text: string | RegExp) => HTMLElement,
  queryByText: (text: string | RegExp) => HTMLElement | null
) => {
  // Jika loading message terlihat, tunggu sampai menghilang
  if (queryByText('Memuat halaman...')) {
    await waitForElementToBeRemoved(() => getByText('Memuat halaman...'))
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'
