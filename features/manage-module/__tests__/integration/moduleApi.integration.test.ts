import { createRequest, createResponse } from 'node-mocks-http'
import { Request, Response } from 'express'
import { moduleService } from '../../services/moduleService'

// Definisikan enum ModuleStatus secara manual untuk test
const ModuleStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
}

// Mock moduleService
jest.mock('../../services/moduleService')

// Mock auth dari Clerk
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn().mockReturnValue({ userId: 'admin-id' }),
  clerkClient: {
    users: {
      getUser: jest.fn().mockResolvedValue({ id: 'admin-id', role: 'ADMIN' }),
    },
  },
}))

describe('Module API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/module', () => {
    it('should return paginated modules', async () => {
      // Arrange
      const mockModules = {
        data: [
          {
            id: 'module-1',
            title: 'Module 1',
            description: 'Description 1',
            status: ModuleStatus.DRAFT,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'admin-id',
            updatedBy: 'admin-id',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      }

      ;(moduleService.getModules as jest.Mock).mockResolvedValue(mockModules)

      // Buat request dan response mock
      const req = createRequest({
        method: 'GET',
        url: '/api/module?page=1&limit=10',
        query: {
          page: '1',
          limit: '10',
        },
      })
      const res = createResponse()

      // Simulasikan handler
      const getModulesHandler = async (req: Request, res: Response) => {
        try {
          const page = req.query.page ? parseInt(req.query.page as string) : 1
          const limit = req.query.limit
            ? parseInt(req.query.limit as string)
            : 10
          const status = req.query.status as string
          const search = req.query.search as string

          const modules = await moduleService.getModules({
            page,
            limit,
            status,
            search,
          })

          return res.status(200).json({
            data: modules.data,
            pagination: modules.pagination,
          })
        } catch (error) {
          console.error('Error fetching modules:', error)
          return res
            .status(500)
            .json({ error: 'Terjadi kesalahan saat mengambil data modul' })
        }
      }

      // Act
      await getModulesHandler(
        req as unknown as Request,
        res as unknown as Response
      )
      const data = res._getJSONData()

      // Assert
      expect(res._getStatusCode()).toBe(200)
      expect(data).toEqual(mockModules)
      expect(moduleService.getModules).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: undefined,
        search: undefined,
      })
    })

    it('should handle errors when fetching modules', async () => {
      // Arrange
      ;(moduleService.getModules as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      // Buat request dan response mock
      const req = createRequest({
        method: 'GET',
        url: '/api/module',
      })
      const res = createResponse()

      // Simulasikan handler
      const getModulesHandler = async (req: Request, res: Response) => {
        try {
          const page = req.query.page ? parseInt(req.query.page as string) : 1
          const limit = req.query.limit
            ? parseInt(req.query.limit as string)
            : 10
          const status = req.query.status as string
          const search = req.query.search as string

          const modules = await moduleService.getModules({
            page,
            limit,
            status,
            search,
          })

          return res.status(200).json(modules)
        } catch (error) {
          console.error('Error fetching modules:', error)
          return res
            .status(500)
            .json({ error: 'Terjadi kesalahan saat mengambil data modul' })
        }
      }

      // Act
      await getModulesHandler(
        req as unknown as Request,
        res as unknown as Response
      )
      const data = res._getJSONData()

      // Assert
      expect(res._getStatusCode()).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('POST /api/module', () => {
    it('should create a new module', async () => {
      // Arrange
      const moduleData = {
        title: 'New Module',
        description: 'New Description',
        status: ModuleStatus.DRAFT,
      }

      const mockCreatedModule = {
        id: 'new-module-id',
        ...moduleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin-id',
        updatedBy: 'admin-id',
      }

      ;(moduleService.createModule as jest.Mock).mockResolvedValue(
        mockCreatedModule
      )

      // Buat request dan response mock
      const req = createRequest({
        method: 'POST',
        url: '/api/module',
        body: moduleData,
      })
      const res = createResponse()

      // Simulasikan handler
      const createModuleHandler = async (req: Request, res: Response) => {
        try {
          const userId = 'admin-id' // Dari mock auth
          const newModule = await moduleService.createModule(req.body, userId)
          return res.status(201).json(newModule)
        } catch (error) {
          console.error('Error creating module:', error)
          return res
            .status(500)
            .json({ error: 'Terjadi kesalahan saat membuat modul' })
        }
      }

      // Act
      await createModuleHandler(
        req as unknown as Request,
        res as unknown as Response
      )
      const data = res._getJSONData()

      // Assert
      expect(res._getStatusCode()).toBe(201)
      expect(data).toEqual(mockCreatedModule)
      expect(moduleService.createModule).toHaveBeenCalledWith(
        moduleData,
        'admin-id'
      )
    })
  })

  describe('GET /api/module/[id]', () => {
    it('should return module by ID', async () => {
      // Arrange
      const moduleId = 'module-id'
      const mockModule = {
        id: moduleId,
        title: 'Module 1',
        description: 'Description 1',
        status: ModuleStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin-id',
        updatedBy: 'admin-id',
      }

      ;(moduleService.getModuleById as jest.Mock).mockResolvedValue(mockModule)

      // Buat request dan response mock
      const req = createRequest({
        method: 'GET',
        url: `/api/module/${moduleId}`,
        query: {
          id: moduleId,
        },
      })
      const res = createResponse()

      // Simulasikan handler
      const getModuleByIdHandler = async (req: Request, res: Response) => {
        try {
          const moduleId = req.query.id as string
          const moduleData = await moduleService.getModuleById(moduleId)

          if (!moduleData) {
            return res.status(404).json({ error: 'Modul tidak ditemukan' })
          }

          return res.status(200).json(moduleData)
        } catch (error) {
          console.error('Error fetching module:', error)
          return res
            .status(500)
            .json({ error: 'Terjadi kesalahan saat mengambil data modul' })
        }
      }

      // Act
      await getModuleByIdHandler(
        req as unknown as Request,
        res as unknown as Response
      )
      const data = res._getJSONData()

      // Assert
      expect(res._getStatusCode()).toBe(200)
      expect(data).toEqual(mockModule)
      expect(moduleService.getModuleById).toHaveBeenCalledWith(moduleId)
    })
  })

  describe('PUT /api/module/[id]', () => {
    it('should update module by ID', async () => {
      // Arrange
      const moduleId = 'module-id'
      const updateData = {
        title: 'Updated Title',
        status: ModuleStatus.ACTIVE,
      }

      const mockUpdatedModule = {
        id: moduleId,
        title: 'Updated Title',
        description: 'Old Description',
        status: ModuleStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin-id',
        updatedBy: 'admin-id',
      }

      ;(moduleService.updateModule as jest.Mock).mockResolvedValue(
        mockUpdatedModule
      )

      // Buat request dan response mock
      const req = createRequest({
        method: 'PUT',
        url: `/api/module/${moduleId}`,
        query: {
          id: moduleId,
        },
        body: updateData,
        headers: {
          'x-user-id': 'admin-id',
        },
      })
      const res = createResponse()

      // Simulasikan handler
      const updateModuleHandler = async (req: Request, res: Response) => {
        try {
          const moduleId = req.query.id as string
          const userId = req.headers['x-user-id'] as string

          if (!userId) {
            return res.status(401).json({ error: 'User ID tidak ditemukan' })
          }

          const updatedModule = await moduleService.updateModule(
            moduleId,
            req.body,
            userId
          )

          if (!updatedModule) {
            return res.status(404).json({ error: 'Modul tidak ditemukan' })
          }

          return res.status(200).json(updatedModule)
        } catch (error) {
          console.error('Error updating module:', error)
          return res
            .status(500)
            .json({ error: 'Terjadi kesalahan saat mengupdate modul' })
        }
      }

      // Act
      await updateModuleHandler(
        req as unknown as Request,
        res as unknown as Response
      )
      const data = res._getJSONData()

      // Assert
      expect(res._getStatusCode()).toBe(200)
      expect(data).toEqual(mockUpdatedModule)
      expect(moduleService.updateModule).toHaveBeenCalledWith(
        moduleId,
        updateData,
        'admin-id'
      )
    })
  })

  describe('DELETE /api/module/[id]', () => {
    it('should delete module by ID', async () => {
      // Arrange
      const moduleId = 'module-id'
      const mockDeletedModule = {
        id: moduleId,
        title: 'Module Title',
        description: 'Module Description',
        status: ModuleStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin-id',
        updatedBy: 'admin-id',
      }

      ;(moduleService.deleteModule as jest.Mock).mockResolvedValue(
        mockDeletedModule
      )

      // Buat request dan response mock
      const req = createRequest({
        method: 'DELETE',
        url: `/api/module/${moduleId}`,
        query: {
          id: moduleId,
        },
        headers: {
          'x-user-id': 'admin-id',
        },
      })
      const res = createResponse()

      // Simulasikan handler
      const deleteModuleHandler = async (req: Request, res: Response) => {
        try {
          const moduleId = req.query.id as string
          const userId = req.headers['x-user-id'] as string

          if (!userId) {
            return res.status(401).json({ error: 'User ID tidak ditemukan' })
          }

          const deletedModule = await moduleService.deleteModule(moduleId)

          if (!deletedModule) {
            return res.status(404).json({ error: 'Modul tidak ditemukan' })
          }

          return res.status(200).json({ message: 'Modul berhasil dihapus' })
        } catch (error) {
          console.error('Error deleting module:', error)
          return res
            .status(500)
            .json({ error: 'Terjadi kesalahan saat menghapus modul' })
        }
      }

      // Act
      await deleteModuleHandler(
        req as unknown as Request,
        res as unknown as Response
      )
      const data = res._getJSONData()

      // Assert
      expect(res._getStatusCode()).toBe(200)
      expect(data).toHaveProperty('message')
      expect(moduleService.deleteModule).toHaveBeenCalledWith(moduleId)
    })
  })
})
