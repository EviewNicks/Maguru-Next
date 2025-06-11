/**
 * Utilities untuk mendukung aksesibilitas (A11y) pada aplikasi
 */

/**
 * Memeriksa apakah keyboard event terjadi dengan spesifik modifier key
 * @param event Event keyboard
 * @param modKey Modifier key yang dicek (ctrl, alt, shift, meta)
 * @returns Boolean apakah modifier key sedang ditekan
 */
export function hasModifier(
  event: KeyboardEvent | React.KeyboardEvent,
  modKey: 'ctrl' | 'alt' | 'shift' | 'meta'
): boolean {
  switch (modKey) {
    case 'ctrl':
      return event.ctrlKey
    case 'alt':
      return event.altKey
    case 'shift':
      return event.shiftKey
    case 'meta':
      return event.metaKey
    default:
      return false
  }
}

/**
 * Memeriksa apakah event sedang terjadi di dalam elemen editable (input, textarea, dll)
 * Digunakan untuk mencegah shortcut berjalan saat pengguna mengetik
 * @param event Keyboard event
 * @returns Boolean apakah event terjadi di elemen editable
 */
export function isEditableElement(
  event: KeyboardEvent | React.KeyboardEvent
): boolean {
  const target = event.target as HTMLElement
  const tagName = target.tagName.toLowerCase()
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  )
}

/**
 * Mendapatkan pesan pengumuman berdasarkan status penyimpanan
 * @param status Status penyimpanan ('saved', 'saving', 'unsaved', 'error')
 * @returns Pesan pengumuman yang sesuai
 */
export function getStatusAnnouncement(
  status: 'saved' | 'saving' | 'unsaved' | 'error'
): string {
  switch (status) {
    case 'saved':
      return 'Perubahan telah tersimpan'
    case 'saving':
      return 'Menyimpan perubahan'
    case 'unsaved':
      return 'Perubahan belum tersimpan'
    case 'error':
      return 'Gagal menyimpan perubahan'
    default:
      return ''
  }
}

/**
 * Menghasilkan ID unik untuk atribut ARIA
 * @param prefix Prefix string untuk ID
 * @returns String ID unik untuk elemen
 */
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Membuat penunjuk fokus custom yang lebih terlihat
 * @param element Elemen yang mendapat outline fokus
 */
export function enhanceFocusVisibility(element: HTMLElement): void {
  element.style.outline = '2px solid #3b82f6'
  element.style.outlineOffset = '2px'
  element.style.borderRadius = '3px'
}

/**
 * Menangani penekanan tombol untuk elemen yang seharusnya bisa diklik dengan keyboard
 * @param event Event keyboard
 * @param callback Fungsi yang dipanggil saat tombol yang benar ditekan
 */
export function handleKeyboardActivation(
  event: React.KeyboardEvent,
  callback: () => void
): void {
  // Enter dan Space adalah tombol standar untuk aktivasi elemen
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    callback()
  }
}
