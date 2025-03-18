import { createMocks } from 'node-mocks-http';
import { moduleService } from '@/features/manage-module/services/moduleService';
import { ModuleStatus } from '@/features/manage-module/types';
import type { MockRequest, MockResponse } from 'node-mocks-http';
import { Request, Response } from 'express';

// Mock moduleService
jest.mock('@/features/manage-module/services/moduleService');

/**
 * Test untuk pagination, filter, dan search yang lebih komprehensif
 * sesuai dengan test plan
 */
describe('Module API Filter and Search Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Simulasikan handler untuk get modules dengan filter dan search
  const getModulesHandler = async (req: MockRequest<Request>, res: MockResponse<Response>) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const modules = await moduleService.getModules({
        page,
        limit,
        status,
        search,
      });

      return res.status(200).json({
        data: modules.data,
        pagination: modules.pagination,
      });
    } catch (error) {
      console.error('Error fetching modules:', error);
      return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data modul' });
    }
  };

  it('should filter modules by DRAFT status', async () => {
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
        {
          id: 'module-2',
          title: 'Module 2',
          description: 'Description 2',
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
        total: 2,
        totalPages: 1,
      },
    };

    (moduleService.getModules as jest.Mock).mockResolvedValue(mockModules);

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/module?status=DRAFT',
      query: {
        status: 'DRAFT',
      },
    });

    // Act
    await getModulesHandler(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      data: mockModules.data,
      pagination: mockModules.pagination,
    });
    expect(moduleService.getModules).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: 'DRAFT',
      search: undefined,
    });
  });

  it('should filter modules by ACTIVE status', async () => {
    // Arrange
    const mockModules = {
      data: [
        {
          id: 'module-3',
          title: 'Module 3',
          description: 'Description 3',
          status: ModuleStatus.ACTIVE,
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
    };

    (moduleService.getModules as jest.Mock).mockResolvedValue(mockModules);

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/module?status=ACTIVE',
      query: {
        status: 'ACTIVE',
      },
    });

    // Act
    await getModulesHandler(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      data: mockModules.data,
      pagination: mockModules.pagination,
    });
    expect(moduleService.getModules).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: 'ACTIVE',
      search: undefined,
    });
  });

  it('should search modules by keyword', async () => {
    // Arrange
    const searchKeyword = 'Matematika';
    const mockModules = {
      data: [
        {
          id: 'module-4',
          title: 'Matematika Dasar',
          description: 'Pengantar Matematika Dasar',
          status: ModuleStatus.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'admin-id',
          updatedBy: 'admin-id',
        },
        {
          id: 'module-5',
          title: 'Matematika Lanjut',
          description: 'Pengantar Matematika Lanjut',
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
        total: 2,
        totalPages: 1,
      },
    };

    (moduleService.getModules as jest.Mock).mockResolvedValue(mockModules);

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'GET',
      url: `/api/module?search=${searchKeyword}`,
      query: {
        search: searchKeyword,
      },
    });

    // Act
    await getModulesHandler(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      data: mockModules.data,
      pagination: mockModules.pagination,
    });
    expect(moduleService.getModules).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: undefined,
      search: searchKeyword,
    });
  });

  it('should combine filter and search', async () => {
    // Arrange
    const searchKeyword = 'Matematika';
    const status = 'ACTIVE';
    const mockModules = {
      data: [
        {
          id: 'module-4',
          title: 'Matematika Dasar',
          description: 'Pengantar Matematika Dasar',
          status: ModuleStatus.ACTIVE,
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
    };

    (moduleService.getModules as jest.Mock).mockResolvedValue(mockModules);

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'GET',
      url: `/api/module?search=${searchKeyword}&status=${status}`,
      query: {
        search: searchKeyword,
        status: status,
      },
    });

    // Act
    await getModulesHandler(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      data: mockModules.data,
      pagination: mockModules.pagination,
    });
    expect(moduleService.getModules).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: status,
      search: searchKeyword,
    });
  });

  it('should handle pagination correctly', async () => {
    // Arrange
    const page = 2;
    const limit = 5;
    const mockModules = {
      data: [
        {
          id: 'module-6',
          title: 'Module 6',
          description: 'Description 6',
          status: ModuleStatus.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'admin-id',
          updatedBy: 'admin-id',
        },
        {
          id: 'module-7',
          title: 'Module 7',
          description: 'Description 7',
          status: ModuleStatus.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'admin-id',
          updatedBy: 'admin-id',
        },
      ],
      pagination: {
        page: page,
        limit: limit,
        total: 12,
        totalPages: 3,
      },
    };

    (moduleService.getModules as jest.Mock).mockResolvedValue(mockModules);

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'GET',
      url: `/api/module?page=${page}&limit=${limit}`,
      query: {
        page: page.toString(),
        limit: limit.toString(),
      },
    });

    // Act
    await getModulesHandler(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      data: mockModules.data,
      pagination: mockModules.pagination,
    });
    expect(moduleService.getModules).toHaveBeenCalledWith({
      page: page,
      limit: limit,
      status: undefined,
      search: undefined,
    });
  });

  it('should handle empty search results', async () => {
    // Arrange
    const searchKeyword = 'NonExistentModule';
    const mockModules = {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };

    (moduleService.getModules as jest.Mock).mockResolvedValue(mockModules);

    // Buat request dan response mock
    const { req, res } = createMocks({
      method: 'GET',
      url: `/api/module?search=${searchKeyword}`,
      query: {
        search: searchKeyword,
      },
    });

    // Act
    await getModulesHandler(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      data: [],
      pagination: mockModules.pagination,
    });
    expect(moduleService.getModules).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: undefined,
      search: searchKeyword,
    });
  });
});
