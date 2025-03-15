// features/manage-module/components/editors/TheoryEditor.tsx
'use client'

import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import CharacterCount from '@tiptap/extension-character-count'
import { Editor } from '@tiptap/core'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Code,
} from 'lucide-react'

interface TheoryEditorProps {
  content: string
  onChange: (content: string) => void
  maxLength?: number
  className?: string
}

export function TheoryEditor({
  content,
  onChange,
  maxLength = 5000,
  className,
}: TheoryEditorProps) {
  // Pastikan content selalu string valid
  const safeContent = typeof content === 'string' ? content : '';
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
    ],
    content: safeContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
  })

  // Perbarui konten editor ketika prop content berubah
  useEffect(() => {
    if (editor && typeof content === 'string' && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Batasi panjang konten
  useEffect(() => {
    if (editor) {
      const handleUpdate = ({ editor }: { editor: Editor }) => {
        const html = editor.getHTML()
        if (html.length > maxLength) {
          editor.commands.undo()
        }
      }

      editor.on('update', handleUpdate)

      return () => {
        editor.off('update', handleUpdate)
      }
    }
  }, [editor, maxLength])

  if (!editor) {
    return null
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className={`theory-editor ${className || ''}`}>
      <div className="flex flex-wrap gap-1 mb-2 p-1 border rounded-md bg-background">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          aria-label="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          aria-label="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('codeBlock')}
          onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
          aria-label="Code Block"
        >
          <Code className="h-4 w-4" />
        </Toggle>
        <Button
          variant="outline"
          size="sm"
          onClick={setLink}
          className={editor.isActive('link') ? 'bg-accent' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="border rounded-md p-3 min-h-[200px] bg-background">
        <EditorContent editor={editor} className="prose dark:prose-invert max-w-none" />
      </div>

      <div className="text-xs text-muted-foreground mt-1 text-right" data-testid="theory-editor-toolbar">
        {editor && editor.storage && editor.storage.characterCount ? 
          `${editor.storage.characterCount.characters()}/${maxLength} karakter` : 
          `0/${maxLength} karakter`}
      </div>
    </div>
  )
}
