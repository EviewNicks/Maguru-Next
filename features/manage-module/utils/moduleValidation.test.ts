import { moduleSchema, updateModuleSchema, moduleQuerySchema } from './moduleValidation';
import { ModuleStatus } from '../types';

describe('Module Validation Schema', () => {
  describe('moduleSchema', () => {
    it('should validate a valid module', () => {
      const validModule = {
        title: 'Pengantar Artificial Intelligence',
        description: 'Modul pengenalan dasar AI',
        status: ModuleStatus.DRAFT,
      };

      const result = moduleSchema.safeParse(validModule);
      expect(result.success).toBe(true);
    });

    it('should validate a module without description', () => {
      const moduleWithoutDesc = {
        title: 'Pengantar Artificial Intelligence',
        status: ModuleStatus.DRAFT,
      };

      const result = moduleSchema.safeParse(moduleWithoutDesc);
      expect(result.success).toBe(true);
    });

    it('should set default status to DRAFT if not provided', () => {
      const moduleWithoutStatus = {
        title: 'Pengantar Artificial Intelligence',
        description: 'Modul pengenalan dasar AI',
      };

      const result = moduleSchema.safeParse(moduleWithoutStatus);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(ModuleStatus.DRAFT);
      }
    });

    it('should reject a module with title less than 5 characters', () => {
      const invalidModule = {
        title: 'AI',
        description: 'Modul pengenalan dasar AI',
        status: ModuleStatus.DRAFT,
      };

      const result = moduleSchema.safeParse(invalidModule);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Judul minimal 5 karakter');
      }
    });

    it('should reject a module with title more than 100 characters', () => {
      const longTitle = 'A'.repeat(101);
      const invalidModule = {
        title: longTitle,
        description: 'Modul pengenalan dasar AI',
        status: ModuleStatus.DRAFT,
      };

      const result = moduleSchema.safeParse(invalidModule);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Judul maksimal 100 karakter');
      }
    });

    it('should reject a module with invalid status', () => {
      const invalidModule = {
        title: 'Pengantar Artificial Intelligence',
        description: 'Modul pengenalan dasar AI',
        status: 'INVALID_STATUS' as ModuleStatus,
      };

      const result = moduleSchema.safeParse(invalidModule);
      expect(result.success).toBe(false);
    });
  });

  describe('updateModuleSchema', () => {
    it('should validate a valid update with all fields', () => {
      const validUpdate = {
        title: 'Pengantar Machine Learning',
        description: 'Modul pengenalan dasar ML',
        status: ModuleStatus.ACTIVE,
      };

      const result = updateModuleSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate a partial update with only title', () => {
      const partialUpdate = {
        title: 'Pengantar Machine Learning',
      };

      const result = updateModuleSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate a partial update with only description', () => {
      const partialUpdate = {
        description: 'Modul pengenalan dasar ML',
      };

      const result = updateModuleSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate a partial update with only status', () => {
      const partialUpdate = {
        status: ModuleStatus.ACTIVE,
      };

      const result = updateModuleSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject an update with invalid title length', () => {
      const invalidUpdate = {
        title: 'ML',
      };

      const result = updateModuleSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe('moduleQuerySchema', () => {
    it('should validate valid query parameters', () => {
      const validQuery = {
        page: 2,
        limit: 20,
        status: ModuleStatus.ACTIVE,
        search: 'AI',
      };

      const result = moduleQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should coerce string numbers to actual numbers', () => {
      const stringQuery = {
        page: '2',
        limit: '20',
      };

      const result = moduleQuerySchema.safeParse(stringQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.page).toBe('number');
        expect(typeof result.data.limit).toBe('number');
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should set default values for missing page and limit', () => {
      const partialQuery = {
        status: ModuleStatus.ACTIVE,
      };

      const result = moduleQuerySchema.safeParse(partialQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it('should reject negative page numbers', () => {
      const invalidQuery = {
        page: -1,
        limit: 20,
      };

      const result = moduleQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject non-integer page numbers', () => {
      const invalidQuery = {
        page: 2.5,
        limit: 20,
      };

      const result = moduleQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject invalid status values', () => {
      const invalidQuery = {
        status: 'INVALID_STATUS' as ModuleStatus,
      };

      const result = moduleQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });
});
