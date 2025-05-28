'use client'
import {
  Module,
  CreateModuleInput,
  UpdateModuleInput,
  ModuleStatus,
  ApiListResponse,
  ApiEntityResponse,
  ModuleQueryParams,
} from '../types'
import { logger } from '../services/logger'

// Interface untuk ModuleAdapter
export interface IModuleAdapter {
  getModules(params: ModuleQueryParams): Promise<ApiListResponse<Module>>
  getModuleById(id: string): Promise<ApiEntityResponse<Module> | null>
  createModule(
    data: CreateModuleInput,
    userId: string
  ): Promise<ApiEntityResponse<Module>>
  updateModule(
    id: string,
    data: UpdateModuleInput,
    userId: string
  ): Promise<ApiEntityResponse<Module>>
  deleteModule(id: string): Promise<boolean>
  updateModuleStatus(
    id: string,
    status: ModuleStatus,
    userId: string
  ): Promise<ApiEntityResponse<Module> | null>
}

/**
 * Adapter untuk modul yang menghubungkan API dengan hooks
 * Menangani HTTP requests, transformasi data, dan error handling
 */
export const moduleAdapter: IModuleAdapter = {
  /**
   * Mendapatkan daftar modul dengan pagination dan filter
   * @param params Parameter query untuk pagination dan filter
   * @returns Daftar modul dengan pagination
   */
  async getModules(
    params: ModuleQueryParams
  ): Promise<ApiListResponse<Module>> {
    try {
      // Buat query string dari params
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.status) queryParams.append('status', params.status.toString())
      if (params.search) queryParams.append('search', params.search || '')
      if (params.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

      // Panggil API endpoint
      const response = await fetch(`/api/module?${queryParams.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch modules')
      }

      const data = await response.json()

      return {
        success: true,
        data: data.data || [],
        meta: {
          currentPage: data.pagination?.page || 1,
          totalPages: data.pagination?.totalPages || 0,
          pageSize: data.pagination?.limit || 10,
          totalItems: data.pagination?.total || 0,
        },
      }
    } catch (error) {
      logger.error('moduleAdapter', 'Error getting modules', error)
      throw error
    }
  },

  /**
   * Mendapatkan detail modul berdasarkan ID
   * @param id ID modul
   * @returns Detail modul
   */
  async getModuleById(id: string): Promise<ApiEntityResponse<Module> | null> {
    try {
      const response = await fetch(`/api/module/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        const errorData = await response.json()
        throw new Error(
          errorData.error || `Failed to fetch module with ID ${id}`
        )
      }

      const data = await response.json()

      if (!data) {
        return null
      }

      return {
        success: true,
        data: data,
      }
    } catch (error) {
      logger.error('moduleAdapter', 'Error getting module', error)
      throw error
    }
  },

  /**
   * Membuat modul baru
   * @param data Data modul yang akan dibuat
   * @param userId ID pengguna yang membuat modul (tidak digunakan di client, tetapi diperlukan untuk interface)
   * @returns Modul yang baru dibuat
   */
  async createModule(
    data: CreateModuleInput
  ): Promise<ApiEntityResponse<Module>> {
    try {
      const response = await fetch('/api/module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create module')
      }

      const moduleData = await response.json()

      return {
        success: true,
        data: moduleData,
      }
    } catch (error) {
      logger.error('moduleAdapter', 'Error creating module', error)
      throw error
    }
  },

  /**
   * Memperbarui modul berdasarkan ID
   * @param id ID modul
   * @param data Data modul yang akan diperbarui
   * @param userId ID pengguna yang memperbarui modul (tidak digunakan di client, tetapi diperlukan untuk interface)
   * @returns Modul yang telah diperbarui
   */
  async updateModule(
    id: string,
    data: UpdateModuleInput
  ): Promise<ApiEntityResponse<Module>> {
    try {
      const response = await fetch(`/api/module/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `Failed to update module with ID ${id}`
        )
      }

      const moduleData = await response.json()

      return {
        success: true,
        data: moduleData,
      }
    } catch (error) {
      logger.error('moduleAdapter', 'Error updating module', error)
      throw error
    }
  },

  /**
   * Menghapus modul berdasarkan ID
   * @param id ID modul
   * @returns true jika berhasil dihapus
   */
  async deleteModule(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/module/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `Failed to delete module with ID ${id}`
        )
      }

      return true
    } catch (error) {
      logger.error('moduleAdapter', 'Error deleting module', error)
      throw error
    }
  },

  /**
   * Memperbarui status modul berdasarkan ID
   * @param id ID modul
   * @param status Status baru modul
   * @param userId ID pengguna yang memperbarui status modul (tidak digunakan di client, tetapi diperlukan untuk interface)
   * @returns Modul yang telah diperbarui
   */
  async updateModuleStatus(
    id: string,
    status: ModuleStatus
  ): Promise<ApiEntityResponse<Module> | null> {
    try {
      const response = await fetch(`/api/module/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        const errorData = await response.json()
        throw new Error(
          errorData.error || `Failed to update status for module with ID ${id}`
        )
      }

      const moduleData = await response.json()

      if (!moduleData) {
        return null
      }

      return {
        success: true,
        data: moduleData,
      }
    } catch (error) {
      logger.error('moduleAdapter', 'Error updating status', error)
      throw error
    }
  },
}
