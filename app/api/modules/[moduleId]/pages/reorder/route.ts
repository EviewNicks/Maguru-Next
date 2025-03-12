// app/api/modules/[moduleId]/pages/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  reorderModulePages,
  getModuleById,
} from '@/features/manage-module/services/modulePageService'
import { ModulePageReorderSchema } from '@/features/manage-module/schemas/modulePageSchema'

// PATCH /api/modules/:moduleId/pages/reorder
export async function PATCH(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const moduleId = params.moduleId

    // Validasi moduleId
    if (!moduleId || !z.string().uuid().safeParse(moduleId).success) {
      return NextResponse.json(
        { error: 'ID modul tidak valid' },
        { status: 400 }
      )
    }

    // Periksa apakah modul ada
    const module = await getModuleById(moduleId)
    if (!module) {
      return NextResponse.json(
        { error: 'Modul tidak ditemukan' },
        { status: 404 }
      )
    }

    // Parse dan validasi body request
    const body = await request.json()
    
    // Validasi data dengan Zod schema
    const validationResult = ModulePageReorderSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Data tidak valid',
          details: validationResult.error.format() 
        },
        { status: 400 }
      )
    }

    // Perbarui urutan halaman modul
    const updatedPages = await reorderModulePages(
      moduleId,
      validationResult.data
    )

    return NextResponse.json({ pages: updatedPages })
  } catch (error) {
    console.error('Error in PATCH /api/modules/:moduleId/pages/reorder:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengubah urutan halaman modul' },
      { status: 500 }
    )
  }
}
