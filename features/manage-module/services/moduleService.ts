import { PrismaClient } from '@prisma/client';
import { 
  Module, 
  CreateModuleInput, 
  UpdateModuleInput, 
  ModuleQueryParams, 
  PaginatedResponse,
  ModuleStatus
} from '../types';

const prisma = new PrismaClient();

export const moduleService = {
  /**
   * Membuat modul baru
   * @param data Data modul yang akan dibuat
   * @param userId ID pengguna yang membuat modul
   * @returns Modul yang baru dibuat
   */
  async createModule(data: CreateModuleInput, userId: string): Promise<Module> {
    const moduleData = await prisma.module.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || ModuleStatus.DRAFT,
        createdBy: userId,
        updatedBy: userId,
      },
    });
    
    // Konversi null menjadi undefined untuk description dan konversi status ke ModuleStatus
    return {
      ...moduleData,
      description: moduleData.description || undefined,
      status: moduleData.status as unknown as ModuleStatus
    };
  },

  /**
   * Mendapatkan daftar modul dengan pagination, filter, dan pencarian
   * @param params Parameter query untuk pagination, filter, dan pencarian
   * @returns Daftar modul dengan informasi pagination
   */
  async getModules(params: ModuleQueryParams): Promise<PaginatedResponse<Module>> {
    const { page = 1, limit = 10, status, search } = params;
    const skip = (page - 1) * limit;

    // Buat filter berdasarkan parameter
    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Dapatkan total modul
    const total = await prisma.module.count({ where });
    
    // Dapatkan daftar modul
    const modules = await prisma.module.findMany({
      where,
      skip,
      take: limit,
      orderBy: params.sortBy 
        ? { [params.sortBy]: params.sortOrder || 'asc' } 
        : { createdAt: 'desc' },
    });
    
    // Konversi null menjadi undefined untuk description dan konversi status ke ModuleStatus
    const formattedModules = modules.map(moduleData => ({
      ...moduleData,
      description: moduleData.description || undefined,
      status: moduleData.status as unknown as ModuleStatus
    }));
    
    return {
      data: formattedModules,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Mendapatkan detail modul berdasarkan ID
   * @param id ID modul
   * @returns Detail modul
   */
  async getModuleById(id: string): Promise<Module | null> {
    const moduleData = await prisma.module.findUnique({
      where: { id },
    });
    
    if (!moduleData) {
      return null;
    }
    
    // Konversi null menjadi undefined untuk description dan konversi status ke ModuleStatus
    return {
      ...moduleData,
      description: moduleData.description || undefined,
      status: moduleData.status as unknown as ModuleStatus
    };
  },

  /**
   * Memperbarui modul berdasarkan ID
   * @param id ID modul
   * @param data Data modul yang akan diperbarui
   * @param userId ID pengguna yang memperbarui modul
   * @returns Modul yang telah diperbarui
   */
  async updateModule(id: string, data: UpdateModuleInput, userId: string): Promise<Module> {
    const moduleData = await prisma.module.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
    
    // Konversi null menjadi undefined untuk description dan konversi status ke ModuleStatus
    return {
      ...moduleData,
      description: moduleData.description || undefined,
      status: moduleData.status as unknown as ModuleStatus
    };
  },
  
  /**
   * Memperbarui status modul berdasarkan ID
   * @param id ID modul
   * @param status Status baru modul
   * @param userId ID pengguna yang memperbarui status modul
   * @returns Modul yang telah diperbarui
   */
  async updateModuleStatus(id: string, status: ModuleStatus, userId: string): Promise<Module | null> {
    try {
      const moduleData = await prisma.module.update({
        where: { id },
        data: {
          status,
          updatedBy: userId,
          updatedAt: new Date(),
        },
      });
      
      // Konversi null menjadi undefined untuk description dan konversi status ke ModuleStatus
      return {
        ...moduleData,
        description: moduleData.description || undefined,
        status: moduleData.status as unknown as ModuleStatus
      };
    } catch (error) {
      console.error(`Error updating module status for ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Menghapus modul berdasarkan ID
   * @param id ID modul
   * @returns Modul yang telah dihapus
   */
  async deleteModule(id: string): Promise<Module> {
    const moduleData = await prisma.module.delete({
      where: { id },
    });
    
    // Konversi null menjadi undefined untuk description dan konversi status ke ModuleStatus
    return {
      ...moduleData,
      description: moduleData.description || undefined,
      status: moduleData.status as unknown as ModuleStatus
    };
  },
};
