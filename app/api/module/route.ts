import { NextRequest, NextResponse } from 'next/server'
import { moduleService } from '../../../features/manage-module/services/moduleService'
import {
  moduleQuerySchema,
  createModuleSchema,
} from '../../../features/manage-module/utils/moduleValidation'
import {
  withAdminAuth,
  withAuditTrail,
  withValidation,
  composeMiddlewares,
} from './middleware'
import { auth } from '@clerk/nextjs'

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

    const modules = await moduleService.getModules({
      page,
      limit,
      status: status as string,
      search: search as string,
    })

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
    const { userId } = auth()

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
