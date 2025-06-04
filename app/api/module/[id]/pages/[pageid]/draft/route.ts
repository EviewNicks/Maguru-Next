import { NextRequest, NextResponse } from 'next/server'
import { modulePageService } from '@/features/manage-module/services/modulePageService'
import {
  withAdminAuth,
  withAuditTrail,
  composeMiddlewares,
} from '../../../../middleware'
import { StandardEditorContent } from '@/features/manage-module/types'

// Tipe untuk params dari route dynamic
type RouteParams = { params: { id: string } }

/**
 * Handler untuk POST request
 * Menyimpan draft halaman modul
 */
async function saveDraftHandler(request: NextRequest, context: RouteParams) {
  try {
    const pageId = context.params.id

    // Tangani JSON parsing dengan lebih baik
    let body
    try {
      body = await request.json()
      console.log('[API] Save draft request body:', JSON.stringify(body))
    } catch (jsonError) {
      console.error('Error parsing JSON in saveDraftHandler:', jsonError)
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
      console.error('[API] Invalid content format:', body.content)
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
      console.error('[API] Missing authorId:', body)
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
  try {
    const pageId = context.params.id

    // Publikasikan draft
    const publishedPage = await modulePageService.publishDraft(pageId)

    if (!publishedPage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Halaman atau draft tidak ditemukan',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: publishedPage.data,
        meta: {
          version: publishedPage.data.version,
          publishedAt: publishedPage.data.updatedAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error publishing draft:', error)
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
  try {
    const pageId = context.params.id

    // Buang draft
    const discarded = await modulePageService.discardDraft(pageId)

    if (!discarded) {
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
        message: 'Draft berhasil dibuang',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error discarding draft:', error)
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

    console.log(
      `[API] Draft operation for pageId: ${pageId}, path: ${url.pathname}`
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
