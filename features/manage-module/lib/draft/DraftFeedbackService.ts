'use client'

import { type StandardEditorContent, type DraftSaveStatus } from '../../types'

/**
 * DraftFeedbackService
 *
 * Service untuk mengelola status draft dan feedback ke pengguna.
 * Menangani notifikasi status (saving, saved, error, offline) dan
 * deteksi offline.
 */
export class DraftFeedbackService {
  // Status saving saat ini
  private _currentStatus: DraftSaveStatus = 'idle'
  // Waktu terakhir disimpan
  private _lastSavedAt: Date | null = null
  // Fungsi callback untuk mengubah status
  private _onStatusChange: (
    status: DraftSaveStatus,
    timestamp?: Date | null
  ) => void = () => {}
  // Flag untuk status online/offline
  private _isOnline: boolean = true
  // Error terakhir
  private _lastError: Error | null = null
  // Timer untuk retry
  private _retryTimer: NodeJS.Timeout | null = null
  // Antrian operasi yang gagal
  private _failedOperations: Array<{
    pageId: string
    content: StandardEditorContent
    authorId: string
    timestamp: number
  }> = []

  constructor() {
    // Deteksi status online/offline jika berada di browser
    if (typeof window !== 'undefined') {
      this._isOnline = navigator.onLine

      // Menambahkan event listener untuk online/offline
      window.addEventListener('online', this._handleOnline)
      window.addEventListener('offline', this._handleOffline)
    }
  }

  /**
   * Membersihkan event listeners saat service tidak lagi digunakan
   */
  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this._handleOnline)
      window.removeEventListener('offline', this._handleOffline)
    }

    if (this._retryTimer) {
      clearTimeout(this._retryTimer)
    }
  }

  /**
   * Mengatur callback untuk perubahan status
   * @param callback - Fungsi yang akan dipanggil saat status berubah
   */
  public setStatusChangeCallback(
    callback: (status: DraftSaveStatus, timestamp?: Date | null) => void
  ) {
    this._onStatusChange = callback
  }

  /**
   * Mendapatkan status penyimpanan saat ini
   */
  public getStatus(): DraftSaveStatus {
    return this._currentStatus
  }

  /**
   * Mendapatkan timestamp terakhir disimpan
   */
  public getLastSavedAt(): Date | null {
    return this._lastSavedAt
  }

  /**
   * Mendapatkan error terakhir
   */
  public getLastError(): Error | null {
    return this._lastError
  }

  /**
   * Mengecek apakah pengguna online
   */
  public isOnline(): boolean {
    return this._isOnline
  }

  /**
   * Mengupdate status dan memanggil callback
   * @param status - Status baru
   * @param timestamp - Timestamp terkait (opsional)
   */
  public updateStatus(status: DraftSaveStatus, timestamp?: Date | null) {
    this._currentStatus = status

    // Update timestamp jika status adalah 'saved'
    if (status === 'saved' && timestamp) {
      this._lastSavedAt = timestamp
    }

    // Reset error jika status bukan 'error'
    if (status !== 'error') {
      this._lastError = null
    }

    // Panggil callback jika ada
    if (this._onStatusChange) {
      this._onStatusChange(status, timestamp)
    }
  }

  /**
   * Menangani error penyimpanan
   * @param error - Error yang terjadi
   */
  public handleError(error: Error) {
    this._lastError = error

    // Jika offline, set status ke offline
    if (!this._isOnline) {
      this.updateStatus('offline')
      return
    }

    // Jika online, set status ke error
    this.updateStatus('error')
  }

  /**
   * Menambahkan operasi yang gagal ke antrian
   * @param pageId - ID halaman
   * @param content - Konten draft
   * @param authorId - ID pengguna
   */
  public queueFailedOperation(
    pageId: string,
    content: StandardEditorContent,
    authorId: string
  ) {
    this._failedOperations.push({
      pageId,
      content,
      authorId,
      timestamp: Date.now(),
    })
  }

  /**
   * Mendapatkan operasi yang gagal dari antrian
   */
  public getFailedOperations() {
    return [...this._failedOperations]
  }

  /**
   * Menghapus operasi yang gagal dari antrian
   * @param index - Indeks operasi yang akan dihapus
   */
  public removeFailedOperation(index: number) {
    if (index >= 0 && index < this._failedOperations.length) {
      this._failedOperations.splice(index, 1)
    }
  }

  /**
   * Menghapus semua operasi yang gagal dari antrian
   */
  public clearFailedOperations() {
    this._failedOperations = []
  }

  /**
   * Handler untuk event online
   */
  private _handleOnline = () => {
    this._isOnline = true

    // Cek apakah ada operasi yang gagal yang perlu di-retry
    if (this._failedOperations.length > 0 && this._currentStatus !== 'saving') {
      this.updateStatus('retrying')
    } else if (this._currentStatus === 'offline') {
      // Jika status sebelumnya offline, kembalikan ke idle
      this.updateStatus('idle')
    }
  }

  /**
   * Handler untuk event offline
   */
  private _handleOffline = () => {
    this._isOnline = false
    this.updateStatus('offline')
  }

  /**
   * Memulai retry otomatis untuk operasi yang gagal
   * @param retryCallback - Fungsi yang akan dipanggil untuk retry
   * @param interval - Interval retry dalam milidetik (default: 30000)
   */
  public startAutoRetry(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retryCallback: (failedOp: any) => Promise<void>,
    interval: number = 30000
  ) {
    // Hentikan timer sebelumnya jika ada
    if (this._retryTimer) {
      clearTimeout(this._retryTimer)
    }

    // Jika tidak online atau tidak ada operasi yang gagal, jangan lakukan apa-apa
    if (!this._isOnline || this._failedOperations.length === 0) {
      return
    }

    // Set timer untuk retry
    this._retryTimer = setTimeout(async () => {
      if (this._isOnline && this._failedOperations.length > 0) {
        this.updateStatus('retrying')

        try {
          // Ambil operasi pertama dari antrian
          const failedOp = this._failedOperations[0]

          // Coba retry
          await retryCallback(failedOp)

          // Jika berhasil, hapus dari antrian
          this.removeFailedOperation(0)

          // Update status
          this.updateStatus('saved', new Date())
        } catch (error) {
          // Jika gagal, update status ke error
          this.handleError(
            error instanceof Error ? error : new Error('Retry failed')
          )
        }

        // Jika masih ada operasi yang gagal, lanjutkan retry
        if (this._failedOperations.length > 0) {
          this.startAutoRetry(retryCallback, interval)
        }
      }
    }, interval)
  }

  /**
   * Menghentikan retry otomatis
   */
  public stopAutoRetry() {
    if (this._retryTimer) {
      clearTimeout(this._retryTimer)
      this._retryTimer = null
    }
  }
}

// Singleton instance untuk digunakan di seluruh aplikasi
let draftFeedbackServiceInstance: DraftFeedbackService | null = null

/**
 * Mendapatkan instance singleton dari DraftFeedbackService
 */
export const getDraftFeedbackService = (): DraftFeedbackService => {
  if (!draftFeedbackServiceInstance) {
    draftFeedbackServiceInstance = new DraftFeedbackService()
  }
  return draftFeedbackServiceInstance
}
