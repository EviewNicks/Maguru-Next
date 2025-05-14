/**
 * Utility helper untuk menangani shortcut keyboard.
 * Berisi fungsi-fungsi untuk mendeteksi, memformat, dan menangani event keyboard.
 */

import { ShortcutDefinition } from '../constants/shortcuts'

/**
 * Check if a keyboard event matches a shortcut key combination.
 */
export const matchesShortcut = (
  event: KeyboardEvent,
  shortcut: ShortcutDefinition
): boolean => {
  const key = event.key.toLowerCase()
  const parts = shortcut.key.toLowerCase().split('+')

  // Check if the main key matches
  const mainKey = parts[parts.length - 1].toLowerCase()
  const mainKeyMatches =
    key === mainKey.toLowerCase() ||
    // Handle arrow keys and special keys
    (mainKey === 'arrowleft' && key === 'arrowleft') ||
    (mainKey === 'arrowright' && key === 'arrowright') ||
    (mainKey === 'arrowup' && key === 'arrowup') ||
    (mainKey === 'arrowdown' && key === 'arrowdown') ||
    (mainKey === 'escape' && key === 'escape') ||
    (mainKey === '/' && key === '/') ||
    (mainKey === '\\' && key === '\\') ||
    // Numeric keys
    (mainKey === '0' && key === '0') ||
    (mainKey === '1' && key === '1') ||
    (mainKey === '2' && key === '2') ||
    (mainKey === '3' && key === '3')

  if (!mainKeyMatches) return false

  // Check modifiers
  const hasCtrl = parts.includes('ctrl')
  const hasAlt = parts.includes('alt')
  const hasShift = parts.includes('shift')

  return (
    (!hasCtrl || event.ctrlKey) &&
    (!hasAlt || event.altKey) &&
    (!hasShift || event.shiftKey)
  )
}

/**
 * Format a key combination for display.
 * Changes the format from 'Ctrl+Shift+A' to 'Ctrl + Shift + A'.
 */
export const formatKeyCombination = (combo: string): string => {
  // Replace + with spaces for better readability
  return combo
    .split('+')
    .map((part) => {
      // Special case for arrow keys and special characters
      if (part.toLowerCase() === 'arrowleft') return '←'
      if (part.toLowerCase() === 'arrowright') return '→'
      if (part.toLowerCase() === 'arrowup') return '↑'
      if (part.toLowerCase() === 'arrowdown') return '↓'
      if (part.toLowerCase() === 'escape') return 'Esc'

      // Capitalize first letter of each part
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' + ')
}

/**
 * Handles keyboard event and executes the appropriate action if a shortcut matches.
 */
export const handleKeyboardEvent = (
  event: KeyboardEvent,
  shortcuts: ShortcutDefinition[],
  handlers: Record<string, () => void>
): boolean => {
  for (const shortcut of shortcuts) {
    if (matchesShortcut(event, shortcut)) {
      const handler = handlers[shortcut.action]

      if (handler) {
        if (shortcut.preventDefault) {
          event.preventDefault()
        }
        if (shortcut.stopPropagation) {
          event.stopPropagation()
        }

        handler()
        return true
      }
    }
  }

  return false
}

/**
 * Detect current platform (macOS, Windows, Linux, etc.).
 * Can be used to show appropriate key combinations for the platform.
 */
export const getPlatform = (): 'mac' | 'windows' | 'linux' | 'other' => {
  if (typeof navigator === 'undefined') return 'other'

  const platform = navigator.platform.toLowerCase()

  if (platform.includes('mac')) return 'mac'
  if (platform.includes('win')) return 'windows'
  if (platform.includes('linux')) return 'linux'

  return 'other'
}

/**
 * Format key combination according to the platform.
 * For Mac: ⌘ (Command) instead of Ctrl, ⌥ (Option) instead of Alt.
 */
export const formatKeyForPlatform = (combo: string): string => {
  const platform = getPlatform()

  if (platform === 'mac') {
    return combo
      .replace(/Ctrl/g, '⌘')
      .replace(/Alt/g, '⌥')
      .replace(/Shift/g, '⇧')
  }

  return combo
}

/**
 * Checks if a target element should handle keyboard shortcuts
 * Used to avoid conflicts with input fields, contenteditable, etc.
 */
export const shouldHandleShortcut = (event: KeyboardEvent): boolean => {
  const target = event.target as HTMLElement
  const tagName = target.tagName.toLowerCase()

  // If the target is an input field, textarea, or contenteditable,
  // only handle shortcuts with Alt key to avoid interfering with typing
  if (
    tagName === 'input' ||
    tagName === 'textarea' ||
    target.isContentEditable
  ) {
    // Allow Alt combinations even in form controls
    if (event.altKey) return true

    // Allow Ctrl+S for save everywhere
    if (event.ctrlKey && event.key.toLowerCase() === 's') return true

    // Don't handle other shortcuts in form controls
    return false
  }

  return true
}
