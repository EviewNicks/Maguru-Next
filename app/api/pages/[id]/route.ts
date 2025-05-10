import { NextRequest, NextResponse } from 'next/server'
import { updateModulePageSchema } from '@/features/manage-module/types/modulePageSchema'
import { modulePageService } from '@/features/manage-module/services/modulePageService'
import {
  withAdminAuth,
  withAuditTrail,
  withValidation,
  composeMiddlewares,
} from '../../module/middleware'

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
        { error: 'Halaman tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(page, { status: 200 })
  } catch (error) {
    console.error('Error fetching module page:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil detail halaman modul' },
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
    const body = await request.json()

    // Perbarui halaman
    const updatedPage = await modulePageService.updateModulePage(pageId, body)

    if (!updatedPage) {
      return NextResponse.json(
        { error: 'Halaman tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedPage, { status: 200 })
  } catch (error) {
    console.error('Error updating module page:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui halaman modul' },
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
        { error: 'Halaman tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Halaman berhasil dihapus' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting module page:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus halaman modul' },
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
    // Ambil ID halaman (last segment dari path)
    const id = pathParts[pathParts.length - 1]

    // Buat context dengan params
    const context: RouteParams = { params: { id } }

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
    (handler) => withValidation(updateModulePageSchema, handler),
  ],
  createRouteHandler(updateModulePageHandler)
)

// Gunakan middleware untuk DELETE request
export const DELETE = composeMiddlewares(
  [withAdminAuth, withAuditTrail],
  createRouteHandler(deleteModulePageHandler)
)
