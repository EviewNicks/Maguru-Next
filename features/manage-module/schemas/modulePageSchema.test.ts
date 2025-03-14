// features/manage-module/schemas/modulePageSchema.test.ts
import { 
  ModulePageType, 
  ProgrammingLanguage, 
  ModulePageCreateSchema,
  ModulePageUpdateSchema,
  ModulePageReorderSchema
} from './modulePageSchema'

describe('ModulePageSchema', () => {
  describe('ModulePageCreateSchema', () => {
    describe('Teori type validation', () => {
      it('validates valid theory page input', () => {
        const validInput = {
          type: ModulePageType.TEORI,
          moduleId: '123e4567-e89b-12d3-a456-426614174000',
          order: 1,
          content: '<p>Konten teori yang valid</p>',
        }

        const result = ModulePageCreateSchema.safeParse(validInput)
        expect(result.success).toBe(true)
      })

      it('rejects empty content', () => {
        const invalidInput = {
          type: ModulePageType.TEORI,
          moduleId: '123e4567-e89b-12d3-a456-426614174000',
          order: 1,
          content: '',
        }

        const result = ModulePageCreateSchema.safeParse(invalidInput)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Konten tidak boleh kosong')
        }
      })

      it('rejects content exceeding max length', () => {
        const invalidInput = {
          type: ModulePageType.TEORI,
          moduleId: '123e4567-e89b-12d3-a456-426614174000',
          order: 1,
          content: 'a'.repeat(5001),
        }

        const result = ModulePageCreateSchema.safeParse(invalidInput)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Konten teori maksimal 5000 karakter')
        }
      })

      it('rejects invalid moduleId', () => {
        const invalidInput = {
          type: ModulePageType.TEORI,
          moduleId: 'not-a-uuid',
          order: 1,
          content: '<p>Konten teori</p>',
        }

        const result = ModulePageCreateSchema.safeParse(invalidInput)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('ModuleId harus berupa UUID yang valid')
        }
      })

      it('rejects negative order', () => {
        const invalidInput = {
          type: ModulePageType.TEORI,
          moduleId: '123e4567-e89b-12d3-a456-426614174000',
          order: -1,
          content: '<p>Konten teori</p>',
        }

        const result = ModulePageCreateSchema.safeParse(invalidInput)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Urutan harus angka non-negatif')
        }
      })

      it('ignores language field for theory type', () => {
        const input = {
          type: ModulePageType.TEORI,
          moduleId: '123e4567-e89b-12d3-a456-426614174000',
          order: 1,
          content: '<p>Konten teori</p>',
          language: ProgrammingLanguage.JAVASCRIPT, // Seharusnya diabaikan
        }

        const result = ModulePageCreateSchema.safeParse(input)
        expect(result.success).toBe(true)
      })
    })

    describe('Kode type validation', () => {
      it('validates valid code page input', () => {
        const validInput = {
          type: ModulePageType.KODE,
          moduleId: '123e4567-e89b-12d3-a456-426614174000',
          order: 1,
          content: 'console.log("Hello World");',
          language: ProgrammingLanguage.JAVASCRIPT,
        }

        const result = ModulePageCreateSchema.safeParse(validInput)
        expect(result.success).toBe(true)
      })

      it('rejects missing language field', () => {
        const invalidInput = {
          type: ModulePageType.KODE,
          moduleId: '123e4567-e89b-12d3-a456-426614174000',
          order: 1,
          content: 'console.log("Hello World");',
          // language field missing
        }

        const result = ModulePageCreateSchema.safeParse(invalidInput)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors[0].path).toContain('language')
        }
      })

      it('rejects invalid language', () => {
        const invalidInput = {
          type: ModulePageType.KODE,
          moduleId: '123e4567-e89b-12d3-a456-426614174000',
          order: 1,
          content: 'code content',
          language: 'invalid-language' as ProgrammingLanguage,
        }

        const result = ModulePageCreateSchema.safeParse(invalidInput)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Bahasa pemrograman tidak valid')
        }
      })

      it('rejects content exceeding max length', () => {
        const invalidInput = {
          type: ModulePageType.KODE,
          moduleId: '123e4567-e89b-12d3-a456-426614174000',
          order: 1,
          content: 'a'.repeat(2001),
          language: ProgrammingLanguage.JAVASCRIPT,
        }

        const result = ModulePageCreateSchema.safeParse(invalidInput)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Konten kode maksimal 2000 karakter')
        }
      })
    })
  })

  describe('ModulePageUpdateSchema', () => {
    it('validates valid theory page update', () => {
      const validInput = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: ModulePageType.TEORI,
        content: '<p>Konten teori yang diperbarui</p>',
      }

      const result = ModulePageUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('validates valid code page update', () => {
      const validInput = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: ModulePageType.KODE,
        content: 'console.log("Updated");',
        language: ProgrammingLanguage.JAVASCRIPT,
      }

      const result = ModulePageUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('rejects missing id', () => {
      const invalidInput = {
        type: ModulePageType.TEORI,
        content: '<p>Konten teori</p>',
      }

      const result = ModulePageUpdateSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('allows moduleId to be optional', () => {
      const validInput = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: ModulePageType.TEORI,
        content: '<p>Konten teori</p>',
        // moduleId is optional for updates
      }

      const result = ModulePageUpdateSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })
  })

  describe('ModulePageReorderSchema', () => {
    it('validates valid reorder input', () => {
      const validInput = {
        updates: [
          { pageId: '123e4567-e89b-12d3-a456-426614174000', order: 2 },
          { pageId: '223e4567-e89b-12d3-a456-426614174000', order: 1 },
        ],
      }

      const result = ModulePageReorderSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('rejects empty updates array', () => {
      const invalidInput = {
        updates: [],
      }

      const result = ModulePageReorderSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('rejects invalid pageId', () => {
      const invalidInput = {
        updates: [
          { pageId: 'not-a-uuid', order: 1 },
        ],
      }

      const result = ModulePageReorderSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('rejects negative order', () => {
      const invalidInput = {
        updates: [
          { pageId: '123e4567-e89b-12d3-a456-426614174000', order: -1 },
        ],
      }

      const result = ModulePageReorderSchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })
  })
})
