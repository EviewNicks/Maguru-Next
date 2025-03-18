import { moduleService } from './moduleService';
import { ModuleStatus } from '../types';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockCreate = jest.fn();
  const mockFindMany = jest.fn();
  const mockFindUnique = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockCount = jest.fn();

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      module: {
        create: mockCreate,
        findMany: mockFindMany,
        findUnique: mockFindUnique,
        update: mockUpdate,
        delete: mockDelete,
        count: mockCount,
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    })),
    mockCreate,
    mockFindMany,
    mockFindUnique,
    mockUpdate,
    mockDelete,
    mockCount,
  };
});

const {
  mockCreate,
  mockFindMany,
  mockFindUnique,
  mockUpdate,
  mockDelete,
  mockCount,
} = jest.requireMock('@prisma/client');

describe('Module Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createModule', () => {
    it('should create a new module with provided data', async () => {
      // Arrange
      const moduleData = {
        title: 'Pengantar AI',
        description: 'Modul pengenalan dasar AI',
        status: ModuleStatus.DRAFT,
      };
      const userId = 'admin-id';
      
      const expectedModule = {
        id: 'module-id',
        ...moduleData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
      };
      
      mockCreate.mockResolvedValue(expectedModule);

      // Act
      const result = await moduleService.createModule(moduleData, userId);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          title: moduleData.title,
          description: moduleData.description,
          status: moduleData.status,
          createdBy: userId,
          updatedBy: userId,
        },
      });
      expect(result).toEqual(expectedModule);
    });

    it('should set default status to DRAFT if not provided', async () => {
      // Arrange
      const moduleData = {
        title: 'Pengantar AI',
        description: 'Modul pengenalan dasar AI',
      };
      const userId = 'admin-id';
      
      const expectedModule = {
        id: 'module-id',
        ...moduleData,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
      };
      
      mockCreate.mockResolvedValue(expectedModule);

      // Act
      const result = await moduleService.createModule(moduleData, userId);

      // Assert
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          title: moduleData.title,
          description: moduleData.description,
          status: ModuleStatus.DRAFT,
          createdBy: userId,
          updatedBy: userId,
        },
      });
      expect(result).toEqual(expectedModule);
    });
  });

  describe('getModules', () => {
    it('should return paginated modules', async () => {
      // Arrange
      const params = {
        page: 1,
        limit: 10,
      };
      
      const modules = Array(3).fill(null).map((_, index) => ({
        id: `module-${index}`,
        title: `Module ${index}`,
        description: `Description ${index}`,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin-id',
        updatedBy: 'admin-id',
      }));
      
      mockCount.mockResolvedValue(3);
      mockFindMany.mockResolvedValue(modules);

      // Act
      const result = await moduleService.getModules(params);

      // Assert
      expect(mockCount).toHaveBeenCalledWith({ where: {} });
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: modules.map(module => ({
          ...module,
          description: module.description,
          status: module.status,
        })),
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1,
        },
      });
    });

    it('should apply status filter if provided', async () => {
      // Arrange
      const params = {
        page: 1,
        limit: 10,
        status: ModuleStatus.ACTIVE,
      };
      
      mockCount.mockResolvedValue(2);
      mockFindMany.mockResolvedValue([]);

      // Act
      await moduleService.getModules(params);

      // Assert
      expect(mockCount).toHaveBeenCalledWith({
        where: { status: ModuleStatus.ACTIVE },
      });
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { status: ModuleStatus.ACTIVE },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should apply search filter if provided', async () => {
      // Arrange
      const params = {
        page: 1,
        limit: 10,
        search: 'AI',
      };
      
      mockCount.mockResolvedValue(1);
      mockFindMany.mockResolvedValue([]);

      // Act
      await moduleService.getModules(params);

      // Assert
      expect(mockCount).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'AI', mode: 'insensitive' } },
            { description: { contains: 'AI', mode: 'insensitive' } },
          ]
        },
      });
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'AI', mode: 'insensitive' } },
            { description: { contains: 'AI', mode: 'insensitive' } },
          ]
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should calculate correct pagination values', async () => {
      // Arrange
      const params = {
        page: 2,
        limit: 5,
      };
      
      mockCount.mockResolvedValue(12);
      mockFindMany.mockResolvedValue([]);

      // Act
      const result = await moduleService.getModules(params);

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {},
        skip: 5, // (page - 1) * limit
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 12,
        totalPages: 3, // Math.ceil(12 / 5)
      });
    });
  });

  describe('getModuleById', () => {
    it('should return module by id if found', async () => {
      // Arrange
      const moduleId = 'module-id';
      const expectedModule = {
        id: moduleId,
        title: 'Pengantar AI',
        description: 'Modul pengenalan dasar AI',
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin-id',
        updatedBy: 'admin-id',
      };
      
      mockFindUnique.mockResolvedValue(expectedModule);

      // Act
      const result = await moduleService.getModuleById(moduleId);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: moduleId },
      });
      expect(result).toEqual(expectedModule);
    });

    it('should return null if module not found', async () => {
      // Arrange
      const moduleId = 'non-existent-id';
      
      mockFindUnique.mockResolvedValue(null);

      // Act
      const result = await moduleService.getModuleById(moduleId);

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: moduleId },
      });
      expect(result).toBeNull();
    });
  });

  describe('updateModule', () => {
    it('should update module with all provided fields', async () => {
      // Arrange
      const moduleId = 'module-id';
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        status: ModuleStatus.ACTIVE,
      };
      const userId = 'admin-id';
      
      const expectedModule = {
        id: moduleId,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin-id',
        updatedBy: userId,
      };
      
      mockUpdate.mockResolvedValue(expectedModule);

      // Act
      const result = await moduleService.updateModule(moduleId, updateData, userId);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: moduleId },
        data: {
          ...updateData,
          updatedBy: userId,
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual({
        ...expectedModule,
        description: expectedModule.description,
        status: expectedModule.status,
      });
    });

    it('should update only provided fields', async () => {
      // Arrange
      const moduleId = 'module-id';
      const updateData = {
        title: 'Updated Title',
      };
      const userId = 'admin-id';
      
      mockUpdate.mockResolvedValue({});

      // Act
      await moduleService.updateModule(moduleId, updateData, userId);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: moduleId },
        data: {
          ...updateData,
          updatedBy: userId,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should handle empty description correctly', async () => {
      // Arrange
      const moduleId = 'module-id';
      const updateData = {
        description: '',
      };
      const userId = 'admin-id';
      
      mockUpdate.mockResolvedValue({});

      // Act
      await moduleService.updateModule(moduleId, updateData, userId);

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: moduleId },
        data: {
          ...updateData,
          updatedBy: userId,
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe('deleteModule', () => {
    it('should delete module by id', async () => {
      // Arrange
      const moduleId = 'module-id';
      const expectedModule = {
        id: moduleId,
        title: 'Pengantar AI',
        description: 'Modul pengenalan dasar AI',
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin-id',
        updatedBy: 'admin-id',
      };
      
      mockDelete.mockResolvedValue(expectedModule);

      // Act
      const result = await moduleService.deleteModule(moduleId);

      // Assert
      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: moduleId },
      });
      expect(result).toEqual(expectedModule);
    });
  });
});
