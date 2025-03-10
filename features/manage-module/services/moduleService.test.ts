// Mock prisma client sebelum mengimpor moduleService
jest.mock('./moduleService', () => {
  // Simpan referensi ke modul asli
  const originalModule = jest.requireActual('./moduleService') as Record<string, unknown>;
  
  // Buat mock untuk prisma
  const mockPrisma = {
    module: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
  
  // Ganti prisma dengan mock, tapi pertahankan fungsi-fungsi lainnya
  return {
    ...originalModule,
    prisma: mockPrisma
  };
});

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import * as moduleService from './moduleService'
import {
  ModuleStatus,
  Module,
  ModuleCreateInput,
  ModuleUpdateInput,
} from '../types'

// Definisikan tipe untuk mock PrismaClient
type MockPrismaClient = {
  module: {
    create: jest.Mock<(data: ModuleCreateInput) => Promise<Module>>
    findMany: jest.Mock<
      (args?: {
        where?: object
        orderBy?: object
        take?: number
        skip?: number
        cursor?: object
      }) => Promise<Module[]>
    >
    findUnique: jest.Mock<
      (args: { where: { id: string } }) => Promise<Module | null>
    >
    update: jest.Mock<
      (args: {
        where: { id: string }
        data: ModuleUpdateInput
      }) => Promise<Module>
    >
    delete: jest.Mock<
      (args: { where: { id: string } }) => Promise<Module | null>
    >
  }
  $connect: jest.Mock
  $disconnect: jest.Mock
}

// Dapatkan mock prisma yang sudah ditipe dengan benar
const prismaMock = moduleService.prisma as unknown as MockPrismaClient;

describe('Module Service', () => {
  const mockModule: Module = {
    id: 'module-1',
    title: 'Test Module',
    description: 'Test Description',
    status: 'ACTIVE' as ModuleStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1',
    updatedBy: 'user-1',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createModule', () => {
    it('should create a new module', async () => {
      prismaMock.module.create.mockResolvedValue(mockModule as Module)

      const moduleData: ModuleCreateInput = {
        title: 'Test Module',
        description: 'Test Description',
        status: 'ACTIVE' as ModuleStatus,
        createdBy: 'user-1',
      }

      const result = await moduleService.createModule(moduleData)

      expect(prismaMock.module.create).toHaveBeenCalledWith({
        data: expect.objectContaining(
          moduleData as unknown as Record<string, unknown>
        ),
      })
      expect(result).toEqual(mockModule)
    })

    it('should throw an error if creation fails', async () => {
      const error = new Error('Database error')
      prismaMock.module.create.mockRejectedValue(error)

      const moduleData: ModuleCreateInput = {
        title: 'Test Module',
        description: 'Test Description',
        status: 'ACTIVE' as ModuleStatus,
        createdBy: 'user-1',
      }

      await expect(moduleService.createModule(moduleData)).rejects.toThrow(
        'Failed to create module'
      )
    })
  })

  describe('getModules', () => {
    it('should return all modules', async () => {
      const mockModules: Module[] = [mockModule]
      prismaMock.module.findMany.mockResolvedValue(mockModules as Module[])

      const result = await moduleService.getModules({})

      expect(prismaMock.module.findMany).toHaveBeenCalled()
      expect(result).toEqual(mockModules)
    })

    it('should support filtering by status', async () => {
      const mockModules: Module[] = [mockModule]
      prismaMock.module.findMany.mockResolvedValue(mockModules as Module[])

      const result = await moduleService.getModules({ status: 'ACTIVE' })

      expect(prismaMock.module.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: expect.any(Object),
        take: expect.any(Number),
        skip: undefined,
        cursor: undefined,
      })
      expect(result).toEqual(mockModules)
    })

    it('should support pagination', async () => {
      const mockModules: Module[] = [mockModule]
      prismaMock.module.findMany.mockResolvedValue(mockModules as Module[])

      const result = await moduleService.getModules({
        limit: 10,
        cursor: 'module-id',
      })

      expect(prismaMock.module.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 1,
          cursor: { id: 'module-id' },
        })
      )
      expect(result).toEqual(mockModules)
    })
  })

  describe('getModuleById', () => {
    it('should return a module by id', async () => {
      prismaMock.module.findUnique.mockResolvedValue(
        mockModule as Module | null
      )

      const result = await moduleService.getModuleById('module-1')

      expect(prismaMock.module.findUnique).toHaveBeenCalledWith({
        where: { id: 'module-1' },
      })
      expect(result).toEqual(mockModule)
    })

    it('should return null if module not found', async () => {
      prismaMock.module.findUnique.mockResolvedValue(null)

      const result = await moduleService.getModuleById('not-found')

      expect(result).toBeNull()
    })
  })

  describe('updateModule', () => {
    it('should update a module', async () => {
      const updatedModule: Module = { ...mockModule, title: 'Updated Title' }
      prismaMock.module.update.mockResolvedValue(updatedModule as Module)

      const updateData: ModuleUpdateInput = {
        title: 'Updated Title',
        updatedBy: 'user-2',
      }

      const result = await moduleService.updateModule('module-1', updateData)

      expect(prismaMock.module.update).toHaveBeenCalledWith({
        where: { id: 'module-1' },
        data: expect.objectContaining(
          updateData as unknown as Record<string, unknown>
        ),
      })
      expect(result).toEqual(updatedModule)
    })

    it('should throw an error if update fails', async () => {
      const error = new Error('Database error')
      prismaMock.module.update.mockRejectedValue(error)

      const updateData: ModuleUpdateInput = {
        title: 'Updated Title',
        updatedBy: 'user-2',
      }

      await expect(
        moduleService.updateModule('module-1', updateData)
      ).rejects.toThrow('Failed to update module')
    })
  })

  describe('deleteModule', () => {
    it('should delete a module', async () => {
      prismaMock.module.delete.mockResolvedValue(mockModule)

      const result = await moduleService.deleteModule('module-1')

      expect(prismaMock.module.delete).toHaveBeenCalledWith({
        where: { id: 'module-1' },
      })
      expect(result).toEqual(mockModule)
    })

    it('should throw an error if delete fails', async () => {
      const error = new Error('Database error')
      prismaMock.module.delete.mockRejectedValue(error)

      await expect(moduleService.deleteModule('module-1')).rejects.toThrow(
        'Failed to delete module'
      )
    })

    it('should return null if module not found', async () => {
      prismaMock.module.delete.mockResolvedValue(null)

      const result = await moduleService.deleteModule('not-found')

      expect(prismaMock.module.delete).toHaveBeenCalledWith({
        where: { id: 'not-found' },
      })
      expect(result).toBeNull()
    })
  })
})
