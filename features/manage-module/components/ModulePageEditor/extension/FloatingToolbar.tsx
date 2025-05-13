'use client'

import { BubbleMenu, type Editor } from '@tiptap/react'
import { BoldToolbar } from '../toolbars/Bold'
import { ItalicToolbar } from '../toolbars/Italic'
import { UnderlineToolbar } from '../toolbars/Underline'
import { LinkToolbar } from '../toolbars/Link'
import { ColorHighlightToolbar } from '../toolbars/ColorAndHighlight'
import { ToolbarProvider } from '../toolbars/ToolbarProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { HeadingsToolbar } from '../toolbars/Headings'
import { BulletListToolbar } from '../toolbars/BulletList'
import { OrderedListToolbar } from '../toolbars/OrderedList'
import { ImagePlaceholderToolbar } from '../toolbars/ImagePlaceholderToolbar'
import { AlignmentTooolbar } from '../toolbars/Alignment'
import { BlockquoteToolbar } from '../toolbars/BlockQuote'
import { useEffect } from 'react'

export function FloatingToolbar({ editor }: { editor: Editor | null }) {
  const isMobile = useMediaQuery('(max-width: 640px)')

  // Prevent default context menu on mobile
  useEffect(() => {
    if (!editor?.options.element || !isMobile) return

    const handleContextMenu = (e: Event) => {
      e.preventDefault()
    }

    const el = editor.options.element
    el.addEventListener('contextmenu', handleContextMenu)

    return () => el.removeEventListener('contextmenu', handleContextMenu)
  }, [editor, isMobile])

  if (!editor) return null

  if (isMobile) {
    return (
      <TooltipProvider>
        <BubbleMenu
          tippyOptions={{
            duration: 100,
            placement: 'bottom',
            offset: [0, 10],
          }}
          shouldShow={() => {
            // Show toolbar when editor is focused and has selection
            return editor.isEditable && editor.isFocused
          }}
          editor={editor}
          className="w-full min-w-full mx-0 shadow-sm border rounded-sm bg-background"
        >
          <ToolbarProvider editor={editor}>
            <ScrollArea className="h-fit py-0.5 w-full">
              <div className="flex items-center px-2 gap-0.5">
                <div className="flex items-center gap-0.5 p-1">
                  {/* Primary formatting */}
                  <BoldToolbar />
                  <ItalicToolbar />
                  <UnderlineToolbar />
                  <Separator orientation="vertical" className="h-6 mx-1" />

                  {/* Structure controls */}
                  <HeadingsToolbar />
                  <BulletListToolbar />
                  <OrderedListToolbar />
                  <Separator orientation="vertical" className="h-6 mx-1" />

                  {/* Rich formatting */}
                  <ColorHighlightToolbar />
                  <LinkToolbar />
                  <ImagePlaceholderToolbar />
                  <Separator orientation="vertical" className="h-6 mx-1" />

                  {/* Additional controls */}
                  <AlignmentTooolbar />
                  <BlockquoteToolbar />
                </div>
              </div>
              <ScrollBar className="h-0.5" orientation="horizontal" />
            </ScrollArea>
          </ToolbarProvider>
        </BubbleMenu>
      </TooltipProvider>
    )
  }

  return null
}
