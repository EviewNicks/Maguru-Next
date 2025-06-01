import { CreateModulePageInput, UpdateModulePageInput } from '../types'
import {
  ModulePage,
  ApiListResponse,
  ApiEntityResponse,
  ModulePageStatus,
  ModuleStatus,
  IModulePageService,
  StandardEditorContent,
} from '../types'
import prisma from '@/lib/prisma'
import { logger } from './logger'
import { ensureValidEditorContent } from '../lib/dataFormats'

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
        hasContent: !!data.content,
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

      // Pastikan content valid dan dalam format yang benar
      const contentJson = ensureValidEditorContent(data.content)

      let createdPage
      let retryCount = 0
      const maxRetries = 3

      while (retryCount < maxRetries) {
        try {
          // Simpan dengan konten sebagai JSONB
          createdPage = await prisma.modulePage.create({
            data: {
              moduleId: data.moduleId,
              title: data.title || 'Halaman Baru',
              order: orderToUse,
              // Menggunakan type assertion untuk mengatasi masalah tipe
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content: contentJson as any,
              type: data.type || 'content',
              authorId: data.authorId, // Tambahkan authorId jika ada
            },
          })

          // Berhasil dibuat, keluar dari loop
          break
        } catch (error: unknown) {
          // Logic untuk retry jika terjadi konflik order
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

      // Transform hasil untuk response API - selalu kembalikan content dalam format JSONB
      const responseData: ModulePage = {
        id: createdPage.id,
        moduleId: createdPage.moduleId,
        title: createdPage.title,
        order: createdPage.order,
        type: createdPage.type,
        content: createdPage.content as unknown as StandardEditorContent,
        version: createdPage.version,
        // Cast status karena TypeScript belum mengenali pembaruan prisma schema
        status:
          (createdPage.status as ModulePageStatus) || ModulePageStatus.DRAFT,
        createdAt: createdPage.createdAt,
        updatedAt: createdPage.updatedAt,
        // Field baru untuk draft
        authorId: createdPage.authorId || undefined,
        lastEditBy: createdPage.lastEditBy || undefined,
        draftData: undefined,
        draftSavedAt: undefined,
        isDraft: false,
        hasUnpublishedChanges: false,
      }

      return {
        success: true,
        data: responseData,
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
      // Base page data
      const pageData: ModulePage = {
        id: page.id,
        moduleId: page.moduleId,
        title: page.title,
        order: page.order,
        type: page.type,
        content: page.content as unknown as StandardEditorContent,
        version: page.version,
        // Cast status karena TypeScript belum mengenali pembaruan prisma schema
        status: (page.status as ModulePageStatus) || ModulePageStatus.DRAFT,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        // Field baru untuk draft
        authorId: page.authorId || undefined,
        lastEditBy: page.lastEditBy || undefined,
        draftData:
          (page.draftData as unknown as StandardEditorContent) || undefined,
        draftSavedAt: page.draftSavedAt || undefined,
        isDraft: page.isDraft || false,
        hasUnpublishedChanges: page.hasUnpublishedChanges || false,
      }

      return pageData
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
        type: page.type,
        content: page.content as unknown as StandardEditorContent,
        version: page.version,
        // Cast status karena TypeScript belum mengenali pembaruan prisma schema
        status: (page.status as ModulePageStatus) || ModulePageStatus.DRAFT,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        // Field baru untuk draft
        authorId: page.authorId || undefined,
        lastEditBy: page.lastEditBy || undefined,
        draftData:
          (page.draftData as unknown as StandardEditorContent) || undefined,
        draftSavedAt: page.draftSavedAt || undefined,
        isDraft: page.isDraft || false,
        hasUnpublishedChanges: page.hasUnpublishedChanges || false,
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

    // Persiapkan data update yang akan di-spread
    const baseUpdateData = {
      version: { increment: 1 }, // Optimistic locking
    }

    // Penggunaan Record<string, unknown> untuk tipe yang lebih aman
    const updateFields: Record<string, unknown> = { ...baseUpdateData }

    if (data.title) {
      updateFields.title = data.title
    }

    if (data.order) {
      updateFields.order = data.order
    }

    if (data.type) {
      updateFields.type = data.type
    }

    // Jika status diupdate
    if (data.status) {
      updateFields.status = data.status
      console.log(`[Service] Updating page status to: ${data.status}`)
    }

    // Jika lastEditBy diupdate
    if (data.lastEditBy) {
      updateFields.lastEditBy = data.lastEditBy
    }

    // Pastikan content valid jika diberikan
    if (data.content) {
      // Konversi tipe yang aman dengan ensureValidEditorContent
      const contentValue = ensureValidEditorContent(data.content)
      // Gunakan type assertion untuk mengatasi masalah tipe
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateFields.content = contentValue as any

      // Reset draft jika konten utama diupdate
      updateFields.hasUnpublishedChanges = false
      updateFields.draftData = undefined
      updateFields.draftSavedAt = undefined
    }

    // Update halaman
    const updatedPage = await prisma.modulePage.update({
      where: { id: pageId },
      data: updateFields,
    })

    // Transform hasil untuk response API
    return {
      success: true,
      data: {
        id: updatedPage.id,
        moduleId: updatedPage.moduleId,
        title: updatedPage.title,
        order: updatedPage.order,
        type: updatedPage.type,
        content: updatedPage.content as unknown as StandardEditorContent,
        version: updatedPage.version,
        // Cast status karena TypeScript belum mengenali pembaruan prisma schema
        status:
          (updatedPage.status as ModulePageStatus) || ModulePageStatus.DRAFT,
        createdAt: updatedPage.createdAt,
        updatedAt: updatedPage.updatedAt,
        // Field baru untuk draft
        authorId: updatedPage.authorId || undefined,
        lastEditBy: updatedPage.lastEditBy || undefined,
        draftData:
          (updatedPage.draftData as unknown as StandardEditorContent) ||
          undefined,
        draftSavedAt: updatedPage.draftSavedAt || undefined,
        isDraft: updatedPage.isDraft || false,
        hasUnpublishedChanges: updatedPage.hasUnpublishedChanges || false,
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
   * Parse konten ke format StandardEditorContent
   * @param content - Konten yang akan diparse (objek JSONB atau lainnya)
   * @returns Hasil parsing sebagai StandardEditorContent
   */
  parseContent(content: unknown): StandardEditorContent {
    // Jika lib/dataFormats tidak mendukung parameter returnRawJSON, hapus parameter kedua
    return ensureValidEditorContent(content)
  },

  /**
   * Menyimpan draft ke database
   * @param pageId - ID halaman
   * @param draftData - Konten draft
   * @param authorId - ID pengguna yang menyimpan draft
   * @returns Halaman dengan draft yang telah disimpan
   */
  async saveDraft(
    pageId: string,
    draftData: StandardEditorContent,
    authorId: string
  ): Promise<ApiEntityResponse<ModulePage> | null> {
    try {
      logger.info(SERVICE, 'Saving draft for page', {
        pageId,
        authorId,
        hasContent: !!draftData,
      })

      // Cek keberadaan halaman
      const existingPage = await prisma.modulePage.findUnique({
        where: { id: pageId },
      })

      if (!existingPage) {
        logger.error(SERVICE, 'Page not found for draft save', { pageId })
        return null
      }

      // Pastikan draftData valid dan dalam format yang benar
      const validDraftData = ensureValidEditorContent(draftData)

      // Update halaman dengan draft baru
      const updatedPage = await prisma.modulePage.update({
        where: { id: pageId },
        data: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          draftData: validDraftData as any,
          draftSavedAt: new Date(),
          lastEditBy: authorId,
          hasUnpublishedChanges: true,
          isDraft: true,
        },
      })

      logger.debug(SERVICE, 'Draft saved successfully', {
        pageId,
        draftSavedAt: updatedPage.draftSavedAt,
      })

      // Transform hasil untuk response API
      return {
        success: true,
        data: {
          id: updatedPage.id,
          moduleId: updatedPage.moduleId,
          title: updatedPage.title,
          order: updatedPage.order,
          type: updatedPage.type,
          content: updatedPage.content as unknown as StandardEditorContent,
          version: updatedPage.version,
          status:
            (updatedPage.status as ModulePageStatus) || ModulePageStatus.DRAFT,
          createdAt: updatedPage.createdAt,
          updatedAt: updatedPage.updatedAt,
          authorId: updatedPage.authorId || undefined,
          lastEditBy: updatedPage.lastEditBy || undefined,
          draftData: updatedPage.draftData as unknown as StandardEditorContent,
          draftSavedAt: updatedPage.draftSavedAt || undefined,
          isDraft: updatedPage.isDraft || false,
          hasUnpublishedChanges: updatedPage.hasUnpublishedChanges || false,
        },
      }
    } catch (error) {
      logger.error(SERVICE, 'Error saving draft', { error, pageId })
      throw error
    }
  },

  /**
   * Mendapatkan draft terbaru dari database
   * @param pageId - ID halaman
   * @returns Halaman dengan draft
   */
  async getDraft(
    pageId: string
  ): Promise<ApiEntityResponse<ModulePage> | null> {
    try {
      logger.info(SERVICE, 'Getting draft for page', { pageId })

      // Ambil halaman dengan draft
      const page = await prisma.modulePage.findUnique({
        where: { id: pageId },
      })

      if (!page) {
        logger.error(SERVICE, 'Page not found for draft retrieval', { pageId })
        return null
      }

      // Jika tidak ada draft, kembalikan null untuk draftData
      if (!page.draftData) {
        logger.debug(SERVICE, 'No draft found for page', { pageId })
        return {
          success: true,
          data: {
            id: page.id,
            moduleId: page.moduleId,
            title: page.title,
            order: page.order,
            type: page.type,
            content: page.content as unknown as StandardEditorContent,
            version: page.version,
            status: (page.status as ModulePageStatus) || ModulePageStatus.DRAFT,
            createdAt: page.createdAt,
            updatedAt: page.updatedAt,
            authorId: page.authorId || undefined,
            lastEditBy: page.lastEditBy || undefined,
            draftData: undefined,
            draftSavedAt: undefined,
            isDraft: false,
            hasUnpublishedChanges: false,
          },
        }
      }

      // Transform hasil untuk response API
      return {
        success: true,
        data: {
          id: page.id,
          moduleId: page.moduleId,
          title: page.title,
          order: page.order,
          type: page.type,
          content: page.content as unknown as StandardEditorContent,
          version: page.version,
          status: (page.status as ModulePageStatus) || ModulePageStatus.DRAFT,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
          authorId: page.authorId || undefined,
          lastEditBy: page.lastEditBy || undefined,
          draftData: page.draftData as unknown as StandardEditorContent,
          draftSavedAt: page.draftSavedAt || undefined,
          isDraft: page.isDraft || false,
          hasUnpublishedChanges: page.hasUnpublishedChanges || false,
        },
      }
    } catch (error) {
      logger.error(SERVICE, 'Error getting draft', { error, pageId })
      throw error
    }
  },

  /**
   * Mempublikasikan draft menjadi versi published
   * @param pageId - ID halaman
   * @returns Halaman yang telah dipublikasikan
   */
  async publishDraft(
    pageId: string
  ): Promise<ApiEntityResponse<ModulePage> | null> {
    try {
      logger.info(SERVICE, 'Publishing draft for page', { pageId })

      // Cek keberadaan halaman dan draft
      const existingPage = await prisma.modulePage.findUnique({
        where: { id: pageId },
      })

      if (!existingPage) {
        logger.error(SERVICE, 'Page not found for draft publish', { pageId })
        return null
      }

      if (!existingPage.draftData) {
        logger.error(SERVICE, 'No draft found to publish', { pageId })
        return null
      }

      // Update halaman dengan konten dari draft dan increment version
      const updatedPage = await prisma.modulePage.update({
        where: { id: pageId },
        data: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: existingPage.draftData as any, // Gunakan konten draft sebagai konten utama
          draftData: undefined, // Reset draft
          draftSavedAt: undefined,
          isDraft: false,
          hasUnpublishedChanges: false,
          version: { increment: 1 }, // Increment version saat publish
          status: ModulePageStatus.PUBLISHED as unknown as ModuleStatus, // Cast ke ModuleStatus
        },
      })

      logger.debug(SERVICE, 'Draft published successfully', {
        pageId,
        newVersion: updatedPage.version,
      })

      // Transform hasil untuk response API
      return {
        success: true,
        data: {
          id: updatedPage.id,
          moduleId: updatedPage.moduleId,
          title: updatedPage.title,
          order: updatedPage.order,
          type: updatedPage.type,
          content: updatedPage.content as unknown as StandardEditorContent,
          version: updatedPage.version,
          status: ModulePageStatus.PUBLISHED,
          createdAt: updatedPage.createdAt,
          updatedAt: updatedPage.updatedAt,
          authorId: updatedPage.authorId || undefined,
          lastEditBy: updatedPage.lastEditBy || undefined,
          draftData: undefined,
          draftSavedAt: undefined,
          isDraft: false,
          hasUnpublishedChanges: false,
        },
      }
    } catch (error) {
      logger.error(SERVICE, 'Error publishing draft', { error, pageId })
      throw error
    }
  },

  /**
   * Membuang draft dan kembali ke versi published
   * @param pageId - ID halaman
   * @returns True jika berhasil dibuang
   */
  async discardDraft(pageId: string): Promise<boolean> {
    try {
      logger.info(SERVICE, 'Discarding draft for page', { pageId })

      // Cek keberadaan halaman
      const existingPage = await prisma.modulePage.findUnique({
        where: { id: pageId },
      })

      if (!existingPage) {
        logger.error(SERVICE, 'Page not found for draft discard', { pageId })
        return false
      }

      // Update halaman untuk menghapus draft
      await prisma.modulePage.update({
        where: { id: pageId },
        data: {
          draftData: undefined,
          draftSavedAt: undefined,
          isDraft: false,
          hasUnpublishedChanges: false,
        },
      })

      logger.debug(SERVICE, 'Draft discarded successfully', { pageId })
      return true
    } catch (error) {
      logger.error(SERVICE, 'Error discarding draft', { error, pageId })
      throw error
    }
  },
}
