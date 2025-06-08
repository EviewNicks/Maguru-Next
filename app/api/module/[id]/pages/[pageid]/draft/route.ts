import { NextRequest, NextResponse } from 'next/server'
import { modulePageService } from '@/features/manage-module/services/modulePageService'
import {
  withAdminAuth,
  withAuditTrail,
  composeMiddlewares,
} from '../../../../middleware'
import { StandardEditorContent } from '@/features/manage-module/types'
import { logger } from '@/features/manage-module/services/logger'

// Tipe untuk params dari route dynamic
type RouteParams = { params: { id: string } }

/**
 * Handler untuk POST request
 * Menyimpan draft halaman modul
 */
async function saveDraftHandler(request: NextRequest, context: RouteParams) {
  const ROUTE = 'API_SAVE_DRAFT'
  const FUNCTION_NAME = 'saveDraftHandler'

  try {
    const pageId = context.params.id

    // Tangani JSON parsing dengan lebih baik
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      logger.error(
        ROUTE,
        FUNCTION_NAME,
        'Error parsing JSON in saveDraftHandler',
        jsonError instanceof Error
          ? jsonError
          : new Error('Unknown JSON parsing error')
      )
      return NextResponse.json(
        {
          success: false,
          error:
            'Format JSON tidak valid. Pastikan request body berformat JSON yang benar.',
        },
        { status: 400 }
      )
    }

    // Validasi content (harus sesuai format Tiptap)
    if (
      !body.content ||
      typeof body.content !== 'object' ||
      body.content.type !== 'doc' ||
      !Array.isArray(body.content.content)
    ) {
      logger.error(ROUTE, FUNCTION_NAME, 'Invalid content format', {
        pageId,
        contentType: typeof body.content,
        hasType: body.content && 'type' in body.content,
        hasContent: body.content && 'content' in body.content,
        isContentArray:
          body.content &&
          'content' in body.content &&
          Array.isArray(body.content.content),
      })
      return NextResponse.json(
        {
          success: false,
          error:
            'Format content tidak valid. Content harus berformat Tiptap JSON dengan type="doc"',
        },
        { status: 400 }
      )
    }

    // Validasi authorId
    if (!body.authorId) {
      logger.error(ROUTE, FUNCTION_NAME, 'Missing authorId', {
        pageId,
        body: { ...body, content: '[content omitted]' },
      })
      return NextResponse.json(
        {
          success: false,
          error: 'AuthorId diperlukan untuk menyimpan draft',
        },
        { status: 400 }
      )
    }

    // Simpan draft
    const savedDraft = await modulePageService.saveDraft(
      pageId,
      body.content as StandardEditorContent,
      body.authorId
    )

    if (!savedDraft) {
      return NextResponse.json(
        {
          success: false,
          error: 'Halaman tidak ditemukan',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: savedDraft.data,
        meta: {
          draftSavedAt: savedDraft.data.draftSavedAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving draft:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: `Terjadi kesalahan saat menyimpan draft: ${error.message}`,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat menyimpan draft',
      },
      { status: 500 }
    )
  }
}

/**
 * Handler untuk PATCH request
 * Mempublikasikan draft halaman modul
 */
async function publishDraftHandler(request: NextRequest, context: RouteParams) {
  const ROUTE = 'API_PUBLISH_DRAFT'
  const FUNCTION_NAME = 'publishDraftHandler'

  try {
    const pageId = context.params.id

    logger.info(ROUTE, FUNCTION_NAME, 'Memulai publikasi draft', { pageId })

    // Ambil data halaman sebelum publikasi untuk logging
    try {
      const pageBeforePublish = await modulePageService.getModulePage(pageId)
      if (pageBeforePublish) {
        logger.debug(ROUTE, FUNCTION_NAME, 'Data halaman sebelum publikasi', {
          pageId,
          status: pageBeforePublish.data.status,
          hasDraft: !!pageBeforePublish.data.draftData,
          hasUnpublishedChanges: pageBeforePublish.data.hasUnpublishedChanges,
          version: pageBeforePublish.data.version,
        })
      } else {
        logger.warn(
          ROUTE,
          FUNCTION_NAME,
          'Halaman tidak ditemukan sebelum publikasi',
          {
            pageId,
          }
        )
      }
    } catch (preCheckError) {
      logger.error(
        ROUTE,
        FUNCTION_NAME,
        'Error saat pre-check halaman',
        preCheckError instanceof Error
          ? preCheckError
          : new Error('Unknown error')
      )
      // Lanjutkan eksekusi meskipun pre-check gagal
    }

    // Publikasikan draft
    logger.info(
      ROUTE,
      FUNCTION_NAME,
      'Memanggil modulePageService.publishDraft',
      { pageId }
    )
    const publishedPage = await modulePageService.publishDraft(pageId)

    if (!publishedPage) {
      logger.warn(
        ROUTE,
        FUNCTION_NAME,
        'Gagal publikasi, tidak ada halaman atau draft',
        { pageId }
      )
      return NextResponse.json(
        {
          success: false,
          error: 'Halaman atau draft tidak ditemukan',
        },
        { status: 404 }
      )
    }

    logger.info(ROUTE, FUNCTION_NAME, 'Draft berhasil dipublikasikan', {
      pageId,
      status: publishedPage.data.status,
      version: publishedPage.data.version,
      hasDraft: !!publishedPage.data.draftData,
      hasUnpublishedChanges: publishedPage.data.hasUnpublishedChanges,
    })

    return NextResponse.json(
      {
        success: true,
        data: publishedPage.data,
        meta: {
          version: publishedPage.data.version,
          publishedAt: publishedPage.data.updatedAt,
          isDraft: publishedPage.data.isDraft,
          hasUnpublishedChanges: publishedPage.data.hasUnpublishedChanges,
          lastEditBy: publishedPage.data.lastEditBy,
          status: publishedPage.data.status,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error(
      ROUTE,
      FUNCTION_NAME,
      'Error saat publikasi draft',
      error instanceof Error ? error : new Error('Unknown error')
    )

    // Log error detail jika tersedia
    if (error instanceof Error) {
      logger.error(ROUTE, FUNCTION_NAME, 'Error detail', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat mempublikasikan draft',
      },
      { status: 500 }
    )
  }
}

/**
 * Handler untuk DELETE request
 * Membuang draft halaman modul
 */
async function discardDraftHandler(request: NextRequest, context: RouteParams) {
  const ROUTE = 'API_DISCARD_DRAFT'
  const FUNCTION_NAME = 'discardDraftHandler'

  try {
    const pageId = context.params.id

    logger.info(ROUTE, FUNCTION_NAME, 'Memulai proses membuang draft', {
      pageId,
    })

    // Ambil data halaman sebelum discard untuk logging
    try {
      const pageBeforeDiscard = await modulePageService.getModulePage(pageId)
      if (pageBeforeDiscard) {
        logger.debug(
          ROUTE,
          FUNCTION_NAME,
          'Data halaman sebelum discard draft',
          {
            pageId,
            status: pageBeforeDiscard.data.status,
            hasDraft: !!pageBeforeDiscard.data.draftData,
            hasUnpublishedChanges: pageBeforeDiscard.data.hasUnpublishedChanges,
            version: pageBeforeDiscard.data.version,
          }
        )
      } else {
        logger.warn(
          ROUTE,
          FUNCTION_NAME,
          'Halaman tidak ditemukan sebelum discard draft',
          {
            pageId,
          }
        )
      }
    } catch (preCheckError) {
      logger.error(
        ROUTE,
        FUNCTION_NAME,
        'Error saat pre-check halaman',
        preCheckError instanceof Error
          ? preCheckError
          : new Error('Unknown error')
      )
      // Lanjutkan eksekusi meskipun pre-check gagal
    }

    // Buang draft
    const discardedPage = await modulePageService.discardDraft(pageId)

    if (!discardedPage) {
      logger.warn(
        ROUTE,
        FUNCTION_NAME,
        'Halaman tidak ditemukan saat membuang draft',
        { pageId }
      )
      return NextResponse.json(
        {
          success: false,
          error: 'Halaman tidak ditemukan',
        },
        { status: 404 }
      )
    }

    logger.info(ROUTE, FUNCTION_NAME, 'Draft berhasil dibuang', {
      pageId,
      status: discardedPage.data.status,
      isDraft: discardedPage.data.isDraft,
      hasUnpublishedChanges: discardedPage.data.hasUnpublishedChanges,
    })

    return NextResponse.json(
      {
        success: true,
        data: discardedPage.data,
        meta: {
          version: discardedPage.data.version,
          updatedAt: discardedPage.data.updatedAt,
          isDraft: discardedPage.data.isDraft,
          hasUnpublishedChanges: discardedPage.data.hasUnpublishedChanges,
          status: discardedPage.data.status,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error(
      ROUTE,
      FUNCTION_NAME,
      'Error saat membuang draft',
      error instanceof Error ? error : new Error('Unknown error')
    )
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat membuang draft',
      },
      { status: 500 }
    )
  }
}

// Wrapper untuk menangani params dari dynamic route
function createRouteHandler(
  handler: (req: NextRequest, context: RouteParams) => Promise<NextResponse>
) {
  return (req: NextRequest) => {
    // Ekstrak ID dari URL
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')

    // Format URL yang diharapkan: /api/module/{moduleId}/pages/{pageId}/draft
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const moduleIndex = pathParts.indexOf('module') // Tidak digunakan tapi disimpan untuk konsistensi
    const pagesIndex = pathParts.indexOf('pages')

    // Ambil pageId (setelah 'pages')
    const pageId =
      pagesIndex !== -1 && pagesIndex + 1 < pathParts.length
        ? pathParts[pagesIndex + 1]
        : ''

    logger.debug(
      'API_ROUTE',
      'createRouteHandler',
      'Draft operation requested',
      {
        pageId,
        path: url.pathname,
        method: req.method,
      }
    )

    // Buat context dengan params
    const context: RouteParams = {
      params: {
        id: pageId,
      },
    }

    // Panggil handler dengan context
    return handler(req, context)
  }
}

// Gunakan middleware untuk POST request (save draft)
export const POST = composeMiddlewares(
  [withAdminAuth, withAuditTrail],
  createRouteHandler(saveDraftHandler)
)

// Gunakan middleware untuk PATCH request (publish draft)
export const PATCH = composeMiddlewares(
  [withAdminAuth, withAuditTrail],
  createRouteHandler(publishDraftHandler)
)

// Gunakan middleware untuk DELETE request (discard draft)
export const DELETE = composeMiddlewares(
  [withAdminAuth, withAuditTrail],
  createRouteHandler(discardDraftHandler)
)
