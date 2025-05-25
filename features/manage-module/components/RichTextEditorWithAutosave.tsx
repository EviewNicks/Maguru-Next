'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { defaultContentJSON } from '@/features/manage-module/lib/content'
import { RichTextEditor, RichTextEditorProps } from './RichTextEditor'
import {
  ContentBlock,
  ContentBlockType,
  ModulePage,
} from '../types/modulePageSchema'
import { useModulePageCRUDContext } from '../context/ModulePageCRUDContext'
import { useQuery } from '@tanstack/react-query'
import { modulePageService } from '../services/modulePageService'

// Fungsi untuk mengkonversi format blok dari API ke JSON Tiptap
function parseContent(
  content: string | undefined,
  pageData?: ModulePage
): object {
  // Debug logs untuk melihat nilai input
  console.log(
    '[parseContent] Input content:',
    content ? `String length: ${content.length}` : 'Not provided'
  )
  console.log(
    '[parseContent] Input pageData:',
    pageData ? `ID: ${pageData.id}, Title: ${pageData.title}` : 'Not provided'
  )

  if (pageData) {
    console.log(
      '[parseContent] Page blocks:',
      pageData.blocks ? `Count: ${pageData.blocks.length}` : 'No blocks'
    )
  }

  // Jika tidak ada konten dan tidak ada pageData, gunakan defaultContentJSON
  if (!content && !pageData) {
    console.log(
      '[parseContent] No content or pageData, using defaultContentJSON'
    )
    return defaultContentJSON
  }

  try {
    // PRIORITAS 1: Jika pageData tersedia, gunakan data dari API
    if (pageData && pageData.blocks) {
      console.log(
        '[parseContent] Processing API data:',
        `${pageData.blocks.length} blocks,`,
        'types:',
        pageData.blocks.map((b) => b.type).join(', ')
      )

      // Jika blocks adalah array dan memiliki konten
      if (Array.isArray(pageData.blocks) && pageData.blocks.length > 0) {
        const firstBlock = pageData.blocks[0]

        // Jika blok pertama adalah TEXT dan mungkin berisi JSON Tiptap
        if (
          firstBlock.type === ContentBlockType.TEXT &&
          typeof firstBlock.content === 'string' &&
          firstBlock.content.startsWith('{') &&
          firstBlock.content.includes('"type":"doc"')
        ) {
          try {
            console.log('[parseContent] Detected Tiptap JSON in block content')
            const parsedTiptapJson = JSON.parse(firstBlock.content)
            if (parsedTiptapJson.type === 'doc') {
              console.log(
                '[parseContent] Successfully parsed Tiptap JSON from block'
              )
              return parsedTiptapJson
            }
          } catch (jsonError) {
            console.error(
              '[parseContent] Failed to parse Tiptap JSON from block:',
              jsonError
            )
          }
        }

        // Format 1: Jika ada multiple blocks, konversi masing-masing ke format Tiptap
        console.log(
          '[parseContent] Converting multiple blocks to Tiptap format'
        )
        return {
          type: 'doc',
          content: pageData.blocks.map((block: ContentBlock) => {
            if (block.type === ContentBlockType.TEXT) {
              // Coba parse content sebagai HTML jika mengandung tag HTML
              if (
                typeof block.content === 'string' &&
                (block.content.includes('<p>') || block.content.includes('<h'))
              ) {
                console.log(
                  '[parseContent] Processing HTML content in TEXT block'
                )
                return {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: block.content.replace(/<\/?[^>]+(>|$)/g, ''),
                    },
                  ],
                }
              }

              // Plain text content
              return {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: block.content || '',
                  },
                ],
              }
            }
            if (block.type === ContentBlockType.HEADING) {
              return {
                type: 'heading',
                attrs: { level: 2 },
                content: [
                  {
                    type: 'text',
                    text: block.content || '',
                  },
                ],
              }
            }
            if (block.type === ContentBlockType.CODE) {
              return {
                type: 'codeBlock',
                attrs: { language: block.language || 'javascript' },
                content: [
                  {
                    type: 'text',
                    text: block.content || '',
                  },
                ],
              }
            }
            // Default fallback
            return {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: block.content || '',
                },
              ],
            }
          }),
        }
      }
    }

    // PRIORITAS 2: Jika tidak ada pageData, gunakan content string jika tersedia
    if (content) {
      console.log('[parseContent] Trying to parse content string')

      // Cek apakah content adalah JSON string yang valid
      try {
        // Coba parse sebagai JSON
        const parsedContent = JSON.parse(content)
        console.log('[parseContent] Successfully parsed content as JSON')

        // Format 1: Jika content adalah format JSON Tiptap
        if (parsedContent.type === 'doc') {
          console.log('[parseContent] Content is valid Tiptap JSON')
          return parsedContent
        }

        // Format 2: Jika content adalah array blocks
        if (Array.isArray(parsedContent) && parsedContent.length > 0) {
          console.log('[parseContent] Content is array of blocks')

          // Jika multiple blocks
          return {
            type: 'doc',
            content: parsedContent.map((block: ContentBlock) => {
              if (block.type === ContentBlockType.TEXT) {
                return {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: block.content.replace(/<\/?[^>]+(>|$)/g, ''),
                    },
                  ],
                }
              }
              // Handle other block types...
              return {
                type: 'paragraph',
                content: [{ type: 'text', text: block.content || '' }],
              }
            }),
          }
        }
      } catch (error) {
        console.error('[parseContent] Error parsing content as JSON:', error)
        // Content bukan JSON valid, mungkin plain text
      }

      // Format 3: Jika content adalah plain text
      console.log('[parseContent] Treating content as plain text')
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: content,
              },
            ],
          },
        ],
      }
    }

    // FALLBACK: Jika semua gagal, gunakan defaultContentJSON
    console.log(
      '[parseContent] All parsing attempts failed, using defaultContentJSON'
    )
    return defaultContentJSON
  } catch (error) {
    console.error('[parseContent] Error in parseContent:', error)
    return defaultContentJSON
  }
}

// Komponen khusus untuk autosave
export function RichTextEditorWithAutosave({
  pageId,
  className,
  initialContent,
  onChange,
}: Omit<RichTextEditorProps, 'autosave'> & { pageId: string }) {
  // Gunakan context untuk mengakses moduleId, isNavigating, dan getPageById
  const { moduleId, activePage, pages } = useModulePageCRUDContext()

  const [parsedContent, setParsedContent] = useState<object>(defaultContentJSON)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Penggunaan data dari context jika tersedia atau fetch dengan useQuery
  useEffect(() => {
    if (!pageId) {
      setError('Page ID tidak tersedia')
      setIsLoading(false)
      return
    }

    // Coba gunakan data dari context terlebih dahulu
    if (activePage && activePage.id === pageId) {
      console.log('[RichTextEditorWithAutosave] Using active page from context')
      const parsedContent = parseContent(initialContent, activePage)
      setParsedContent(parsedContent)
      setIsLoading(false)
      setError(null)
      return
    }

    const pageFromContext = pages.find((p) => p.id === pageId)
    if (pageFromContext && pageFromContext.blocks) {
      console.log('[RichTextEditorWithAutosave] Using page from context pages')
      const parsedContent = parseContent(initialContent, pageFromContext)
      setParsedContent(parsedContent)
      setIsLoading(false)
      setError(null)
      return
    }

    // Jika tidak ada di context, fetch menggunakan useQuery
    // useQuery hook ini akan menangani caching dan re-fetching secara otomatis
  }, [pageId, initialContent, activePage, pages])

  // Fetch page data menggunakan useQuery jika tidak tersedia di context
  const pageQuery = useQuery({
    queryKey: ['modulePage', moduleId, pageId],
    queryFn: () => modulePageService.getModulePage(pageId),
    enabled:
      !!pageId &&
      (!activePage || activePage.id !== pageId) &&
      !pages.some((p) => p.id === pageId), // Hanya jalankan jika pageId ada, tidak ada di activePage atau pages list
    staleTime: 5 * 60 * 1000, // 5 menit
    gcTime: 10 * 60 * 1000, // 10 menit
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
  })

  // Update state saat data dari query berubah
  useEffect(() => {
    if (pageQuery.data?.data) {
      console.log(
        '[RichTextEditorWithAutosave] Data fetched from query',
        pageQuery.data.data
      )
      const parsed = parseContent(
        initialContent,
        pageQuery.data.data as unknown as ModulePage
      )
      setParsedContent(parsed)
      setIsLoading(false)
      setError(null)
    } else if (pageQuery.error) {
      console.error(
        '[RichTextEditorWithAutosave] Error fetching data from query',
        pageQuery.error
      )
      setError('Error loading page data')
      setIsLoading(false)
    } else if (pageQuery.isLoading) {
      setIsLoading(true)
      setError(null)
    } else if (
      !pageQuery.data &&
      !pageQuery.isLoading &&
      !pageQuery.error &&
      pageId
    ) {
      // Case page not found after fetch attempt
      setError('Halaman tidak ditemukan')
      setIsLoading(false)
    }
  }, [
    pageQuery.data,
    pageQuery.error,
    pageQuery.isLoading,
    initialContent,
    pageId,
  ])

  // Tangani status loading gabungan
  const combinedIsLoading = isLoading || pageQuery.isLoading

  // Tampilkan loader selama data diambil
  if (combinedIsLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
        <span className="ml-3 text-lg font-medium text-gray-600">
          Memuat konten editor...
        </span>
      </div>
    )
  }

  // Tampilkan pesan error jika ada
  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <h3 className="mb-2 text-lg font-medium text-red-600">Error</h3>
          <p className="mb-4 text-sm text-red-500">{error}</p>
          <button
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Coba lagi
          </button>
        </div>
      </div>
    )
  }

  // Render RichTextEditor dengan konten yang sudah di-parse
  return (
    <RichTextEditor
      className={className}
      initialContent={JSON.stringify(parsedContent)}
      onChange={onChange}
      autosave={true}
      pageId={pageId}
    />
  )
}
