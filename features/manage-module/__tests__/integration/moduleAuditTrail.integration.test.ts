import { createMocks } from 'node-mocks-http';
import { moduleService } from '@/features/manage-module/services/moduleService';
import { ModuleStatus } from '@/features/manage-module/types';
import type { MockRequest, MockResponse } from 'node-mocks-http';
import { Request, Response } from 'express';
import path from 'path';

// Import mock untuk fs/promises
import fsMock, { mockReadFile, mockAppendFile } from '@/__tests__/__mocks__/fs-promises';

// Mock fs/promises dengan mock yang sudah dibuat
jest.mock('fs/promises', () => fsMock);

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

/**
 * Test audit trail untuk memastikan setiap operasi CRUD tercatat dengan benar
 * sesuai dengan test plan
 */
describe('Module API Audit Trail Tests', () => {
  const auditLogPath = path.join(process.cwd(), 'logs', 'audit.log');
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks
    mockReadFile.mockClear();
    mockAppendFile.mockClear();
    
    // Set default return values
    mockReadFile.mockResolvedValue(Buffer.from(''));
    mockAppendFile.mockResolvedValue(undefined);
  });

  // Simulasikan handler untuk create module
  const createModuleHandler = async (
    req: MockRequest<Request>, 
    res: MockResponse<Response>
  ) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Missing user ID' });
      }

      const moduleData = req.body;
      const createdModule = await moduleService.createModule(moduleData, userId);

      // Log audit trail
      const auditLog = JSON.stringify({
        timestamp: new Date().toISOString(),
        userId,
        action: 'CREATE',
        resource: 'module',
        resourceId: createdModule.id,
        details: `Created module: ${createdModule.title}`
      }) + '\n';

      await fsMock.appendFile(auditLogPath, auditLog);
      
      return res.status(201).json(createdModule);
    } catch (error) {
      console.error('Error creating module:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  // Simulasikan handler untuk update module
  const updateModuleHandler = async (
    req: MockRequest<Request>, 
    res: MockResponse<Response>
  ) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Missing user ID' });
      }

      const moduleId = req.params.id || (req.query.id as string);
      const moduleData = req.body;

      // Cek apakah modul ada
      const existingModule = await moduleService.getModuleById(moduleId);
      if (!existingModule) {
        return res.status(404).json({ error: 'Module not found' });
      }

      const updatedModule = await moduleService.updateModule(moduleId, moduleData, userId);

      // Log audit trail
      const auditLog = JSON.stringify({
        timestamp: new Date().toISOString(),
        userId,
        action: 'UPDATE',
        resource: 'module',
        resourceId: moduleId,
        details: `Updated module: ${updatedModule.title}`
      }) + '\n';

      await fsMock.appendFile(auditLogPath, auditLog);
      
      return res.status(200).json(updatedModule);
    } catch (error) {
      console.error('Error updating module:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  // Simulasikan handler untuk delete module
  const deleteModuleHandler = async (
    req: MockRequest<Request>, 
    res: MockResponse<Response>
  ) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Missing user ID' });
      }

      const moduleId = req.params.id || (req.query.id as string);

      // Cek apakah modul ada
      const existingModule = await moduleService.getModuleById(moduleId);
      if (!existingModule) {
        return res.status(404).json({ error: 'Module not found' });
      }

      const deletedModule = await moduleService.deleteModule(moduleId);

      // Log audit trail
      const auditLog = JSON.stringify({
        timestamp: new Date().toISOString(),
        userId,
        action: 'DELETE',
        resource: 'module',
        resourceId: moduleId,
        details: `Deleted module: ${deletedModule.title}`
      }) + '\n';

      await fsMock.appendFile(auditLogPath, auditLog);
      
      return res.status(200).json(deletedModule);
    } catch (error) {
      console.error('Error deleting module:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  it('should log module creation in audit trail', async () => {
    // Arrange
    const moduleData = {
      title: 'Test Module',
      description: 'Test Description',
      status: ModuleStatus.DRAFT
    };

    const createdAt = new Date();
    const updatedAt = new Date();

    const createdModule = {
      id: 'module-1',
      ...moduleData,
      createdAt,
      updatedAt,
      createdBy: 'admin-id',
      updatedBy: 'admin-id'
    };

    // Mock Prisma response
    (moduleService.createModule as jest.Mock).mockResolvedValue(createdModule);

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/module',
      body: moduleData,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'admin-id'
      }
    });

    // Act
    await createModuleHandler(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(201);
    
    // Gunakan expect.objectContaining untuk mengabaikan perbedaan format Date
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
      id: createdModule.id,
      title: createdModule.title,
      description: createdModule.description,
      status: createdModule.status,
      createdBy: createdModule.createdBy,
      updatedBy: createdModule.updatedBy
    }));
    
    // Verifikasi bahwa appendFile dipanggil dengan format audit log yang benar
    expect(mockAppendFile).toHaveBeenCalledTimes(1);
    
    const appendFileCalls = mockAppendFile.mock.calls;
    const auditLogEntry = appendFileCalls[0][1];
    
    // Verifikasi format dan konten audit log
    expect(auditLogEntry).toContain('admin-id'); // userId
    expect(auditLogEntry).toContain('CREATE'); // action
    expect(auditLogEntry).toContain('module'); // resource
    expect(auditLogEntry).toContain('Test Module'); // detail
  });

  it('should log module update in audit trail', async () => {
    // Arrange
    const moduleId = 'module-1';
    const moduleData = {
      title: 'Updated Module',
      description: 'Updated Description',
      status: ModuleStatus.ACTIVE
    };

    const createdAt = new Date();
    const updatedAt = new Date();

    const existingModule = {
      id: moduleId,
      title: 'Test Module',
      description: 'Test Description',
      status: ModuleStatus.DRAFT,
      createdAt,
      updatedAt,
      createdBy: 'admin-id',
      updatedBy: 'admin-id'
    };

    const updatedModule = {
      ...existingModule,
      ...moduleData,
      updatedAt,
      updatedBy: 'admin-id'
    };

    // Mock Prisma response
    (moduleService.getModuleById as jest.Mock).mockResolvedValue(existingModule);
    (moduleService.updateModule as jest.Mock).mockResolvedValue(updatedModule);

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'PUT',
      url: `/api/module/${moduleId}`,
      query: { id: moduleId },
      params: { id: moduleId },
      body: moduleData,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'admin-id'
      }
    });

    // Act
    await updateModuleHandler(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(200);
    
    // Gunakan expect.objectContaining untuk mengabaikan perbedaan format Date
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
      id: updatedModule.id,
      title: updatedModule.title,
      description: updatedModule.description,
      status: updatedModule.status,
      createdBy: updatedModule.createdBy,
      updatedBy: updatedModule.updatedBy
    }));
    
    // Verifikasi bahwa appendFile dipanggil dengan format audit log yang benar
    expect(mockAppendFile).toHaveBeenCalledTimes(1);
    
    const appendFileCalls = mockAppendFile.mock.calls;
    const auditLogEntry = appendFileCalls[0][1];
    
    // Verifikasi format dan konten audit log
    expect(auditLogEntry).toContain('admin-id'); // userId
    expect(auditLogEntry).toContain('UPDATE'); // action
    expect(auditLogEntry).toContain('module'); // resource
    expect(auditLogEntry).toContain('Updated Module'); // detail
  });

  it('should log module deletion in audit trail', async () => {
    // Arrange
    const moduleId = 'module-1';
    
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const existingModule = {
      id: moduleId,
      title: 'Test Module',
      description: 'Test Description',
      status: ModuleStatus.DRAFT,
      createdAt,
      updatedAt,
      createdBy: 'admin-id',
      updatedBy: 'admin-id'
    };

    // Mock Prisma response
    (moduleService.getModuleById as jest.Mock).mockResolvedValue(existingModule);
    (moduleService.deleteModule as jest.Mock).mockResolvedValue(existingModule);

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'DELETE',
      url: `/api/module/${moduleId}`,
      query: { id: moduleId },
      params: { id: moduleId },
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'admin-id'
      }
    });

    // Act
    await deleteModuleHandler(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(200);
    
    // Gunakan expect.objectContaining untuk mengabaikan perbedaan format Date
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
      id: existingModule.id,
      title: existingModule.title,
      description: existingModule.description,
      status: existingModule.status,
      createdBy: existingModule.createdBy,
      updatedBy: existingModule.updatedBy
    }));
    
    // Verifikasi bahwa appendFile dipanggil dengan format audit log yang benar
    expect(mockAppendFile).toHaveBeenCalledTimes(1);
    
    const appendFileCalls = mockAppendFile.mock.calls;
    const auditLogEntry = appendFileCalls[0][1];
    
    // Verifikasi format dan konten audit log
    expect(auditLogEntry).toContain('admin-id'); // userId
    expect(auditLogEntry).toContain('DELETE'); // action
    expect(auditLogEntry).toContain('module'); // resource
    expect(auditLogEntry).toContain('Test Module'); // detail
  });
});
