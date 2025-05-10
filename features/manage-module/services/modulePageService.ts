import { PrismaClient } from '@prisma/client'
import {
  ContentBlock,
  CreateModulePageInput,
  UpdateModulePageInput,
} from '../types/modulePageSchema'
import {
  ModulePage,
  ApiListResponse,
  ApiEntityResponse,
  PaginationMeta,
} from '../types'

const prisma = new PrismaClient()

/**
 * Service untuk operasi CRUD halaman modul
 */
export const modulePageService = {
  /**
   * Membuat halaman baru dalam modul
   * @param data - Data halaman yang akan dibuat
   * @returns Halaman yang telah dibuat
   */
  async createModulePage(
    data: CreateModulePageInput
  ): Promise<ApiEntityResponse<ModulePage>> {
    // Validasi keberadaan modul
    const module = await prisma.module.findUnique({
      where: { id: data.moduleId },
    })

    if (!module) {
      throw new Error('Modul tidak ditemukan')
    }

    // Jika order tidak disediakan, tandai sebagai halaman terakhir
    if (!data.order) {
      const lastPage = await prisma.modulePage.findFirst({
        where: { moduleId: data.moduleId },
        orderBy: { order: 'desc' },
        select: { order: true },
      })
      data.order = lastPage ? lastPage.order + 1 : 1
    }

    // Simpan blocks sebagai JSON di kolom content
    const createdPage = await prisma.modulePage.create({
      data: {
        moduleId: data.moduleId,
        title: data.title,
        order: data.order,
        content: JSON.stringify(data.blocks),
      },
    })

    // Transform hasil untuk response API
    return {
      success: true,
      data: {
        id: createdPage.id,
        moduleId: createdPage.moduleId,
        title: createdPage.title,
        order: createdPage.order,
        blocks: data.blocks, // Gunakan data asli blocks, bukan string JSON
        createdAt: createdPage.createdAt,
        updatedAt: createdPage.updatedAt,
      },
    }
  },

  /**
   * Mendapatkan daftar halaman dalam modul
   * @param moduleId - ID modul
   * @param options - Opsi query (pagination, includeContent)
   * @returns Daftar halaman dengan pagination
   */
  async getModulePages(
    moduleId: string,
    options: { page?: number; limit?: number; includeContent?: boolean } = {}
  ): Promise<ApiListResponse<ModulePage>> {
    const page = options.page || 1
    const limit = options.limit || 10
    const skip = (page - 1) * limit

    // Ambil daftar halaman
    const pages = await prisma.modulePage.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
      skip,
      take: limit,
    })

    // Hitung total halaman
    const total = await prisma.modulePage.count({
      where: { moduleId },
    })

    // Transform hasil untuk response API
    const transformedPages = pages.map((page) => ({
      id: page.id,
      moduleId: page.moduleId,
      title: page.title,
      order: page.order,
      blocks: JSON.parse(page.content as string) as ContentBlock[],
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    }))

    return {
      success: true,
      data: transformedPages,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  /**
   * Mendapatkan detail halaman berdasarkan ID
   * @param pageId - ID halaman
   * @returns Detail halaman
   */
  async getModulePage(
    pageId: string
  ): Promise<ApiEntityResponse<ModulePage> | null> {
    const page = await prisma.modulePage.findUnique({
      where: { id: pageId },
    })

    if (!page) {
      return null
    }

    // Transform hasil untuk response API
    return {
      success: true,
      data: {
        id: page.id,
        moduleId: page.moduleId,
        title: page.title,
        order: page.order,
        blocks: JSON.parse(page.content as string) as ContentBlock[],
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      },
    }
  },

  /**
   * Memperbarui halaman berdasarkan ID
   * @param pageId - ID halaman
   * @param data - Data yang akan diperbarui
   * @returns Halaman yang telah diperbarui
   */
  async updateModulePage(
    pageId: string,
    data: UpdateModulePageInput
  ): Promise<ApiEntityResponse<ModulePage> | null> {
    // Cek keberadaan halaman
    const existingPage = await prisma.modulePage.findUnique({
      where: { id: pageId },
    })

    if (!existingPage) {
      return null
    }

    // Persiapkan data update
    const updateData: {
      title?: string
      order?: number
      content?: string
      version: { increment: 1 }
    } = {
      version: { increment: 1 }, // Optimistic locking
    }

    if (data.title) {
      updateData.title = data.title
    }

    if (data.order) {
      updateData.order = data.order
    }

    if (data.blocks) {
      updateData.content = JSON.stringify(data.blocks)
    }

    // Update halaman
    const updatedPage = await prisma.modulePage.update({
      where: { id: pageId },
      data: updateData,
    })

    // Parse konten dari JSON
    const blocks =
      data.blocks ||
      (JSON.parse(updatedPage.content as string) as ContentBlock[])

    // Transform hasil untuk response API
    return {
      success: true,
      data: {
        id: updatedPage.id,
        moduleId: updatedPage.moduleId,
        title: updatedPage.title,
        order: updatedPage.order,
        blocks,
        createdAt: updatedPage.createdAt,
        updatedAt: updatedPage.updatedAt,
      },
    }
  },

  /**
   * Menghapus halaman berdasarkan ID
   * @param pageId - ID halaman
   * @returns True jika berhasil dihapus
   */
  async deleteModulePage(pageId: string): Promise<boolean> {
    // Cek keberadaan halaman
    const existingPage = await prisma.modulePage.findUnique({
      where: { id: pageId },
    })

    if (!existingPage) {
      return false
    }

    // Hapus halaman
    await prisma.modulePage.delete({
      where: { id: pageId },
    })

    return true
  },
}
