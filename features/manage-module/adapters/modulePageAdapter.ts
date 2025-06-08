'use client'

import {
  ModulePage,
  CreateModulePageInput,
  UpdateModulePageInput,
  IModulePageAdapter,
  StandardEditorContent,
  ApiEntityResponse,
  ApiListResponse,
  ModulePageStatus,
} from '../types'
import { ensureValidEditorContent } from '../lib/dataFormats'
// import { logger } from '../services/logger'

// Konstanta untuk adapter name (context)
// const ADAPTER = 'ModulePageAdapter'

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
  drafts: {
    [pageId: string]: {
      data: ModulePage
      timestamp: number
    }
  }
}

// Cache expiration in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000

/**
 * ModulePageAdapter - Layer untuk menjembatani antara API dan context
 * Adapter ini menyediakan abstraksi untuk operasi yang berhubungan dengan module page
 * dan menangani transformasi format data secara konsisten
 */
export const modulePageAdapter: IModulePageAdapter = {
  // Local cache untuk menyimpan data
  _cache: {
    pages: {},
    page: {},
    drafts: {},
  } as Cache,

  /**
   * Menghapus cache untuk modul tertentu
   * @param moduleId - ID modul
   */
  invalidateModuleCache(moduleId: string): void {
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

    // Hapus cache draft yang terkait dengan modul
    Object.keys(this._cache.drafts).forEach((pageId) => {
      if (this._cache.drafts[pageId]?.data.moduleId === moduleId) {
        delete this._cache.drafts[pageId]
      }
    })
  },

  /**
   * Menghapus cache untuk halaman tertentu
   * @param pageId - ID halaman
   */
  invalidatePageCache(pageId: string): void {
    if (this._cache.page[pageId]) {
      // Ambil moduleId dari cache sebelum dihapus
      const moduleId = this._cache.page[pageId].data.moduleId

      // Hapus cache halaman
      delete this._cache.page[pageId]

      // Hapus cache draft untuk halaman ini
      if (this._cache.drafts[pageId]) {
        delete this._cache.drafts[pageId]
      }

      // Hapus juga cache modul terkait agar data selalu konsisten
      if (moduleId && this._cache.pages[moduleId]) {
        delete this._cache.pages[moduleId]
      }
    }
  },

  /**
   * Menghapus cache draft untuk halaman tertentu
   * @param pageId - ID halaman
   */
  invalidateDraftCache(pageId: string): void {
    if (this._cache.drafts[pageId]) {
      delete this._cache.drafts[pageId]
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
      throw new Error('ModuleId diperlukan')
    }

    if (typeof moduleId !== 'string') {
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
      throw new Error('PageId diperlukan')
    }

    if (typeof pageId !== 'string') {
      throw new Error('PageId harus berupa string')
    }
  },

  /**
   * Mendapatkan daftar halaman untuk modul tertentu melalui API
   * @param moduleId - ID modul
   * @param skipCache - Flag untuk melewati cache
   * @returns Promise dengan array ModulePage
   */
  getPages: async (
    moduleId: string,
    skipCache: boolean = false
  ): Promise<ModulePage[]> => {
    try {
      // Tambahkan validasi untuk moduleId undefined atau kosong
      if (!moduleId || moduleId === 'undefined') {
        return [] // Return array kosong daripada melakukan panggilan API yang tidak valid
      }

      // Validasi input
      modulePageAdapter.validateModuleId(moduleId)

      // Cek cache jika skipCache=false
      const useCache =
        !skipCache &&
        modulePageAdapter._cache.pages[moduleId] &&
        Date.now() - modulePageAdapter._cache.pages[moduleId].timestamp <
          CACHE_EXPIRATION

      if (useCache) {
        return modulePageAdapter._cache.pages[moduleId].data
      }

      // Gunakan parameter waktu untuk mencegah hasil dari cache browser
      const timestamp = new Date().getTime()

      // Panggil API endpoint dengan parameter untuk menyertakan konten dan timestamp untuk menghindari cache
      const response = await fetch(
        `/api/module/${moduleId}/pages?includeContent=true&_t=${timestamp}`,
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `Failed to fetch pages for module ${moduleId}`
        )
      }

      const result = (await response.json()) as ApiListResponse<ModulePage>

      // Ensure data is an array
      if (!Array.isArray(result.data)) {
        return [] // Return empty array for consistency
      }

      // Simpan ke cache
      modulePageAdapter._cache.pages[moduleId] = {
        data: result.data,
        timestamp: Date.now(),
      }

      return result.data
    } catch {
      // Return empty array on error to ensure consistent return type
      return []
    }
  },

  /**
   * Mendapatkan detail halaman berdasarkan ID melalui API
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
        return modulePageAdapter._cache.page[pageId].data
      }

      // Coba dapatkan moduleId dari cache atau dari pages cache
      let moduleId: string | undefined

      // Cek di cache halaman terlebih dahulu
      if (modulePageAdapter._cache.page[pageId]?.data?.moduleId) {
        moduleId = modulePageAdapter._cache.page[pageId].data.moduleId
      }

      // Jika tidak ada di cache halaman, cari di semua modul yang ada di cache
      if (!moduleId) {
        for (const cachedModuleId in modulePageAdapter._cache.pages) {
          const pages = modulePageAdapter._cache.pages[cachedModuleId].data
          const foundPage = pages.find((page) => page.id === pageId)
          if (foundPage) {
            moduleId = cachedModuleId
            break
          }
        }
      }

      if (!moduleId) {
        return null
      }

      // Gunakan endpoint yang benar dengan moduleId yang sudah ditemukan
      const apiPath = `/api/module/${moduleId}/pages/${pageId}`

      const response = await fetch(apiPath, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to fetch page ${pageId}`)
      }

      const result = (await response.json()) as ApiEntityResponse<ModulePage>

      if (result.success && result.data) {
        // Simpan ke cache
        modulePageAdapter._cache.page[pageId] = {
          data: result.data,
          timestamp: Date.now(),
        }

        // Juga update cache modul jika belum ada
        if (
          result.data.moduleId &&
          !modulePageAdapter._cache.pages[result.data.moduleId]
        ) {
          // Ambil semua halaman modul untuk memastikan cache konsisten
          await modulePageAdapter.getPages(result.data.moduleId, true)
        }

        return result.data
      }

      return null
    } catch {
      return null
    }
  },

  /**
   * Membuat halaman baru melalui API
   * @param data - Data halaman yang akan dibuat
   * @returns Promise dengan ModulePage yang baru dibuat
   */
  createPage: async (data: CreateModulePageInput): Promise<ModulePage> => {
    try {
      // Validasi input
      modulePageAdapter.validateModuleId(data.moduleId)

      // Pastikan content valid dengan format yang diharapkan
      if (data.content) {
        // Buat salinan data untuk mencegah mutasi
        const newData = { ...data }
        // Gunakan ensureValidEditorContent untuk validasi dan konversi
        // Gunakan type assertion untuk mengatasi ketidakcocokan tipe
        newData.content = ensureValidEditorContent(
          data.content
        ) as unknown as CreateModulePageInput['content']
        data = newData
      }

      // Panggil API endpoint
      const response = await fetch(`/api/module/${data.moduleId}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create page')
      }

      const result = (await response.json()) as ApiEntityResponse<ModulePage>

      // Invalidate module cache
      modulePageAdapter.invalidateModuleCache(data.moduleId)

      return result.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Memperbarui halaman berdasarkan ID melalui API
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

      // Pastikan content valid jika disediakan
      if (data.content) {
        // Buat salinan data untuk mencegah mutasi
        const newData = { ...data }
        // Gunakan ensureValidEditorContent untuk validasi dan konversi
        // Gunakan type assertion untuk mengatasi ketidakcocokan tipe
        newData.content = ensureValidEditorContent(
          data.content
        ) as unknown as UpdateModulePageInput['content']
        data = newData
      }

      // Dapatkan modul ID dari cache atau dari request GET
      let moduleId: string | undefined
      const pageData = modulePageAdapter._cache.page[pageId]?.data
      if (pageData) {
        moduleId = pageData.moduleId
      }

      // Jika tidak ada di cache, coba dapatkan dari API
      if (!moduleId) {
        const page = await modulePageAdapter.getPage(pageId)
        moduleId = page?.moduleId
      }

      if (!moduleId) {
        return null
      }

      // Panggil API endpoint
      const response = await fetch(`/api/module/${moduleId}/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to update page ${pageId}`)
      }

      const result = (await response.json()) as ApiEntityResponse<ModulePage>

      if (result.success && result.data) {
        // Invalidate cache
        modulePageAdapter.invalidatePageCache(pageId)
        modulePageAdapter.invalidateModuleCache(result.data.moduleId)

        return result.data
      }

      return null
    } catch (error) {
      throw error
    }
  },

  /**
   * Memperbarui status halaman menggunakan endpoint khusus status
   * @param pageId - ID halaman
   * @param status - Status baru (DRAFT, PUBLISHED, ARCHIVED)
   * @param options - Parameter opsional seperti isDraft dan hasUnpublishedChanges
   * @returns Promise dengan ModulePage yang telah diperbarui atau null
   */
  updatePageStatus: async (
    pageId: string,
    status: ModulePageStatus,
    options?: { isDraft?: boolean; hasUnpublishedChanges?: boolean }
  ): Promise<ModulePage | null> => {
    try {
      // Validasi input
      modulePageAdapter.validatePageId(pageId)

      // Dapatkan modul ID dari cache atau dari request GET
      let moduleId: string | undefined
      const pageData = modulePageAdapter._cache.page[pageId]?.data
      if (pageData) {
        moduleId = pageData.moduleId
      }

      // Jika tidak ada di cache, coba dapatkan dari API
      if (!moduleId) {
        const page = await modulePageAdapter.getPage(pageId)
        moduleId = page?.moduleId
      }

      if (!moduleId) {
        return null
      }

      // Siapkan payload dengan status dan parameter opsional
      const payload: {
        status: ModulePageStatus
        isDraft?: boolean
        hasUnpublishedChanges?: boolean
      } = { status }

      // Tambahkan parameter opsional jika disediakan
      if (options?.isDraft !== undefined) {
        payload.isDraft = options.isDraft
      }

      if (options?.hasUnpublishedChanges !== undefined) {
        payload.hasUnpublishedChanges = options.hasUnpublishedChanges
      }

      // Panggil API endpoint status yang benar
      const response = await fetch(
        `/api/module/${moduleId}/pages/${pageId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `Failed to update page status ${pageId}`
        )
      }

      const result = (await response.json()) as ApiEntityResponse<ModulePage>

      if (result.success && result.data) {
        // Invalidate cache
        modulePageAdapter.invalidatePageCache(pageId)
        modulePageAdapter.invalidateModuleCache(result.data.moduleId)

        return result.data
      }

      return null
    } catch (error) {
      throw error
    }
  },

  /**
   * Menghapus halaman berdasarkan ID melalui API
   * @param pageId - ID halaman
   * @returns Promise dengan boolean yang menunjukkan keberhasilan
   */
  deletePage: async (pageId: string): Promise<boolean> => {
    try {
      // Validasi input
      modulePageAdapter.validatePageId(pageId)

      // Dapatkan halaman untuk moduleId sebelum dihapus
      const page = await modulePageAdapter.getPage(pageId, true) // Skip cache
      const moduleId = page?.moduleId

      if (!moduleId) {
        return false
      }

      // Invalidate all caches first (pre-emptively)
      modulePageAdapter.invalidatePageCache(pageId)
      modulePageAdapter.invalidateModuleCache(moduleId)

      // Panggil API endpoint dengan no-cache headers
      const timestamp = new Date().getTime()
      const response = await fetch(
        `/api/module/${moduleId}/pages/${pageId}?_t=${timestamp}`,
        {
          method: 'DELETE',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      )

      if (response.status === 404) {
        return false
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to delete page ${pageId}`)
      }

      const result = await response.json()

      // Invalidate caches again after successful deletion
      if (result && result.success) {
        // Invalidate cache again to be sure
        modulePageAdapter.invalidatePageCache(pageId)
        modulePageAdapter.invalidateModuleCache(moduleId)

        // Explicitly clear cache entries
        if (modulePageAdapter._cache.page[pageId]) {
          delete modulePageAdapter._cache.page[pageId]
        }

        if (modulePageAdapter._cache.pages[moduleId]) {
          delete modulePageAdapter._cache.pages[moduleId]
        }
      }

      return result.success || false
    } catch (error) {
      throw error
    }
  },

  /**
   * Mengubah urutan halaman melalui API
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
        throw new Error('PageIds harus berupa array yang tidak kosong')
      }

      // Panggil API endpoint
      const response = await fetch(`/api/module/${moduleId}/pages/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageIds }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `Failed to reorder pages for module ${moduleId}`
        )
      }

      const result = await response.json()

      if (result.success) {
        // Invalidate module cache
        modulePageAdapter.invalidateModuleCache(moduleId)

        // Invalidate all affected page caches
        pageIds.forEach((pageId) =>
          modulePageAdapter.invalidatePageCache(pageId)
        )
      }

      return result.success || false
    } catch (error) {
      throw error
    }
  },

  /**
   * Menyimpan konten editor melalui API
   * @param pageId - ID halaman
   * @param editorContent - Konten dari editor dalam format JSON
   * @returns Promise dengan ModulePage yang telah diperbarui atau null
   */
  saveEditorContent: async (
    pageId: string,
    editorContent: StandardEditorContent
  ): Promise<ModulePage | null> => {
    try {
      // Validasi input
      modulePageAdapter.validatePageId(pageId)

      if (!editorContent || typeof editorContent !== 'object') {
        throw new Error('Konten editor tidak valid')
      }

      // Validasi dan konversi ke StandardEditorContent
      if (!('type' in editorContent) || editorContent.type !== 'doc') {
        throw new Error('Format konten editor tidak valid')
      }

      // Gunakan ensureValidEditorContent untuk validasi dan konversi
      const validContent = ensureValidEditorContent(editorContent)

      // Dapatkan modul ID dari cache atau dari request GET
      let moduleId: string | undefined
      const pageData = modulePageAdapter._cache.page[pageId]?.data
      if (pageData) {
        moduleId = pageData.moduleId
      }

      // Jika tidak ada di cache, coba dapatkan dari API
      if (!moduleId) {
        const page = await modulePageAdapter.getPage(pageId)
        moduleId = page?.moduleId
      }

      if (!moduleId) {
        return null
      }

      // Panggil API endpoint
      const response = await fetch(`/api/module/${moduleId}/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: validContent,
        }),
      })

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `Failed to save content for page ${pageId}`
        )
      }

      const result = (await response.json()) as ApiEntityResponse<ModulePage>

      if (result.success && result.data) {
        // Invalidate cache
        modulePageAdapter.invalidatePageCache(pageId)
        modulePageAdapter.invalidateModuleCache(result.data.moduleId)

        return result.data
      }

      return null
    } catch (error) {
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

    // Ambil content langsung dari page.content jika tersedia
    if (page.content) {
      // Gunakan ensureValidEditorContent untuk validasi dan konversi
      return ensureValidEditorContent(page.content)
    }

    // Fallback ke default content jika content tidak valid
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '' }],
        },
      ],
    }
  },

  /**
   * Menyimpan draft halaman melalui API
   * @param pageId - ID halaman
   * @param content - Konten draft dalam format Tiptap
   * @param authorId - ID pengguna yang menyimpan draft
   * @returns Promise dengan detail draft yang tersimpan atau null
   */
  saveDraft: async (
    pageId: string,
    content: StandardEditorContent,
    authorId: string
  ): Promise<ModulePage | null> => {
    try {
      // Validasi input
      modulePageAdapter.validatePageId(pageId)

      // Validasi content
      if (!content || typeof content !== 'object') {
        throw new Error('Konten draft tidak valid')
      }

      if (!authorId) {
        throw new Error('ID pengguna diperlukan untuk menyimpan draft')
      }

      // Gunakan ensureValidEditorContent untuk validasi dan konversi
      const validContent = ensureValidEditorContent(content)

      // Dapatkan modul ID dari cache atau dari request GET
      let moduleId: string | undefined
      const pageData = modulePageAdapter._cache.page[pageId]?.data
      if (pageData) {
        moduleId = pageData.moduleId
      }

      // Jika tidak ada di cache, coba dapatkan dari API
      if (!moduleId) {
        const page = await modulePageAdapter.getPage(pageId)
        moduleId = page?.moduleId
      }

      if (!moduleId) {
        return null
      }

      // Panggil API endpoint draft
      const response = await fetch(
        `/api/module/${moduleId}/pages/${pageId}/draft`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: validContent,
            authorId,
          }),
        }
      )

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `Failed to save draft for page ${pageId}`
        )
      }

      const result = (await response.json()) as ApiEntityResponse<ModulePage>

      if (result.success && result.data) {
        // Simpan ke cache draft
        modulePageAdapter._cache.drafts[pageId] = {
          data: result.data,
          timestamp: Date.now(),
        }

        // Juga update cache halaman jika ada
        if (modulePageAdapter._cache.page[pageId]) {
          modulePageAdapter._cache.page[pageId] = {
            data: result.data,
            timestamp: Date.now(),
          }
        }

        return result.data
      }

      return null
    } catch (error) {
      throw error
    }
  },

  /**
   * Mempublikasikan draft menjadi konten halaman yang dipublikasikan
   * @param pageId - ID halaman
   * @returns Promise dengan detail halaman yang dipublikasikan atau null
   */
  publishDraft: async (pageId: string): Promise<ModulePage | null> => {
    // const FUNCTION_NAME = 'publishDraft'

    try {
      modulePageAdapter.validatePageId(pageId)

      let moduleId: string | undefined
      const pageData = modulePageAdapter._cache.page[pageId]?.data
      if (pageData) {
        moduleId = pageData.moduleId
      }

      // Jika tidak ada di cache, coba dapatkan dari API
      if (!moduleId) {
        const page = await modulePageAdapter.getPage(pageId)
        moduleId = page?.moduleId

        if (page) {
        }
      }

      if (!moduleId) {
        return null
      }

      // Panggil API endpoint draft dengan PATCH untuk publish

      const response = await fetch(
        `/api/module/${moduleId}/pages/${pageId}/draft`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(
          errorData.error || `Failed to publish draft for page ${pageId}`
        )
      }

      const result = (await response.json()) as ApiEntityResponse<ModulePage>

      if (result.success && result.data) {
        // Log data halaman yang diterima

        // Invalidate cache karena konten halaman telah berubah

        modulePageAdapter.invalidatePageCache(pageId)
        modulePageAdapter.invalidateDraftCache(pageId)
        modulePageAdapter.invalidateModuleCache(result.data.moduleId)

        return result.data
      }

      return null
    } catch (error) {
      throw error
    }
  },

  /**
   * Membuang draft dan kembali ke versi published
   * @param pageId - ID halaman
   * @returns Promise dengan detail halaman yang telah diupdate setelah draft dibuang
   */
  discardDraft: async (
    pageId: string
  ): Promise<ApiEntityResponse<ModulePage> | null> => {
    try {
      // Validasi input
      modulePageAdapter.validatePageId(pageId)

      // Dapatkan modul ID dari cache atau dari request GET
      let moduleId: string | undefined
      const pageData = modulePageAdapter._cache.page[pageId]?.data
      if (pageData) {
        moduleId = pageData.moduleId
      }

      // Jika tidak ada di cache, coba dapatkan dari API
      if (!moduleId) {
        const page = await modulePageAdapter.getPage(pageId)
        moduleId = page?.moduleId
      }

      if (!moduleId) {
        return null
      }

      // Panggil API endpoint draft dengan DELETE untuk discard
      const response = await fetch(
        `/api/module/${moduleId}/pages/${pageId}/draft`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `Failed to discard draft for page ${pageId}`
        )
      }

      const result = (await response.json()) as ApiEntityResponse<ModulePage>

      if (result.success) {
        // Invalidate cache
        modulePageAdapter.invalidateDraftCache(pageId)
        modulePageAdapter.invalidatePageCache(pageId)

        return result
      }

      return null
    } catch (error) {
      throw error
    }
  },

  /**
   * Memeriksa apakah halaman memiliki draft yang belum dipublikasikan
   * @param pageId - ID halaman
   * @returns Promise dengan boolean yang menunjukkan keberadaan draft
   */
  hasDraft: async (pageId: string): Promise<boolean> => {
    try {
      // Validasi input
      modulePageAdapter.validatePageId(pageId)

      // Cek cache draft terlebih dahulu
      if (modulePageAdapter._cache.drafts[pageId]) {
        return !!modulePageAdapter._cache.drafts[pageId].data.draftData
      }

      // Cek cache page
      if (modulePageAdapter._cache.page[pageId]) {
        return !!modulePageAdapter._cache.page[pageId].data.draftData
      }

      // Jika tidak ada di cache, ambil dari API menggunakan getPage
      const page = await modulePageAdapter.getPage(pageId)
      return !!page?.draftData || !!page?.hasUnpublishedChanges
    } catch {
      return false
    }
  },

  /**
   * Mendapatkan draft halaman melalui API
   * @param pageId - ID halaman
   * @param skipCache - Flag untuk melewati cache
   * @returns Promise dengan detail draft atau null
   */
  getDraft: async (
    pageId: string,
    skipCache: boolean = false
  ): Promise<ModulePage | null> => {
    try {
      // Validasi input
      modulePageAdapter.validatePageId(pageId)

      // Cek cache draft terlebih dahulu jika skipCache=false
      if (!skipCache && modulePageAdapter._cache.drafts[pageId]) {
        const cachedDraft = modulePageAdapter._cache.drafts[pageId]
        const now = Date.now()

        // Gunakan cache jika masih valid (belum expired)
        if (now - cachedDraft.timestamp < CACHE_EXPIRATION) {
          return cachedDraft.data
        }
      }

      // Karena endpoint getDraft tidak ada lagi, kita gunakan getPage sebagai gantinya
      // getPage sudah mengembalikan informasi draft jika tersedia
      try {
        const page = await modulePageAdapter.getPage(pageId, skipCache)

        // Jika halaman memiliki draft, kembalikan halaman tersebut
        if (page && (page.draftData || page.hasUnpublishedChanges)) {
          // Simpan ke cache draft
          modulePageAdapter._cache.drafts[pageId] = {
            data: page,
            timestamp: Date.now(),
          }

          return page
        }

        // Jika tidak ada draft, kembalikan null
        return null
      } catch {
        return null
      }
    } catch {
      return null
    }
  },
}
