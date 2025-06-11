import { ContentBlockType, ModulePage } from '../../types/modulePageSchema'

/**
 * Mock data untuk halaman modul
 * Digunakan dalam integration testing
 */
const mockPages: ModulePage[] = [
  {
    id: 'page-1',
    title: 'Pengenalan',
    moduleId: 'module-1',
    order: 1,
    blocks: [
      {
        type: ContentBlockType.TEXT,
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Ini adalah halaman pengenalan' },
              ],
            },
          ],
        }),
      },
    ],
    status: 'DRAFT',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 'page-2',
    title: 'Materi Dasar',
    moduleId: 'module-1',
    order: 2,
    blocks: [
      {
        type: ContentBlockType.TEXT,
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Ini adalah materi dasar' }],
            },
          ],
        }),
      },
    ],
    status: 'DRAFT',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
  {
    id: 'page-3',
    title: 'Latihan Praktik',
    moduleId: 'module-1',
    order: 3,
    blocks: [
      {
        type: ContentBlockType.TEXT,
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Ini adalah latihan praktik' }],
            },
          ],
        }),
      },
    ],
    status: 'PUBLISHED',
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03'),
  },
]

export default mockPages

// Helper untuk mendapatkan halaman berdasarkan ID
export const getPageById = (id: string): ModulePage | undefined => {
  return mockPages.find((page) => page.id === id)
}

// Helper untuk mendapatkan halaman berdasarkan order
export const getPageByOrder = (order: number): ModulePage | undefined => {
  return mockPages.find((page) => page.order === order)
}

// Helper untuk mendapatkan halaman selanjutnya
export const getNextPage = (currentPageId: string): ModulePage | undefined => {
  const currentPage = getPageById(currentPageId)
  if (!currentPage) return undefined

  return mockPages.find((page) => page.order === currentPage.order + 1)
}

// Helper untuk mendapatkan halaman sebelumnya
export const getPrevPage = (currentPageId: string): ModulePage | undefined => {
  const currentPage = getPageById(currentPageId)
  if (!currentPage) return undefined

  return mockPages.find((page) => page.order === currentPage.order - 1)
}
