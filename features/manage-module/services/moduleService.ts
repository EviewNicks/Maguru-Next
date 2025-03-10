// features/manage-module/services/moduleService.ts
import {
  PrismaClient,
  ModuleStatus as PrismaModuleStatus,
  Prisma,
} from '@prisma/client'
import {
  ModuleCreateInput,
  ModuleUpdateInput,
  GetModulesOptions,
  Module,
} from '../types'

// Ekspor prisma client agar bisa di-mock dengan mudah dalam pengujian
export const prisma = new PrismaClient()

/**
 * Membuat modul baru
 * @param data - Data modul yang akan dibuat
 * @returns Modul yang dibuat
 */
export async function createModule(data: ModuleCreateInput): Promise<Module> {
  try {
    return (await prisma.module.create({
      data: {
        ...data,
        updatedBy: data.createdBy, // Awalnya updatedBy sama dengan createdBy
      },
    })) as Module
  } catch (error) {
    console.error('Error creating module:', error)
    throw new Error('Failed to create module')
  }
}

export async function getModules(
  options: GetModulesOptions
): Promise<Module[]> {
  try {
    const { status, limit = 10, cursor, search } = options

    // Buat where clause berdasarkan filter
    const where: Prisma.ModuleWhereInput = {}

    if (status) {
      where.status = status as PrismaModuleStatus
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Konfigurasi pagination
    const paginationConfig: Prisma.ModuleFindManyArgs = {
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }

    // Tambahkan cursor-based pagination jika cursor tersedia
    if (cursor) {
      paginationConfig.skip = 1 // Skip item dengan cursor
      paginationConfig.cursor = { id: cursor }
    }

    return (await prisma.module.findMany(paginationConfig)) as Module[]
  } catch (error) {
    console.error('Error fetching modules:', error)
    throw new Error('Failed to fetch modules')
  }
}

/**
 * Mengambil modul berdasarkan ID
 * @param id - ID modul yang dicari
 * @returns Modul yang ditemukan atau null jika tidak ada
 */
export async function getModuleById(id: string): Promise<Module | null> {
  try {
    const result = await prisma.module.findUnique({
      where: { id },
    })
    return result as Module | null
  } catch (error) {
    console.error(`Error fetching module with id ${id}:`, error)
    throw new Error('Failed to fetch module')
  }
}

/**
 * Memperbarui modul yang sudah ada
 * @param id - ID modul yang akan diperbarui
 * @param data - Data pembaruan modul
 * @returns Modul yang sudah diperbarui
 */
export async function updateModule(
  id: string,
  data: ModuleUpdateInput
): Promise<Module> {
  try {
    return (await prisma.module.update({
      where: { id },
      data,
    })) as Module
  } catch (error) {
    console.error(`Error updating module with id ${id}:`, error)
    throw new Error('Failed to update module')
  }
}

/**
 * Menghapus modul berdasarkan ID
 * @param id - ID modul yang akan dihapus
 * @returns Modul yang dihapus
 */

// Fungsi untuk menghapus modul
export async function deleteModule(moduleId: string): Promise<Module | null> {
  try {
    const deletedModule = await prisma.module.delete({
      where: { id: moduleId },
    })
    return deletedModule
  } catch (error) {
    console.error(`Error deleting module with id ${moduleId}:`, error)
    // Jika error message mengandung 'Record to delete does not exist', berarti record tidak ditemukan
    const errorMessage = String(error)
    if (errorMessage.includes('Record to delete does not exist') || 
        errorMessage.includes('not found')) {
      return null // Mengembalikan null jika modul tidak ditemukan
    }
    // Untuk error lainnya, lempar error
    throw new Error('Failed to delete module')
  }
}
