import { NextRequest, NextResponse } from 'next/server'
import { moduleService } from '../../../../../features/manage-module/services/moduleService'
import {
  withAdminAuth,
  withAuditTrail,
  composeMiddlewares,
} from '../../middleware'
import { auth } from '@clerk/nextjs/server'

// Tipe untuk params dari route dynamic
type RouteParams = { params: { id: string } }

/**
 * Handler untuk PATCH request
 * Memperbarui status modul berdasarkan ID
 */
async function updateModuleStatusHandler(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const moduleId = context.params.id
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID tidak ditemukan' },
        { status: 401 }
      )
    }

    const body = await request.json()

    if (!body.status) {
      return NextResponse.json(
        { error: 'Status tidak boleh kosong' },
        { status: 400 }
      )
    }

    const updatedModule = await moduleService.updateModuleStatus(
      moduleId,
      body.status,
      userId
    )

    if (!updatedModule) {
      return NextResponse.json(
        { error: 'Modul tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedModule, { status: 200 })
  } catch (error) {
    console.error('Error updating module status:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui status modul' },
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
    // ID modul ada di posisi sebelum 'status'
    const idIndex = pathParts.indexOf('status') - 1
    const id = pathParts[idIndex]

    // Buat context dengan params
    const context: RouteParams = { params: { id } }

    // Panggil handler dengan context
    return handler(req, context)
  }
}

// Gunakan middleware untuk PATCH request
export const PATCH = composeMiddlewares(
  [withAdminAuth, withAuditTrail],
  createRouteHandler(updateModuleStatusHandler)
)
