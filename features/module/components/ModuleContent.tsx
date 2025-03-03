// features/module/components/ModuleContent.tsx
import  { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle } from 'lucide-react'
import Image from 'next/image'
import type { Components } from 'react-markdown'
interface ModuleContentProps {
  title?: string
  content: string
  media?: string
  pageNumber?: number
  onInteraction?: (interactionId: string) => void
  onScroll?: (scrollData: { pageNumber: number, scrollPercentage: number }) => void
}

const ModuleContent: React.FC<ModuleContentProps> = ({
  title,
  content,
  media,
  pageNumber = 1,
  onInteraction,
  onScroll,
}) => {
  // Referensi untuk elemen konten
  const contentRef = useRef<HTMLDivElement>(null)

  // Efek untuk mendeteksi interaksi scroll
  useEffect(() => {
    if (!contentRef.current || !onInteraction) return

    // Fungsi untuk mendeteksi scroll ke bagian bawah konten
    const handleScroll = () => {
      if (!contentRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      // Jika pengguna telah menggulir ke bagian bawah (dengan toleransi 50px)
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        onInteraction('scroll-to-bottom')
      }
      
      // Panggil onScroll callback jika tersedia
      if (onScroll) {
        const scrollPercentage = Math.min(
          100,
          Math.round((scrollTop / (scrollHeight - clientHeight)) * 100) || 0
        )
        onScroll({ pageNumber, scrollPercentage })
      }
    }

    const contentElement = contentRef.current
    contentElement.addEventListener('scroll', handleScroll)

    return () => {
      contentElement.removeEventListener('scroll', handleScroll)
    }
  }, [onInteraction, onScroll, pageNumber])

  // Fungsi untuk menangani interaksi dengan elemen tertentu
  const handleInteraction = (interactionId: string) => {
    if (onInteraction) {
      onInteraction(interactionId)
    }
  }

  // Komponen khusus untuk menampilkan daftar periksa interaktif
  const InteractiveChecklist = ({ items }: { items: string[] }) => (
    <div className="my-4 p-4 bg-muted rounded-md">
      <h3 className="font-semibold mb-2">Daftar Periksa:</h3>
      <ul className="space-y-2">
        {items.map((item, index) => {
          const interactionId = `checklist-item-${index}`
          return (
            <li 
              key={interactionId}
              className="flex items-start gap-2 p-2 hover:bg-muted-foreground/10 rounded transition-colors"
              id={interactionId}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={() => handleInteraction(interactionId)}
              >
                <Circle className="h-5 w-5" />
                <CheckCircle className="h-5 w-5 text-green-500 hidden checked:block" />
              </Button>
              <span>{item}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )

  // Komponen khusus untuk menampilkan tombol interaktif
  const InteractiveButton = ({ 
    id, 
    label 
  }: { 
    id: string
    label: string 
  }) => (
    <Button
      className="my-2"
      id={id}
      onClick={() => handleInteraction(id)}
    >
      {label}
    </Button>
  )

  // Definisikan komponen kustom untuk ReactMarkdown
  const markdownComponents: Components = {
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '')
      const isInline = !match
      return isInline ? (
        <code className={className} {...props}>
          {children}
        </code>
      ) : (
        <SyntaxHighlighter
          // @ts-expect-error - Style dari react-syntax-highlighter memiliki tipe yang kompleks
          style={vscDarkPlus}
          language={match ? match[1] : ''}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      )
    },
    pre: ({ children }) => {
      return <div className="overflow-auto">{children}</div>
    },
    h3: ({ children }) => {
      const headingId = `heading-${String(children).toLowerCase().replace(/\s+/g, '-')}`
      return (
        <h3 
          id={headingId} 
          className="scroll-mt-20"
          onClick={() => handleInteraction(`view-${headingId}`)}
        >
          {children}
        </h3>
      )
    },
    div: ({ className, children, ...props }) => {
      // Deteksi blok checklist interaktif
      if (className === 'interactive-checklist') {
        const content = String(children)
        const items = content
          .split('\n')
          .filter(item => item.trim().startsWith('- '))
          .map(item => item.trim().substring(2))
        
        return <InteractiveChecklist items={items} />
      }
      
      // Deteksi blok tombol interaktif
      if (className?.includes('interactive-button')) {
        const content = String(children).trim()
        const id = className.split(' ')[1] || 'interactive-button'
        return <InteractiveButton id={id} label={content} />
      }
      
      return <div className={className} {...props}>{children}</div>
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        
        {media && (
          <div className="mb-6 relative h-[300px] w-full">
            <Image 
              src={media || ''}
              alt={title || 'Module content image'}
              className="rounded-md object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              priority
              onLoadingComplete={() => handleInteraction('media-viewed')}
            />
          </div>
        )}
        
        <div 
          className="prose prose-slate dark:prose-invert max-w-none overflow-auto max-h-[500px] pr-2"
          ref={contentRef}
        >
          <ReactMarkdown components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
        
        {/* Tombol untuk menandai halaman telah dibaca */}
        <div className="mt-6 flex justify-end">
          <Button 
            variant="outline"
            onClick={() => handleInteraction('mark-as-read')}
            className="text-sm"
          >
            Tandai Telah Dibaca
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ModuleContent
