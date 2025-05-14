import { useEffect, useCallback } from 'react';
import { isEditableElement } from '../utils/a11yUtils';

type KeyHandler = (event: KeyboardEvent) => void;

interface KeyboardShortcut {
  key: string;
  callback: () => void;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  preventDefault?: boolean;
  disableInInputs?: boolean;
  description?: string;
}

/**
 * Custom hook untuk menangani keyboard shortcuts untuk aksesibilitas
 * Mendukung modifier keys (ctrl, alt, shift, meta) dan berbagai opsi
 * 
 * @param shortcuts Array dari definisi shortcut (key, callback, modifier keys, dll)
 * @param deps Array dependency untuk memperbarui shortcut listeners
 * @returns Object berisi shortcut aktif dan deskripsinya
 */
export function useA11yKeyboard(
  shortcuts: KeyboardShortcut[],
  deps: React.DependencyList = []
) {
  const keyHandlerMap = new Map<string, KeyHandler>();

  // Membuat handler untuk shortcut
  const createKeyHandler = useCallback(
    (shortcut: KeyboardShortcut): KeyHandler => {
      return (event: KeyboardEvent) => {
        // Skip jika elemen editable (input, textarea) dan shortcut seharusnya dinonaktifkan
        if (shortcut.disableInInputs && isEditableElement(event)) {
          return;
        }

        // Periksa modifier keys
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !shortcut.ctrl;
        const altMatch = shortcut.alt ? event.altKey : !shortcut.alt;
        const shiftMatch = shortcut.shift ? event.shiftKey : !shortcut.shift;
        const metaMatch = shortcut.meta ? event.metaKey : !shortcut.meta;

        // Jika key dan semua modifiers cocok
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          altMatch &&
          shiftMatch &&
          metaMatch
        ) {
          // Prevent default jika diperlukan
          if (shortcut.preventDefault) {
            event.preventDefault();
          }
          // Eksekusi callback
          shortcut.callback();
        }
      };
    },
    []
  );

  // Setup event listeners
  useEffect(() => {
    // Bersihkan map sebelum membuat handler baru
    keyHandlerMap.clear();

    // Buat dan simpan handler untuk setiap shortcut
    shortcuts.forEach((shortcut) => {
      const handler = createKeyHandler(shortcut);
      keyHandlerMap.set(shortcut.key, handler);
      document.addEventListener('keydown', handler);
    });

    // Cleanup: hapus semua event listeners
    return () => {
      keyHandlerMap.forEach((handler, key) => {
        document.removeEventListener('keydown', handler);
      });
    };
  }, [shortcuts, createKeyHandler, ...deps]);

  // Daftar shortcut dengan deskripsi untuk dokumentasi
  const shortcutList = shortcuts.map((shortcut) => {
    const modifiers = [
      shortcut.ctrl && 'Ctrl',
      shortcut.alt && 'Alt',
      shortcut.shift && 'Shift',
      shortcut.meta && 'Meta',
    ].filter(Boolean);

    const keyCombo = [...modifiers, shortcut.key.toUpperCase()].join(' + ');

    return {
      combo: keyCombo,
      description: shortcut.description || '',
    };
  });

  return { shortcuts: shortcutList };
}

export default useA11yKeyboard; 