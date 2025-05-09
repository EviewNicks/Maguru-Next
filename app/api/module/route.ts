import { NextRequest, NextResponse } from 'next/server'
import { moduleService } from '../../../features/manage-module/services/moduleService'
import { createModuleSchema } from '../../../features/manage-module/utils/moduleValidation'
import {
  withAdminAuth,
  withAuditTrail,
  withValidation,
  composeMiddlewares,
} from './middleware'
import { auth } from '@clerk/nextjs/server'

/**
 * Handler untuk GET request
 * Mendapatkan daftar modul dengan pagination, filter, dan pencarian
 */
async function getModulesHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
      ? parseInt(searchParams.get('page') as string)
      : 1
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit') as string)
      : 10
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    console.log(
      `[DEBUG] Fetching modules with params: page=${page}, limit=${limit}, status=${status}, search=${search}`
    )

    const modules = await moduleService.getModules({
      page,
      limit,
      status: status as string,
      search: search as string,
    })

    console.log(`[DEBUG] Found ${modules.data?.length || 0} modules`)

    // Log struktur response untuk debugging
    console.log(
      '[DEBUG] Response structure:',
      JSON.stringify({
        dataLength: modules.data?.length || 0,
        paginationKeys: modules.pagination
          ? Object.keys(modules.pagination)
          : 'No pagination',
      })
    )

    // Gunakan data yang berasal dari database (prioritaskan data asli)
    if (modules.data && modules.data.length > 0) {
      console.log('[DEBUG] Using real data from database')

      // Log beberapa sampel data
      console.log('[DEBUG] Sample real data:', JSON.stringify(modules.data[0]))

      return NextResponse.json(modules, { status: 200 })
    }

    // Hanya gunakan data dummy jika benar-benar tidak ada data di database
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] No modules found, adding dummy data for development')

      // Data dummy untuk pengembangan
      const dummyData = {
        data: Array(5)
          .fill(0)
          .map((_, i) => ({
            id: `dummy-${i + 1}`,
            title: `Dummy Module ${i + 1}`,
            description: `This is a dummy module for development purposes - ${i + 1}`,
            status: ['DRAFT', 'ACTIVE', 'ARCHIVED'][
              Math.floor(Math.random() * 3)
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            updatedBy: 'system',
          })),
        pagination: {
          page,
          limit,
          total: 5,
          totalPages: 1,
        },
      }

      // Log sampel data dummy
      console.log(
        '[DEBUG] Sample dummy data:',
        JSON.stringify(dummyData.data[0])
      )

      return NextResponse.json(dummyData, { status: 200 })
    }

    // Jika tidak ada data dan bukan mode development, kembalikan data kosong
    return NextResponse.json(modules, { status: 200 })
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data modul' },
      { status: 500 }
    )
  }
}

/**
 * Handler untuk POST request
 * Membuat modul baru
 */
async function createModuleHandler(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID tidak ditemukan' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const newModule = await moduleService.createModule(body, userId)
    return NextResponse.json(newModule, { status: 201 })
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat modul' },
      { status: 500 }
    )
  }
}

// Gunakan middleware untuk GET request
export const GET = composeMiddlewares(
  [withAdminAuth, withAuditTrail],
  getModulesHandler
)

// Gunakan middleware untuk POST request
export const POST = composeMiddlewares(
  [
    withAdminAuth,
    withAuditTrail,
    (handler) => withValidation(createModuleSchema, handler),
  ],
  createModuleHandler
)
