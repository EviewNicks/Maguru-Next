import { NextRequest, NextResponse } from 'next/server'
import { modulePageService } from '@/features/manage-module/services/modulePageService'
import {
  withAdminAuth,
  withAuditTrail,
  composeMiddlewares,
} from '../../../../middleware'
import { z } from 'zod'

// Tipe untuk params dari route dynamic
type RouteParams = { params: { id: string } }

// Schema untuk validasi input
const UpdatePageStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
})

/**
 * Handler untuk PATCH request
 * Mengubah status halaman modul berdasarkan ID
 */
async function updateModulePageStatusHandler(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const pageId = context.params.id

    // Tangani JSON parsing dengan lebih baik
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error(
        'Error parsing JSON in updateModulePageStatusHandler:',
        jsonError
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

    // Validasi input
    const validationResult = UpdatePageStatusSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data tidak valid',
          details: validationResult.error.format(),
        },
        { status: 400 }
      )
    }

    const { status } = validationResult.data

    // Perbarui status halaman
    const updatedPage = await modulePageService.updateModulePage(pageId, {
      status,
    })

    if (!updatedPage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Halaman tidak ditemukan',
        },
        { status: 404 }
      )
    }

    // Gunakan format response yang konsisten
    return NextResponse.json(
      {
        success: true,
        data: updatedPage.data,
        message: `Status halaman berhasil diubah menjadi ${status}`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating module page status:', error)

    // Berikan respons yang lebih spesifik berdasarkan jenis error
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: `Terjadi kesalahan saat memperbarui status halaman: ${error.message}`,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat memperbarui status halaman',
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

    // Format URL yang diharapkan: /api/module/{moduleId}/pages/{pageId}/status
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
        : ''

    console.log(
      `[API] Extracted moduleId: ${moduleId}, pageId: ${pageId}, path: ${url.pathname}`
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

// Gunakan middleware untuk PATCH request
export const PATCH = composeMiddlewares(
  [withAdminAuth, withAuditTrail],
  createRouteHandler(updateModulePageStatusHandler)
)
