/**
 * Unit test untuk useKeyboardShortcuts hook.
 */

import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import { ShortcutDefinition } from '../types/shortcuts'

// Mock shortcut definitions untuk testing
const mockShortcuts: ShortcutDefinition[] = [
  {
    id: 'test-save',
    key: 'ctrl+s',
    description: 'Test save shortcut',
    action: 'save',
    category: 'system',
    scope: 'global',
    keyCombination: 'Ctrl + S',
    preventDefault: true,
  },
  {
    id: 'test-navigation',
    key: 'alt+arrowright',
    description: 'Test navigation shortcut',
    action: 'navigate-next',
    category: 'navigation',
    scope: 'global',
    keyCombination: 'Alt + →',
    preventDefault: true,
  },
  {
    id: 'test-format',
    key: 'ctrl+b',
    description: 'Test format shortcut',
    action: 'format-bold',
    category: 'editing',
    scope: 'editor',
    keyCombination: 'Ctrl + B',
    preventDefault: true,
  },
]

// Mock handlers
const mockHandlers = {
  save: jest.fn(),
  'navigate-next': jest.fn(),
  'format-bold': jest.fn(),
}

// Mock event
const createKeyboardEvent = (
  key: string,
  ctrlKey = false,
  altKey = false,
  shiftKey = false
): KeyboardEvent => {
  return {
    key,
    ctrlKey,
    altKey,
    shiftKey,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: document.createElement('div'),
  } as unknown as KeyboardEvent
}

describe('useKeyboardShortcuts', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register keyboard event listener when enabled', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useKeyboardShortcuts(mockShortcuts, mockHandlers, { enabled: true })
    )

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
  })

  it('should not register keyboard event listener when disabled', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener')

    renderHook(() =>
      useKeyboardShortcuts(mockShortcuts, mockHandlers, { enabled: false })
    )

    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )
  })

  it('should allow enabling/disabling shortcuts dynamically', () => {
    const { result } = renderHook(() =>
      useKeyboardShortcuts(mockShortcuts, mockHandlers, { enabled: true })
    )

    act(() => {
      result.current.setEnabled(false)
    })

    expect(result.current.getEnabled()).toBe(false)

    act(() => {
      result.current.setEnabled(true)
    })

    expect(result.current.getEnabled()).toBe(true)
  })

  it('should trigger shortcut handlers manually', () => {
    const { result } = renderHook(() =>
      useKeyboardShortcuts(mockShortcuts, mockHandlers)
    )

    act(() => {
      result.current.triggerShortcut('test-save')
    })

    expect(mockHandlers.save).toHaveBeenCalledTimes(1)
  })

  it('should not trigger shortcut handler if shortcut is not found', () => {
    const { result } = renderHook(() =>
      useKeyboardShortcuts(mockShortcuts, mockHandlers)
    )

    act(() => {
      result.current.triggerShortcut('non-existent-shortcut')
    })

    expect(mockHandlers.save).not.toHaveBeenCalled()
    expect(mockHandlers['navigate-next']).not.toHaveBeenCalled()
    expect(mockHandlers['format-bold']).not.toHaveBeenCalled()
  })

  it('should filter shortcuts by scope', () => {
    const { result } = renderHook(() =>
      useKeyboardShortcuts(mockShortcuts, mockHandlers, { scope: 'editor' })
    )

    act(() => {
      result.current.triggerShortcut('test-format') // Should work as it's in editor scope
    })

    expect(mockHandlers['format-bold']).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.triggerShortcut('test-save') // Should not work as it's filtered out
    })

    expect(mockHandlers.save).not.toHaveBeenCalled()
  })

  // Mengubah cara pengujian untuk event keyboard
  it('should handle keyboard event and trigger appropriate handler', () => {
    // Implementasi alternatif dengan mock manual
    let keydownHandler: ((e: KeyboardEvent) => void) | null = null

    // Mock addEventListener untuk menangkap handler
    jest
      .spyOn(document, 'addEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'keydown') {
          keydownHandler = handler as (e: KeyboardEvent) => void
        }
      })

    renderHook(() => useKeyboardShortcuts(mockShortcuts, mockHandlers))

    // Memastikan handler telah teregistrasi
    expect(keydownHandler).not.toBeNull()

    // Menjalankan handler secara manual
    if (keydownHandler) {
      // Simulasikan event Ctrl+S
      const ctrlSEvent = createKeyboardEvent('s', true, false, false)
      keydownHandler(ctrlSEvent)
      expect(mockHandlers.save).toHaveBeenCalledTimes(1)

      // Simulasikan event Alt+ArrowRight
      const altRightEvent = createKeyboardEvent(
        'ArrowRight',
        false,
        true,
        false
      )
      keydownHandler(altRightEvent)
      expect(mockHandlers['navigate-next']).toHaveBeenCalledTimes(1)
    }

    // Bersihkan mock
    ;(document.addEventListener as jest.Mock).mockRestore()
  })
})
