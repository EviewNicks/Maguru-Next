'use client'

import { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
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
    content ? 'Provided' : 'Not provided'
  )
  console.log(
    '[parseContent] Input pageData:',
    pageData ? 'Provided' : 'Not provided'
  )

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
        '[parseContent] Menggunakan data dari API:',
        pageData.blocks.length,
        'blocks,',
        'tipe:',
        pageData.blocks.map((b) => b.type).join(', ')
      )

      // Jika blocks adalah array dan memiliki konten
      if (Array.isArray(pageData.blocks) && pageData.blocks.length > 0) {
        // Format 1: Jika ada multiple blocks, konversi masing-masing ke format Tiptap
        console.log(
          '[parseContent] Format 1: Multiple blocks, converting each to Tiptap format'
        )
        return {
          type: 'doc',
          content: pageData.blocks.map((block: ContentBlock) => {
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
            if (block.type === ContentBlockType.HEADING) {
              return {
                type: 'heading',
                attrs: { level: 2 },
                content: [
                  {
                    type: 'text',
                    text: block.content,
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
                    text: block.content,
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
      console.log('[parseContent] No pageData, trying to parse content string')

      // Cek apakah content adalah JSON string yang valid
      try {
        // Coba parse sebagai JSON
        const parsedContent = JSON.parse(content)

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
      console.log(
        '[parseContent] Content is plain text, creating simple paragraph'
      )
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
  // State untuk menyimpan content yang sudah di-parse
  const [parsedContent, setParsedContent] = useState<object>(defaultContentJSON)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null)

  // Fetch page data from API
  useEffect(() => {
    const fetchPageData = async () => {
      if (!pageId) return

      setIsLoading(true)
      setError(null)

      try {
        // Extract moduleId from pageId
        let moduleId
        // Jika pageId berformat dengan separator "-", ambil bagian pertama
        if (pageId.includes('-')) {
          moduleId = pageId.split('-')[0]
        } else {
          // Jika tidak, coba dapatkan moduleId langsung dari URL
          const pathParts = window.location.pathname.split('/')
          const moduleIdIndex = pathParts.indexOf('pages')

          if (moduleIdIndex !== -1 && moduleIdIndex + 1 < pathParts.length) {
            moduleId = pathParts[moduleIdIndex + 1]
          } else {
            // Jika tidak ditemukan, gunakan pageId sebagai moduleId
            moduleId = pageId
          }
        }

        console.log(
          `[RichTextEditor] Fetching data for module: ${moduleId}, page: ${pageId}`
        )

        const response = await axios.get(
          `/api/module/${moduleId}/pages/${pageId}`,
          {
            headers: {
              'Cache-Control': 'no-cache',
              'X-Client-Source': 'RichTextEditor',
            },
            timeout: 10000, // 10 seconds timeout
          }
        )

        console.log('[RichTextEditor] API response:', response.data)

        if (response.data && response.data.success) {
          const fetchedPageData = response.data.data
          console.log(
            '[RichTextEditor] Page data fetched successfully:',
            fetchedPageData.id,
            fetchedPageData.title,
            'blocks:',
            fetchedPageData.blocks
          )

          // Parse content from API data
          const parsed = parseContent(initialContent, fetchedPageData)
          console.log('[RichTextEditor] Parsed content for editor:', parsed)
          setParsedContent(parsed)
        } else {
          throw new Error(response.data?.error || 'Failed to fetch page data')
        }
      } catch (err) {
        console.error('[RichTextEditor] Error fetching page data:', err)

        // Tampilkan pesan error yang lebih spesifik untuk pengguna
        if (axios.isAxiosError(err)) {
          if (err.code === 'ECONNABORTED') {
            setError('Waktu permintaan habis. Silakan coba lagi.')
          } else if (err.response?.status === 404) {
            setError('Halaman tidak ditemukan. Silakan periksa ID halaman.')
          } else if (
            err.response?.status === 401 ||
            err.response?.status === 403
          ) {
            setError('Anda tidak memiliki izin untuk mengakses halaman ini.')
          } else {
            setError(
              `Gagal mengambil data halaman: ${
                err.response?.data?.error || err.message || 'Terjadi kesalahan'
              }`
            )
          }
        } else {
          setError('Gagal mengambil data halaman. Silakan coba lagi.')
        }

        // Fallback to initialContent if available
        if (initialContent) {
          console.log('[RichTextEditor] Using initialContent as fallback')
          setParsedContent(parseContent(initialContent))
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchPageData()
  }, [pageId, initialContent])

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
      onEditorReady={setEditorInstance}
      autosave={true}
    />
  )
}
