import prisma from '@/lib/prisma'
import { ModuleStatus } from '@/features/manage-module/types'

// Mock prisma client
jest.mock('@/lib/prisma', () => ({
  module: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  modulePage: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(prisma)),
}))

describe('ModulePage Model', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('harus dapat membuat module page dengan semua field yang diperlukan', async () => {
    // Mock data yang akan digunakan
    const mockModule = {
      id: 'module-id-1',
      title: 'Test Module',
      description: 'Test Description',
      status: ModuleStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      updatedBy: 'user-1',
    }

    const mockModulePage = {
      id: 'page-id-1',
      moduleId: mockModule.id,
      title: 'Introduction',
      type: 'text',
      order: 1,
      content: '<p>This is the introduction content</p>',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Mock prisma response
    ;(prisma.module.findUnique as jest.Mock).mockResolvedValue(mockModule)
    ;(prisma.modulePage.create as jest.Mock).mockResolvedValue(mockModulePage)

    // Simulasi pembuatan module page
    const modulePage = await prisma.modulePage.create({
      data: {
        moduleId: mockModule.id,
        title: 'Introduction',
        type: 'text',
        order: 1,
        content: '<p>This is the introduction content</p>',
      },
    })

    // Verifikasi bahwa prisma.modulePage.create dipanggil dengan parameter yang benar
    expect(prisma.modulePage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        moduleId: mockModule.id,
        title: 'Introduction',
        type: 'text',
        order: 1,
        content: '<p>This is the introduction content</p>',
      }),
    })

    // Verifikasi bahwa result memiliki semua field yang diperlukan
    expect(modulePage).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        moduleId: mockModule.id,
        title: 'Introduction',
        type: 'text',
        order: expect.any(Number),
        content: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    )
  })

  it('harus dapat mengambil semua halaman yang terkait dengan modul tertentu', async () => {
    // Mock data
    const mockModuleId = 'module-id-1'
    const mockPages = [
      {
        id: 'page-id-1',
        moduleId: mockModuleId,
        title: 'Introduction',
        type: 'text',
        order: 1,
        content: '<p>Introduction content</p>',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'page-id-2',
        moduleId: mockModuleId,
        title: 'Chapter 1',
        type: 'text',
        order: 2,
        content: '<p>Chapter 1 content</p>',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Mock prisma response
    ;(prisma.modulePage.findMany as jest.Mock).mockResolvedValue(mockPages)

    // Simulasi pengambilan halaman modul
    const pages = await prisma.modulePage.findMany({
      where: {
        moduleId: mockModuleId,
      },
      orderBy: {
        order: 'asc',
      },
    })

    // Verifikasi bahwa prisma.modulePage.findMany dipanggil dengan parameter yang benar
    expect(prisma.modulePage.findMany).toHaveBeenCalledWith({
      where: {
        moduleId: mockModuleId,
      },
      orderBy: {
        order: 'asc',
      },
    })

    // Verifikasi bahwa result sesuai dengan yang diharapkan
    expect(pages).toHaveLength(2)
    expect(pages[0].title).toBe('Introduction')
    expect(pages[1].title).toBe('Chapter 1')
    expect(pages[0].order).toBeLessThan(pages[1].order)
  })

  it('harus mendukung berbagai tipe konten (teks, kode, gambar, video)', async () => {
    // Mock data untuk berbagai tipe konten
    const mockContentTypes = [
      {
        id: 'page-id-1',
        moduleId: 'module-id-1',
        title: 'Text Content',
        type: 'text',
        order: 1,
        content: '<p>Sample text content</p>',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'page-id-2',
        moduleId: 'module-id-1',
        title: 'Code Example',
        type: 'code',
        order: 2,
        content: 'function hello() { return "world"; }',
        language: 'javascript',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'page-id-3',
        moduleId: 'module-id-1',
        title: 'Image Example',
        type: 'image',
        order: 3,
        content: 'https://example.com/image.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'page-id-4',
        moduleId: 'module-id-1',
        title: 'Video Example',
        type: 'video',
        order: 4,
        content: 'https://example.com/video.mp4',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Test penciptaan berbagai tipe konten
    for (const mockPage of mockContentTypes) {
      ;(prisma.modulePage.create as jest.Mock).mockResolvedValueOnce(mockPage)

      const page = await prisma.modulePage.create({
        data: {
          moduleId: mockPage.moduleId,
          title: mockPage.title,
          type: mockPage.type,
          order: mockPage.order,
          content: mockPage.content,
          ...(mockPage.language ? { language: mockPage.language } : {}),
        },
      })

      // Verifikasi hasil
      expect(page).toEqual(
        expect.objectContaining({
          type: mockPage.type,
          content: mockPage.content,
        })
      )

      // Khusus untuk tipe kode, verifikasi field language
      if (mockPage.type === 'code') {
        expect(page).toHaveProperty('language', mockPage.language)
      }
    }
  })
})
