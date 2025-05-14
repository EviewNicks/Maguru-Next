/**
 * Definisi shortcut keyboard untuk fitur manajemen modul.
 * Shortcut dikelompokkan berdasarkan kategori untuk memudahkan penggunaan dan dokumentasi.
 */

export type ShortcutCategory =
  | 'navigation'
  | 'editing'
  | 'heading'
  | 'system'
  | 'content'

export type ShortcutScope =
  | 'global' // Berlaku di seluruh aplikasi
  | 'editor' // Hanya di dalam editor
  | 'sidebar' // Hanya di dalam sidebar
  | 'modal' // Hanya di dalam modal
  | 'dialog' // Hanya di dalam dialog

export interface ShortcutDefinition {
  id: string // Unique ID for shortcut
  key: string // Key combination (e.g., 'Alt+ArrowLeft')
  description: string // Human-readable description
  action: string // Action to perform
  category: ShortcutCategory // Category of the shortcut
  scope: ShortcutScope // Where the shortcut applies
  keyCombination: string // Readable key combination for display
  condition?: () => boolean // Optional: condition to enable shortcut
  preventDefault?: boolean // Whether to preventDefault on the event
  stopPropagation?: boolean // Whether to stopPropagation on the event
}

// Navigation Shortcuts
export const NAVIGATION_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'prev-page',
    key: 'Alt+ArrowLeft',
    description: 'Navigasi ke halaman sebelumnya dalam modul',
    action: 'navigate-prev',
    category: 'navigation',
    scope: 'global',
    keyCombination: 'Alt + ←',
    preventDefault: true,
  },
  {
    id: 'next-page',
    key: 'Alt+ArrowRight',
    description: 'Navigasi ke halaman berikutnya dalam modul',
    action: 'navigate-next',
    category: 'navigation',
    scope: 'global',
    keyCombination: 'Alt + →',
    preventDefault: true,
  },
  {
    id: 'toggle-sidebar',
    key: 'Alt+s',
    description: 'Buka/tutup sidebar kanan',
    action: 'toggle-sidebar',
    category: 'navigation',
    scope: 'global',
    keyCombination: 'Alt + S',
    preventDefault: true,
  },
  {
    id: 'show-help',
    key: 'Alt+h',
    description: 'Tampilkan dialog bantuan shortcut',
    action: 'show-shortcut-help',
    category: 'navigation',
    scope: 'global',
    keyCombination: 'Alt + H',
    preventDefault: true,
  },
  {
    id: 'first-page',
    key: 'Alt+Home',
    description: 'Navigasi ke halaman pertama dalam modul',
    action: 'navigate-first',
    category: 'navigation',
    scope: 'global',
    keyCombination: 'Alt + Home',
    preventDefault: true,
  },
  {
    id: 'last-page',
    key: 'Alt+End',
    description: 'Navigasi ke halaman terakhir dalam modul',
    action: 'navigate-last',
    category: 'navigation',
    scope: 'global',
    keyCombination: 'Alt + End',
    preventDefault: true,
  },
]

// Editing Shortcuts
export const EDITING_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'bold',
    key: 'Ctrl+b',
    description: 'Format teks menjadi bold',
    action: 'format-bold',
    category: 'editing',
    scope: 'editor',
    keyCombination: 'Ctrl + B',
    preventDefault: true,
  },
  {
    id: 'italic',
    key: 'Ctrl+i',
    description: 'Format teks menjadi italic',
    action: 'format-italic',
    category: 'editing',
    scope: 'editor',
    keyCombination: 'Ctrl + I',
    preventDefault: true,
  },
  {
    id: 'underline',
    key: 'Ctrl+u',
    description: 'Format teks menjadi underline',
    action: 'format-underline',
    category: 'editing',
    scope: 'editor',
    keyCombination: 'Ctrl + U',
    preventDefault: true,
  },
  {
    id: 'link',
    key: 'Ctrl+k',
    description: 'Menambahkan atau mengedit link',
    action: 'insert-link',
    category: 'editing',
    scope: 'editor',
    keyCombination: 'Ctrl + K',
    preventDefault: true,
  },
  {
    id: 'clear-format',
    key: 'Ctrl+\\',
    description: 'Hapus semua formatting',
    action: 'clear-formatting',
    category: 'editing',
    scope: 'editor',
    keyCombination: 'Ctrl + \\',
    preventDefault: true,
  },
  {
    id: 'align-center',
    key: 'Ctrl+e',
    description: 'Perataan tengah',
    action: 'align-center',
    category: 'editing',
    scope: 'editor',
    keyCombination: 'Ctrl + E',
    preventDefault: true,
  },
  {
    id: 'align-left',
    key: 'Ctrl+l',
    description: 'Perataan kiri',
    action: 'align-left',
    category: 'editing',
    scope: 'editor',
    keyCombination: 'Ctrl + L',
    preventDefault: true,
  },
  {
    id: 'align-right',
    key: 'Ctrl+r',
    description: 'Perataan kanan',
    action: 'align-right',
    category: 'editing',
    scope: 'editor',
    keyCombination: 'Ctrl + R',
    preventDefault: true,
  },
  {
    id: 'align-justify',
    key: 'Ctrl+j',
    description: 'Perataan justify',
    action: 'align-justify',
    category: 'editing',
    scope: 'editor',
    keyCombination: 'Ctrl + J',
    preventDefault: true,
  },
]

// Heading Shortcuts
export const HEADING_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'heading-1',
    key: 'Ctrl+Alt+1',
    description: 'Format paragraf menjadi Heading 1',
    action: 'format-heading-1',
    category: 'heading',
    scope: 'editor',
    keyCombination: 'Ctrl + Alt + 1',
    preventDefault: true,
  },
  {
    id: 'heading-2',
    key: 'Ctrl+Alt+2',
    description: 'Format paragraf menjadi Heading 2',
    action: 'format-heading-2',
    category: 'heading',
    scope: 'editor',
    keyCombination: 'Ctrl + Alt + 2',
    preventDefault: true,
  },
  {
    id: 'heading-3',
    key: 'Ctrl+Alt+3',
    description: 'Format paragraf menjadi Heading 3',
    action: 'format-heading-3',
    category: 'heading',
    scope: 'editor',
    keyCombination: 'Ctrl + Alt + 3',
    preventDefault: true,
  },
  {
    id: 'normal-text',
    key: 'Ctrl+Alt+0',
    description: 'Format heading menjadi paragraf normal',
    action: 'format-paragraph',
    category: 'heading',
    scope: 'editor',
    keyCombination: 'Ctrl + Alt + 0',
    preventDefault: true,
  },
]

// System Shortcuts
export const SYSTEM_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'save',
    key: 'Ctrl+s',
    description: 'Simpan perubahan halaman saat ini',
    action: 'save-page',
    category: 'system',
    scope: 'global',
    keyCombination: 'Ctrl + S',
    preventDefault: true,
  },
  {
    id: 'show-help-slash',
    key: 'Ctrl+/',
    description: 'Tampilkan dialog bantuan shortcut',
    action: 'show-shortcut-help',
    category: 'system',
    scope: 'global',
    keyCombination: 'Ctrl + /',
    preventDefault: true,
  },
  {
    id: 'close-dialog',
    key: 'Escape',
    description: 'Menutup dialog yang sedang terbuka',
    action: 'close-dialog',
    category: 'system',
    scope: 'dialog',
    keyCombination: 'Esc',
    preventDefault: false,
  },
  {
    id: 'find',
    key: 'Ctrl+f',
    description: 'Mencari teks dalam dokumen',
    action: 'find-text',
    category: 'system',
    scope: 'editor',
    keyCombination: 'Ctrl + F',
    preventDefault: true,
  },
  {
    id: 'replace',
    key: 'Ctrl+h',
    description: 'Mencari dan mengganti teks',
    action: 'replace-text',
    category: 'system',
    scope: 'editor',
    keyCombination: 'Ctrl + H',
    preventDefault: true,
  },
  // Undo & redo handled by the editor
]

// Content Block Shortcuts
export const CONTENT_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'code-block',
    key: 'Ctrl+Alt+c',
    description: 'Menambahkan blok kode',
    action: 'insert-code-block',
    category: 'content',
    scope: 'editor',
    keyCombination: 'Ctrl + Alt + C',
    preventDefault: true,
  },
  {
    id: 'image',
    key: 'Ctrl+Alt+i',
    description: 'Menambahkan gambar',
    action: 'insert-image',
    category: 'content',
    scope: 'editor',
    keyCombination: 'Ctrl + Alt + I',
    preventDefault: true,
  },
  {
    id: 'blockquote',
    key: 'Ctrl+Alt+q',
    description: 'Menambahkan blockquote',
    action: 'insert-blockquote',
    category: 'content',
    scope: 'editor',
    keyCombination: 'Ctrl + Alt + Q',
    preventDefault: true,
  },
  {
    id: 'bullet-list',
    key: 'Ctrl+Alt+b',
    description: 'Menambahkan bullet list',
    action: 'insert-bullet-list',
    category: 'content',
    scope: 'editor',
    keyCombination: 'Ctrl + Alt + B',
    preventDefault: true,
  },
  {
    id: 'numbered-list',
    key: 'Ctrl+Alt+n',
    description: 'Menambahkan numbered list',
    action: 'insert-numbered-list',
    category: 'content',
    scope: 'editor',
    keyCombination: 'Ctrl + Alt + N',
    preventDefault: true,
  },
]

// All shortcuts combined
export const ALL_SHORTCUTS: ShortcutDefinition[] = [
  ...NAVIGATION_SHORTCUTS,
  ...EDITING_SHORTCUTS,
  ...HEADING_SHORTCUTS,
  ...SYSTEM_SHORTCUTS,
  ...CONTENT_SHORTCUTS,
]

// Get shortcuts by category
export const getShortcutsByCategory = (
  category: ShortcutCategory
): ShortcutDefinition[] => {
  return ALL_SHORTCUTS.filter((shortcut) => shortcut.category === category)
}

// Get shortcuts by scope
export const getShortcutsByScope = (
  scope: ShortcutScope
): ShortcutDefinition[] => {
  return ALL_SHORTCUTS.filter((shortcut) => shortcut.scope === scope)
}

// Find a shortcut by ID
export const getShortcutById = (id: string): ShortcutDefinition | undefined => {
  return ALL_SHORTCUTS.find((shortcut) => shortcut.id === id)
}

// Find a shortcut by key combination
export const getShortcutByKey = (
  key: string
): ShortcutDefinition | undefined => {
  return ALL_SHORTCUTS.find(
    (shortcut) => shortcut.key.toLowerCase() === key.toLowerCase()
  )
}
