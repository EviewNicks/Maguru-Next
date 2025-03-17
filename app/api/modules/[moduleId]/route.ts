// app/api/modules/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import {
  getModuleById,
  updateModule,
  deleteModule,
} from '@/features/manage-module/services/moduleService'
import { ModuleUpdateSchema } from '@/features/manage-module/schemas/moduleSchema'
import { validateRequest } from '@/features/manage-module/middleware/validateRequest'
import { isAdmin } from '@/features/manage-module/middleware/authMiddleware'
import { ZodError } from 'zod'
import { ModuleStatus } from '@/features/manage-module/types'
import { ModuleUpdateInput } from '@/features/manage-module/schemas/moduleSchema'

/**
 * GET /api/modules/[moduleId] - Mengambil modul berdasarkan ID
 */
export async function GET(
  req: NextRequest,
  context: { params: { moduleId: string } }
) {
  try {
    // Pastikan params.moduleId diakses dengan benar
    const moduleId = context.params.moduleId

    if (!moduleId) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ID',
            message: 'ID modul tidak valid',
          },
        },
        { status: 400 }
      )
    }

    const moduleData = await getModuleById(moduleId);

    if (!moduleData) {
      return NextResponse.json(
        {
          error: {
            code: 'MODULE_NOT_FOUND',
            message: 'Modul tidak ditemukan',
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json(moduleData)
  } catch (error) {
    console.error(`Error in GET /api/modules/${context.params.moduleId}:`, error)

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan internal',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/modules/[moduleId] - Memperbarui modul berdasarkan ID
 * Hanya admin yang diizinkan
 */
export async function PUT(
  req: NextRequest,
  context: { params: { moduleId: string } }
) {
  try {
    // Pastikan params.moduleId diakses dengan benar
    const moduleId = context.params.moduleId

    if (!moduleId) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ID',
            message: 'ID modul tidak valid',
          },
        },
        { status: 400 }
      )
    }

    // Validasi request
    const validationResult = await validateRequest(ModuleUpdateSchema)(req)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      )
    }

    // Periksa otorisasi
    const authResult = await isAdmin()(req)

    if (!authResult.success) {
      return NextResponse.json(
        {
          error: authResult.error || {
            code: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred',
          },
        },
        { status: authResult.error?.code === 'UNAUTHORIZED' ? 401 : 403 }
      )
    }

    // Periksa apakah modul ada
    const existingModule = await getModuleById(moduleId)

    if (!existingModule) {
      return NextResponse.json(
        {
          error: {
            code: 'MODULE_NOT_FOUND',
            message: 'Modul tidak ditemukan',
          },
        },
        { status: 404 }
      )
    }

    // Set updatedBy dari user yang terotentikasi
    const updateData: ModuleUpdateInput = {
      title: validationResult.data?.title,
      description: validationResult.data?.description,
      status: validationResult.data?.status as ModuleStatus | undefined,
      updatedBy: authResult.user.id,
    }

    // Update modul
    const updatedModule = await updateModule(moduleId, updateData)

    // Return response
    return NextResponse.json(updatedModule)
  } catch (error) {
    console.error(`Error in PUT /api/modules/${context.params.moduleId}:`, error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validasi input gagal',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan internal',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/modules/[moduleId] - Menghapus modul berdasarkan ID
 * Hanya admin yang diizinkan
 */
export async function DELETE(
  req: NextRequest,
  context: { params: { moduleId: string } }
) {
  try {
    // Pastikan params.moduleId diakses dengan benar
    const moduleId = context.params.moduleId

    if (!moduleId) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ID',
            message: 'ID modul tidak valid',
          },
        },
        { status: 400 }
      )
    }

    // Periksa otorisasi
    const authResult = await isAdmin()(req)

    if (!authResult.success) {
      return NextResponse.json(
        {
          error: authResult.error || {
            code: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred',
          },
        },
        { status: authResult.error?.code === 'UNAUTHORIZED' ? 401 : 403 }
      )
    }

    // Periksa apakah modul ada
    const existingModule = await getModuleById(moduleId)

    if (!existingModule) {
      return NextResponse.json(
        {
          error: {
            code: 'MODULE_NOT_FOUND',
            message: 'Modul tidak ditemukan',
          },
        },
        { status: 404 }
      )
    }

    // Hapus modul
    await deleteModule(moduleId)

    // Return response
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(`Error in DELETE /api/modules/${context.params.moduleId}:`, error)

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan internal',
        },
      },
      { status: 500 }
    )
  }
}
