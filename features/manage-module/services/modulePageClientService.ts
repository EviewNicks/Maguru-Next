import axios from 'axios'
import {
  CreateModulePageInput,
  UpdateModulePageInput,
  ContentBlockType,
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
   * Tambahkan fungsi untuk menangani error autentikasi
   */
  handleAuthError(error: unknown) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      console.error(
        '[Client] Autentikasi dibutuhkan, mengarahkan ke halaman login...'
      )

      // Jika dalam lingkungan browser, arahkan ke halaman login
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        window.location.href = `/sign-in?redirect_url=${encodeURIComponent(currentPath)}`
      }

      throw new Error('Sesi autentikasi kedaluwarsa. Silakan login kembali.')
    }

    throw error
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
      // Set sebagai modul aktif
      this.setActiveModuleId(moduleId)

      // Buat query string dari parameter
      const queryParams = new URLSearchParams()
      if (options.page) queryParams.append('page', options.page.toString())
      if (options.limit) queryParams.append('limit', options.limit.toString())
      if (options.includeContent !== undefined)
        queryParams.append('includeContent', options.includeContent.toString())

      const baseUrl = getBaseUrl()
      const url = `${baseUrl}/api/module/${moduleId}/pages?${queryParams.toString()}`
      console.log(`[Client] Fetching pages for moduleId: ${moduleId}`)
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

      // Tampilkan informasi error untuk debugging
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('[Client] Status:', error.response.status)
          if (error.response.status === 401 || error.response.status === 403) {
            return this.handleAuthError(error)
          }
          console.error('[Client] Response data:', error.response.data)
        } else if (error.request) {
          console.error('[Client] No response received:', error.request)
        }
      }

      // Return data kosong sebagai fallback untuk mencegah crash UI
      return {
        success: false,
        data: [],
        meta: {
          totalItems: 0,
          currentPage: 1,
          totalPages: 1,
          pageSize: 10,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      }
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
        throw new Error(
          'ModuleId tidak ditemukan untuk mengambil detail halaman'
        )
      }

      const baseUrl = getBaseUrl()
      const response = await axios.get(
        `${baseUrl}/api/module/${activeModuleId}/pages/${pageId}`
      )

      // Periksa apakah response data valid
      if (response.data && response.data.data) {
        // Cek apakah blocks ada dan perlu diproses
        const pageData = response.data.data

        if (pageData.blocks && Array.isArray(pageData.blocks)) {
          // Cek apakah ini mungkin format JSON Tiptap
          if (
            pageData.blocks.length === 1 &&
            pageData.blocks[0].type === 'text' &&
            typeof pageData.blocks[0].content === 'string' &&
            pageData.blocks[0].content.startsWith('{') &&
            pageData.blocks[0].content.includes('"type":"doc"')
          ) {
            console.log('[Client] Detected Tiptap JSON format in response')
            // Format sudah benar, tidak perlu dikonversi
          }
        }
      }

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Memperbarui halaman modul
   * @param pageId - ID halaman yang akan diperbarui
   * @param data - Data baru untuk halaman
   * @param moduleId - ID modul (opsional, akan menggunakan active moduleId jika tidak disediakan)
   * @returns Halaman yang telah diperbarui
   */
  async updateModulePage(
    pageId: string,
    data: UpdateModulePageInput,
    moduleId?: string
  ): Promise<ApiEntityResponse<ModulePage> | null> {
    // Pastikan kita memiliki moduleId
    const effectiveModuleId = moduleId || this.getActiveModuleId()
    if (!effectiveModuleId) {
      throw new Error('ModuleId tidak ditemukan untuk memperbarui halaman')
    }

    try {
      console.log(
        `[Client] Updating module page ${pageId} in module ${effectiveModuleId}`
      )

      // Validasi data sebelum dikirim untuk menghindari error JSON
      const validatedData = { ...data }

      // Jika ada blocks, pastikan itu array dan dapat di-stringify
      if (validatedData.blocks) {
        // Periksa apakah ini adalah format JSON Tiptap
        if (
          validatedData.blocks.length === 1 &&
          validatedData.blocks[0].type === 'text' &&
          typeof validatedData.blocks[0].content === 'string' &&
          validatedData.blocks[0].content.startsWith('{') &&
          validatedData.blocks[0].content.includes('"type":"doc"')
        ) {
          // Ini adalah format JSON Tiptap, format sudah benar
          console.log('[Client] Detected Tiptap JSON format, sending as is')
        }
        // Jika bukan array, konversi ke array
        else if (!Array.isArray(validatedData.blocks)) {
          console.warn('[Client] Blocks bukan array, mengkonversi ke array')
          validatedData.blocks = [validatedData.blocks]
        }

        // Pastikan blocks dapat di-stringify
        try {
          JSON.stringify(validatedData.blocks)
        } catch (error) {
          console.error('[Client] Error stringifying blocks:', error)
          throw new Error('Format blocks tidak valid')
        }
      }

      const baseUrl = getBaseUrl()
      const response = await axios.put(
        `${baseUrl}/api/module/${effectiveModuleId}/pages/${pageId}`,
        validatedData,
        {
          // Tambahkan timeout untuk menghindari request tergantung terlalu lama
          timeout: 15000,
          // Tambahkan header untuk menandai request dari client
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Source': 'modulePageClientService',
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('[Client] Error updating module page:', error)

      // Tangani error autentikasi
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        return this.handleAuthError(error)
      }

      // Tangani error format JSON
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 400 &&
        error.response?.data?.error?.includes('JSON')
      ) {
        console.error('[Client] JSON format error:', error.response.data)

        // Coba lagi dengan format yang lebih sederhana
        try {
          console.log('[Client] Retrying with simplified format')

          // Buat versi sederhana dari data
          const simplifiedData = { ...data }

          // Jika ada blocks, sederhanakan
          if (simplifiedData.blocks) {
            simplifiedData.blocks = [
              {
                type: ContentBlockType.TEXT,
                content: Array.isArray(simplifiedData.blocks)
                  ? JSON.stringify(simplifiedData.blocks)
                  : 'Konten tidak dapat diformat dengan benar',
              },
            ]
          }

          const baseUrl = getBaseUrl()
          const response = await axios.put(
            `${baseUrl}/api/module/${effectiveModuleId}/pages/${pageId}`,
            simplifiedData,
            {
              timeout: 15000,
              headers: {
                'Content-Type': 'application/json',
                'X-Client-Source': 'modulePageClientService-retry',
              },
            }
          )

          return response.data
        } catch (retryError) {
          console.error('[Client] Retry failed:', retryError)
          throw new Error('Format data tidak valid dan upaya perbaikan gagal')
        }
      }

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
        : new Error('Terjadi kesalahan saat memperbarui halaman')
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
