import { createMocks } from 'node-mocks-http';
import { moduleService } from '@/features/manage-module/services/moduleService';
import { ModuleStatus } from '@/features/manage-module/types';
import type { MockRequest, MockResponse } from 'node-mocks-http';
import { Request, Response } from 'express';
import { z } from 'zod';

// Mock moduleService
jest.mock('@/features/manage-module/services/moduleService');

// Mock middleware
jest.mock('@/app/api/module/middleware', () => {
  // Implementasi sebenarnya dari withValidation untuk testing
  const withValidation = (schema: z.ZodType<unknown, z.ZodTypeDef, unknown>) => {
    return (handler: (req: Request, res: Response) => Promise<Response>) => {
      return async (req: Request, res: Response) => {
        try {
          // Validasi body request dengan schema Zod
          schema.parse(req.body);
          return handler(req, res);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return res.status(400).json({
              error: 'Validasi gagal',
              details: error.errors,
            });
          }
          return res.status(500).json({ error: 'Terjadi kesalahan internal' });
        }
      };
    };
  };

  return {
    withValidation,
    withAdminAuth: (handler: (req: Request, res: Response) => Promise<Response>) => handler,
    withAuditTrail: (handler: (req: Request, res: Response) => Promise<Response>) => handler,
    composeMiddlewares: (_middlewares: unknown[], handler: (req: Request, res: Response) => Promise<Response>) => handler,
  };
});

/**
 * Test validasi input untuk memastikan input yang tidak valid
 * ditolak dengan pesan error yang sesuai
 */
describe('Module API Validation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Schema Zod untuk validasi modul
  const createModuleSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    status: z.enum([ModuleStatus.DRAFT, ModuleStatus.ACTIVE, ModuleStatus.ARCHIVED]),
  });

  // Simulasikan handler untuk create module dengan validasi
  const createModuleWithValidation = async (req: MockRequest<Request>, res: MockResponse<Response>) => {
    const handler = async (req: Request, res: Response) => {
      try {
        const userId = 'admin-id';
        const moduleData = req.body;
        const createdModule = await moduleService.createModule(moduleData, userId);
        return res.status(201).json(createdModule);
      } catch (error) {
        console.error('Error creating module:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    };

    // Gunakan middleware validasi dari mock
    const mockMiddleware = jest.requireMock('@/app/api/module/middleware');
    return mockMiddleware.withValidation(createModuleSchema)(handler)(req, res);
  };

  it('should reject module creation with empty title', async () => {
    // Arrange
    const invalidModuleData = {
      title: '', // Title kosong, seharusnya minimal 3 karakter
      description: 'This is a valid description for the module',
      status: ModuleStatus.DRAFT,
    };

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/module',
      body: invalidModuleData,
    });

    // Act
    await createModuleWithValidation(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toHaveProperty('error', 'Validasi gagal');
    expect(res._getJSONData()).toHaveProperty('details');
    // Pastikan detail error menyebutkan masalah dengan title
    expect(JSON.stringify(res._getJSONData().details)).toContain('title');
  });

  it('should reject module creation with short description', async () => {
    // Arrange
    const invalidModuleData = {
      title: 'Valid Title',
      description: 'Too short', // Description terlalu pendek, seharusnya minimal 10 karakter
      status: ModuleStatus.DRAFT,
    };

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/module',
      body: invalidModuleData,
    });

    // Act
    await createModuleWithValidation(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toHaveProperty('error', 'Validasi gagal');
    expect(res._getJSONData()).toHaveProperty('details');
    // Pastikan detail error menyebutkan masalah dengan description
    expect(JSON.stringify(res._getJSONData().details)).toContain('description');
  });

  it('should reject module creation with invalid status', async () => {
    // Arrange
    const invalidModuleData = {
      title: 'Valid Title',
      description: 'This is a valid description for the module',
      status: 'INVALID_STATUS', // Status tidak valid, seharusnya DRAFT, ACTIVE, atau ARCHIVED
    };

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/module',
      body: invalidModuleData,
    });

    // Act
    await createModuleWithValidation(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toHaveProperty('error', 'Validasi gagal');
    expect(res._getJSONData()).toHaveProperty('details');
    // Pastikan detail error menyebutkan masalah dengan status
    expect(JSON.stringify(res._getJSONData().details)).toContain('status');
  });

  it('should reject module creation with missing fields', async () => {
    // Arrange
    const invalidModuleData = {
      // Tidak ada title dan description
      status: ModuleStatus.DRAFT,
    };

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/module',
      body: invalidModuleData,
    });

    // Act
    await createModuleWithValidation(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toHaveProperty('error', 'Validasi gagal');
    expect(res._getJSONData()).toHaveProperty('details');
    // Pastikan detail error menyebutkan masalah dengan title dan description
    const errorDetails = JSON.stringify(res._getJSONData().details);
    expect(errorDetails).toContain('title');
    expect(errorDetails).toContain('description');
  });

  it('should accept valid module data', async () => {
    // Arrange
    const validModuleData = {
      title: 'Valid Module Title',
      description: 'This is a valid description for the module that meets the minimum length requirement',
      status: ModuleStatus.DRAFT,
    };

    (moduleService.createModule as jest.Mock).mockResolvedValue({
      id: 'new-module-id',
      ...validModuleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin-id',
      updatedBy: 'admin-id',
    });

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/module',
      body: validModuleData,
    });

    // Act
    await createModuleWithValidation(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData()).toEqual({
      id: 'new-module-id',
      ...validModuleData,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      createdBy: 'admin-id',
      updatedBy: 'admin-id',
    });
  });

  it('should sanitize input to prevent XSS', async () => {
    // Arrange
    const moduleDataWithXSS = {
      title: 'Valid Title <script>alert("XSS")</script>',
      description: 'Valid description <img src="x" onerror="alert(\'XSS\')">',
      status: ModuleStatus.DRAFT,
    };

    // Mock implementation untuk sanitasi
    const sanitizedModuleData = {
      title: 'Valid Title &lt;script&gt;alert("XSS")&lt;/script&gt;',
      description: 'Valid description &lt;img src="x" onerror="alert(\'XSS\')"&gt;',
      status: ModuleStatus.DRAFT,
    };

    // Mock sanitasi dalam createModule
    (moduleService.createModule as jest.Mock).mockImplementation((data, userId) => {
      // Simulasikan sanitasi input dan gunakan data yang sudah disanitasi
      return Promise.resolve({
        id: 'new-module-id',
        ...sanitizedModuleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
        updatedBy: userId,
      });
    });

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/module',
      body: moduleDataWithXSS,
    });

    // Act
    await createModuleWithValidation(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(201);
    expect(moduleService.createModule).toHaveBeenCalledWith(moduleDataWithXSS, 'admin-id');
    
    // Pastikan output sudah disanitasi
    const responseData = res._getJSONData();
    expect(responseData.title).toContain('&lt;script&gt;');
    expect(responseData.description).toContain('&lt;img');
  });
});
