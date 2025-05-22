import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  withAdminAuth,
  withAuditTrail,
  composeMiddlewares,
} from '../../../middleware'

// Tipe untuk params dari route dynamic
type RouteParams = { params: { id: string } }

/**
 * Handler untuk PUT request
 * Mengubah urutan halaman dalam modul
 */
async function reorderModulePagesHandler(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const moduleId = context.params.id
    const body = await request.json()
    const { pageIds } = body

    if (!pageIds || !Array.isArray(pageIds)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data tidak valid. pageIds harus berupa array.',
        },
        { status: 400 }
      )
    }

    // Ensure the module exists
    const moduleExists = await prisma.module.findUnique({
      where: { id: moduleId },
    })

    if (!moduleExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Modul tidak ditemukan',
        },
        { status: 404 }
      )
    }

    // Ensure all pages exist and belong to the module
    const existingPages = await prisma.modulePage.findMany({
      where: { moduleId },
      select: { id: true },
    })

    const existingPageIds = existingPages.map((page) => page.id)
    const allPagesExist = pageIds.every((id) => existingPageIds.includes(id))

    if (!allPagesExist) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Beberapa halaman tidak ditemukan atau tidak dimiliki oleh modul ini',
        },
        { status: 400 }
      )
    }

    // Update the order of pages in a transaction
    await prisma.$transaction(
      pageIds.map((pageId, index) =>
        prisma.modulePage.update({
          where: { id: pageId },
          data: { order: index + 1 },
        })
      )
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Urutan halaman berhasil diperbarui',
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

// Wrapper untuk menangani params dari dynamic route
function createRouteHandler(
  handler: (req: NextRequest, context: RouteParams) => Promise<NextResponse>
) {
  return (req: NextRequest) => {
    // Ekstrak ID dari URL
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    // Ambil ID modul (posisi setelah /api/module/)
    const id = pathParts[3]

    // Buat context dengan params
    const context: RouteParams = { params: { id } }

    // Panggil handler dengan context
    return handler(req, context)
  }
}

// Gunakan middleware untuk PUT request
export const PUT = composeMiddlewares(
  [withAdminAuth, withAuditTrail],
  createRouteHandler(reorderModulePagesHandler)
)
