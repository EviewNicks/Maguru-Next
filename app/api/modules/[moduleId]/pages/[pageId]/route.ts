// app/api/modules/[moduleId]/pages/[pageId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getModulePageById,
  updateModulePage,
  deleteModulePage,
} from '@/features/manage-module/services/modulePageService'
import { ModulePageUpdateSchema } from '@/features/manage-module/schemas/modulePageSchema'

// GET /api/modules/:moduleId/pages/:pageId
export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string; pageId: string } }
) {
  try {
    const { moduleId, pageId } = params

    // Validasi moduleId dan pageId
    if (!moduleId || !z.string().uuid().safeParse(moduleId).success) {
      return NextResponse.json(
        { error: 'ID modul tidak valid' },
        { status: 400 }
      )
    }

    if (!pageId || !z.string().uuid().safeParse(pageId).success) {
      return NextResponse.json(
        { error: 'ID halaman tidak valid' },
        { status: 400 }
      )
    }

    // Ambil halaman modul berdasarkan ID
    const page = await getModulePageById(pageId)
    if (!page) {
      return NextResponse.json(
        { error: 'Halaman modul tidak ditemukan' },
        { status: 404 }
      )
    }

    // Pastikan halaman milik modul yang benar
    if (page.moduleId !== moduleId) {
      return NextResponse.json(
        { error: 'Halaman modul tidak ditemukan dalam modul ini' },
        { status: 404 }
      )
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error in GET /api/modules/:moduleId/pages/:pageId:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil halaman modul' },
      { status: 500 }
    )
  }
}

// PUT /api/modules/:moduleId/pages/:pageId
export async function PUT(
  request: NextRequest,
  { params }: { params: { moduleId: string; pageId: string } }
) {
  try {
    const { moduleId, pageId } = params

    // Validasi moduleId dan pageId
    if (!moduleId || !z.string().uuid().safeParse(moduleId).success) {
      return NextResponse.json(
        { error: 'ID modul tidak valid' },
        { status: 400 }
      )
    }

    if (!pageId || !z.string().uuid().safeParse(pageId).success) {
      return NextResponse.json(
        { error: 'ID halaman tidak valid' },
        { status: 400 }
      )
    }

    // Periksa apakah halaman ada dan milik modul yang benar
    const existingPage = await getModulePageById(pageId)
    if (!existingPage) {
      return NextResponse.json(
        { error: 'Halaman modul tidak ditemukan' },
        { status: 404 }
      )
    }

    if (existingPage.moduleId !== moduleId) {
      return NextResponse.json(
        { error: 'Halaman modul tidak ditemukan dalam modul ini' },
        { status: 404 }
      )
    }

    // Parse dan validasi body request
    const body = await request.json()
    
    // Pastikan tipe tidak berubah jika tidak disediakan
    const data = { 
      ...body,
      type: body.type || existingPage.type 
    }
    
    // Validasi data dengan Zod schema
    const validationResult = ModulePageUpdateSchema.safeParse(data)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Data tidak valid',
          details: validationResult.error.format() 
        },
        { status: 400 }
      )
    }

    // Ambil versi saat ini dari header
    const currentVersion = Number(request.headers.get('x-page-version') || existingPage.version)

    // Perbarui halaman modul
    const updatedPage = await updateModulePage(
      pageId,
      validationResult.data,
      currentVersion
    )

    return NextResponse.json(updatedPage)
  } catch (error) {
    console.error('Error in PUT /api/modules/:moduleId/pages/:pageId:', error)
    
    // Cek jika error adalah karena konflik versi
    if (error instanceof Error && error.message.includes('Versi halaman tidak sesuai')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 } // Conflict
      )
    }
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui halaman modul' },
      { status: 500 }
    )
  }
}

// DELETE /api/modules/:moduleId/pages/:pageId
export async function DELETE(
  request: NextRequest,
  { params }: { params: { moduleId: string; pageId: string } }
) {
  try {
    const { moduleId, pageId } = params

    // Validasi moduleId dan pageId
    if (!moduleId || !z.string().uuid().safeParse(moduleId).success) {
      return NextResponse.json(
        { error: 'ID modul tidak valid' },
        { status: 400 }
      )
    }

    if (!pageId || !z.string().uuid().safeParse(pageId).success) {
      return NextResponse.json(
        { error: 'ID halaman tidak valid' },
        { status: 400 }
      )
    }

    // Periksa apakah halaman ada dan milik modul yang benar
    const existingPage = await getModulePageById(pageId)
    if (!existingPage) {
      return NextResponse.json(
        { error: 'Halaman modul tidak ditemukan' },
        { status: 404 }
      )
    }

    if (existingPage.moduleId !== moduleId) {
      return NextResponse.json(
        { error: 'Halaman modul tidak ditemukan dalam modul ini' },
        { status: 404 }
      )
    }

    // Hapus halaman modul
    const deletedPage = await deleteModulePage(pageId)

    return NextResponse.json(deletedPage)
  } catch (error) {
    console.error('Error in DELETE /api/modules/:moduleId/pages/:pageId:', error)
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus halaman modul'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
