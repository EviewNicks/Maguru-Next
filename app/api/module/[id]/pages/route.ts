import { NextRequest, NextResponse } from 'next/server'
import { createModulePageSchema } from '@/features/manage-module/types/modulePageSchema'
import { modulePageService } from '@/features/manage-module/services/modulePageService'
import {
  withAdminAuth,
  withAuditTrail,
  withValidation,
  composeMiddlewares,
} from '../../middleware'

// Tipe untuk params dari route dynamic
type RouteParams = { params: { id: string } }

/**
 * Handler untuk GET request
 * Mendapatkan daftar halaman untuk modul tertentu
 */
async function getModulePagesHandler(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const moduleId = context.params.id
    // Gunakan searchParams dari nextUrl untuk kompatibilitas dengan test
    const searchParams =
      request.nextUrl?.searchParams || new URL(request.url).searchParams

    // Parse query parameters
    const page = searchParams.get('page')
      ? parseInt(searchParams.get('page') as string)
      : undefined
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit') as string)
      : undefined
    const includeContent = searchParams.get('includeContent') === 'true'

    // Dapatkan daftar halaman
    const pages = await modulePageService.getModulePages(moduleId, {
      page,
      limit,
      includeContent,
    })

    return NextResponse.json(pages, { status: 200 })
  } catch (error) {
    console.error('Error fetching module pages:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil daftar halaman modul' },
      { status: 500 }
    )
  }
}

/**
 * Handler untuk POST request
 * Membuat halaman baru dalam modul
 */
async function createModulePageHandler(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const moduleId = context.params.id
    const body = await request.json()

    // Pastikan moduleId di body sesuai dengan URL
    const data = { ...body, moduleId }

    // Buat halaman baru
    const newPage = await modulePageService.createModulePage(data)

    return NextResponse.json(newPage, { status: 201 })
  } catch (error) {
    console.error('Error creating module page:', error)

    if (error instanceof Error) {
      // Tangani error spesifik
      if (error.message === 'Modul tidak ditemukan') {
        return NextResponse.json(
          { error: 'Modul tidak ditemukan' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat halaman modul' },
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
    // Ambil ID modul (posisi setelah /api/module/ dan sebelum /pages)
    const id = pathParts[3]

    // Buat context dengan params
    const context: RouteParams = { params: { id } }

    // Panggil handler dengan context
    return handler(req, context)
  }
}

// Gunakan middleware untuk GET request
export const GET = composeMiddlewares(
  [withAdminAuth, withAuditTrail],
  createRouteHandler(getModulePagesHandler)
)

// Gunakan middleware untuk POST request
export const POST = composeMiddlewares(
  [
    withAdminAuth,
    withAuditTrail,
    (handler) => withValidation(createModulePageSchema, handler),
  ],
  createRouteHandler(createModulePageHandler)
)
