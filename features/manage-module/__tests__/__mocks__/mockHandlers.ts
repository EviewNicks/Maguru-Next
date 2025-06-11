import { http, HttpResponse, delay } from 'msw'
// import mockPages, { getNextPage, getPageById, getPrevPage } from './mockPages'
import mockPages, { getPageById } from './mockPages'

/**
 * Mock handlers untuk MSW
 * Digunakan untuk mocking API calls dalam integration testing
 *
 * Note: Jika ada masalah dengan MSW, alternatif yang bisa digunakan adalah:
 * 1. jest.mock dengan manual mocks untuk axios/fetch
 * 2. nock untuk Node.js HTTP request mocking
 * 3. axios-mock-adapter untuk mocking axios requests
 */
export const handlers = [
  // GET daftar halaman modul
  http.get('/api/module/:moduleId/pages', async ({ params }) => {
    await delay(100) // Simulasi network delay

    return HttpResponse.json({
      success: true,
      data: mockPages.filter((page) => page.moduleId === params.moduleId),
      meta: {
        totalItems: mockPages.length,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      },
    })
  }),

  // GET detail halaman
  http.get('/api/module/:moduleId/pages/:pageId', async ({ params }) => {
    await delay(100)

    const page = getPageById(params.pageId as string)

    if (!page) {
      return HttpResponse.json(
        { success: false, message: 'Halaman tidak ditemukan' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: page,
    })
  }),

  // POST buat halaman baru
  http.post('/api/module/:moduleId/pages', async ({ request, params }) => {
    await delay(200)

    const body = (await request.json()) as {
      title?: string
      blocks?: Array<{ type: string; content: string }>
    }

    const newPage = {
      id: `page-${mockPages.length + 1}`,
      moduleId: params.moduleId as string,
      title: body.title || 'Halaman Baru',
      order: mockPages.length + 1,
      blocks: body.blocks || [],
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return HttpResponse.json({ success: true, data: newPage }, { status: 201 })
  }),

  // PUT update halaman
  http.put(
    '/api/module/:moduleId/pages/:pageId',
    async ({ request, params }) => {
      await delay(200)

      const body = (await request.json()) as Record<string, unknown>
      const page = getPageById(params.pageId as string)

      if (!page) {
        return HttpResponse.json(
          { success: false, message: 'Halaman tidak ditemukan' },
          { status: 404 }
        )
      }

      const updatedPage = {
        ...page,
        ...(body as object),
        updatedAt: new Date(),
      }

      return HttpResponse.json({
        success: true,
        data: updatedPage,
      })
    }
  ),

  // DELETE hapus halaman
  http.delete('/api/module/:moduleId/pages/:pageId', async ({ params }) => {
    await delay(200)

    const page = getPageById(params.pageId as string)

    if (!page) {
      return HttpResponse.json(
        { success: false, message: 'Halaman tidak ditemukan' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      message: 'Halaman berhasil dihapus',
    })
  }),

  // PUT reorder halaman
  http.put('/api/module/:moduleId/pages/reorder', async ({ request }) => {
    await delay(200)

    const body = (await request.json()) as { pageIds: string[] }

    return HttpResponse.json({
      success: true,
      data: body.pageIds,
    })
  }),

  // Fallback untuk request yang tidak di-mock
  http.all('*', ({ request }) => {
    console.warn(`Request ke ${request.url} tidak di-mock!`)
    return HttpResponse.error()
  }),
]
