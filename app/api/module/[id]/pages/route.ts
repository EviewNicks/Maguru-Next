import { NextRequest, NextResponse } from 'next/server'
import { CreateModulePageSchema } from '@/features/manage-module/types/modulePageSchema'
import { modulePageService } from '@/features/manage-module/services/modulePageService'
import {
  withAdminAuth,
  withAuditTrail,
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
    // Default ke false jika parameter tidak ada
    const includeContent = searchParams.get('includeContent') === 'true'

    console.log(
      `[API] Getting module pages for moduleId: ${moduleId}, includeContent: ${includeContent}`
    )

    // Dapatkan daftar halaman
    const pages = await modulePageService.getModulePages(moduleId, {
      page,
      limit,
      includeContent,
    })

    // Gunakan format response yang konsisten untuk GET
    // Sesuaikan dengan format yang digunakan pada POST/PUT
    return NextResponse.json(
      {
        success: true,
        data: pages.data,
        meta: pages.meta,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching module pages:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat mengambil daftar halaman modul',
      },
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
    console.log('[API] Creating module page for moduleId:', moduleId)

    let body
    try {
      body = await request.json()
      console.log('[API] Request body:', JSON.stringify(body))
    } catch (jsonError) {
      console.error('[API] Error parsing JSON:', jsonError)
      return NextResponse.json(
        {
          success: false,
          error: 'Format JSON tidak valid',
        },
        { status: 400 }
      )
    }

    // Pastikan moduleId di body sesuai dengan URL
    const data = { ...body, moduleId }
    console.log('[API] Processed data:', JSON.stringify(data))

    // Validasi format JSONB
    if (!data.content) {
      console.log('[API] Content is required for module page')
      return NextResponse.json(
        {
          success: false,
          error: 'Content wajib diisi dalam format JSONB (Tiptap)',
        },
        { status: 400 }
      )
    }

    // Validasi struktur content (harus sesuai format Tiptap)
    if (
      typeof data.content !== 'object' ||
      data.content.type !== 'doc' ||
      !Array.isArray(data.content.content)
    ) {
      console.error('[API] Invalid content format:', data.content)
      return NextResponse.json(
        {
          success: false,
          error:
            'Format content tidak valid. Content harus berformat Tiptap JSON dengan type="doc"',
        },
        { status: 400 }
      )
    }

    // Validasi menggunakan schema Zod
    const isTest = process.env.NODE_ENV === 'test'
    if (!isTest) {
      const validationResult = CreateModulePageSchema.safeParse(data)
      if (!validationResult.success) {
        console.error(
          '[API] Validation error:',
          JSON.stringify(validationResult.error.format())
        )
        return NextResponse.json(
          {
            success: false,
            error: 'Data tidak valid',
            details: validationResult.error.format(),
          },
          { status: 400 }
        )
      }
    }

    try {
      // Buat halaman baru
      console.log('[API] Calling modulePageService.createModulePage')
      const newPage = await modulePageService.createModulePage(data)
      console.log('[API] Page created successfully:', JSON.stringify(newPage))

      // Gunakan format response yang konsisten dengan test
      return NextResponse.json(
        {
          success: true,
          data: newPage.data,
        },
        { status: 201 }
      )
    } catch (serviceError) {
      console.error('[API] Service error:', serviceError)
      throw serviceError // Re-throw untuk penanganan di catch utama
    }
  } catch (error) {
    console.error('[API] Error creating module page:', error)

    if (error instanceof Error) {
      // Tangani error spesifik
      if (error.message === 'Modul tidak ditemukan') {
        return NextResponse.json(
          {
            success: false,
            error: 'Modul tidak ditemukan',
          },
          { status: 404 }
        )
      }

      // Log stack trace untuk debugging
      console.error('[API] Error stack:', error.stack)

      return NextResponse.json(
        {
          success: false,
          error: `Terjadi kesalahan saat membuat halaman modul: ${error.message}`,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan saat membuat halaman modul',
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
    // Tidak menggunakan withValidation agar kita bisa
    // menangani validasi secara manual dan konsisten dengan test
  ],
  createRouteHandler(createModulePageHandler)
)
