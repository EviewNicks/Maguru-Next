import {
  ModulePage,
  ApiListResponse,
  ApiEntityResponse,
  CreateModulePageInput,
  UpdateModulePageInput,
  ContentBlock,
} from '../types'

/**
 * Service untuk operasi CRUD halaman modul di sisi client
 * Menggunakan fetch API untuk berkomunikasi dengan API endpoint
 */
export const modulePageClientService = {
  // Variabel untuk menyimpan active moduleId
  _activeModuleId: null as string | null,

  /**
   * Set moduleId aktif untuk operasi-operasi lain
   * @param moduleId - ID modul yang aktif
   */
  setActiveModuleId(moduleId: string) {
    // Simpan moduleId dalam variabel lokal
    this._activeModuleId = moduleId
    console.log(`[ClientService] Setting active moduleId: ${moduleId}`)

    // Simpan di sessionStorage jika dalam lingkungan browser
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeModuleId', moduleId)
    }
  },

  /**
   * Mendapatkan moduleId aktif
   * @returns moduleId yang aktif atau null jika belum diset
   */
  getActiveModuleId(): string | null {
    // Coba ambil dari sessionStorage jika dalam browser
    if (typeof window !== 'undefined') {
      const storedId = sessionStorage.getItem('activeModuleId')
      if (storedId) {
        this._activeModuleId = storedId
      }
    }
    return this._activeModuleId
  },

  /**
   * Membuat halaman baru dalam modul
   * @param data - Data halaman yang akan dibuat
   * @returns Halaman yang telah dibuat
   */
  async createModulePage(
    data: CreateModulePageInput
  ): Promise<ApiEntityResponse<ModulePage>> {
    try {
      console.log(
        '[ClientService] Creating module page with data:',
        JSON.stringify({
          moduleId: data.moduleId,
          title: data.title,
          type: data.type,
          order: data.order,
          hasBlocks: !!data.blocks && Array.isArray(data.blocks),
        })
      )

      const response = await fetch(`/api/module/${data.moduleId}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal membuat halaman')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('[ClientService] Error in createModulePage:', error)
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
    try {
      const { page = 1, limit = 10, includeContent = false } = options

      // Buat query params
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      params.append('includeContent', includeContent.toString())

      const response = await fetch(
        `/api/module/${moduleId}/pages?${params.toString()}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal mengambil daftar halaman')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('[ClientService] Error in getModulePages:', error)
      throw error
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
    try {
      const moduleId = this.getActiveModuleId()
      if (!moduleId) {
        throw new Error('ModuleId tidak tersedia')
      }

      const response = await fetch(`/api/module/${moduleId}/pages/${pageId}`)

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal mengambil detail halaman')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('[ClientService] Error in getModulePage:', error)
      throw error
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
    try {
      const moduleId = this.getActiveModuleId()
      if (!moduleId) {
        throw new Error('ModuleId tidak tersedia')
      }

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
        throw new Error(errorData.error || 'Gagal memperbarui halaman')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('[ClientService] Error in updateModulePage:', error)
      throw error
    }
  },

  /**
   * Menghapus halaman berdasarkan ID
   * @param pageId - ID halaman
   * @returns True jika berhasil dihapus
   */
  async deleteModulePage(pageId: string): Promise<boolean> {
    try {
      const moduleId = this.getActiveModuleId()
      if (!moduleId) {
        throw new Error('ModuleId tidak tersedia')
      }

      const response = await fetch(`/api/module/${moduleId}/pages/${pageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal menghapus halaman')
      }

      return true
    } catch (error) {
      console.error('[ClientService] Error in deleteModulePage:', error)
      throw error
    }
  },

  /**
   * Mengubah urutan halaman
   * @param moduleId - ID modul
   * @param pageIds - Array ID halaman dalam urutan yang diinginkan
   * @returns True jika berhasil diubah
   */
  async reorderModulePages(
    moduleId: string,
    pageIds: string[]
  ): Promise<boolean> {
    try {
      const response = await fetch(`/api/module/${moduleId}/pages/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageIds }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal mengubah urutan halaman')
      }

      return true
    } catch (error) {
      console.error('[ClientService] Error in reorderModulePages:', error)
      throw error
    }
  },

  /**
   * Mengubah status halaman
   * @param pageId - ID halaman
   * @param status - Status baru ('DRAFT', 'PUBLISHED', 'ARCHIVED')
   * @returns Halaman yang telah diperbarui
   */
  async updatePageStatus(
    pageId: string,
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  ): Promise<ApiEntityResponse<ModulePage> | null> {
    try {
      const moduleId = this.getActiveModuleId()
      if (!moduleId) {
        throw new Error('ModuleId tidak tersedia')
      }

      const response = await fetch(
        `/api/module/${moduleId}/pages/${pageId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      )

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal memperbarui status halaman')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('[ClientService] Error in updatePageStatus:', error)
      throw error
    }
  },

  /**
   * Parse content dari string JSON menjadi ContentBlock[]
   * @param content - String JSON content
   * @returns Array ContentBlock
   */
  parseContent(content: string): ContentBlock[] {
    try {
      if (!content) return []
      return JSON.parse(content) as ContentBlock[]
    } catch (error) {
      console.error('[ClientService] Error parsing content:', error)
      return []
    }
  },
}
