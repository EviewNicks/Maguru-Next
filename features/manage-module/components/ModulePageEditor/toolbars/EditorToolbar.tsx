import { Separator } from '@/components/ui/separator'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ToolbarProvider } from './ToolbarProvider'
import type { Editor } from '@tiptap/core'
import { UndoToolbar } from './Undo'
import { RedoToolbar } from './Redo'
import { HeadingsToolbar } from './Headings'
import { BlockquoteToolbar } from './BlockQuote'
import { CodeToolbar } from './Code'
import { BoldToolbar } from './Bold'
import { ItalicToolbar } from './Italic'
import { UnderlineToolbar } from './Underline'
import { StrikeThroughToolbar } from './Strikethrough'
import { LinkToolbar } from './Link'
import { BulletListToolbar } from './BulletList'
import { OrderedListToolbar } from './OrderedList'
import { HorizontalRuleToolbar } from './HorizontalRule'
import { AlignmentTooolbar } from './Alignment'
import { ImagePlaceholderToolbar } from './ImagePlaceholderToolbar'
import { ColorHighlightToolbar } from './ColorAndHighlight'
import { SearchAndReplaceToolbar } from './SearchAndReplaceToolbar'
import { CodeBlockToolbar } from './CodeBlock'

export const EditorToolbar = ({ editor }: { editor: Editor }) => {
  return (
    <div className="sticky top-0 z-20 w-full border-b bg-background hidden sm:block">
      <ToolbarProvider editor={editor}>
        <TooltipProvider>
          <ScrollArea className="h-fit py-0.5">
            <div>
              <div className="flex items-center gap-1 px-2">
                {/* History Group */}
                <UndoToolbar />
                <RedoToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Text Structure Group */}
                <HeadingsToolbar />
                <BlockquoteToolbar />
                <CodeToolbar />
                <CodeBlockToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Basic Formatting Group */}
                <BoldToolbar />
                <ItalicToolbar />
                <UnderlineToolbar />
                <StrikeThroughToolbar />
                <LinkToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Lists & Structure Group */}
                <BulletListToolbar />
                <OrderedListToolbar />
                <HorizontalRuleToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Alignment Group */}
                <AlignmentTooolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Media & Styling Group */}
                <ImagePlaceholderToolbar />
                <ColorHighlightToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                <div className="flex-1" />

                {/* Utility Group */}
                <SearchAndReplaceToolbar />
              </div>
            </div>
            <ScrollBar className="hidden" orientation="horizontal" />
          </ScrollArea>
        </TooltipProvider>
      </ToolbarProvider>
    </div>
  )
}
