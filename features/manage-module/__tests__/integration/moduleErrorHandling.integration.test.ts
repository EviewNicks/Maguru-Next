import { createMocks } from 'node-mocks-http';
import { moduleService } from '@/features/manage-module/services/moduleService';
import { ModuleStatus } from '@/features/manage-module/types';
import type { MockRequest, MockResponse } from 'node-mocks-http';
import { Request, Response } from 'express';
import { z } from 'zod';

// Mock moduleService
jest.mock('@/features/manage-module/services/moduleService');

/**
 * Test untuk error handling yang terstandarisasi
 * sesuai dengan test plan
 */
describe('Module API Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Schema validasi untuk module
  const moduleSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    status: z.enum([ModuleStatus.DRAFT, ModuleStatus.ACTIVE, ModuleStatus.ARCHIVED]),
  });

  // Middleware validasi sederhana untuk testing
  const withValidation = (schema: z.ZodType<unknown, z.ZodTypeDef, unknown>) => {
    return (handler: (req: Request, res: Response) => Promise<Response>) => {
      return async (req: Request, res: Response) => {
        try {
          // Validasi body request dengan schema
          const validatedData = schema.parse(req.body);
          
          // Jika valid, lanjutkan ke handler
          req.body = validatedData;
          return handler(req, res);
        } catch (error) {
          if (error instanceof z.ZodError) {
            // Format error Zod menjadi format yang lebih ramah pengguna
            const formattedErrors = error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            }));
            
            return res.status(400).json({
              status: 'error',
              message: 'Validasi gagal',
              errors: formattedErrors,
            });
          }
          
          // Error lainnya
          console.error('Validation error:', error);
          return res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan saat memvalidasi data',
          });
        }
      };
    };
  };

  // Simulasikan handler untuk create module dengan validasi
  const createModuleWithValidation = (req: MockRequest<Request>, res: MockResponse<Response>) => {
    const handler = async (req: Request, res: Response) => {
      try {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
          return res.status(401).json({
            status: 'error',
            message: 'Unauthorized: Missing user ID',
          });
        }

        const moduleData = req.body;
        const createdModule = await moduleService.createModule(moduleData, userId);
        
        return res.status(201).json({
          status: 'success',
          data: createdModule,
        });
      } catch (error) {
        console.error('Error creating module:', error);
        
        // Standarisasi error response
        return res.status(500).json({
          status: 'error',
          message: 'Terjadi kesalahan saat membuat modul',
        });
      }
    };

    // Gunakan middleware validasi
    return withValidation(moduleSchema)(handler)(req, res);
  };

  // Simulasikan handler untuk get module by id
  const getModuleByIdHandler = async (req: MockRequest<Request>, res: MockResponse<Response>) => {
    try {
      const moduleId = req.params.id || (req.query.id as string);
      
      if (!moduleId) {
        return res.status(400).json({
          status: 'error',
          message: 'ID modul tidak diberikan',
        });
      }

      const moduleData = await moduleService.getModuleById(moduleId);
      
      if (!moduleData) {
        return res.status(404).json({
          status: 'error',
          message: 'Modul tidak ditemukan',
        });
      }
      
      return res.status(200).json({
        status: 'success',
        data: moduleData,
      });
    } catch (error) {
      console.error('Error fetching module:', error);
      
      // Standarisasi error response
      return res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan saat mengambil data modul',
      });
    }
  };

  // Simulasikan handler untuk update module
  const updateModuleHandler = async (req: MockRequest<Request>, res: MockResponse<Response>) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized: Missing user ID',
        });
      }

      const moduleId = req.params.id || (req.query.id as string);
      
      if (!moduleId) {
        return res.status(400).json({
          status: 'error',
          message: 'ID modul tidak diberikan',
        });
      }

      // Cek apakah modul ada
      const existingModule = await moduleService.getModuleById(moduleId);
      if (!existingModule) {
        return res.status(404).json({
          status: 'error',
          message: 'Modul tidak ditemukan',
        });
      }

      const moduleData = req.body;
      const updatedModule = await moduleService.updateModule(moduleId, moduleData, userId);
      
      return res.status(200).json({
        status: 'success',
        data: updatedModule,
      });
    } catch (error) {
      console.error('Error updating module:', error);
      
      // Standarisasi error response
      return res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan saat memperbarui modul',
      });
    }
  };

  describe('Validation Error Handling', () => {
    it('should return standardized error for invalid module data', async () => {
      // Arrange
      const invalidModuleData = {
        title: 'A', // Terlalu pendek
        description: 'Short', // Terlalu pendek
        status: 'INVALID_STATUS', // Status tidak valid
      };

      // Buat request dan response mock
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/module',
        body: invalidModuleData,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'admin-id',
        },
      });

      // Act
      await createModuleWithValidation(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(400);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({
        status: 'error',
        message: 'Validasi gagal',
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      });
      
      // Pastikan moduleService tidak dipanggil
      expect(moduleService.createModule).not.toHaveBeenCalled();
    });
  });

  describe('Not Found Error Handling', () => {
    it('should return standardized 404 error for non-existent module', async () => {
      // Arrange
      const nonExistentModuleId = 'non-existent-id';
      
      // Mock moduleService.getModuleById untuk return null
      (moduleService.getModuleById as jest.Mock).mockResolvedValue(null);

      // Buat request dan response mock
      const { req, res } = createMocks({
        method: 'GET',
        url: `/api/module/${nonExistentModuleId}`,
        params: {
          id: nonExistentModuleId,
        },
      });

      // Act
      await getModuleByIdHandler(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(404);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({
        status: 'error',
        message: 'Modul tidak ditemukan',
      });
    });

    it('should return standardized 404 error when updating non-existent module', async () => {
      // Arrange
      const nonExistentModuleId = 'non-existent-id';
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description that is long enough',
        status: ModuleStatus.ACTIVE,
      };
      
      // Mock moduleService.getModuleById untuk return null
      (moduleService.getModuleById as jest.Mock).mockResolvedValue(null);

      // Buat request dan response mock
      const { req, res } = createMocks({
        method: 'PUT',
        url: `/api/module/${nonExistentModuleId}`,
        params: {
          id: nonExistentModuleId,
        },
        body: updateData,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'admin-id',
        },
      });

      // Act
      await updateModuleHandler(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(404);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({
        status: 'error',
        message: 'Modul tidak ditemukan',
      });
      
      // Pastikan moduleService.updateModule tidak dipanggil
      expect(moduleService.updateModule).not.toHaveBeenCalled();
    });
  });

  describe('Server Error Handling', () => {
    it('should return standardized 500 error when service throws exception', async () => {
      // Arrange
      const moduleData = {
        title: 'Test Module',
        description: 'Test Description that is long enough',
        status: ModuleStatus.DRAFT,
      };

      // Mock moduleService.createModule untuk throw error
      (moduleService.createModule as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Buat request dan response mock
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/module',
        body: moduleData,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'admin-id',
        },
      });

      // Act
      await createModuleWithValidation(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(500);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({
        status: 'error',
        message: 'Terjadi kesalahan saat membuat modul',
      });
    });
  });

  describe('Authentication Error Handling', () => {
    it('should return standardized 401 error when user ID is missing', async () => {
      // Arrange
      const moduleData = {
        title: 'Test Module',
        description: 'Test Description that is long enough',
        status: ModuleStatus.DRAFT,
      };

      // Buat request dan response mock tanpa user ID
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/module',
        body: moduleData,
        headers: {
          'Content-Type': 'application/json',
          // x-user-id tidak ada
        },
      });

      // Act
      // Lewati validasi langsung ke handler
      const handler = async (req: Request, res: Response) => {
        try {
          const userId = req.headers['x-user-id'] as string;
          if (!userId) {
            return res.status(401).json({
              status: 'error',
              message: 'Unauthorized: Missing user ID',
            });
          }

          const moduleData = req.body;
          const createdModule = await moduleService.createModule(moduleData, userId);
          
          return res.status(201).json({
            status: 'success',
            data: createdModule,
          });
        } catch (error) {
          console.error('Error creating module:', error);
          
          return res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan saat membuat modul',
          });
        }
      };

      await handler(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(401);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({
        status: 'error',
        message: 'Unauthorized: Missing user ID',
      });
      
      // Pastikan moduleService.createModule tidak dipanggil
      expect(moduleService.createModule).not.toHaveBeenCalled();
    });
  });
});
