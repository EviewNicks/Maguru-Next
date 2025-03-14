// features/manage-module/services/modulePageService.ts
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import DOMPurify from 'isomorphic-dompurify'
import {
  ModulePage,
  ModulePageCreateInput,
  ModulePageUpdateInput,
  ModulePageReorderInput,
} from '../types'
import { ModulePageType } from '../schemas/modulePageSchema'

/**
 * Membuat halaman modul baru
 * @param data - Data halaman modul yang akan dibuat
 * @returns Halaman modul yang dibuat
 */
export async function createModulePage(
  data: ModulePageCreateInput
): Promise<ModulePage> {
  try {
    // Sanitasi konten untuk mencegah XSS jika tipe konten adalah teori
    let sanitizedContent = data.content
    if (data.type === ModulePageType.TEORI) {
      sanitizedContent = DOMPurify.sanitize(data.content, {
        ALLOWED_TAGS: [
          'p',
          'b',
          'i',
          'em',
          'strong',
          'a',
          'ul',
          'ol',
          'li',
          'code',
          'pre',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      })
    }

    // Cari urutan terakhir untuk modul ini
    const lastPage = await prisma.modulePage.findFirst({
      where: { moduleId: data.moduleId },
      orderBy: { order: 'desc' },
    })

    // Jika order tidak ditentukan, gunakan urutan terakhir + 1 atau 0 jika tidak ada halaman
    const order = data.order ?? (lastPage ? lastPage.order + 1 : 0)

    return (await prisma.modulePage.create({
      data: {
        moduleId: data.moduleId,
        order,
        type: data.type,
        content: sanitizedContent,
        language: data.language,
        version: 1, // Versi awal
      },
    })) as ModulePage
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating module page:', error)
      throw new Error(`Gagal membuat halaman modul: ${error.message}`)
    } else {
      console.error('Error creating module page:', error)
      throw new Error('Gagal membuat halaman modul')
    }
  }
}

/**
 * Mendapatkan daftar halaman modul berdasarkan moduleId
 * @param moduleId - ID modul
 * @returns Daftar halaman modul
 */
export async function getModulePages(moduleId: string): Promise<ModulePage[]> {
  try {
    return (await prisma.modulePage.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
    })) as ModulePage[]
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error getting module pages:', error)
      throw new Error(`Gagal mendapatkan halaman modul: ${error.message}`)
    } else {
      console.error('Error getting module pages:', error)
      throw new Error('Gagal mendapatkan halaman modul')
    }
  }
}

/**
 * Mendapatkan halaman modul berdasarkan ID
 * @param id - ID halaman modul
 * @returns Halaman modul yang ditemukan atau null jika tidak ada
 */
export async function getModulePageById(
  id: string
): Promise<ModulePage | null> {
  try {
    return (await prisma.modulePage.findUnique({
      where: { id },
    })) as ModulePage | null
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error getting module page by id:', error)
      throw new Error(`Gagal mendapatkan halaman modul: ${error.message}`)
    } else {
      console.error('Error getting module page by id:', error)
      throw new Error('Gagal mendapatkan halaman modul')
    }
  }
}

/**
 * Mengambil modul berdasarkan ID
 * @param id - ID modul yang akan diambil
 * @returns Modul yang ditemukan atau null jika tidak ada
 */
export async function getModuleById(id: string) {
  return await prisma.module.findUnique({
    where: { id },
  })
}

/**
 * Memperbarui halaman modul yang sudah ada
 * @param id - ID halaman modul yang akan diperbarui
 * @param data - Data pembaruan halaman modul
 * @param currentVersion - Versi saat ini untuk optimistic locking
 * @returns Halaman modul yang sudah diperbarui
 */
export async function updateModulePage(
  id: string,
  data: ModulePageUpdateInput,
  currentVersion: number
): Promise<ModulePage> {
  try {
    // Sanitasi konten untuk mencegah XSS jika tipe konten adalah teori dan konten diperbarui
    let sanitizedContent = data.content
    if (data.type === ModulePageType.TEORI && data.content) {
      sanitizedContent = DOMPurify.sanitize(data.content, {
        ALLOWED_TAGS: [
          'p',
          'b',
          'i',
          'em',
          'strong',
          'a',
          'ul',
          'ol',
          'li',
          'code',
          'pre',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      })
    }

    // Gunakan optimistic locking untuk mencegah konflik
    const updatedPage = await prisma.modulePage.update({
      where: {
        id,
        version: currentVersion, // Pastikan versi sesuai
      },
      data: {
        ...(data.order !== undefined && { order: data.order }),
        ...(data.type !== undefined && { type: data.type }),
        ...(sanitizedContent !== undefined && { content: sanitizedContent }),
        ...(data.language !== undefined && { language: data.language }),
        version: { increment: 1 }, // Increment versi
      },
    })

    return updatedPage as ModulePage
  } catch (error) {
    if (error instanceof Error) {
      // Cek jika error adalah dari Prisma dengan kode P2025
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new Error(
          `Versi halaman tidak sesuai. Halaman telah diubah oleh pengguna lain: ${error.message}`
        )
      } else {
        console.error('Error updating module page:', error)
        throw new Error(`Gagal memperbarui halaman modul: ${error.message}`)
      }
    } else {
      console.error('Error updating module page:', error)
      throw new Error('Gagal memperbarui halaman modul')
    }
  }
}

/**
 * Menghapus halaman modul berdasarkan ID
 * @param id - ID halaman modul yang akan dihapus
 * @returns Halaman modul yang dihapus
 */
export async function deleteModulePage(id: string): Promise<ModulePage> {
  try {
    // Dapatkan halaman yang akan dihapus
    const pageToDelete = await prisma.modulePage.findUnique({
      where: { id },
    })

    if (!pageToDelete) {
      throw new Error('Halaman modul tidak ditemukan')
    }

    // Hapus halaman
    const deletedPage = await prisma.modulePage.delete({
      where: { id },
    })

    // Perbarui urutan halaman lain dalam modul yang sama
    await prisma.modulePage.updateMany({
      where: {
        moduleId: pageToDelete.moduleId,
        order: { gt: pageToDelete.order },
      },
      data: {
        order: { decrement: 1 },
      },
    })

    return deletedPage as ModulePage
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting module page:', error)
      throw new Error(`Gagal menghapus halaman modul: ${error.message}`)
    } else {
      console.error('Error deleting module page:', error)
      throw new Error('Gagal menghapus halaman modul')
    }
  }
}

/**
 * Mengubah urutan halaman modul secara batch
 * @param moduleId - ID modul
 * @param data - Data pengurutan ulang
 * @returns Daftar halaman modul yang sudah diperbarui
 */
export async function reorderModulePages(
  moduleId: string,
  data: ModulePageReorderInput
): Promise<ModulePage[]> {
  try {
    // Gunakan transaksi untuk memastikan semua perubahan berhasil atau gagal bersama
    await prisma.$transaction(async (tx) => {
      // Verifikasi bahwa semua pageId ada dan milik modul yang sama
      const pageIds = data.updates.map((update) => update.pageId)
      const existingPages = await tx.modulePage.findMany({
        where: {
          id: { in: pageIds },
          moduleId,
        },
      })

      if (existingPages.length !== pageIds.length) {
        throw new Error(
          'Beberapa halaman tidak ditemukan atau bukan bagian dari modul ini'
        )
      }

      // Perbarui urutan untuk setiap halaman
      for (const update of data.updates) {
        await tx.modulePage.update({
          where: {
            id: update.pageId,
            moduleId, // Pastikan halaman milik modul yang benar
          },
          data: {
            order: update.order,
            version: { increment: 1 }, // Increment versi untuk optimistic locking
          },
        })
      }
    })

    // Ambil daftar halaman yang diperbarui
    const updatedPages = await prisma.modulePage.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
    })

    return updatedPages as ModulePage[]
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in reorderModulePages:', error)
      throw new Error(`Gagal mengubah urutan halaman: ${error.message}`)
    } else {
      console.error('Error in reorderModulePages:', error)
      throw new Error('Gagal mengubah urutan halaman')
    }
  }
}
