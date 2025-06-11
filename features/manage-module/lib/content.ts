import { StandardEditorContent } from '../types'

// Format JSON Tiptap untuk digunakan dengan editor
export const defaultContentJSON: StandardEditorContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [
        {
          type: 'text',
          text: 'Halaman Baru',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Selamat datang di halaman modul ini. Gunakan editor untuk menambahkan konten pembelajaran Anda.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Ketik ',
        },
        {
          type: 'text',
          marks: [{ type: 'code' }],
          text: '/',
        },
        {
          type: 'text',
          text: ' untuk melihat perintah yang tersedia atau gunakan toolbar di atas.',
        },
      ],
    },
  ],
}
