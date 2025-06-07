'use client'

import {
  Heading1,
  Heading2,
  Heading3,
  ListOrdered,
  List,
  Code2,
  ChevronRight,
  Quote,
  ImageIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CodeSquare,
  TextQuote,
} from 'lucide-react'
import { FloatingMenu } from '@tiptap/react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Editor } from '@tiptap/core'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDebounce } from '@/features/manage-module/hooks/useDebounce'

interface CommandItemType {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  keywords: string
  command: (editor: Editor) => void
  group: string
}

type CommandGroupType = {
  group: string
  items: Omit<CommandItemType, 'group'>[]
}

const groups: CommandGroupType[] = [
  {
    group: 'Basic blocks',
    items: [
      {
        title: 'Text',
        description: 'Just start writing with plain text',
        icon: ChevronRight,
        keywords: 'paragraph text',
        command: (editor) => editor.chain().focus().clearNodes().run(),
      },
      {
        title: 'Heading 1',
        description: 'Large section heading',
        icon: Heading1,
        keywords: 'h1 title header',
        command: (editor) =>
          editor.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        title: 'Heading 2',
        description: 'Medium section heading',
        icon: Heading2,
        keywords: 'h2 subtitle',
        command: (editor) =>
          editor.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        title: 'Heading 3',
        description: 'Small section heading',
        icon: Heading3,
        keywords: 'h3 subheader',
        command: (editor) =>
          editor.chain().focus().toggleHeading({ level: 3 }).run(),
      },
      {
        title: 'Bullet List',
        description: 'Create a simple bullet list',
        icon: List,
        keywords: 'unordered ul bullets',
        command: (editor) => editor.chain().focus().toggleBulletList().run(),
      },
      {
        title: 'Numbered List',
        description: 'Create a ordered list',
        icon: ListOrdered,
        keywords: 'numbered ol',
        command: (editor) => editor.chain().focus().toggleOrderedList().run(),
      },
      {
        title: 'Code Block',
        description: 'Capture code snippets',
        icon: Code2,
        keywords: 'code snippet pre',
        command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
      },
      {
        title: 'Image',
        description: 'Insert an image',
        icon: ImageIcon,
        keywords: 'image picture photo',
        command: (editor) =>
          editor.chain().focus().insertImagePlaceholder().run(),
      },
      {
        title: 'Horizontal Rule',
        description: 'Add a horizontal divider',
        icon: Minus,
        keywords: 'horizontal rule divider',
        command: (editor) => editor.chain().focus().setHorizontalRule().run(),
      },
    ],
  },
  {
    group: 'Inline',
    items: [
      {
        title: 'Quote',
        description: 'Capture a quotation',
        icon: Quote,
        keywords: 'blockquote cite',
        command: (editor) => editor.chain().focus().toggleBlockquote().run(),
      },
      {
        title: 'Code',
        description: 'Inline code snippet',
        icon: CodeSquare,
        keywords: 'code inline',
        command: (editor) => editor.chain().focus().toggleCode().run(),
      },
      {
        title: 'Blockquote',
        description: 'Block quote',
        icon: TextQuote,
        keywords: 'blockquote quote',
        command: (editor) => editor.chain().focus().toggleBlockquote().run(),
      },
    ],
  },
  {
    group: 'Alignment',
    items: [
      {
        title: 'Align Left',
        description: 'Align text to the left',
        icon: AlignLeft,
        keywords: 'align left',
        command: (editor) => editor.chain().focus().setTextAlign('left').run(),
      },
      {
        title: 'Align Center',
        description: 'Center align text',
        icon: AlignCenter,
        keywords: 'align center',
        command: (editor) =>
          editor.chain().focus().setTextAlign('center').run(),
      },
      {
        title: 'Align Right',
        description: 'Align text to the right',
        icon: AlignRight,
        keywords: 'align right',
        command: (editor) => editor.chain().focus().setTextAlign('right').run(),
      },
    ],
  },
]

// Komponen yang disederhanakan untuk mengatasi error DOM
export function TipTapFloatingMenu({ editor }: { editor: Editor }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const commandRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Simpan flag active untuk memastikan tidak ada operasi setelah unmount
  const isActiveRef = useRef(true)

  // Gunakan useEffect untuk membersihkan state saat unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false
    }
  }, [])

  // Filter grup berdasarkan pencarian
  const filteredGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) =>
              item.title
                .toLowerCase()
                .includes(debouncedSearch.toLowerCase()) ||
              item.description
                .toLowerCase()
                .includes(debouncedSearch.toLowerCase()) ||
              item.keywords
                .toLowerCase()
                .includes(debouncedSearch.toLowerCase())
          ),
        }))
        .filter((group) => group.items.length > 0),
    [debouncedSearch]
  )

  // Flattenkan item yang difilter untuk navigasi keyboard
  const flatFilteredItems = useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups]
  )

  // Jalankan perintah saat item dipilih
  const executeCommand = useCallback(
    (commandFn: (editor: Editor) => void) => {
      if (!editor || editor.isDestroyed) return

      try {
        const { from } = editor.state.selection
        const slashCommandLength = search.length + 1

        editor
          .chain()
          .focus()
          .deleteRange({
            from: Math.max(0, from - slashCommandLength),
            to: from,
          })
          .run()

        commandFn(editor)
      } catch (error) {
        console.error('Error executing command:', error)
      } finally {
        if (isActiveRef.current) {
          setIsOpen(false)
          setSearch('')
          setSelectedIndex(-1)
        }
      }
    },
    [editor, search]
  )

  // Tangani penekanan tombol untuk navigasi keyboard
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || !editor || editor.isDestroyed) return

      const preventDefault = () => {
        e.preventDefault()
        e.stopImmediatePropagation()
      }

      switch (e.key) {
        case 'ArrowDown':
          preventDefault()
          setSelectedIndex((prev) => {
            if (prev === -1) return 0
            return prev < flatFilteredItems.length - 1 ? prev + 1 : 0
          })
          break

        case 'ArrowUp':
          preventDefault()
          setSelectedIndex((prev) => {
            if (prev === -1) return flatFilteredItems.length - 1
            return prev > 0 ? prev - 1 : flatFilteredItems.length - 1
          })
          break

        case 'Enter':
          preventDefault()
          const targetIndex = selectedIndex === -1 ? 0 : selectedIndex
          if (flatFilteredItems[targetIndex]) {
            executeCommand(flatFilteredItems[targetIndex].command)
          }
          break

        case 'Escape':
          preventDefault()
          if (isActiveRef.current) {
            setIsOpen(false)
            setSelectedIndex(-1)
          }
          break
      }
    },
    [isOpen, selectedIndex, flatFilteredItems, executeCommand, editor]
  )

  // Tambahkan event listener keydown ke editor
  useEffect(() => {
    if (!editor?.options.element || editor.isDestroyed) return

    const editorElement = editor.options.element
    const handleEditorKeyDown = (e: Event) => handleKeyDown(e as KeyboardEvent)

    editorElement.addEventListener('keydown', handleEditorKeyDown)

    return () => {
      // Gunakan try-catch untuk mencegah error jika element dihapus
      try {
        if (editorElement) {
          editorElement.removeEventListener('keydown', handleEditorKeyDown)
        }
      } catch (e) {
        // Abaikan error saat cleanup
      }
    }
  }, [handleKeyDown, editor])

  // Reset selectedIndex saat search berubah
  useEffect(() => {
    if (isActiveRef.current) {
      setSelectedIndex(-1)
    }
  }, [search])

  // Fokus ke item yang dipilih
  useEffect(() => {
    if (
      selectedIndex >= 0 &&
      itemRefs.current[selectedIndex] &&
      isActiveRef.current
    ) {
      itemRefs.current[selectedIndex]?.focus()
    }
  }, [selectedIndex])

  // Validasi bahwa editor valid sebelum rendering
  if (!editor || editor.isDestroyed) return null

  // Gunakan FloatingMenu yang disediakan oleh Tiptap dengan opsi minimal
  return (
    <FloatingMenu
      editor={editor}
      shouldShow={({ state }) => {
        if (!editor || editor.isDestroyed || !isActiveRef.current) return false

        try {
          const { $from } = state.selection
          const currentLineText = $from.parent.textBetween(
            0,
            $from.parentOffset,
            '\n',
            ' '
          )

          // Deteksi apakah ini adalah slash command
          const isSlashCommand =
            currentLineText.startsWith('/') &&
            $from.parent.type.name !== 'codeBlock' &&
            $from.parentOffset === currentLineText.length

          if (!isSlashCommand) {
            if (isOpen && isActiveRef.current) setIsOpen(false)
            return false
          }

          // Update search dan tampilkan menu
          const query = currentLineText.slice(1).trim()
          if (query !== search && isActiveRef.current) setSearch(query)
          if (!isOpen && isActiveRef.current) setIsOpen(true)
          return true
        } catch (error) {
          return false
        }
      }}
      tippyOptions={{
        appendTo: document.body,
        duration: 0, // Nonaktifkan animasi
        animation: false, // Nonaktifkan animasi
        zIndex: 9999,
        interactive: true,
        onHide: () => {
          if (isActiveRef.current) {
            setIsOpen(false)
            setSelectedIndex(-1)
          }
        },
      }}
    >
      <Command
        role="listbox"
        ref={commandRef}
        className="z-50 w-72 overflow-hidden rounded-lg border bg-popover shadow-lg"
      >
        <ScrollArea className="max-h-[330px]">
          <CommandList>
            <CommandEmpty className="py-3 text-center text-sm text-muted-foreground">
              No results found
            </CommandEmpty>

            {filteredGroups.map((group, groupIndex) => (
              <CommandGroup
                key={`${group.group}-${groupIndex}`}
                heading={
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {group.group}
                  </div>
                }
              >
                {group.items.map((item, itemIndex) => {
                  const flatIndex =
                    filteredGroups
                      .slice(0, groupIndex)
                      .reduce((acc, g) => acc + g.items.length, 0) + itemIndex

                  return (
                    <CommandItem
                      role="option"
                      key={`${group.group}-${item.title}-${itemIndex}`}
                      value={`${group.group}-${item.title}`}
                      onSelect={() => executeCommand(item.command)}
                      className={cn(
                        'gap-3 aria-selected:bg-accent/50',
                        flatIndex === selectedIndex ? 'bg-accent/50' : ''
                      )}
                      aria-selected={flatIndex === selectedIndex}
                      ref={(el) => {
                        if (isActiveRef.current) {
                          itemRefs.current[flatIndex] = el
                        }
                      }}
                      tabIndex={flatIndex === selectedIndex ? 0 : -1}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span className="text-sm font-medium">
                          {item.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                      <kbd className="ml-auto flex h-5 items-center rounded bg-muted px-1.5 text-xs text-muted-foreground">
                        ↵
                      </kbd>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </ScrollArea>
      </Command>
    </FloatingMenu>
  )
}
