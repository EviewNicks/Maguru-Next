import axios from 'axios'
import { Module, ModuleStatus } from '../types'

// Interface yang digunakan oleh aplikasi
interface ModuleResponse {
  data: Module[]
  meta: {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
}
}

interface QueryParams {
  page: number
  pageSize: number
  search: string
  status: ModuleStatus | string
  sortBy: string
  sortOrder: 'asc' | 'desc' | ''
}

// Fungsi untuk mengambil data modul dari API dengan parameter pagination, sorting, pencarian, dan filter
export async function getModules(params: QueryParams): Promise<ModuleResponse> {
  try {
    // Buat query string dari parameter
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.pageSize) queryParams.append('limit', params.pageSize.toString())
    if (params.search) queryParams.append('search', params.search)
    if (params.status) queryParams.append('status', params.status)
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const url = `/api/module?${queryParams.toString()}`
    console.log('[Client] Fetching modules from:', url)
    
    // Panggil API dengan axios
    const response = await axios.get(url)

    console.log(
      '[Client] Raw API response:',
      JSON.stringify({
        hasData: !!response.data.data,
        dataLength: response.data.data?.length || 0,
        hasPagination: !!response.data.pagination,
        paginationKeys: response.data.pagination
          ? Object.keys(response.data.pagination)
          : [],
      })
    )

    // Pastikan response.data memiliki struktur yang diharapkan
    if (!response.data.data || !Array.isArray(response.data.data)) {
      console.error('[Client] API response missing data array:', response.data)
      throw new Error(
        'Format respons API tidak valid: data array tidak ditemukan'
      )
    }

    if (!response.data.pagination) {
      console.error(
        '[Client] API response missing pagination object:',
        response.data
      )
      throw new Error(
        'Format respons API tidak valid: pagination object tidak ditemukan'
      )
    }

    // Transform response untuk kompatibilitas dengan kode yang ada
    return {
      data: response.data.data,
      meta: {
        currentPage: response.data.pagination.page,
        totalPages: response.data.pagination.totalPages,
        pageSize: response.data.pagination.limit,
        totalItems: response.data.pagination.total,
      },
    }
  } catch (error) {
    console.error('[Client] Error fetching modules:', error)

    // Tampilkan lebih banyak informasi tentang error untuk debugging
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('[Client] Error response data:', error.response.data)
        console.error('[Client] Error response status:', error.response.status)
      } else if (error.request) {
        console.error('[Client] No response received:', error.request)
      }
    }

    throw new Error(
      `Gagal memuat data modul: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Fungsi untuk mengambil detail modul berdasarkan ID
export async function getModuleById(id: string): Promise<Module> {
  try {
    const response = await axios.get<Module>(`/api/module/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching module detail:', error)
    throw new Error('Gagal memuat detail modul')
  }
}

// Fungsi untuk membuat modul baru
export async function createModule(moduleData: {
  title: string
  description: string
  status: ModuleStatus
}): Promise<Module> {
  try {
    const response = await axios.post<Module>('/api/module', moduleData)
    return response.data
  } catch (error) {
    console.error('Error creating module:', error)
    throw new Error('Gagal membuat modul')
  }
}

// Fungsi untuk memperbarui modul
export async function updateModule(
  id: string,
  moduleData: {
  title?: string
  description?: string
  status?: ModuleStatus
  }
): Promise<Module> {
  try {
    const response = await axios.put<Module>(`/api/module/${id}`, moduleData)
    return response.data
  } catch (error) {
    console.error('Error updating module:', error)
    throw new Error('Gagal memperbarui modul')
  }
}

// Fungsi untuk menghapus modul
export async function deleteModule(id: string): Promise<void> {
  try {
    await axios.delete(`/api/module/${id}`)
  } catch (error) {
    console.error('Error deleting module:', error)
    throw new Error('Gagal menghapus modul')
  }
}
