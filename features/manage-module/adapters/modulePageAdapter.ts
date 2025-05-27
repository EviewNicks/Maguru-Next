import { modulePageService } from '../services/modulePageService'
import {
  ModulePage,
  CreateModulePageInput,
  UpdateModulePageInput,
  IModulePageAdapter,
  StandardEditorContent,
} from '../types'
import {
  blocksToStandardContent,
  standardContentToBlocks,
  parseContent,
} from '../lib/dataFormats'
import { logger } from '../services/logger'

// Konstanta untuk adapter name (context)
const ADAPTER = 'ModulePageAdapter'

// Interface untuk cache
interface Cache {
  pages: {
    [moduleId: string]: {
      data: ModulePage[]
      timestamp: number
    }
  }
  page: {
    [pageId: string]: {
      data: ModulePage
      timestamp: number
    }
  }
}

// Cache expiration in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000

/**
 * ModulePageAdapter - Layer untuk menjembatani antara service dan context
 * Adapter ini menyediakan abstraksi untuk operasi yang berhubungan dengan module page
 * dan menangani transformasi format data secara konsisten
 */
export const modulePageAdapter: IModulePageAdapter = {
  // Local cache untuk menyimpan data
  _cache: {
    pages: {},
    page: {},
  } as Cache,

  /**
   * Menghapus cache untuk modul tertentu
   * @param moduleId - ID modul
   */
  invalidateModuleCache(moduleId: string): void {
    logger.debug(ADAPTER, `Invalidating cache for module ${moduleId}`)

    // Hapus cache untuk daftar halaman modul
    if (this._cache.pages[moduleId]) {
      delete this._cache.pages[moduleId]
    }

    // Hapus cache untuk halaman individual yang terkait dengan modul
    Object.keys(this._cache.page).forEach((pageId) => {
      if (this._cache.page[pageId]?.data.moduleId === moduleId) {
        delete this._cache.page[pageId]
      }
    })
  },

  /**
   * Menghapus cache untuk halaman tertentu
   * @param pageId - ID halaman
   */
  invalidatePageCache(pageId: string): void {
    logger.debug(ADAPTER, `Invalidating cache for page ${pageId}`)

    if (this._cache.page[pageId]) {
      // Ambil moduleId dari cache sebelum dihapus
      const moduleId = this._cache.page[pageId].data.moduleId

      // Hapus cache halaman
      delete this._cache.page[pageId]

      // Hapus juga cache modul terkait agar data selalu konsisten
      if (moduleId && this._cache.pages[moduleId]) {
        delete this._cache.pages[moduleId]
      }
    }
  },

  /**
   * Validasi input moduleId
   * @param moduleId - ID modul yang akan divalidasi
   * @throws Error jika moduleId tidak valid
   */
  validateModuleId(
    moduleId: string | null | undefined
  ): asserts moduleId is string {
    if (!moduleId) {
      logger.error(ADAPTER, 'ModuleId is required but was not provided')
      throw new Error('ModuleId diperlukan')
    }

    if (typeof moduleId !== 'string') {
      logger.error(ADAPTER, `Invalid moduleId type: ${typeof moduleId}`)
      throw new Error('ModuleId harus berupa string')
    }
  },

  /**
   * Validasi input pageId
   * @param pageId - ID halaman yang akan divalidasi
   * @throws Error jika pageId tidak valid
   */
  validatePageId(pageId: string | null | undefined): asserts pageId is string {
    if (!pageId) {
      logger.error(ADAPTER, 'PageId is required but was not provided')
      throw new Error('PageId diperlukan')
    }

    if (typeof pageId !== 'string') {
      logger.error(ADAPTER, `Invalid pageId type: ${typeof pageId}`)
      throw new Error('PageId harus berupa string')
    }
  },

  /**
   * Mendapatkan daftar halaman untuk modul tertentu
   * @param moduleId - ID modul
   * @param skipCache - Flag untuk melewati cache
   * @returns Promise dengan array ModulePage
   */
  getPages: async (
    moduleId: string,
    skipCache: boolean = false
  ): Promise<ModulePage[]> => {
    try {
      // Validasi input
      modulePageAdapter.validateModuleId(moduleId)

      // Cek cache jika skipCache=false
      if (
        !skipCache &&
        modulePageAdapter._cache.pages[moduleId] &&
        Date.now() - modulePageAdapter._cache.pages[moduleId].timestamp <
          CACHE_EXPIRATION
      ) {
        logger.debug(ADAPTER, `Using cached data for module ${moduleId}`)
        return modulePageAdapter._cache.pages[moduleId].data
      }

      logger.info(ADAPTER, `Fetching pages for module ${moduleId}`)
      const response = await modulePageService.getModulePages(moduleId, {
        includeContent: true,
      })

      // Simpan ke cache
      modulePageAdapter._cache.pages[moduleId] = {
        data: response.data,
        timestamp: Date.now(),
      }

      return response.data
    } catch (error) {
      logger.error(
        ADAPTER,
        `Error fetching pages for module ${moduleId}`,
        error
      )
      throw error
    }
  },

  /**
   * Mendapatkan detail halaman berdasarkan ID
   * @param pageId - ID halaman
   * @param skipCache - Flag untuk melewati cache
   * @returns Promise dengan detail ModulePage atau null
   */
  getPage: async (
    pageId: string,
    skipCache: boolean = false
  ): Promise<ModulePage | null> => {
    try {
      // Validasi input
      modulePageAdapter.validatePageId(pageId)

      // Cek cache jika skipCache=false
      if (
        !skipCache &&
        modulePageAdapter._cache.page[pageId] &&
        Date.now() - modulePageAdapter._cache.page[pageId].timestamp <
          CACHE_EXPIRATION
      ) {
        logger.debug(ADAPTER, `Using cached data for page ${pageId}`)
        return modulePageAdapter._cache.page[pageId].data
      }

      logger.info(ADAPTER, `Fetching page ${pageId}`)
      const response = await modulePageService.getModulePage(pageId)

      if (response?.data) {
        // Simpan ke cache
        modulePageAdapter._cache.page[pageId] = {
          data: response.data,
          timestamp: Date.now(),
        }
        return response.data
      }

      return null
    } catch (error) {
      logger.error(ADAPTER, `Error fetching page ${pageId}`, error)
      return null
    }
  },

  /**
   * Membuat halaman baru
   * @param data - Data halaman yang akan dibuat
   * @returns Promise dengan ModulePage yang baru dibuat
   */
  createPage: async (data: CreateModulePageInput): Promise<ModulePage> => {
    try {
      // Validasi input
      modulePageAdapter.validateModuleId(data.moduleId)

      logger.info(ADAPTER, `Creating new page for module ${data.moduleId}`)
      const response = await modulePageService.createModulePage(data)

      // Invalidate module cache
      modulePageAdapter.invalidateModuleCache(data.moduleId)

      return response.data
    } catch (error) {
      logger.error(ADAPTER, 'Error creating page', error)
      throw error
    }
  },

  /**
   * Memperbarui halaman berdasarkan ID
   * @param pageId - ID halaman
   * @param data - Data yang akan diperbarui
   * @returns Promise dengan ModulePage yang telah diperbarui atau null
   */
  updatePage: async (
    pageId: string,
    data: UpdateModulePageInput
  ): Promise<ModulePage | null> => {
    try {
      // Validasi input
      modulePageAdapter.validatePageId(pageId)

      logger.info(ADAPTER, `Updating page ${pageId}`)
      const response = await modulePageService.updateModulePage(pageId, data)

      if (response?.data) {
        // Invalidate cache
        modulePageAdapter.invalidatePageCache(pageId)
        modulePageAdapter.invalidateModuleCache(response.data.moduleId)

        return response.data
      }

      return null
    } catch (error) {
      logger.error(ADAPTER, `Error updating page ${pageId}`, error)
      throw error
    }
  },

  /**
   * Menghapus halaman berdasarkan ID
   * @param pageId - ID halaman
   * @returns Promise dengan boolean yang menunjukkan keberhasilan
   */
  deletePage: async (pageId: string): Promise<boolean> => {
    try {
      // Validasi input
      modulePageAdapter.validatePageId(pageId)

      // Dapatkan halaman untuk moduleId sebelum dihapus
      const page = await modulePageAdapter.getPage(pageId)
      const moduleId = page?.moduleId

      logger.info(ADAPTER, `Deleting page ${pageId}`)
      const result = await modulePageService.deleteModulePage(pageId)

      if (result && moduleId) {
        // Invalidate cache
        modulePageAdapter.invalidatePageCache(pageId)
        modulePageAdapter.invalidateModuleCache(moduleId)
      }

      return result
    } catch (error) {
      logger.error(ADAPTER, `Error deleting page ${pageId}`, error)
      throw error
    }
  },

  /**
   * Mengubah urutan halaman
   * @param moduleId - ID modul
   * @param pageIds - Array of page IDs in the desired order
   * @returns Promise dengan boolean yang menunjukkan keberhasilan
   */
  reorderPages: async (
    moduleId: string,
    pageIds: string[]
  ): Promise<boolean> => {
    try {
      // Validasi input
      modulePageAdapter.validateModuleId(moduleId)

      if (!Array.isArray(pageIds) || pageIds.length === 0) {
        logger.error(ADAPTER, 'PageIds must be a non-empty array')
        throw new Error('PageIds harus berupa array yang tidak kosong')
      }

      logger.info(ADAPTER, `Reordering pages for module ${moduleId}`)
      const result = await modulePageService.reorderModulePages(
        moduleId,
        pageIds
      )

      if (result) {
        // Invalidate module cache
        modulePageAdapter.invalidateModuleCache(moduleId)

        // Invalidate all affected page caches
        pageIds.forEach((pageId) =>
          modulePageAdapter.invalidatePageCache(pageId)
        )
      }

      return result
    } catch (error) {
      logger.error(
        ADAPTER,
        `Error reordering pages for module ${moduleId}`,
        error
      )
      throw error
    }
  },

  /**
   * Menyimpan konten editor
   * @param pageId - ID halaman
   * @param editorContent - Konten dari editor dalam format JSON
   * @returns Promise dengan ModulePage yang telah diperbarui atau null
   */
  saveEditorContent: async (
    pageId: string,
    editorContent: unknown
  ): Promise<ModulePage | null> => {
    try {
      // Validasi input
      modulePageAdapter.validatePageId(pageId)

      if (!editorContent || typeof editorContent !== 'object') {
        logger.error(ADAPTER, `Invalid editor content: ${typeof editorContent}`)
        throw new Error('Konten editor tidak valid')
      }

      // Validasi dan konversi ke StandardEditorContent
      if (!('type' in editorContent) || editorContent.type !== 'doc') {
        logger.error(
          ADAPTER,
          'Editor content does not have valid Tiptap format'
        )
        throw new Error('Format konten editor tidak valid')
      }

      logger.info(ADAPTER, `Saving editor content for page ${pageId}`)

      // Gunakan format blocks yang konsisten dengan standardContentToBlocks
      const blocks = standardContentToBlocks(
        editorContent as StandardEditorContent
      )

      // Update halaman dengan blocks yang konsisten
      const response = await modulePageService.updateModulePage(pageId, {
        blocks,
      })

      if (response?.data) {
        // Invalidate cache
        modulePageAdapter.invalidatePageCache(pageId)
        modulePageAdapter.invalidateModuleCache(response.data.moduleId)
      }

      return response?.data || null
    } catch (error) {
      logger.error(
        ADAPTER,
        `Error saving editor content for page ${pageId}`,
        error
      )
      throw error
    }
  },

  /**
   * Mendapatkan konten yang telah diparse untuk editor
   * @param page - Halaman yang berisi konten
   * @returns Konten yang telah diparse dalam format JSON
   */
  getParsedEditorContent: (page: ModulePage | null): StandardEditorContent => {
    if (!page) {
      logger.debug(ADAPTER, 'No page provided, returning empty editor content')
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '' }],
          },
        ],
      }
    }

    logger.debug(ADAPTER, `Parsing editor content for page ${page.id}`)

    // Gunakan parseContent dari dataFormats dengan returnRawJSON=true
    return parseContent(undefined, page, true) as StandardEditorContent
  },
}
