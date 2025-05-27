import {
  ContentType,
  CreateModulePageSchema,
  UpdateModulePageSchema,
  imageUploadSchema,
  videoUploadSchema,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
} from './modulePageSchema'

describe('ModulePage Validation Schemas', () => {
  describe('createModulePageSchema', () => {
    it('harus valid dengan data yang benar', () => {
      const validData = {
        moduleId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Introduction to JavaScript',
        type: ContentType.TEXT,
        order: 1,
        content: '<p>This is some content</p>',
      }

      const result = CreateModulePageSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('harus menerima type code dengan language', () => {
      const validData = {
        moduleId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'JavaScript Functions',
        type: ContentType.CODE,
        order: 2,
        content: 'function greet() { return "Hello"; }',
        language: 'javascript',
      }

      const result = CreateModulePageSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('harus menolak judul yang terlalu pendek', () => {
      const invalidData = {
        moduleId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'JS', // terlalu pendek
        type: ContentType.TEXT,
        order: 1,
        content: '<p>This is some content</p>',
      }

      const result = CreateModulePageSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toContain('minimal 5 karakter')
      }
    })

    it('harus menolak tipe konten yang tidak valid', () => {
      const invalidData = {
        moduleId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Introduction to JavaScript',
        type: 'invalid-type' as ContentType, // tipe yang tidak valid
        order: 1,
        content: '<p>This is some content</p>',
      }

      const result = CreateModulePageSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Tipe konten tidak valid'
        )
      }
    })

    it('harus menolak moduleId yang tidak valid', () => {
      const invalidData = {
        moduleId: 'not-a-uuid',
        title: 'Introduction to JavaScript',
        type: ContentType.TEXT,
        order: 1,
        content: '<p>This is some content</p>',
      }

      const result = CreateModulePageSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toContain('ID Modul tidak valid')
      }
    })

    it('harus menolak konten kosong', () => {
      const invalidData = {
        moduleId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Introduction to JavaScript',
        type: ContentType.TEXT,
        order: 1,
        content: '',
      }

      const result = CreateModulePageSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Konten tidak boleh kosong'
        )
      }
    })
  })

  describe('updateModulePageSchema', () => {
    it('harus valid untuk update sebagian', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Title',
      }

      const result = UpdateModulePageSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('harus valid untuk update penuh', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        moduleId: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Updated Title',
        type: ContentType.CODE,
        order: 2,
        content: 'updated content',
        language: 'typescript',
      }

      const result = UpdateModulePageSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('harus menolak jika tidak ada field yang diubah', () => {
      const invalidData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = UpdateModulePageSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Tidak ada data yang diubah'
        )
      }
    })

    it('harus menolak jika id tidak valid', () => {
      const invalidData = {
        id: 'not-a-uuid',
        title: 'Updated Title',
      }

      const result = UpdateModulePageSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'ID halaman tidak valid'
        )
      }
    })
  })

  describe('File Upload Schemas', () => {
    let mockValidImageFile: File
    let mockValidVideoFile: File
    let mockLargeImageFile: File
    let mockLargeVideoFile: File
    let mockInvalidImageType: File
    let mockInvalidVideoType: File

    beforeEach(() => {
      // Mock valid image file
      mockValidImageFile = new File(['image content'], 'test.jpg', {
        type: 'image/jpeg',
      })
      Object.defineProperty(mockValidImageFile, 'size', { value: 1024 * 1024 }) // 1MB

      // Mock valid video file
      mockValidVideoFile = new File(['video content'], 'test.mp4', {
        type: 'video/mp4',
      })
      Object.defineProperty(mockValidVideoFile, 'size', {
        value: 10 * 1024 * 1024,
      }) // 10MB

      // Mock large image file
      mockLargeImageFile = new File(['large image content'], 'large.jpg', {
        type: 'image/jpeg',
      })
      Object.defineProperty(mockLargeImageFile, 'size', {
        value: MAX_IMAGE_SIZE_BYTES + 1,
      })

      // Mock large video file
      mockLargeVideoFile = new File(['large video content'], 'large.mp4', {
        type: 'video/mp4',
      })
      Object.defineProperty(mockLargeVideoFile, 'size', {
        value: MAX_VIDEO_SIZE_BYTES + 1,
      })

      // Mock invalid image type
      mockInvalidImageType = new File(['image content'], 'test.txt', {
        type: 'text/plain',
      })
      Object.defineProperty(mockInvalidImageType, 'size', { value: 1024 })

      // Mock invalid video type
      mockInvalidVideoType = new File(['video content'], 'test.avi', {
        type: 'video/x-msvideo',
      })
      Object.defineProperty(mockInvalidVideoType, 'size', {
        value: 1024 * 1024,
      })
    })

    describe('imageUploadSchema', () => {
      it('harus menerima file gambar valid', () => {
        const result = imageUploadSchema.safeParse({ file: mockValidImageFile })
        expect(result.success).toBe(true)
      })

      it('harus menolak file gambar terlalu besar', () => {
        const result = imageUploadSchema.safeParse({ file: mockLargeImageFile })
        expect(result.success).toBe(false)

        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            'Ukuran gambar maksimal 2MB'
          )
        }
      })

      it('harus menolak file dengan tipe yang tidak valid', () => {
        const result = imageUploadSchema.safeParse({
          file: mockInvalidImageType,
        })
        expect(result.success).toBe(false)

        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Format file harus')
        }
      })
    })

    describe('videoUploadSchema', () => {
      it('harus menerima file video valid', () => {
        const result = videoUploadSchema.safeParse({ file: mockValidVideoFile })
        expect(result.success).toBe(true)
      })

      it('harus menolak file video terlalu besar', () => {
        const result = videoUploadSchema.safeParse({ file: mockLargeVideoFile })
        expect(result.success).toBe(false)

        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            'Ukuran video maksimal 20MB'
          )
        }
      })

      it('harus menolak file dengan tipe yang tidak valid', () => {
        const result = videoUploadSchema.safeParse({
          file: mockInvalidVideoType,
        })
        expect(result.success).toBe(false)

        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Format file harus')
        }
      })
    })
  })
})
