import { createMocks } from 'node-mocks-http';
import { moduleService } from '@/features/manage-module/services/moduleService';
import { ModuleStatus } from '@/features/manage-module/types';
import type { MockRequest, MockResponse } from 'node-mocks-http';
import { Request, Response } from 'express';

// Mock moduleService
jest.mock('@/features/manage-module/services/moduleService');

// Mock auth dari Clerk
const mockAuth = jest.fn();
const mockGetUser = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  auth: () => mockAuth(),
  clerkClient: {
    users: {
      getUser: (userId: string) => mockGetUser(userId),
    },
  },
}));

/**
 * Test middleware otorisasi untuk memastikan hanya admin yang dapat
 * mengakses operasi kritikal (POST/PUT/DELETE) sesuai dengan test plan
 */
describe('Module API Authorization Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Implementasi middleware otorisasi admin untuk testing
  const withAdminAuth = (handler: (req: Request, res: Response) => Promise<Response>) => {
    return async (req: Request, res: Response) => {
      try {
        // Dapatkan userId dari auth
        const { userId } = mockAuth();
        
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized: Missing authentication' });
        }

        // Dapatkan data user dari Clerk
        const user = await mockGetUser(userId);
        
        // Cek apakah user adalah admin
        if (user.role !== 'ADMIN') {
          return res.status(403).json({ 
            error: 'Forbidden: Hanya admin yang diperbolehkan.' 
          });
        }

        // Tambahkan userId ke request headers untuk digunakan handler
        req.headers['x-user-id'] = userId;
        
        return handler(req, res);
      } catch (error) {
        console.error('Error in admin auth middleware:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    };
  };

  // Simulasikan handler untuk create module dengan otorisasi
  const createModuleWithAuth = (req: MockRequest<Request>, res: MockResponse<Response>) => {
    const handler = async (req: Request, res: Response) => {
      try {
        const userId = req.headers['x-user-id'] as string;
        const moduleData = req.body;
        const createdModule = await moduleService.createModule(moduleData, userId);
        return res.status(201).json(createdModule);
      } catch (error) {
        console.error('Error creating module:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    };

    // Gunakan middleware otorisasi
    return withAdminAuth(handler)(req, res);
  };

  // Simulasikan handler untuk delete module dengan otorisasi
  const deleteModuleWithAuth = (req: MockRequest<Request>, res: MockResponse<Response>) => {
    const handler = async (req: Request, res: Response) => {
      try {
        const moduleId = req.query.id as string;
        
        // Cek apakah modul ada
        const moduleData = await moduleService.getModuleById(moduleId);
        if (!moduleData) {
          return res.status(404).json({ error: 'Module not found' });
        }
        
        const deletedModule = await moduleService.deleteModule(moduleId);
        return res.status(200).json(deletedModule);
      } catch (error) {
        console.error('Error deleting module:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    };

    // Gunakan middleware otorisasi
    return withAdminAuth(handler)(req, res);
  };

  describe('Admin Authorization', () => {
    it('should allow admin to create module', async () => {
      // Arrange
      const moduleData = {
        title: 'Test Module',
        description: 'Test Description',
        status: ModuleStatus.DRAFT,
      };

      const mockCreatedModule = {
        id: 'module-1',
        ...moduleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin-id',
        updatedBy: 'admin-id',
      };

      // Mock auth untuk admin
      mockAuth.mockReturnValue({ userId: 'admin-id' });
      mockGetUser.mockResolvedValue({ id: 'admin-id', role: 'ADMIN' });
      
      // Mock Prisma response
      (moduleService.createModule as jest.Mock).mockResolvedValue(mockCreatedModule);

      // Buat request dan response mock
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/module',
        body: moduleData,
      });

      // Act
      await createModuleWithAuth(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toEqual(mockCreatedModule);
      expect(moduleService.createModule).toHaveBeenCalledWith(moduleData, 'admin-id');
    });

    it('should allow admin to delete module', async () => {
      // Arrange
      const moduleId = 'module-1';
      
      const mockModule = {
        id: moduleId,
        title: 'Test Module',
        description: 'Test Description',
        status: ModuleStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin-id',
        updatedBy: 'admin-id',
      };

      // Mock auth untuk admin
      mockAuth.mockReturnValue({ userId: 'admin-id' });
      mockGetUser.mockResolvedValue({ id: 'admin-id', role: 'ADMIN' });
      
      // Mock Prisma response
      (moduleService.getModuleById as jest.Mock).mockResolvedValue(mockModule);
      (moduleService.deleteModule as jest.Mock).mockResolvedValue(mockModule);

      // Buat request dan response mock
      const { req, res } = createMocks({
        method: 'DELETE',
        url: `/api/module/${moduleId}`,
        query: {
          id: moduleId,
        },
      });

      // Act
      await deleteModuleWithAuth(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(mockModule);
      expect(moduleService.deleteModule).toHaveBeenCalledWith(moduleId);
    });
  });

  describe('Non-Admin Authorization', () => {
    it('should reject module creation by mahasiswa', async () => {
      // Arrange
      const moduleData = {
        title: 'Test Module',
        description: 'Test Description',
        status: ModuleStatus.DRAFT,
      };

      // Mock auth untuk mahasiswa
      mockAuth.mockReturnValue({ userId: 'mahasiswa-id' });
      mockGetUser.mockResolvedValue({ id: 'mahasiswa-id', role: 'MAHASISWA' });

      // Buat request dan response mock
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/module',
        body: moduleData,
      });

      // Act
      await createModuleWithAuth(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(403);
      expect(res._getJSONData()).toEqual({
        error: 'Forbidden: Hanya admin yang diperbolehkan.',
      });
      expect(moduleService.createModule).not.toHaveBeenCalled();
    });

    it('should reject module deletion by mahasiswa', async () => {
      // Arrange
      const moduleId = 'module-1';

      // Mock auth untuk mahasiswa
      mockAuth.mockReturnValue({ userId: 'mahasiswa-id' });
      mockGetUser.mockResolvedValue({ id: 'mahasiswa-id', role: 'MAHASISWA' });

      // Buat request dan response mock
      const { req, res } = createMocks({
        method: 'DELETE',
        url: `/api/module/${moduleId}`,
        query: {
          id: moduleId,
        },
      });

      // Act
      await deleteModuleWithAuth(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(403);
      expect(res._getJSONData()).toEqual({
        error: 'Forbidden: Hanya admin yang diperbolehkan.',
      });
      expect(moduleService.deleteModule).not.toHaveBeenCalled();
    });
  });

  describe('Authentication Errors', () => {
    it('should reject requests with missing authentication', async () => {
      // Arrange
      const moduleData = {
        title: 'Test Module',
        description: 'Test Description',
        status: ModuleStatus.DRAFT,
      };

      // Mock auth untuk return null (tidak ada auth)
      mockAuth.mockReturnValue({ userId: null });

      // Buat request dan response mock
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/module',
        body: moduleData,
      });

      // Act
      await createModuleWithAuth(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({
        error: 'Unauthorized: Missing authentication',
      });
      expect(moduleService.createModule).not.toHaveBeenCalled();
    });

    it('should handle auth service errors gracefully', async () => {
      // Arrange
      const moduleData = {
        title: 'Test Module',
        description: 'Test Description',
        status: ModuleStatus.DRAFT,
      };

      // Mock auth untuk throw error
      mockAuth.mockReturnValue({ userId: 'admin-id' });
      mockGetUser.mockRejectedValue(new Error('Auth service error'));

      // Buat request dan response mock
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/module',
        body: moduleData,
      });

      // Act
      await createModuleWithAuth(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        error: 'Internal Server Error',
      });
      expect(moduleService.createModule).not.toHaveBeenCalled();
    });
  });
});
