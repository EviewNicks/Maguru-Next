import { ModulePage, ModulePageStatus } from '../../types/modulePageSchema'

/**
 * Mock data untuk halaman modul dengan fitur draft
 * Digunakan dalam integration testing
 */
const mockDraftPages: ModulePage[] = [
  {
    id: 'draft-page-1',
    title: 'Halaman Test Format JSONB',
    moduleId: 'module-test-1',
    order: 1,
    type: 'content',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: {
            level: 1,
          },
          content: [
            {
              text: 'Halaman Format JSONB',
              type: 'text',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              text: 'Ini adalah contoh konten dengan format JSONB langsung menggunakan struktur Tiptap.',
              type: 'text',
            },
          ],
        },
      ],
    },
    version: 1,
    status: ModulePageStatus.DRAFT,
    createdAt: new Date('2025-05-31T23:05:32.202Z'),
    updatedAt: new Date('2025-05-31T23:09:17.028Z'),
    lastEditBy: 'test-user-id',
    draftData: null,
    draftSavedAt: null,
    isDraft: false,
    hasUnpublishedChanges: false,
  },
  {
    id: 'draft-page-2',
    title: 'Halaman Dengan Draft',
    moduleId: 'module-test-1',
    order: 2,
    type: 'content',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: {
            level: 1,
          },
          content: [
            {
              text: 'Konten Asli',
              type: 'text',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              text: 'Ini adalah konten yang sudah dipublikasikan.',
              type: 'text',
            },
          ],
        },
      ],
    },
    version: 1,
    status: ModulePageStatus.PUBLISHED,
    createdAt: new Date('2025-05-31T23:05:32.202Z'),
    updatedAt: new Date('2025-05-31T23:09:17.028Z'),
    lastEditBy: 'test-user-id',
    draftData: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: {
            level: 1,
          },
          content: [
            {
              text: 'Draft Halaman',
              type: 'text',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              text: 'Ini adalah konten draft yang belum dipublikasikan.',
              type: 'text',
            },
          ],
        },
      ],
    },
    draftSavedAt: new Date('2025-05-31T23:09:17.024Z'),
    isDraft: true,
    hasUnpublishedChanges: true,
  },
]

export default mockDraftPages

// Helper untuk mendapatkan halaman berdasarkan ID
export const getDraftPageById = (id: string): ModulePage | undefined => {
  return mockDraftPages.find((page) => page.id === id)
}

// Helper untuk mendapatkan halaman dengan draft
export const getPagesWithDraft = (): ModulePage[] => {
  return mockDraftPages.filter((page) => page.isDraft)
}

// Helper untuk mendapatkan halaman tanpa draft
export const getPagesWithoutDraft = (): ModulePage[] => {
  return mockDraftPages.filter((page) => !page.isDraft)
}

// Helper untuk mendapatkan halaman dengan perubahan yang belum dipublikasikan
export const getPagesWithUnpublishedChanges = (): ModulePage[] => {
  return mockDraftPages.filter((page) => page.hasUnpublishedChanges)
}
