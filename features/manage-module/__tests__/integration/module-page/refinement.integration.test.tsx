import React, { useState } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { server } from '../../utils/testUtils'
import { HttpResponse, http, delay } from 'msw'

// Konstanta untuk kondisi jaringan
const NETWORK_CONDITIONS = {
  FAST: 50,
  SLOW: 1000,
  VERY_SLOW: 3000,
}

// Komponen untuk pengujian optimasi
function OptimizationTestComponent() {
  const [content, setContent] = useState('')
  const [apiCalls, setApiCalls] = useState(0)
  const [lastSavedContent, setLastSavedContent] = useState('')
  const [loading, setLoading] = useState(false)

  // Fungsi untuk menyimpan konten dengan optimasi
  const saveContent = async (newContent: string) => {
    // Skip jika konten sama dengan yang terakhir disimpan
    if (newContent === lastSavedContent) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/module/module-1/pages/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      setApiCalls((prev) => prev + 1)
      setLastSavedContent(newContent)
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setLoading(false)
    }
  }

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
      <div data-testid="last-saved">Last saved: {lastSavedContent}</div>
    </div>
  )
}

// Komponen untuk pengujian kondisi jaringan
function NetworkConditionsTestComponent() {
  const [requests, setRequests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fungsi untuk mengirim request dengan ID
  const sendRequest = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/module/module-1/pages/network?id=${id}`
      )

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setRequests((prev) => [...prev, `${id}: ${data.message}`])
    } catch (error) {
      setError(
        `Request ${id} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
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
        onClick={() => {
          sendRequest('req1')
          sendRequest('req2')
        }}
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
  })

  describe('Content Optimization Tests', () => {
    beforeEach(() => {
      // Setup handler untuk endpoint optimasi
      server.use(
        http.post(
          '/api/module/module-1/pages/optimize',
          async ({ request }) => {
            const requestBody = (await request.json()) as { content: string }
            return HttpResponse.json({
              success: true,
              content: requestBody.content,
            })
          }
        )
      )
    })

    test('tidak mengirim permintaan jika konten tidak berubah', async () => {
      render(<OptimizationTestComponent />)

      const editor = screen.getByTestId('content-editor')

      // Input konten pertama kali
      fireEvent.change(editor, { target: { value: 'Hello World' } })

      // Tunggu sampai API call tercatat
      await waitFor(() => {
        expect(screen.getByTestId('api-calls').textContent).toBe('API calls: 1')
      })

      // Input konten yang sama lagi
      fireEvent.change(editor, { target: { value: 'Hello World' } })

      // Tunggu sebentar untuk memastikan tidak ada API call tambahan
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Verifikasi API call tetap 1
      expect(screen.getByTestId('api-calls').textContent).toBe('API calls: 1')
    })
  })

  describe('Network Conditions Tests', () => {
    beforeEach(() => {
      // Setup handlers untuk endpoint network dengan delay berbeda
      server.use(
        http.get('/api/module/module-1/pages/network', async ({ request }) => {
          const url = new URL(request.url)
          const id = url.searchParams.get('id')

          // Simulasi kondisi jaringan berbeda berdasarkan ID
          if (id === 'slow') {
            await delay(NETWORK_CONDITIONS.SLOW)
            return HttpResponse.json({ message: 'Slow response' })
          } else if (id === 'req1' || id === 'req2') {
            // Untuk request konkuren
            await delay(500)
            return HttpResponse.json({ message: `Response for ${id}` })
          }

          // Default fast response
          return HttpResponse.json({ message: 'Fast response' })
        })
      )
    })

    test('menangani kondisi jaringan lambat', async () => {
      render(<NetworkConditionsTestComponent />)

      // Klik tombol untuk request lambat
      fireEvent.click(screen.getByTestId('send-slow'))

      // Verifikasi loading indicator muncul
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()

      // Tunggu sampai request selesai
      await waitFor(
        () => {
          expect(
            screen.queryByTestId('loading-indicator')
          ).not.toBeInTheDocument()
        },
        { timeout: NETWORK_CONDITIONS.SLOW + 500 }
      )

      // Verifikasi response diterima
      const requestsList = screen.getByTestId('requests-list')
      expect(requestsList.textContent).toContain('slow: Slow response')
    })

    test('menangani multiple requests dengan benar', async () => {
      render(<NetworkConditionsTestComponent />)

      // Klik tombol untuk concurrent requests
      fireEvent.click(screen.getByTestId('send-concurrent'))

      // Verifikasi loading indicator muncul
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()

      // Tunggu sampai semua request selesai
      await waitFor(
        () => {
          const requestsList = screen.getByTestId('requests-list')
          return requestsList.children.length === 2
        },
        { timeout: 2000 }
      )

      // Verifikasi kedua response diterima
      const requestsList = screen.getByTestId('requests-list')
      expect(requestsList.textContent).toContain('req1: Response for req1')
      expect(requestsList.textContent).toContain('req2: Response for req2')
    })
  })
})
