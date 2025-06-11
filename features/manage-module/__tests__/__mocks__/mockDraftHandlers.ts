import { http, HttpResponse, delay } from 'msw'
import mockDraftPages, { getDraftPageById } from './mockDraftPages'
import { ModulePageStatus } from '../../types/modulePageSchema'

/**
 * Mock handlers untuk fitur draft
 * Digunakan untuk mocking API calls dalam integration testing
 */
export const draftHandlers = [
  // POST - Save Draft
  http.post(
    '/api/module/:moduleId/pages/:pageId/draft',
    async ({ request, params }) => {
      await delay(100) // Simulasi network delay

      const body = (await request.json()) as {
        content: any
        authorId: string
      }

      const page = getDraftPageById(params.pageId as string)

      if (!page) {
        return HttpResponse.json(
          { success: false, message: 'Halaman tidak ditemukan' },
          { status: 404 }
        )
      }

      const updatedPage = {
        ...page,
        draftData: body.content,
        lastEditBy: body.authorId,
        draftSavedAt: new Date(),
        isDraft: true,
        hasUnpublishedChanges: true,
        updatedAt: new Date(),
      }

      return HttpResponse.json({
        success: true,
        data: updatedPage,
        meta: {
          draftSavedAt: updatedPage.draftSavedAt,
        },
      })
    }
  ),

  // GET - Get Draft
  http.get('/api/module/:moduleId/pages/:pageId/draft', async ({ params }) => {
    await delay(100)

    const page = getDraftPageById(params.pageId as string)

    if (!page) {
      return HttpResponse.json(
        { success: false, message: 'Halaman tidak ditemukan' },
        { status: 404 }
      )
    }

    if (!page.draftData) {
      return HttpResponse.json(
        { success: false, message: 'Tidak ada draft untuk halaman ini' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: page,
      meta: {
        draftSavedAt: page.draftSavedAt,
        hasUnpublishedChanges: page.hasUnpublishedChanges,
      },
    })
  }),

  // PATCH - Publish Draft
  http.patch(
    '/api/module/:moduleId/pages/:pageId/draft',
    async ({ params }) => {
      await delay(200)

      const page = getDraftPageById(params.pageId as string)

      if (!page) {
        return HttpResponse.json(
          { success: false, message: 'Halaman tidak ditemukan' },
          { status: 404 }
        )
      }

      if (!page.draftData) {
        return HttpResponse.json(
          { success: false, message: 'Tidak ada draft untuk dipublikasikan' },
          { status: 400 }
        )
      }

      const publishedPage = {
        ...page,
        content: page.draftData,
        draftData: null,
        draftSavedAt: null,
        isDraft: false,
        hasUnpublishedChanges: false,
        version: page.version + 1,
        status: ModulePageStatus.PUBLISHED,
        updatedAt: new Date(),
      }

      return HttpResponse.json({
        success: true,
        data: publishedPage,
        meta: {
          version: publishedPage.version,
          publishedAt: publishedPage.updatedAt,
        },
      })
    }
  ),

  // DELETE - Discard Draft
  http.delete(
    '/api/module/:moduleId/pages/:pageId/draft',
    async ({ params }) => {
      await delay(150)

      const page = getDraftPageById(params.pageId as string)

      if (!page) {
        return HttpResponse.json(
          { success: false, message: 'Halaman tidak ditemukan' },
          { status: 404 }
        )
      }

      return HttpResponse.json({
        success: true,
        message: 'Draft berhasil dibuang',
      })
    }
  ),
]
