// features/module/types/index.test.ts
import { ModuleData, ModulePage, ModuleProgress } from './index';

describe('Module Types', () => {
  it('should create a valid ModuleData object', () => {
    const moduleData: ModuleData = {
      id: 'module-1',
      title: 'Introduction to React',
      description: 'Learn the basics of React',
      pages: [],
      totalPages: 5,
      progressPercentage: 0,
      isCompleted: false,
      estimatedTime: 30, // Waktu estimasi dalam menit
      quickViewModeAvailable: true // Mode quick view tersedia
    };

    expect(moduleData).toHaveProperty('id');
    expect(moduleData).toHaveProperty('title');
    expect(moduleData).toHaveProperty('description');
    expect(moduleData).toHaveProperty('pages');
    expect(moduleData).toHaveProperty('totalPages');
    expect(moduleData).toHaveProperty('progressPercentage');
    expect(moduleData).toHaveProperty('isCompleted');
    expect(moduleData).toHaveProperty('estimatedTime');
    expect(moduleData).toHaveProperty('quickViewModeAvailable');
  });

  it('should create a valid ModulePage object', () => {
    const modulePage: ModulePage = {
      id: 'page-1',
      title: 'Getting Started',
      content: 'Content for page 1',
      media: 'https://example.com/image.jpg',
      isLastPage: false,
      pageNumber: 1,
    };

    expect(modulePage).toHaveProperty('id');
    expect(modulePage).toHaveProperty('title');
    expect(modulePage).toHaveProperty('content');
    expect(modulePage).toHaveProperty('media');
    expect(modulePage).toHaveProperty('isLastPage');
    expect(modulePage).toHaveProperty('pageNumber');
  });

  it('should create a valid ModuleProgress object', () => {
    const moduleProgress: ModuleProgress = {
      userId: 'user-123',
      moduleId: 'module-1',
      currentPage: 2,
      isCompleted: false,
      progressPercentage: 40,
      lastUpdated: new Date().toISOString(),
    };

    expect(moduleProgress).toHaveProperty('userId');
    expect(moduleProgress).toHaveProperty('moduleId');
    expect(moduleProgress).toHaveProperty('currentPage');
    expect(moduleProgress).toHaveProperty('isCompleted');
    expect(moduleProgress).toHaveProperty('progressPercentage');
    expect(moduleProgress).toHaveProperty('lastUpdated');
  });
});
