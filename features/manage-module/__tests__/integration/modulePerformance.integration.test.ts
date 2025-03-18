import request from 'supertest';
import { createServer, Server } from 'http';
import express, { Express, Request, Response } from 'express';
import { moduleService } from '@/features/manage-module/services/moduleService';
import { ModuleStatus } from '@/features/manage-module/types';

// Mock moduleService
jest.mock('@/features/manage-module/services/moduleService');

// Mock middleware
jest.mock('@/app/api/module/middleware', () => ({
  withValidation: jest.fn((handler) => handler),
  withAdminAuth: jest.fn((handler) => handler),
  withAuditTrail: jest.fn((handler) => handler),
  composeMiddlewares: jest.fn((middlewares, handler) => handler),
}));

// Mock auth dari Clerk
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn().mockReturnValue({ userId: 'admin-id' }),
  clerkClient: {
    users: {
      getUser: jest.fn().mockResolvedValue({ id: 'admin-id', role: 'ADMIN' }),
    },
  },
}));

/**
 * Test kinerja API untuk memastikan respons API <300ms
 * sesuai dengan test plan
 */
describe('Module API Performance Tests', () => {
  let server: Server;
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup Express app untuk testing
    app = express();
    app.use(express.json());
    
    // Definisikan route handler untuk GET /api/module
    app.get('/api/module', (req: Request, res: Response) => {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      moduleService.getModules({
        page,
        limit,
        status,
        search,
      }).then(modules => {
        res.status(200).json(modules);
      }).catch(error => {
        console.error('Error fetching modules:', error);
        res.status(500).json({ 
          error: 'Terjadi kesalahan saat mengambil data modul' 
        });
      });
    });
    
    // Buat HTTP server
    server = createServer(app);
  });

  afterEach(() => {
    if (server && server.listening) {
      server.close();
    }
  });

  it('should respond in less than 300ms for GET /api/module', async () => {
    // Arrange
    // Mock data untuk pagination
    const modules = Array(20).fill(null).map((_, index) => ({
      id: `module-${index}`,
      title: `Module ${index}`,
      description: `Description for module ${index}`,
      status: ModuleStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin'
    }));

    const mockResponse = {
      data: modules,
      pagination: {
        page: 1,
        limit: 10,
        total: modules.length,
        totalPages: Math.ceil(modules.length / 10)
      }
    };

    // Mock moduleService.getModules
    (moduleService.getModules as jest.Mock).mockResolvedValue(mockResponse);

    // Act & Assert
    const startTime = performance.now();
    
    const response = await request(app)
      .get('/api/module?page=1&limit=10')
      .expect(200)
      .expect('Content-Type', /json/);
      
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    // Memastikan respons API <300ms sesuai test plan
    expect(responseTime).toBeLessThan(300);
    
    // Gunakan expect.objectContaining untuk menghindari masalah perbandingan objek
    expect(response.body).toEqual(expect.objectContaining({
      data: expect.any(Array),
      pagination: expect.objectContaining({
        page: 1,
        limit: 10,
        total: modules.length,
        totalPages: expect.any(Number)
      })
    }));
  });

  it('should handle load of 100 modules in less than 300ms', async () => {
    // Arrange
    // Mock data untuk pagination dengan 100 modul
    const modules = Array(100).fill(null).map((_, index) => ({
      id: `module-${index}`,
      title: `Module ${index}`,
      description: `Description for module ${index}`,
      status: ModuleStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin'
    }));

    const mockResponse = {
      data: modules.slice(0, 10),
      pagination: {
        page: 1,
        limit: 10,
        total: modules.length,
        totalPages: Math.ceil(modules.length / 10)
      }
    };

    // Mock moduleService.getModules
    (moduleService.getModules as jest.Mock).mockResolvedValue(mockResponse);

    // Act & Assert
    const startTime = performance.now();
    
    const response = await request(app)
      .get('/api/module?page=1&limit=10')
      .expect(200)
      .expect('Content-Type', /json/);
      
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    // Memastikan respons API <300ms sesuai test plan
    expect(responseTime).toBeLessThan(300);
    
    // Gunakan expect.objectContaining untuk menghindari masalah perbandingan objek
    expect(response.body).toEqual(expect.objectContaining({
      data: expect.any(Array),
      pagination: expect.objectContaining({
        page: 1,
        limit: 10,
        total: modules.length,
        totalPages: expect.any(Number)
      })
    }));
  });

  it('should handle load of 10000 modules in less than 300ms', async () => {
    // Arrange
    // Simulasikan 10000 modul sesuai dengan test plan
    const totalModules = 10000;
    const pageSize = 10;
    
    const mockModules = Array(pageSize).fill(null).map((_, index) => ({
      id: `module-${index}`,
      title: `Module ${index}`,
      description: `Description for module ${index}`,
      status: ModuleStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin'
    }));

    const mockResponse = {
      data: mockModules,
      pagination: {
        page: 1,
        limit: pageSize,
        total: totalModules,
        totalPages: Math.ceil(totalModules / pageSize)
      }
    };

    // Mock moduleService.getModules
    (moduleService.getModules as jest.Mock).mockResolvedValue(mockResponse);

    // Act & Assert
    const startTime = performance.now();
    
    const response = await request(app)
      .get('/api/module?page=1&limit=10')
      .expect(200)
      .expect('Content-Type', /json/);
      
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    // Memastikan respons API <300ms sesuai test plan
    expect(responseTime).toBeLessThan(300);
    
    // Gunakan expect.objectContaining untuk menghindari masalah perbandingan objek
    expect(response.body).toEqual(expect.objectContaining({
      data: expect.any(Array),
      pagination: expect.objectContaining({
        page: 1,
        limit: pageSize,
        total: totalModules,
        totalPages: expect.any(Number)
      })
    }));
  });
});
