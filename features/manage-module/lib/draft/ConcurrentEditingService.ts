'use client'

import { type ModulePage } from '../../types'

/**
 * Informasi tentang pengguna yang sedang mengedit
 */
export interface ActiveEditor {
  userId: string
  userName: string
  timestamp: number // Waktu terakhir aktivitas dalam ms
  pageId: string
  profileImageUrl?: string // Foto profil (opsional)
}

/**
 * ConcurrentEditingService
 *
 * Service untuk menangani skenario concurrent editing dan
 * mendeteksi konflik editing antar pengguna.
 */
export class ConcurrentEditingService {
  // Waktu maksimal pengguna dianggap masih aktif (5 menit)
  private readonly ACTIVE_TIMEOUT = 5 * 60 * 1000

  // Map dari pageId ke array pengguna yang sedang mengedit
  private _activeEditors: Map<string, ActiveEditor[]> = new Map()

  // Interval untuk membersihkan pengguna yang tidak aktif
  private _cleanupInterval: NodeJS.Timeout | null = null

  // Callback untuk perubahan aktivitas
  private _onActivityChange: (pageId: string, editors: ActiveEditor[]) => void =
    () => {}

  constructor() {
    // Mulai interval pembersihan jika berada di browser
    if (typeof window !== 'undefined') {
      this._cleanupInterval = setInterval(() => {
        this._cleanupInactiveEditors()
      }, 60 * 1000) // Bersihkan setiap 1 menit
    }
  }

  /**
   * Membersihkan resources saat service tidak lagi digunakan
   */
  public destroy() {
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval)
      this._cleanupInterval = null
    }
  }

  /**
   * Mengatur callback untuk perubahan aktivitas
   * @param callback - Fungsi yang akan dipanggil saat aktivitas berubah
   */
  public setActivityChangeCallback(
    callback: (pageId: string, editors: ActiveEditor[]) => void
  ) {
    this._onActivityChange = callback
  }

  /**
   * Mencatat pengguna yang sedang mengedit halaman
   * @param pageId - ID halaman
   * @param userId - ID pengguna
   * @param userName - Nama pengguna
   * @param profileImageUrl - URL foto profil (opsional)
   */
  public registerActivity(
    pageId: string,
    userId: string,
    userName: string,
    profileImageUrl?: string
  ) {
    const now = Date.now()

    // Dapatkan atau buat array untuk pageId ini
    if (!this._activeEditors.has(pageId)) {
      this._activeEditors.set(pageId, [])
    }

    const editors = this._activeEditors.get(pageId) || []

    // Cek apakah pengguna sudah ada dalam daftar
    const existingEditorIndex = editors.findIndex(
      (editor) => editor.userId === userId
    )

    if (existingEditorIndex >= 0) {
      // Update timestamp dan profileImageUrl jika ada
      editors[existingEditorIndex].timestamp = now
      if (profileImageUrl) {
        editors[existingEditorIndex].profileImageUrl = profileImageUrl
      }
    } else {
      // Tambahkan pengguna baru
      editors.push({
        userId,
        userName,
        timestamp: now,
        pageId,
        profileImageUrl,
      })

      // Notifikasi perubahan
      if (this._onActivityChange) {
        this._onActivityChange(pageId, [...editors])
      }
    }
  }

  /**
   * Menghapus pengguna dari daftar editor aktif
   * @param pageId - ID halaman
   * @param userId - ID pengguna
   */
  public unregisterActivity(pageId: string, userId: string) {
    if (!this._activeEditors.has(pageId)) return

    const editors = this._activeEditors.get(pageId) || []
    const filteredEditors = editors.filter((editor) => editor.userId !== userId)

    // Update daftar editor
    this._activeEditors.set(pageId, filteredEditors)

    // Notifikasi perubahan jika ada perubahan
    if (editors.length !== filteredEditors.length && this._onActivityChange) {
      this._onActivityChange(pageId, [...filteredEditors])
    }
  }

  /**
   * Mendapatkan daftar editor aktif untuk halaman tertentu
   * @param pageId - ID halaman
   * @returns Array dari editor aktif
   */
  public getActiveEditors(pageId: string): ActiveEditor[] {
    if (!this._activeEditors.has(pageId)) return []

    const editors = this._activeEditors.get(pageId) || []
    const now = Date.now()

    // Filter hanya editor yang masih aktif
    return editors.filter(
      (editor) => now - editor.timestamp < this.ACTIVE_TIMEOUT
    )
  }

  /**
   * Memeriksa apakah ada konflik versi antara halaman lokal dan remote
   * @param localPage - Halaman yang sedang diedit
   * @param remotePage - Halaman dari server
   * @returns Boolean yang menunjukkan apakah ada konflik
   */
  public hasVersionConflict(
    localPage: ModulePage | null,
    remotePage: ModulePage | null
  ): boolean {
    if (!localPage || !remotePage) return false

    // Fungsi yang lebih aman untuk mendapatkan timestamp dari berbagai format tanggal
    const getTimestamp = (date: unknown): number => {
      try {
        if (!date) return 0

        // Handle Date object
        if (date instanceof Date) return date.getTime()

        // Handle string date
        if (typeof date === 'string') return new Date(date).getTime()

        // Handle number (timestamp)
        if (typeof date === 'number') return date

        // Handle object with toISOString or getTime method
        if (typeof date === 'object' && date !== null) {
          // Handle Date-like objects with getTime method
          const dateObj = date as { getTime?: () => number }
          if (typeof dateObj.getTime === 'function') return dateObj.getTime()

          // Handle objects with toISOString method
          const isoObj = date as { toISOString?: () => string }
          if (typeof isoObj.toISOString === 'function') {
            return new Date(isoObj.toISOString()).getTime()
          }
        }

        // Last resort: try to convert to string and parse
        return new Date(String(date)).getTime()
      } catch (error) {
        console.error('Error parsing date in hasVersionConflict:', error, date)
        return 0
      }
    }

    const localTimestamp = getTimestamp(localPage.updatedAt)
    const remoteTimestamp = getTimestamp(remotePage.updatedAt)

    // Ada konflik jika versi berbeda dan ada perubahan di kedua sisi
    return (
      localPage.version !== remotePage.version &&
      (localTimestamp !== remoteTimestamp ||
        localPage.lastEditBy !== remotePage.lastEditBy)
    )
  }

  /**
   * Memeriksa apakah ada pengguna lain yang sedang aktif
   * @param pageId - ID halaman
   * @param currentUserId - ID pengguna saat ini
   * @returns Boolean yang menunjukkan apakah ada pengguna lain yang aktif
   */
  public hasOtherActiveEditors(pageId: string, currentUserId: string): boolean {
    const activeEditors = this.getActiveEditors(pageId)
    return activeEditors.some((editor) => editor.userId !== currentUserId)
  }

  /**
   * Membersihkan editor yang tidak aktif dari daftar
   */
  private _cleanupInactiveEditors() {
    const now = Date.now()
    let hasChanges = false

    // Iterasi melalui semua halaman
    for (const [pageId, editors] of this._activeEditors.entries()) {
      const activeEditors = editors.filter(
        (editor) => now - editor.timestamp < this.ACTIVE_TIMEOUT
      )

      // Jika ada perubahan, update daftar dan notifikasi
      if (activeEditors.length !== editors.length) {
        this._activeEditors.set(pageId, activeEditors)
        hasChanges = true

        // Notifikasi perubahan
        if (this._onActivityChange) {
          this._onActivityChange(pageId, [...activeEditors])
        }
      }
    }

    return hasChanges
  }
}

// Singleton instance untuk digunakan di seluruh aplikasi
let concurrentEditingServiceInstance: ConcurrentEditingService | null = null

/**
 * Mendapatkan instance singleton dari ConcurrentEditingService
 */
export const getConcurrentEditingService = (): ConcurrentEditingService => {
  if (!concurrentEditingServiceInstance) {
    concurrentEditingServiceInstance = new ConcurrentEditingService()
  }
  return concurrentEditingServiceInstance
}
