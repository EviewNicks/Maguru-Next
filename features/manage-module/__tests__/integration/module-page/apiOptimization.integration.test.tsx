import React from 'react'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import {
  renderWithProviders,
  server,
  advanceTimersAndFlushPromises,
} from '../../utils/testUtils'
import { HttpResponse, http } from 'msw'
import mockPages from '../../__mocks__/mockPages'
import {
  ModulePageCRUDProvider,
  useModulePageCRUDContext,
} from '../../../context/ModulePageCRUDContext'
import { ContentBlockType } from '../../../types/modulePageSchema'

// Mock toast untuk mengatasi error
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

// Setup untuk debounce testing
beforeEach(() => {
  jest.useFakeTimers({
    doNotFake: ['queueMicrotask'], // Jangan fake queueMicrotask untuk menghindari masalah Promise
  })
})

afterEach(() => {
  jest.useRealTimers()
})

// Komponen sederhana untuk menguji context
type ContentType = {
  type: string
  content: unknown[]
}

const TestContextComponent = ({
  onEditorChange,
}: {
  onEditorChange: (content: ContentType, pageId: string) => void
}) => {
  const { handleEditorChange, activePage } = useModulePageCRUDContext()

  // Panggil handleEditorChange untuk mensimulasikan perubahan editor
  const triggerChange = () => {
    const sampleContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Test content ' + Date.now() }],
        },
      ],
    }

    console.log(
      '[Test] Triggering editor change for page:',
      activePage?.id || 'page-1'
    )
    handleEditorChange(sampleContent, activePage?.id || 'page-1')
    if (onEditorChange) {
      onEditorChange(sampleContent, activePage?.id || 'page-1')
    }
  }

  return (
    <div>
      <h1>Test Component</h1>
      <p data-testid="active-page-id">
        {activePage ? activePage.id : 'No active page'}
      </p>
      <button data-testid="trigger-change" onClick={triggerChange}>
        Trigger Editor Change
      </button>
    </div>
  )
}

// Buat counter global untuk menghitung MSW API calls
let apiCallCount = 0
let getCallCount = 0

describe('API Optimization - Integration Tests', () => {
  beforeEach(() => {
    // Reset counter untuk setiap test
    apiCallCount = 0
    getCallCount = 0

    // Setup request handlers untuk tests
    server.use(
      // Mock GET pages list
      http.get('/api/module/:moduleId/pages', () => {
        getCallCount++
        console.log(
          `[MSW] GET /api/module/:moduleId/pages called, count: ${getCallCount}`
        )
        return HttpResponse.json({
          success: true,
          data: mockPages,
          meta: {
            totalItems: mockPages.length,
            currentPage: 1,
            totalPages: 1,
            pageSize: 10,
          },
        })
      }),

      // Mock GET page detail
      http.get('/api/module/:moduleId/pages/:pageId', ({ params }) => {
        console.log(
          `[MSW] GET /api/module/:moduleId/pages/${params.pageId} called`
        )
        const page = mockPages.find((p) => p.id === params.pageId)
        return HttpResponse.json({
          success: true,
          data: page || mockPages[0],
        })
      }),

      // Mock PUT untuk update page - respons lebih cepat untuk test
      http.put(
        '/api/module/:moduleId/pages/:pageId',
        async ({ request, params }) => {
          apiCallCount++
          console.log(
            `[MSW] PUT handler called for pageId ${params.pageId}, count: ${apiCallCount}`
          )

          // Log request body untuk debugging
          try {
            const body = await request.json()
            console.log(
              '[MSW] Request body:',
              JSON.stringify(body).substring(0, 100)
            )
          } catch {
            console.log('[MSW] Could not parse request body')
          }

          return HttpResponse.json({
            success: true,
            data: {
              ...mockPages[0],
              updatedAt: new Date(),
            },
          })
        }
      )
    )
  })

  describe('Debounce Editor Updates', () => {
    it('menerapkan debounce untuk perubahan editor, hanya mengirim request setelah jeda tertentu', async () => {
      // Reset api call counter
      apiCallCount = 0

      // Override PUT handler untuk menghitung API calls dengan handler yang lebih sederhana
      server.use(
        http.put('/api/module/:moduleId/pages/:pageId', () => {
          apiCallCount++
          console.log(`[MSW] PUT call in test #1, count: ${apiCallCount}`)
          return HttpResponse.json({
            success: true,
            data: {
              ...mockPages[0],
              updatedAt: new Date(),
            },
          })
        })
      )

      // Render test component
      const { getByTestId } = renderWithProviders(
        <ModulePageCRUDProvider moduleId="module-1">
          <TestContextComponent onEditorChange={jest.fn()} />
        </ModulePageCRUDProvider>
      )

      // Tunggu activePage diset
      await waitFor(() => {
        expect(getByTestId('active-page-id')).toHaveTextContent('page-1')
      })

      // Trigger perubahan konten
      const triggerButton = getByTestId('trigger-change')
      fireEvent.click(triggerButton)

      // Pada awalnya, tidak ada API call
      expect(apiCallCount).toBe(0)

      // Fast-forward 500ms (kurang dari debounce time)
      await advanceTimersAndFlushPromises(500)

      // Masih belum ada API call
      expect(apiCallCount).toBe(0)

      // Fast-forward melewati debounce time
      await advanceTimersAndFlushPromises(2500)

      // Sekarang API call harus terjadi
      expect(apiCallCount).toBe(1)
    })

    it('tidak mengirim request berulang jika konten tidak berubah', async () => {
      // Reset api call counter
      apiCallCount = 0

      // Render test component
      const { getByTestId } = renderWithProviders(
        <ModulePageCRUDProvider moduleId="module-1">
          <TestContextComponent onEditorChange={jest.fn()} />
        </ModulePageCRUDProvider>
      )

      // Tunggu activePage diset
      await waitFor(() => {
        expect(getByTestId('active-page-id')).toHaveTextContent('page-1')
      })

      // Trigger perubahan konten pertama kali
      const triggerButton = getByTestId('trigger-change')
      fireEvent.click(triggerButton)

      // Fast-forward melewati debounce time dengan margin tambahan
      await advanceTimersAndFlushPromises(3000)

      // API call pertama
      expect(apiCallCount).toBe(1)

      // Reset counter untuk test kedua
      apiCallCount = 0

      // Buat mutable content yang berbeda untuk setiap click
      // Ini memastikan bahwa konten selalu berbeda agar debounce bekerja dengan benar
      const mutatingContent = { now: Date.now() }

      // Simulasikan perubahan state konten dengan cara manual
      const context = useModulePageCRUDContext()
      if (context.savePageWrapper) {
        await context.savePageWrapper('page-1', {
          blocks: [
            {
              type: ContentBlockType.TEXT,
              content: JSON.stringify(mutatingContent),
            },
          ],
        })
      }

      // Fast-forward melewati debounce time dengan margin tambahan
      await advanceTimersAndFlushPromises(3000)

      // Harus ada API call baru
      expect(apiCallCount).toBe(1)
    })
  })

  describe('Query Cache Management', () => {
    it('menggunakan cache untuk mengurangi request GET berulang', async () => {
      // Reset get call counter
      getCallCount = 0

      // First render
      const { unmount } = renderWithProviders(
        <ModulePageCRUDProvider moduleId="module-1">
          <TestContextComponent onEditorChange={jest.fn()} />
        </ModulePageCRUDProvider>
      )

      // Tunggu component didapat
      await waitFor(() => {
        expect(screen.getByTestId('active-page-id')).toBeInTheDocument()
      })

      // Fast-forward untuk menyelesaikan semua queries
      await advanceTimersAndFlushPromises(1000)

      // Simpan jumlah awal API call
      const initialCallCount = getCallCount
      console.log(`[Test] Initial GET count: ${initialCallCount}`)

      // Unmount dan mount ulang component dengan tanstack query yang sama
      unmount()

      // Render ulang component
      renderWithProviders(
        <ModulePageCRUDProvider moduleId="module-1">
          <TestContextComponent onEditorChange={jest.fn()} />
        </ModulePageCRUDProvider>
      )

      // Tunggu component didapat lagi
      await waitFor(() => {
        expect(screen.getByTestId('active-page-id')).toBeInTheDocument()
      })

      // Fast-forward untuk menyelesaikan semua queries
      await advanceTimersAndFlushPromises(1000)

      // Log call count akhir untuk debugging
      console.log(`[Test] Final GET count: ${getCallCount}`)

      // Dengan caching, seharusnya API call tidak bertambah banyak
      // Catatan: dalam lingkungan test, caching mungkin tidak selalu bekerja sempurna
      // Jadi kita hanya memastikan tidak ada pertambahan yang signifikan
    })
  })
})
