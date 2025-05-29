import { NextRequest, NextResponse } from 'next/server'
// import { UpdateModulePageSchema } from '@/features/manage-module/types/modulePageSchema'
import { modulePageService } from '@/features/manage-module/services/modulePageService'
import {
  withAdminAuth,
  withAuditTrail,
  composeMiddlewares,
} from '../../../middleware'

// Tipe untuk params dari route dynamic
type RouteParams = { params: { id: string } }

/**
 * Handler untuk GET request
 * Mendapatkan detail halaman modul berdasarkan ID
 */
async function getModulePageHandler(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const pageId = context.params.id

    // Dapatkan detail halaman
    const page = await modulePageService.getModulePage(pageId)

    if (!page) {
      return NextResponse.json(
        {
          success: false,
          error: 'Halaman tidak ditemukan',
        },
        { status: 404 }
      )
    }

    // Format response untuk konsistensi
    return NextResponse.json(
      {
        success: true,
        data: page.data,
        meta: {}, // Tambahkan meta kosong untuk konsistensi format
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching module page:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat mengambil detail halaman modul',
      },
      { status: 500 }
    )
  }
}

/**
 * Handler untuk PUT request
 * Memperbarui halaman modul berdasarkan ID
 */
async function updateModulePageHandler(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const pageId = context.params.id

    // Tangani JSON parsing dengan lebih baik
    let body
    try {
      body = await request.json()
      console.log('[API] Update request body:', JSON.stringify(body))
    } catch (jsonError) {
      console.error('Error parsing JSON in updateModulePageHandler:', jsonError)
      return NextResponse.json(
        {
          success: false,
          error:
            'Format JSON tidak valid. Pastikan request body berformat JSON yang benar.',
        },
        { status: 400 }
      )
    }

    // Validasi content jika ada
    if (body.content) {
      // Validasi struktur content (harus sesuai format Tiptap)
      if (
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
    }

    // Hapus blocks jika ada (backward compatibility)
    if (body.blocks) {
      console.log(
        '[API] Warning: Blocks format is deprecated, removing blocks property'
      )
      delete body.blocks
    }

    // Perbarui halaman
    const updatedPage = await modulePageService.updateModulePage(pageId, body)

    if (!updatedPage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Halaman tidak ditemukan',
        },
        { status: 404 }
      )
    }

    // Gunakan format response yang konsisten dengan test
    return NextResponse.json(
      {
        success: true,
        data: updatedPage.data,
        meta: {}, // Tambahkan meta kosong untuk konsistensi format
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating module page:', error)

    // Berikan respons yang lebih spesifik berdasarkan jenis error
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: `Terjadi kesalahan saat memperbarui halaman modul: ${error.message}`,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat memperbarui halaman modul',
      },
      { status: 500 }
    )
  }
}

/**
 * Handler untuk DELETE request
 * Menghapus halaman modul berdasarkan ID
 */
async function deleteModulePageHandler(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const pageId = context.params.id

    // Hapus halaman
    const deleted = await modulePageService.deleteModulePage(pageId)

    if (!deleted) {
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
        message: 'Halaman berhasil dihapus',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting module page:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat menghapus halaman modul',
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

    // Format URL yang diharapkan: /api/module/{moduleId}/pages/{pageId}
    const moduleIndex = pathParts.indexOf('module')
    const pagesIndex = pathParts.indexOf('pages')

    // Ambil moduleId (setelah 'module')
    const moduleId =
      moduleIndex !== -1 && moduleIndex + 1 < pathParts.length
        ? pathParts[moduleIndex + 1]
        : ''

    // Ambil pageId (setelah 'pages')
    const pageId =
      pagesIndex !== -1 && pagesIndex + 1 < pathParts.length
        ? pathParts[pagesIndex + 1]
        : pathParts[pathParts.length - 1]

    console.log(
      `[API] Extracted moduleId: ${moduleId}, pageId: ${pageId}, path: ${url.pathname}`
    )

    // Buat context dengan params
    const context: RouteParams = {
      params: {
        id: pageId, // Untuk getModulePageHandler, id adalah pageId
      },
    }

    // Panggil handler dengan context
    return handler(req, context)
  }
}

// Gunakan middleware untuk GET request
export const GET = composeMiddlewares(
  [withAdminAuth, withAuditTrail],
  createRouteHandler(getModulePageHandler)
)

// Gunakan middleware untuk PUT request
export const PUT = composeMiddlewares(
  [
    withAdminAuth,
    withAuditTrail,
    // Tidak menggunakan withValidation agar kita bisa
    // menangani validasi secara manual dan konsisten dengan test
  ],
  createRouteHandler(updateModulePageHandler)
)

// Gunakan middleware untuk DELETE request
export const DELETE = composeMiddlewares(
  [withAdminAuth, withAuditTrail],
  createRouteHandler(deleteModulePageHandler)
)
