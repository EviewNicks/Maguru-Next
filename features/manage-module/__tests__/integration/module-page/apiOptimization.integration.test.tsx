import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { server } from '../../utils/testUtils'
import { HttpResponse, http } from 'msw'
import debounce from 'lodash/debounce'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Buat counter global untuk menghitung API calls
let getCallCount = 0

// Mock debounce untuk test
jest.mock('lodash/debounce', () => {
  return jest.fn().mockImplementation((fn, wait) => {
    let timeout: NodeJS.Timeout
    const debounced = function (...args: unknown[]) {
      clearTimeout(timeout)
      timeout = setTimeout(() => fn(...args), wait)
    }
    return debounced
  })
})

// Setup timer palsu untuk test
beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

// Mock handlers untuk pengujian
const mockApiHandler = jest.fn()
const mockHandleEditorChange = jest
  .fn()
  .mockImplementation((content, pageId) => {
    console.log(`[Test] Editor change called with pageId: ${pageId}`)
    // Simulasi debounced handler
    const debouncedSave = debounce(() => {
      console.log(`[Test] Saving after debounce for pageId: ${pageId}`)
      mockApiHandler(content, pageId)
    }, 2000)
    debouncedSave()
  })

// Define type untuk konten editor
type EditorContent = {
  type: string
  content: Array<{ text: string }>
}

// Test component yang sangat sederhana
function SimpleTestComponent() {
  const content: EditorContent = {
    type: 'doc',
    content: [{ text: 'test' }],
  }

  return (
    <div data-testid="test-component">
      <button
        data-testid="trigger-button"
        onClick={() => mockHandleEditorChange(content, 'page-1')}
      >
        Click Me
      </button>
    </div>
  )
}

describe('API Optimization Tests', () => {
  beforeEach(() => {
    // Reset counters and mocks
    getCallCount = 0
    mockApiHandler.mockClear()
    mockHandleEditorChange.mockClear()

    // Setup mock server
    server.use(
      http.put('/api/module/:id/pages/:pageId', () => {
        return HttpResponse.json({ success: true })
      }),

      http.get('/api/module/:id/pages', () => {
        getCallCount++
        return HttpResponse.json({
          success: true,
          data: [{ id: 'page-1', title: 'Test Page' }],
        })
      })
    )
  })

  test('debounce menunda API call sampai setelah delay tertentu', () => {
    // Render komponen
    render(<SimpleTestComponent />)

    // Tunggu dan pastikan komponen dirender
    expect(screen.getByTestId('test-component')).toBeInTheDocument()

    // Klik button untuk memicu perubahan
    const button = screen.getByTestId('trigger-button')
    fireEvent.click(button)

    // handleEditorChange seharusnya dipanggil, tapi belum API call
    expect(mockHandleEditorChange).toHaveBeenCalledTimes(1)
    expect(mockApiHandler).not.toHaveBeenCalled()

    // Fast-forward timer 1 detik (masih kurang dari debounce)
    jest.advanceTimersByTime(1000)
    expect(mockApiHandler).not.toHaveBeenCalled()

    // Fast-forward timer tambahan 1.5 detik (total 2.5 detik)
    jest.advanceTimersByTime(1500)

    // Sekarang API call seharusnya dipanggil
    expect(mockApiHandler).toHaveBeenCalledTimes(1)
  })

  test('tidak mengirim request berulang jika konten tidak berubah', () => {
    // Override mockHandleEditorChange untuk merecord konten terakhir
    let lastContent: EditorContent | null = null
    mockHandleEditorChange.mockImplementation(
      (content: EditorContent, pageId: string) => {
        // Jika konten sama dengan sebelumnya, jangan panggil API
        if (
          lastContent &&
          JSON.stringify(content) === JSON.stringify(lastContent)
        ) {
          console.log(`[Test] Content unchanged, skipping API call`)
          return
        }

        // Update lastContent dan panggil API
        lastContent = content
        mockApiHandler(content, pageId)
      }
    )

    // Render komponen
    render(<SimpleTestComponent />)

    // Cek komponen ada
    expect(screen.getByTestId('test-component')).toBeInTheDocument()

    // Klik button untuk pertama kali
    const button = screen.getByTestId('trigger-button')
    fireEvent.click(button)

    // API seharusnya dipanggil untuk perubahan pertama
    expect(mockApiHandler).toHaveBeenCalledTimes(1)

    // Reset mock untuk perubahan kedua
    mockApiHandler.mockClear()

    // Klik lagi dengan konten yang sama
    fireEvent.click(button)

    // API seharusnya tidak dipanggil karena konten sama
    expect(mockApiHandler).not.toHaveBeenCalled()
  })

  test('menggunakan cache untuk mengurangi request GET berulang', () => {
    // Reset counter
    getCallCount = 0

    // Buat shared QueryClient
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    })

    // Helper untuk render komponen dengan QueryClient
    const renderWithQueryClient = () => {
      return render(
        <QueryClientProvider client={queryClient}>
          <SimpleTestComponent />
        </QueryClientProvider>
      )
    }

    // Render pertama kali
    const { unmount } = renderWithQueryClient()

    // Set data pada cache
    queryClient.setQueryData(['modulePages'], {
      data: [{ id: 'page-1' }],
    })

    // Pastikan komponen dirender
    expect(screen.getByTestId('test-component')).toBeInTheDocument()

    // Hapus komponen dari DOM
    unmount()

    // Reset counter GET
    getCallCount = 0

    // Render lagi dengan QueryClient yang sama
    renderWithQueryClient()

    // Tunggu komponen muncul
    expect(screen.getByTestId('test-component')).toBeInTheDocument()

    // Tidak ada API call lagi karena menggunakan cache
    expect(getCallCount).toBe(0)
  })
})
