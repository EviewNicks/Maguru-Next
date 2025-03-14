// app/api/modules/[moduleId]/pages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createModulePage,
  getModulePages,
  getModuleById,
} from '@/features/manage-module/services/modulePageService'
import { ModulePageCreateSchema } from '@/features/manage-module/schemas/modulePageSchema'

// GET /api/modules/:moduleId/pages
export async function GET(
  request: NextRequest,
  context: { params: { moduleId: string } }
) {
  try {
    const moduleId = context.params.moduleId

    // Validasi moduleId
    if (!moduleId || !z.string().uuid().safeParse(moduleId).success) {
      return NextResponse.json(
        { error: 'ID modul tidak valid' },
        { status: 400 }
      )
    }

    // Periksa apakah modul ada
    const currentModule = await getModuleById(moduleId)
    if (!currentModule) {
      return NextResponse.json(
        { error: 'Modul tidak ditemukan' },
        { status: 404 }
      )
    }

    // Ambil daftar halaman modul
    const pages = await getModulePages(moduleId)

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Error in GET /api/modules/:moduleId/pages:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil halaman modul' },
      { status: 500 }
    )
  }
}

// POST /api/modules/:moduleId/pages
export async function POST(
  request: NextRequest,
  context: { params: { moduleId: string } }
) {
  try {
    const moduleId = context.params.moduleId

    // Validasi moduleId
    if (!moduleId || !z.string().uuid().safeParse(moduleId).success) {
      return NextResponse.json(
        { error: 'ID modul tidak valid' },
        { status: 400 }
      )
    }

    // Periksa apakah modul ada
    const currentModule = await getModuleById(moduleId)
    if (!currentModule) {
      return NextResponse.json(
        { error: 'Modul tidak ditemukan' },
        { status: 404 }
      )
    }

    // Parse dan validasi body request
    const body = await request.json()
    
    // Tambahkan moduleId ke body
    const data = { ...body, moduleId }
    
    // Validasi data dengan Zod schema
    const validationResult = ModulePageCreateSchema.safeParse(data)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Data tidak valid',
          details: validationResult.error.format() 
        },
        { status: 400 }
      )
    }

    // Buat halaman modul baru
    const newPage = await createModulePage(validationResult.data)

    return NextResponse.json(newPage, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/modules/:moduleId/pages:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat halaman modul' },
      { status: 500 }
    )
  }
}
