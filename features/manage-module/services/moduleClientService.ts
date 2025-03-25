import axios from 'axios'
import { Module, ModuleStatus } from '../types'

interface PaginationMeta {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
}

interface ModuleResponse {
  data: Module[]
  meta: PaginationMeta
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
    
    // Panggil API dengan axios
    const response = await axios.get<ModuleResponse>(`/api/modules?${queryParams.toString()}`)
    
    return response.data
  } catch (error) {
    console.error('Error fetching modules:', error)
    throw new Error('Gagal memuat data modul')
  }
}

// Fungsi untuk mengambil detail modul berdasarkan ID
export async function getModuleById(id: string): Promise<Module> {
  try {
    const response = await axios.get<Module>(`/api/modules/${id}`)
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
    const response = await axios.post<Module>('/api/modules', moduleData)
    return response.data
  } catch (error) {
    console.error('Error creating module:', error)
    throw new Error('Gagal membuat modul')
  }
}

// Fungsi untuk memperbarui modul
export async function updateModule(id: string, moduleData: {
  title?: string
  description?: string
  status?: ModuleStatus
}): Promise<Module> {
  try {
    const response = await axios.put<Module>(`/api/modules/${id}`, moduleData)
    return response.data
  } catch (error) {
    console.error('Error updating module:', error)
    throw new Error('Gagal memperbarui modul')
  }
}

// Fungsi untuk menghapus modul
export async function deleteModule(id: string): Promise<void> {
  try {
    await axios.delete(`/api/modules/${id}`)
  } catch (error) {
    console.error('Error deleting module:', error)
    throw new Error('Gagal menghapus modul')
  }
}
