import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { toast } from 'sonner'

// Mock toast untuk verifikasi notifikasi error
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

// Mock fetch API
const mockFetch = jest.fn()
global.fetch = mockFetch

// Komponen sederhana untuk pengujian error handling
function SimpleErrorComponent() {
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState<{ success: boolean } | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      setData(null)

      const response = await fetch('/api/test-endpoint')

      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button data-testid="fetch-button" onClick={fetchData}>
        Fetch Data
      </button>

      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error-message">{error}</div>}
      {data && <div data-testid="success-data">{JSON.stringify(data)}</div>}

      {error && (
        <button data-testid="retry-button" onClick={fetchData}>
          Retry
        </button>
      )}
    </div>
  )
}

describe('Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  test('menampilkan notifikasi error saat API gagal (500 error)', async () => {
    // Mock fetch untuk mengembalikan error 500
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })
    )

    render(<SimpleErrorComponent />)

    // Klik tombol fetch
    fireEvent.click(screen.getByTestId('fetch-button'))

    // Tunggu pesan error muncul
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    // Verifikasi pesan error
    expect(screen.getByTestId('error-message').textContent).toBe('Error 500')

    // Verifikasi toast error dipanggil
    expect(toast.error).toHaveBeenCalledWith('Error 500')
  })

  test('recovery dari error dengan retry', async () => {
    // Mock fetch untuk mengembalikan error pada panggilan pertama
    // dan sukses pada panggilan kedua
    mockFetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true }),
        })
      )

    render(<SimpleErrorComponent />)

    // Klik tombol fetch untuk request pertama (akan gagal)
    fireEvent.click(screen.getByTestId('fetch-button'))

    // Tunggu pesan error muncul
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    // Verifikasi tombol retry muncul
    expect(screen.getByTestId('retry-button')).toBeInTheDocument()

    // Klik tombol retry untuk request kedua (akan berhasil)
    fireEvent.click(screen.getByTestId('retry-button'))

    // Tunggu data sukses muncul
    await waitFor(() => {
      expect(screen.getByTestId('success-data')).toBeInTheDocument()
    })

    // Verifikasi data sukses
    expect(screen.getByTestId('success-data').textContent).toBe(
      '{"success":true}'
    )
  })
})
