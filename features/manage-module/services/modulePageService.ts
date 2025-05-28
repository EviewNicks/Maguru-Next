import {
  ContentBlock,
  CreateModulePageInput,
  UpdateModulePageInput,
} from '../types/modulePageSchema'
import {
  ModulePage,
  ApiListResponse,
  ApiEntityResponse,
  ModulePageStatus,
  IModulePageService,
} from '../types'
import prisma from '@/lib/prisma'
import { defaultContentJSON } from '../lib/content'
import { logger } from './logger'
import { parseContent } from '../lib/dataFormats'

// Konstanta untuk service name (context)
const SERVICE = 'ModulePageService'

/**
 * Service untuk operasi CRUD halaman modul
 */
export const modulePageService: IModulePageService = {
  /**
   * Mendapatkan moduleId dari storage
   * @param moduleId - Optional moduleId untuk digunakan jika tidak ada di storage
   * @returns moduleId dari storage atau parameter
   */
  getModuleIdFromStorage(moduleId?: string): string | null {
    // Jika moduleId diberikan, gunakan itu
    if (moduleId) {
      return moduleId
    }

    // Coba ambil dari sessionStorage jika dalam lingkungan browser
    if (typeof window !== 'undefined') {
      const storedModuleId = sessionStorage.getItem('activeModuleId')
      if (storedModuleId) {
        logger.debug(
          SERVICE,
          `Retrieved moduleId from storage: ${storedModuleId}`
        )
        return storedModuleId
      }
    }

    return null
  },

  /**
   * Membuat halaman baru dalam modul
   * @param data - Data halaman yang akan dibuat
   * @returns Halaman yang telah dibuat
   */
  async createModulePage(
    data: CreateModulePageInput & { language?: string }
  ): Promise<ApiEntityResponse<ModulePage>> {
    try {
      logger.info(SERVICE, 'Creating module page', {
        moduleId: data.moduleId,
        title: data.title,
        type: data.type,
        order: data.order,
        hasBlocks: !!data.blocks && Array.isArray(data.blocks),
      })

      // Validasi keberadaan modul
      const moduleData = await prisma.module.findUnique({
        where: { id: data.moduleId },
      })

      if (!moduleData) {
        console.error('[Service] Module not found:', data.moduleId)
        throw new Error('Modul tidak ditemukan')
      }

      // Dapatkan halaman terakhir untuk menentukan order
      const lastPage = await prisma.modulePage.findFirst({
        where: { moduleId: data.moduleId },
        orderBy: { order: 'desc' },
        select: { order: true },
      })

      // Jika order tidak disediakan atau untuk menghindari konflik, gunakan order terakhir + 1
      let orderToUse = data.order
      if (!orderToUse) {
        orderToUse = lastPage ? lastPage.order + 1 : 1
        console.log('[Service] Using calculated order:', orderToUse)
      }

      // Pastikan blocks valid dan dapat dikonversi ke JSON
      let contentJson
      try {
        contentJson = JSON.stringify(data.blocks || [])
        console.log('[Service] Content JSON successfully created')
      } catch (jsonError) {
        console.error('[Service] Error stringifying blocks:', jsonError)
        throw new Error('Format blok konten tidak valid')
      }

      let createdPage
      let retryCount = 0
      const maxRetries = 3

      while (retryCount < maxRetries) {
        try {
          // Simpan blocks sebagai JSON di kolom content
          createdPage = await prisma.modulePage.create({
            data: {
              moduleId: data.moduleId,
              title: data.title || 'Halaman Baru',
              order: orderToUse,
              content: contentJson,
              type: data.type || 'content',
              // Tambahkan default language untuk memenuhi schema
              language: data.language || 'id',
            },
          })

          // Berhasil dibuat, keluar dari loop
          break
        } catch (error: unknown) {
          // Jika error adalah constraint unik, coba dengan order yang lebih besar
          const prismaError = error as {
            code?: string
            meta?: { target?: string[] }
          }
          if (
            prismaError.code === 'P2002' &&
            prismaError.meta?.target?.includes('order')
          ) {
            retryCount++
            console.log(
              `[Service] Order conflict detected, retrying with new order (attempt ${retryCount})`
            )

            // Ambil order terbesar saat ini dan tambahkan 1
            const currentMax = await prisma.modulePage.findFirst({
              where: { moduleId: data.moduleId },
              orderBy: { order: 'desc' },
              select: { order: true },
            })

            orderToUse = (currentMax?.order || 0) + 1
            console.log(`[Service] New order to try: ${orderToUse}`)

            // Jika sudah mencapai batas retry, lempar error
            if (retryCount >= maxRetries) {
              throw new Error(
                'Gagal membuat halaman setelah beberapa percobaan. Silakan coba lagi nanti.'
              )
            }
          } else {
            // Jika bukan error constraint, lempar error asli
            throw error
          }
        }
      }

      if (!createdPage) {
        throw new Error('Gagal membuat halaman setelah beberapa percobaan')
      }

      console.log(
        '[Service] Page created successfully with ID:',
        createdPage.id
      )

      // Transform hasil untuk response API
      return {
        success: true,
        data: {
          id: createdPage.id,
          moduleId: createdPage.moduleId,
          title: createdPage.title,
          order: createdPage.order,
          blocks: data.blocks || [], // Gunakan data asli blocks, bukan string JSON
          status: ModulePageStatus.DRAFT, // Gunakan enum
          createdAt: createdPage.createdAt,
          updatedAt: createdPage.updatedAt,
        },
      }
    } catch (error) {
      console.error('[Service] Error in createModulePage:', error)
      throw error
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
    const includeContent = options.includeContent ?? false

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
    const transformedPages = pages.map((page) => {
      // Base page data tanpa blocks
      const pageData: Partial<ModulePage> = {
        id: page.id,
        moduleId: page.moduleId,
        title: page.title,
        order: page.order,
        status: ModulePageStatus.DRAFT,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      }

      // Hanya tambahkan blocks jika includeContent=true
      if (includeContent) {
        pageData.blocks = this.parseContent(page.content as string)
      } else {
        // Tambahkan blocks kosong jika client mengharapkan property ini
        pageData.blocks = []
      }

      return pageData as ModulePage
    })

    return {
      success: true,
      data: transformedPages,
      meta: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
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
        blocks: this.parseContent(page.content as string),
        status: ModulePageStatus.DRAFT,
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
      // Periksa jika blocks sudah dalam format JSON Tiptap
      if (
        data.blocks.length === 1 &&
        data.blocks[0].type === 'text' &&
        typeof data.blocks[0].content === 'string' &&
        data.blocks[0].content.startsWith('{') &&
        data.blocks[0].content.includes('"type":"doc"')
      ) {
        // Simpan content dari block tersebut langsung sebagai content halaman
        // karena ini adalah format JSON Tiptap
        updateData.content = data.blocks[0].content
        console.log(
          'Saving Tiptap JSON format directly:',
          updateData.content.substring(0, 50) + '...'
        )
      } else {
        // Format lama - simpan sebagai array blocks
        updateData.content = JSON.stringify(data.blocks)
        console.log('Saving in legacy blocks format')
      }
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
        status: ModulePageStatus.DRAFT,
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

  /**
   * Mengubah urutan halaman
   * @param moduleId - ID modul
   * @param pageIds - Array of page IDs in the desired order
   * @returns True jika berhasil diperbarui
   */
  async reorderModulePages(
    moduleId: string,
    pageIds: string[]
  ): Promise<boolean> {
    try {
      // Ensure the module exists
      const moduleExists = await prisma.module.findUnique({
        where: { id: moduleId },
      })

      if (!moduleExists) {
        throw new Error('Modul tidak ditemukan')
      }

      // Ensure all pages exist and belong to the module
      const existingPages = await prisma.modulePage.findMany({
        where: { moduleId },
        select: { id: true },
      })

      const existingPageIds = existingPages.map((page) => page.id)
      const allPagesExist = pageIds.every((id) => existingPageIds.includes(id))

      if (!allPagesExist) {
        throw new Error(
          'Beberapa halaman tidak ditemukan atau tidak dimiliki oleh modul ini'
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

      return true
    } catch (error) {
      console.error('Error reordering pages:', error)
      throw error
    }
  },

  /**
   * Parse konten dari string JSON atau data halaman
   * Menggunakan fungsi dari dataFormats.ts
   * @param content - String JSON konten
   * @param pageData - Data halaman (opsional)
   * @param returnRawJSON - Flag untuk mengembalikan JSON mentah
   * @returns Hasil parsing (ContentBlock[] atau StandardEditorContent)
   */
  parseContent(
    content: string | undefined,
    pageData?: ModulePage,
    returnRawJSON: boolean = false
  ): any {
    return parseContent(content, pageData, returnRawJSON)
  },
}
