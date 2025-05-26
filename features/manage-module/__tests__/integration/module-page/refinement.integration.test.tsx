import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { server } from '../../utils/testUtils'

// Setup mock timer untuk debounce
jest.useFakeTimers()

// Konstanta untuk kondisi jaringan
const NETWORK_CONDITIONS = {
  FAST: 50,
  SLOW: 1000,
  VERY_SLOW: 3000,
}

// Komponen untuk pengujian optimasi
function OptimizationTestComponent() {
  const [content, setContent] = React.useState<string>('')
  const [apiCalls, setApiCalls] = React.useState<number>(0)
  const [lastSaved, setLastSaved] = React.useState<string>('')
  const [loading, setLoading] = React.useState<boolean>(false)

  // Fungsi untuk menyimpan konten dengan optimasi
  const saveContent = React.useCallback(
    async (newContent: string) => {
      // Skip jika konten sama dengan yang terakhir disimpan
      if (newContent === lastSaved) {
        return
      }

      setLoading(true)
      try {
        // Simulasi API call
        await new Promise((resolve) => setTimeout(resolve, 100))
        setApiCalls((prev) => prev + 1)
        setLastSaved(newContent)
      } catch (error) {
        console.error('Save error:', error)
      } finally {
        setLoading(false)
      }
    },
    [lastSaved]
  )

  // Handler untuk perubahan konten
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    saveContent(newContent)
  }

  return (
    <div>
      <textarea
        data-testid="content-editor"
        value={content}
        onChange={handleContentChange}
        placeholder="Type content here"
      />
      {loading && <div data-testid="loading-indicator">Saving...</div>}
      <div data-testid="api-calls">API calls: {apiCalls}</div>
      <div data-testid="last-saved">Last saved: {lastSaved}</div>
    </div>
  )
}

// Komponen untuk pengujian kondisi jaringan
function NetworkConditionsTestComponent() {
  const [requests, setRequests] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  // Fungsi untuk mengirim request dengan ID
  const sendRequest = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      // Simulasi network request
      if (id === 'slow') {
        await new Promise<void>((resolve) =>
          setTimeout(resolve, NETWORK_CONDITIONS.SLOW)
        )
      } else {
        await new Promise<void>((resolve) =>
          setTimeout(resolve, NETWORK_CONDITIONS.FAST)
        )
      }

      // Menambahkan hasil ke daftar
      setRequests((prev) => [...prev, `${id}: Response for ${id}`])
    } catch (error) {
      if (error instanceof Error) {
        setError(`Request ${id} failed: ${error.message}`)
      } else {
        setError(`Request ${id} failed: Unknown error`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Fungsi untuk mengirim request konkuren
  const sendConcurrentRequests = () => {
    sendRequest('req1')
    sendRequest('req2')
  }

  return (
    <div>
      <button
        data-testid="send-fast"
        onClick={() => sendRequest('fast')}
        disabled={loading}
      >
        Send Fast Request
      </button>
      <button
        data-testid="send-slow"
        onClick={() => sendRequest('slow')}
        disabled={loading}
      >
        Send Slow Request
      </button>
      <button
        data-testid="send-concurrent"
        onClick={sendConcurrentRequests}
        disabled={loading}
      >
        Send Concurrent Requests
      </button>
      {loading && <div data-testid="loading-indicator">Loading...</div>}
      {error && <div data-testid="error-message">{error}</div>}
      <ul data-testid="requests-list">
        {requests.map((req, index) => (
          <li key={index}>{req}</li>
        ))}
      </ul>
    </div>
  )
}

describe('Refinement & Edge Cases Tests', () => {
  beforeEach(() => {
    // Reset server handlers
    server.resetHandlers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Run any remaining timers
    jest.runOnlyPendingTimers()
  })

  describe('Content Optimization Tests', () => {
    test('tidak mengirim permintaan jika konten tidak berubah', async () => {
      // Render komponen
      render(<OptimizationTestComponent />)

      // Ambil referensi ke editor
      const editor = screen.getByTestId('content-editor')

      // Input konten pertama kali
      fireEvent.change(editor, { target: { value: 'Hello World' } })

      // Maju-mundurkan timer untuk memicu operasi asinkron
      jest.advanceTimersByTime(200)

      // Tunggu API call tercatat
      await waitFor(() => {
        expect(screen.getByTestId('api-calls').textContent).toBe('API calls: 1')
      })

      // Verifikasi konten tersimpan
      expect(screen.getByTestId('last-saved').textContent).toBe(
        'Last saved: Hello World'
      )

      // Input konten yang sama lagi
      fireEvent.change(editor, { target: { value: 'Hello World' } })

      // Maju-mundurkan timer lagi
      jest.advanceTimersByTime(200)

      // Verifikasi API call tetap 1 (tidak bertambah)
      expect(screen.getByTestId('api-calls').textContent).toBe('API calls: 1')
    })
  })

  describe('Network Conditions Tests', () => {
    test('menangani kondisi jaringan lambat', async () => {
      // Render komponen
      render(<NetworkConditionsTestComponent />)

      // Klik tombol untuk request lambat
      fireEvent.click(screen.getByTestId('send-slow'))

      // Verifikasi loading indicator muncul
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()

      // Maju-mundurkan timer untuk simulasi jaringan lambat
      jest.advanceTimersByTime(NETWORK_CONDITIONS.SLOW + 100)

      // Tunggu sampai loading indicator menghilang
      await waitFor(() => {
        expect(
          screen.queryByTestId('loading-indicator')
        ).not.toBeInTheDocument()
      })

      // Verifikasi response diterima
      const requestsList = screen.getByTestId('requests-list')
      expect(requestsList.textContent).toContain('slow: Response for slow')
    })

    test('menangani multiple requests dengan benar', async () => {
      // Render komponen
      render(<NetworkConditionsTestComponent />)

      // Klik tombol untuk concurrent requests
      fireEvent.click(screen.getByTestId('send-concurrent'))

      // Verifikasi loading indicator muncul
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()

      // Maju-mundurkan timer untuk menyelesaikan semua requests
      jest.advanceTimersByTime(NETWORK_CONDITIONS.FAST + 100)

      // Tunggu sampai request selesai
      await waitFor(() => {
        expect(
          screen.queryByTestId('loading-indicator')
        ).not.toBeInTheDocument()
      })

      // Verifikasi kedua response diterima
      const requestsList = screen.getByTestId('requests-list')
      expect(requestsList.textContent).toContain('req1: Response for req1')
      expect(requestsList.textContent).toContain('req2: Response for req2')
    })
  })
})
