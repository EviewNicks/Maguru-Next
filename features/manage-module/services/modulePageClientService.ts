import axios from 'axios'
import {
  CreateModulePageInput,
  UpdateModulePageInput,
} from '../types/modulePageSchema'
import { ModulePage, ApiListResponse, ApiEntityResponse } from '../types'

// Helper untuk mendapatkan base URL yang sesuai dengan environment
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser side
    return ''
  }
  // Server side
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    return `https://${vercelUrl}`
  }
  return `http://localhost:${process.env.PORT || 3000}`
}

// Simpan moduleId aktif untuk operasi halaman
let activeModuleId: string | null = null

/**
 * Client service untuk operasi CRUD halaman modul
 * Menggunakan API endpoints, bukan Prisma langsung
 */
export const modulePageClientService = {
  /**
   * Set moduleId aktif untuk operasi-operasi lain
   * Fungsi ini harus dipanggil sebelum operasi yang memerlukan moduleId
   */
  setActiveModuleId(moduleId: string) {
    activeModuleId = moduleId

    // Simpan di sessionStorage untuk bertahan selama sesi browser
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activeModuleId', moduleId)
    }
  },

  /**
   * Mendapatkan moduleId aktif
   * @returns moduleId yang aktif atau undefined jika belum diset
   */
  getActiveModuleId(): string | null {
    // Cek apakah sudah ada di memori
    if (activeModuleId) return activeModuleId

    // Coba dapatkan dari sessionStorage
    if (typeof window !== 'undefined') {
      const storedModuleId = sessionStorage.getItem('activeModuleId')
      if (storedModuleId) {
        activeModuleId = storedModuleId
        return storedModuleId
      }

      // Coba ekstrak dari URL jika sedang di halaman editor
      const url = new URL(window.location.href)
      const pathParts = url.pathname.split('/')

      // Cek pattern /manage-module/pages/{moduleId}
      const modulePathIndex = pathParts.indexOf('pages')
      if (modulePathIndex !== -1 && modulePathIndex + 1 < pathParts.length) {
        const moduleId = pathParts[modulePathIndex + 1]
        this.setActiveModuleId(moduleId)
        return moduleId
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
    data: CreateModulePageInput
  ): Promise<ApiEntityResponse<ModulePage>> {
    // Pastikan kita memiliki moduleId
    const moduleId = data.moduleId || this.getActiveModuleId()
    if (!moduleId) {
      throw new Error('ModuleId tidak ditemukan untuk membuat halaman')
    }

    try {
      // Tambahkan default language jika tidak ada
      const dataWithLanguage = {
        ...data,
        language: data.language || 'id',
      }

      console.log(
        '[Client] Creating module page, endpoint:',
        `/api/module/${moduleId}/pages`
      )
      console.log(
        '[Client] Request data:',
        JSON.stringify({
          title: dataWithLanguage.title,
          type: dataWithLanguage.type,
          moduleId,
          order: dataWithLanguage.order,
          hasBlocks:
            !!dataWithLanguage.blocks && Array.isArray(dataWithLanguage.blocks),
        })
      )

      const baseUrl = getBaseUrl()
      const response = await axios.post(
        `${baseUrl}/api/module/${moduleId}/pages`,
        dataWithLanguage,
        {
          // Tambahkan timeout untuk menghindari request tergantung terlalu lama
          timeout: 10000,
          // Tambahkan header untuk menandai request dari client
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Source': 'modulePageClientService',
          },
        }
      )
      console.log('[Client] Page created response status:', response.status)
      return response.data
    } catch (error) {
      console.error('[Client] Error creating page:', error)

      // Log detail error
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('[Client] Error response data:', error.response.data)
          console.error(
            '[Client] Error response status:',
            error.response.status
          )

          // Jika ada pesan error dari server, gunakan itu
          if (error.response.data?.error) {
            throw new Error(`Server error: ${error.response.data.error}`)
          }
        } else if (error.request) {
          console.error(
            '[Client] No response received, request:',
            error.request
          )
          throw new Error('Tidak ada respons dari server. Silakan coba lagi.')
        }
      }

      // Jika tidak ada error spesifik, lempar error generik
      throw error instanceof Error
        ? error
        : new Error('Terjadi kesalahan saat membuat halaman')
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
    // Set sebagai modul aktif
    this.setActiveModuleId(moduleId)

    const queryParams = new URLSearchParams()
    if (options.page) queryParams.append('page', options.page.toString())
    if (options.limit) queryParams.append('limit', options.limit.toString())
    if (options.includeContent) queryParams.append('includeContent', 'true')

    try {
      console.log(`[Client] Fetching pages for moduleId: ${moduleId}`)

      const baseUrl = getBaseUrl()
      const url = `${baseUrl}/api/module/${moduleId}/pages?${queryParams.toString()}`
      console.log(`[Client] Request URL: ${url}`)

      const response = await axios.get(url)

      console.log(`[Client] Received ${response.data?.data?.length || 0} pages`)

      // Validasi response
      if (
        !response.data ||
        !response.data.data ||
        !Array.isArray(response.data.data)
      ) {
        console.error('[Client] Invalid response format:', response.data)
        throw new Error('Format respons tidak valid')
      }

      return response.data
    } catch (error) {
      console.error('[Client] Error fetching module pages:', error)

      if (axios.isAxiosError(error)) {
        console.error('[Client] Status:', error.response?.status)
        console.error('[Client] Response data:', error.response?.data)

        if (error.response?.status === 404) {
          return {
            success: true,
            data: [],
            meta: {
              totalItems: 0,
              currentPage: 1,
              totalPages: 0,
              pageSize: 10,
            },
          }
        }
      }

      throw new Error('Gagal mengambil daftar halaman modul')
    }
  },

  /**
   * Mendapatkan detail halaman berdasarkan ID
   * @param pageId - ID halaman
   * @param moduleId - Opsional moduleId, jika tidak disediakan akan menggunakan yang aktif
   * @returns Detail halaman
   */
  async getModulePage(
    pageId: string,
    moduleId?: string
  ): Promise<ApiEntityResponse<ModulePage> | null> {
    try {
      // Gunakan moduleId yang diberikan atau yang aktif
      const activeModuleId = moduleId || this.getActiveModuleId()
      if (!activeModuleId) {
        throw new Error('ModuleId tidak ditemukan untuk mendapatkan halaman')
      }

      const baseUrl = getBaseUrl()
      const response = await axios.get(
        `${baseUrl}/api/module/${activeModuleId}/pages/${pageId}`
      )
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Memperbarui halaman berdasarkan ID
   * @param pageId - ID halaman
   * @param data - Data yang akan diperbarui
   * @param moduleId - Opsional moduleId, jika tidak disediakan akan menggunakan yang aktif
   * @returns Halaman yang telah diperbarui
   */
  async updateModulePage(
    pageId: string,
    data: UpdateModulePageInput,
    moduleId?: string
  ): Promise<ApiEntityResponse<ModulePage> | null> {
    try {
      // Gunakan moduleId yang diberikan atau yang aktif
      const activeModuleId = moduleId || this.getActiveModuleId()
      if (!activeModuleId) {
        throw new Error('ModuleId tidak ditemukan untuk memperbarui halaman')
      }

      console.log(
        `[Client] Updating page ${pageId} with data:`,
        JSON.stringify({
          title: data.title,
          hasBlocks: !!data.blocks && Array.isArray(data.blocks),
        })
      )

      const baseUrl = getBaseUrl()
      const response = await axios.put(
        `${baseUrl}/api/module/${activeModuleId}/pages/${pageId}`,
        data,
        {
          // Tingkatkan timeout untuk menghindari error pada jaringan lambat
          timeout: 30000,
          // Tambahkan header untuk menandai request dari client
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Source': 'modulePageClientService',
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('[Client] Error updating page:', error)

      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
          console.error(
            '[Client] Network error or timeout. Server mungkin tidak tersedia.'
          )
          throw new Error('Koneksi ke server gagal. Silakan coba lagi nanti.')
        }

        if (error.response) {
          console.error('[Client] Error response data:', error.response.data)
          console.error(
            '[Client] Error response status:',
            error.response.status
          )

          if (error.response.status === 404) {
            return null
          }

          throw new Error(
            `Server error: ${error.response.data?.error || error.message}`
          )
        }
      }

      throw error
    }
  },

  /**
   * Menghapus halaman berdasarkan ID
   * @param pageId - ID halaman
   * @param moduleId - Opsional moduleId, jika tidak disediakan akan menggunakan yang aktif
   * @returns True jika berhasil dihapus
   */
  async deleteModulePage(pageId: string, moduleId?: string): Promise<boolean> {
    try {
      // Gunakan moduleId yang diberikan atau yang aktif
      const activeModuleId = moduleId || this.getActiveModuleId()
      if (!activeModuleId) {
        throw new Error('ModuleId tidak ditemukan untuk menghapus halaman')
      }

      const baseUrl = getBaseUrl()
      await axios.delete(
        `${baseUrl}/api/module/${activeModuleId}/pages/${pageId}`
      )
      return true
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false
      }
      throw error
    }
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
      const baseUrl = getBaseUrl()
      await axios.put(`${baseUrl}/api/module/${moduleId}/pages/reorder`, {
        pageIds,
      })
      return true
    } catch (error) {
      throw error
    }
  },
}
