import { NextRequest, NextResponse } from 'next/server'
import { modulePageService } from '@/features/manage-module/services/modulePageService'
import {
  withAdminAuth,
  withAuditTrail,
  composeMiddlewares,
} from '../../../../middleware'
import { z } from 'zod'
import { ModulePageStatus } from '@/features/manage-module/types'
// import { logger } from '@/features/manage-module/services/logger'

// Konstanta untuk context name (logging)
// const CONTEXT = 'StatusRo  uteHandler'

// Tipe untuk params dari route dynamic
type RouteParams = { params: { id: string } }

// Schema untuk validasi input yang diperluas
const UpdatePageStatusSchema = z.object({
  status: z.nativeEnum(ModulePageStatus),
  // Parameter opsional untuk override nilai default
  isDraft: z.boolean().optional(),
  hasUnpublishedChanges: z.boolean().optional(),
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
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            'Format JSON tidak valid. Pastikan request body berformat JSON yang benar.',
        },
        { status: 400 }
      )
    }

    // Log request untuk debugging

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

    // Tentukan nilai isDraft dan hasUnpublishedChanges berdasarkan status
    // Gunakan nilai dari request jika disediakan, atau default berdasarkan status
    const isDraft =
      validationResult.data.isDraft !== undefined
        ? validationResult.data.isDraft
        : status === ModulePageStatus.DRAFT

    const hasUnpublishedChanges =
      validationResult.data.hasUnpublishedChanges !== undefined
        ? validationResult.data.hasUnpublishedChanges
        : status === ModulePageStatus.DRAFT

    // Perbarui status halaman dengan field tambahan
    const updatedPage = await modulePageService.updateModulePage(pageId, {
      status,
      isDraft,
      hasUnpublishedChanges,
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

    // Log hasil update untuk debugging

    // Gunakan format response yang konsisten
    return NextResponse.json(
      {
        success: true,
        data: updatedPage.data,
        message: `Status halaman berhasil diubah menjadi ${status}`,
        meta: {
          isDraft: updatedPage.data.isDraft,
          hasUnpublishedChanges: updatedPage.data.hasUnpublishedChanges,
        },
      },
      { status: 200 }
    )
  } catch (error) {
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

    const pagesIndex = pathParts.indexOf('pages')

    // Ambil moduleId (setelah 'module')

    // Ambil pageId (setelah 'pages')
    const pageId =
      pagesIndex !== -1 && pagesIndex + 1 < pathParts.length
        ? pathParts[pagesIndex + 1]
        : ''

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
