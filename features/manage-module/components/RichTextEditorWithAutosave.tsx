'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { defaultContentJSON } from '@/features/manage-module/lib/content'
import { RichTextEditor, RichTextEditorProps } from './RichTextEditor'
import { ContentBlock, ContentBlockType } from '../types/modulePageSchema'

// Definisikan interface untuk data halaman dari API
interface PageData {
  id: string
  moduleId: string
  title: string
  order: number
  blocks: ContentBlock[]
  status: string
  createdAt: string
  updatedAt: string
}

// Fungsi untuk mengkonversi format blok dari API ke JSON Tiptap
function parseContent(
  content: string | undefined,
  pageData?: PageData
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
  moduleId,
}: Omit<RichTextEditorProps, 'autosave'> & { pageId: string }) {
  const [parsedContent, setParsedContent] = useState<object>(defaultContentJSON)
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Ekstrak moduleId dari URL path hanya jika tidak diberikan sebagai prop
  useEffect(() => {
    if (!moduleId) {
      // Format: /manage-module/pages/{moduleId}
      const pathParts = window.location.pathname.split('/')
      const pagesIndex = pathParts.indexOf('pages')

      if (pagesIndex !== -1 && pagesIndex + 1 < pathParts.length) {
        const extractedModuleId = pathParts[pagesIndex + 1]
        console.log(
          `[RichTextEditorWithAutosave] Extracted moduleId from URL: ${extractedModuleId}`
        )
      }
    } else {
      console.log(
        `[RichTextEditorWithAutosave] Using moduleId from props: ${moduleId}`
      )
    }
  }, [moduleId])

  // Fetch page data from API
  useEffect(() => {
    const controller = new AbortController()

    const fetchPageData = async () => {
      if (!pageId) return

      // Periksa flag navigasi - jangan fetch jika sedang navigasi halaman
      const isNavigating =
        window.sessionStorage.getItem('isNavigating') === 'true'
      if (isNavigating) {
        console.log(
          '[RichTextEditorWithAutosave] Navigation in progress, skipping fetch'
        )
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Pastikan moduleId tersedia sebelum melakukan fetch
        if (!moduleId) {
          console.error('[RichTextEditorWithAutosave] moduleId tidak tersedia')
          setError('Module ID tidak tersedia')
          setIsLoading(false)
          return
        }

        console.log(
          `[RichTextEditorWithAutosave] Fetching data for pageId: ${pageId}, moduleId: ${moduleId}`
        )

        // Gunakan URL API yang benar dengan moduleId
        const response = await axios.get(
          `/api/module/${moduleId}/pages/${pageId}`
        )

        if (response.data && response.data.success) {
          console.log(
            '[RichTextEditorWithAutosave] Data fetched successfully:',
            response.data
          )
          const fetchedPageData = response.data.data
          setPageData(fetchedPageData)

          // Parse content untuk editor
          const parsedContent = parseContent(initialContent, fetchedPageData)
          setParsedContent(parsedContent)
        } else {
          console.error(
            '[RichTextEditorWithAutosave] API error:',
            response.data
          )
          setError('Failed to load page data')
        }
      } catch (err) {
        console.error('[RichTextEditorWithAutosave] Fetch error:', err)
        setError('Error loading page data')
      } finally {
        setIsLoading(false)
      }
    }

    // Hanya jalankan fetchPageData jika moduleId sudah tersedia
    if (moduleId) {
      fetchPageData()
    }

    return () => {
      controller.abort()
    }
  }, [pageId, initialContent, moduleId])

  // Tampilkan loader selama data diambil
  if (isLoading) {
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
      onChange={(content) => {
        if (onChange) {
          onChange(content)
        }
      }}
      autosave={true}
      moduleId={moduleId}
    />
  )
}
