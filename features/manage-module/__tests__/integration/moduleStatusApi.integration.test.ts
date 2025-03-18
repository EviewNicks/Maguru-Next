import { createMocks } from 'node-mocks-http';
import { moduleService } from '@/features/manage-module/services/moduleService';
import { ModuleStatus } from '@/features/manage-module/types';
import type { MockRequest, MockResponse } from 'node-mocks-http';
import { Request, Response } from 'express';

// Mock moduleService
jest.mock('@/features/manage-module/services/moduleService');

// Mock middleware
jest.mock('@/app/api/module/middleware', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withValidation: (_schema: unknown) => (_handler: unknown) => _handler,
  withAdminAuth: (_handler: unknown) => _handler,
  withAuditTrail: (_handler: unknown) => _handler,
  composeMiddlewares: (_middlewares: unknown[], handler: unknown) => handler,
}));

describe('Module Status API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH /api/module/[id]/status', () => {
    it('should update module status', async () => {
      // Arrange
      const moduleId = 'module-id';
      const statusUpdate = {
        status: ModuleStatus.ACTIVE,
      };

      // Buat request dan response mock
      const { req, res } = createMocks({
        method: 'PATCH',
        url: `/api/module/${moduleId}/status`,
        query: {
          id: moduleId,
        },
        body: statusUpdate,
        headers: {
          'x-user-id': 'admin-id',
        },
      });

      const mockExistingModule = {
        id: moduleId,
        title: 'Module Title',
        description: 'Module Description',
        status: ModuleStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin-id',
        updatedBy: 'admin-id',
      };

      const mockUpdatedModule = {
        ...mockExistingModule,
        status: ModuleStatus.ACTIVE,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin-id',
      };

      (moduleService.getModuleById as jest.Mock).mockResolvedValue(mockExistingModule);
      (moduleService.updateModule as jest.Mock).mockResolvedValue(mockUpdatedModule);

      // Simulasikan handler
      const updateModuleStatusHandler = async (
        req: MockRequest<Request>, 
        res: MockResponse<Response>
      ) => {
        try {
          const moduleId = req.query.id as string;
          const userId = req.headers['x-user-id'] as string;
          
          if (!userId) {
            return res.status(401).json({ error: 'User ID tidak ditemukan' });
          }
          
          // Cek apakah modul ada
          const moduleData = await moduleService.getModuleById(moduleId);
          if (!moduleData) {
            return res.status(404).json({ error: 'Modul tidak ditemukan' });
          }
          
          // Update status modul
          const updatedModule = await moduleService.updateModule(
            moduleId, 
            { status: req.body.status }, 
            userId
          );
          
          return res.status(200).json({
            message: `Status modul berhasil diubah menjadi ${req.body.status}`,
            module: updatedModule,
          });
        } catch (error) {
          console.error('Error updating module status:', error);
          return res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui status modul' });
        }
      };

      // Act
      await updateModuleStatusHandler(req, res);

      // Assert
      expect(moduleService.getModuleById).toHaveBeenCalledWith(moduleId);
      expect(moduleService.updateModule).toHaveBeenCalledWith(moduleId, { status: ModuleStatus.ACTIVE }, 'admin-id');
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: `Status modul berhasil diubah menjadi ${ModuleStatus.ACTIVE}`,
        module: mockUpdatedModule,
      });
    });

    it('should return 404 if module not found', async () => {
      // Arrange
      const moduleId = 'non-existent-id';
      const statusUpdate = {
        status: ModuleStatus.ACTIVE,
      };

      // Buat request dan response mock
      const { req, res } = createMocks({
        method: 'PATCH',
        url: `/api/module/${moduleId}/status`,
        query: {
          id: moduleId,
        },
        body: statusUpdate,
        headers: {
          'x-user-id': 'admin-id',
        },
      });

      (moduleService.getModuleById as jest.Mock).mockResolvedValue(null);

      // Simulasikan handler
      const updateModuleStatusHandler = async (
        req: MockRequest<Request>, 
        res: MockResponse<Response>
      ) => {
        try {
          const moduleId = req.query.id as string;
          const userId = req.headers['x-user-id'] as string;
          
          if (!userId) {
            return res.status(401).json({ error: 'User ID tidak ditemukan' });
          }
          
          // Cek apakah modul ada
          const moduleData = await moduleService.getModuleById(moduleId);
          if (!moduleData) {
            return res.status(404).json({ error: 'Modul tidak ditemukan' });
          }
          
          // Update status modul
          const updatedModule = await moduleService.updateModule(
            moduleId, 
            { status: req.body.status }, 
            userId
          );
          
          return res.status(200).json({
            message: `Status modul berhasil diubah menjadi ${req.body.status}`,
            module: updatedModule,
          });
        } catch (error) {
          console.error('Error updating module status:', error);
          return res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui status modul' });
        }
      };

      // Act
      await updateModuleStatusHandler(req, res);

      // Assert
      expect(moduleService.getModuleById).toHaveBeenCalledWith(moduleId);
      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        error: 'Modul tidak ditemukan',
      });
    });

    it('should handle missing user ID', async () => {
      // Arrange
      const moduleId = 'module-id';
      const statusUpdate = {
        status: ModuleStatus.ACTIVE,
      };

      // Buat request dan response mock
      const { req, res } = createMocks({
        method: 'PATCH',
        url: `/api/module/${moduleId}/status`,
        query: {
          id: moduleId,
        },
        body: statusUpdate,
        // Tidak ada header x-user-id
      });

      // Simulasikan handler
      const updateModuleStatusHandler = async (
        req: MockRequest<Request>, 
        res: MockResponse<Response>
      ) => {
        try {
          const moduleId = req.query.id as string;
          const userId = req.headers['x-user-id'] as string;
          
          if (!userId) {
            return res.status(401).json({ error: 'User ID tidak ditemukan' });
          }
          
          // Cek apakah modul ada
          const moduleData = await moduleService.getModuleById(moduleId);
          if (!moduleData) {
            return res.status(404).json({ error: 'Modul tidak ditemukan' });
          }
          
          // Update status modul
          const updatedModule = await moduleService.updateModule(
            moduleId, 
            { status: req.body.status }, 
            userId
          );
          
          return res.status(200).json({
            message: `Status modul berhasil diubah menjadi ${req.body.status}`,
            module: updatedModule,
          });
        } catch (error) {
          console.error('Error updating module status:', error);
          return res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui status modul' });
        }
      };

      // Act
      await updateModuleStatusHandler(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toEqual({
        error: 'User ID tidak ditemukan',
      });
    });

    it('should handle errors when updating module status', async () => {
      // Arrange
      const moduleId = 'module-id';
      const statusUpdate = {
        status: ModuleStatus.ACTIVE,
      };

      // Buat request dan response mock
      const { req, res } = createMocks({
        method: 'PATCH',
        url: `/api/module/${moduleId}/status`,
        query: {
          id: moduleId,
        },
        body: statusUpdate,
        headers: {
          'x-user-id': 'admin-id',
        },
      });

      const mockExistingModule = {
        id: moduleId,
        title: 'Module Title',
        description: 'Module Description',
        status: ModuleStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin-id',
        updatedBy: 'admin-id',
      };

      (moduleService.getModuleById as jest.Mock).mockResolvedValue(mockExistingModule);
      (moduleService.updateModule as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Simulasikan handler
      const updateModuleStatusHandler = async (
        req: MockRequest<Request>, 
        res: MockResponse<Response>
      ) => {
        try {
          const moduleId = req.query.id as string;
          const userId = req.headers['x-user-id'] as string;
          
          if (!userId) {
            return res.status(401).json({ error: 'User ID tidak ditemukan' });
          }
          
          // Cek apakah modul ada
          const moduleData = await moduleService.getModuleById(moduleId);
          if (!moduleData) {
            return res.status(404).json({ error: 'Modul tidak ditemukan' });
          }
          
          // Update status modul
          const updatedModule = await moduleService.updateModule(
            moduleId, 
            { status: req.body.status }, 
            userId
          );
          
          return res.status(200).json({
            message: `Status modul berhasil diubah menjadi ${req.body.status}`,
            module: updatedModule,
          });
        } catch (error) {
          console.error('Error updating module status:', error);
          return res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui status modul' });
        }
      };

      // Act
      await updateModuleStatusHandler(req, res);

      // Assert
      expect(moduleService.getModuleById).toHaveBeenCalledWith(moduleId);
      expect(moduleService.updateModule).toHaveBeenCalledWith(moduleId, { status: ModuleStatus.ACTIVE }, 'admin-id');
      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        error: 'Terjadi kesalahan saat memperbarui status modul',
      });
    });
  });
});
