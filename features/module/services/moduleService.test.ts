// features/module/services/moduleService.test.ts
import { fetchModules, fetchModuleById, fetchModulePage, saveModuleProgress, getModuleProgress } from './moduleService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('moduleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('fetchModules', () => {
    it('should return an array of modules', async () => {
      const modules = await fetchModules();
      expect(modules).toBeInstanceOf(Array);
      expect(modules.length).toBeGreaterThan(0);
      expect(modules[0]).toHaveProperty('id');
      expect(modules[0]).toHaveProperty('title');
      expect(modules[0]).toHaveProperty('description');
      expect(modules[0]).toHaveProperty('pages');
    });
  });

  describe('fetchModuleById', () => {
    it('should return a module when given a valid ID', async () => {
      const modules = await fetchModules();
      const moduleId = modules[0].id;
      
      const foundModule = await fetchModuleById(moduleId);
      expect(foundModule).not.toBeNull();
      expect(foundModule?.id).toBe(moduleId);
    });

    it('should return null when given an invalid ID', async () => {
      const foundModule = await fetchModuleById('invalid-id');
      expect(foundModule).not.toBeNull();
    });
  });

  describe('fetchModulePage', () => {
    it('should return a page when given a valid module ID and page number', async () => {
      const modules = await fetchModules();
      const moduleId = modules[0].id;
      
      const page = await fetchModulePage(moduleId, 1);
      expect(page).not.toBeNull();
      expect(page?.id).toBeDefined();
      expect(page?.title).toBeDefined();
      expect(page?.content).toBeDefined();
    });

    it('should return null when given an invalid module ID', async () => {
      const page = await fetchModulePage('invalid-id', 1);
      expect(page).toBeNull();
    });

    it('should return null when given an invalid page number', async () => {
      const modules = await fetchModules();
      const moduleId = modules[0].id;
      
      const page = await fetchModulePage(moduleId, 999);
      expect(page).toBeNull();
    });
  });

  describe('saveModuleProgress and getModuleProgress', () => {
    it('should save and retrieve module progress', () => {
      const moduleId = 'test-module';
      const progressData = {
        currentPage: 3,
        completedPages: [1, 2, 3],
        interactionsCompleted: { '1': ['interaction1', 'interaction2'] }
      };
      
      saveModuleProgress(moduleId, progressData);
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      const retrievedProgress = getModuleProgress(moduleId);
      expect(retrievedProgress).not.toBeNull();
      expect(retrievedProgress?.currentPage).toBe(progressData.currentPage);
      expect(retrievedProgress?.completedPages).toEqual(progressData.completedPages);
      expect(retrievedProgress?.interactionsCompleted).toEqual(progressData.interactionsCompleted);
    });

    it('should handle localStorage errors when saving', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Simulate localStorage error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const moduleId = 'test-module';
      const progressData = {
        currentPage: 3,
        completedPages: [1, 2, 3],
        interactionsCompleted: { '1': ['interaction1', 'interaction2'] }
      };
      
      saveModuleProgress(moduleId, progressData);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should handle localStorage errors when retrieving', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Save valid data first
      const moduleId = 'test-module';
      const progressData = {
        currentPage: 3,
        completedPages: [1, 2, 3],
        interactionsCompleted: { '1': ['interaction1', 'interaction2'] }
      };
      
      saveModuleProgress(moduleId, progressData);
      
      // Simulate localStorage error
      localStorageMock.getItem.mockImplementation(() => {
        return 'invalid-json';
      });
      
      const retrievedProgress = getModuleProgress(moduleId);
      expect(retrievedProgress).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should return null when no progress is saved', () => {
      const retrievedProgress = getModuleProgress('non-existent-module');
      expect(retrievedProgress).toBeNull();
    });
  });
});
