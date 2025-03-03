// features/module/data/moduleData.test.ts
import modules from './moduleData';
import { ModuleData } from '../types';

describe('moduleData', () => {
  it('should export an array of modules', () => {
    expect(Array.isArray(modules)).toBe(true);
    expect(modules.length).toBeGreaterThan(0);
  });

  it('each module should have the required properties', () => {
    modules.forEach((module: ModuleData) => {
      expect(module).toHaveProperty('id');
      expect(module).toHaveProperty('title');
      expect(module).toHaveProperty('description');
      expect(module).toHaveProperty('pages');
      expect(module).toHaveProperty('totalPages');
      expect(module).toHaveProperty('progressPercentage');
      expect(module).toHaveProperty('isCompleted');
    });
  });

  it('each module should have the correct number of pages', () => {
    modules.forEach((module: ModuleData) => {
      expect(module.pages.length).toBe(module.totalPages);
    });
  });

  it('each page should have the required properties', () => {
    modules.forEach((module: ModuleData) => {
      module.pages.forEach((page) => {
        expect(page).toHaveProperty('id');
        expect(page).toHaveProperty('title');
        expect(page).toHaveProperty('content');
        expect(page).toHaveProperty('isLastPage');
        expect(page).toHaveProperty('pageNumber');
      });
    });
  });

  it('only the last page of each module should have isLastPage set to true', () => {
    modules.forEach((module: ModuleData) => {
      module.pages.forEach((page, index) => {
        if (index === module.pages.length - 1) {
          expect(page.isLastPage).toBe(true);
        } else {
          expect(page.isLastPage).toBe(false);
        }
      });
    });
  });

  it('page numbers should be sequential and start from 1', () => {
    modules.forEach((module: ModuleData) => {
      module.pages.forEach((page, index) => {
        expect(page.pageNumber).toBe(index + 1);
      });
    });
  });
});
