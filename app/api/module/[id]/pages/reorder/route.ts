import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { modulePageService } from '@/features/manage-module/services/modulePageService'
import {
  withAdminAuth,
  withAuditTrail,
  composeMiddlewares,
} from '../../../middleware'

// Tipe untuk params dari route
type RouteParams = { params: { id: string } }

// Schema validasi untuk body request
const ReorderPagesSchema = z.object({
  pageIds: z.array(z.string()).min(1, {
    message: 'Setidaknya satu pageId harus disediakan',
  }),
})

/**
 * Handler untuk PUT request
 * Mengubah urutan halaman modul
 */
async function reorderModulePagesHandler(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const moduleId = context.params.id

    // Parse dan validasi body request
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error('Error parsing JSON in reorderModulePagesHandler:', error)
      return NextResponse.json(
        {
          success: false,
          error:
            'Format JSON tidak valid. Pastikan body request dalam format JSON yang benar.',
        },
        { status: 400 }
      )
    }

    // Validasi dengan Zod
    const validationResult = ReorderPagesSchema.safeParse(body)
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

    const { pageIds } = validationResult.data

    // Gunakan service untuk mengubah urutan halaman
    const success = await modulePageService.reorderModulePages(
      moduleId,
      pageIds
    )

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gagal mengubah urutan halaman',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Urutan halaman berhasil diperbarui',
        data: [],
        meta: {},
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error reordering module pages:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat mengubah urutan halaman',
      },
      { status: 500 }
    )
  }
}

// Wrapper untuk menangani dynamic route parameters
function createRouteHandler(
  handler: (req: NextRequest, context: RouteParams) => Promise<NextResponse>
) {
  return (req: NextRequest) => {
    // Ekstrak ID dari URL
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')

    // Format URL yang diharapkan: /api/module/{moduleId}/pages/reorder
    const moduleIndex = pathParts.indexOf('module')

    // Ambil moduleId (setelah 'module')
    const moduleId =
      moduleIndex !== -1 && moduleIndex + 1 < pathParts.length
        ? pathParts[moduleIndex + 1]
        : ''

    // Buat context dengan params
    const context: RouteParams = {
      params: { id: moduleId },
    }

    // Panggil handler dengan context
    return handler(req, context)
  }
}

// Export PUT handler with middleware
export const PUT = composeMiddlewares(
  [withAdminAuth, withAuditTrail],
  createRouteHandler(reorderModulePagesHandler)
)
