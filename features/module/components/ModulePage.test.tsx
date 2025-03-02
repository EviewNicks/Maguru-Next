// features/module/components/ModulePage.test.tsx
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ModulePage from './ModulePage';
import progressReducer from '../../../store/features/progressSlice';
import userReducer from '../../../store/features/userSlice';

// Mock the hooks and components
jest.mock('../hooks/useModuleProgress', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentPage: 1,
    progressPercentage: 20,
    currentModule: {
      id: 'module-1',
      title: 'Test Module',
      description: 'Test Description',
      totalPages: 5,
    },
    currentPageData: {
      id: 'page-1',
      title: 'Test Page',
      content: 'Test Content',
      isLastPage: false,
      pageNumber: 1,
    },
    goToNextPage: jest.fn(),
    goToPrevPage: jest.fn(),
    goToPage: jest.fn(),
  })),
}));

jest.mock('./ModuleContent', () => ({
  __esModule: true,
  default: ({ title, content }) => (
    <div data-testid="module-content">
      <h2>{title}</h2>
      <div>{content}</div>
    </div>
  ),
}));

jest.mock('./ModuleNavigation', () => ({
  __esModule: true,
  default: () => <div data-testid="module-navigation">Navigation</div>,
}));

jest.mock('./ModuleProgress', () => ({
  __esModule: true,
  default: () => <div data-testid="module-progress">Progress</div>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

// Mock Redux store
const createTestStore = () => {
  return configureStore({
    reducer: {
      progress: progressReducer,
      users: userReducer,
    },
  });
};

describe('ModulePage', () => {
  it('renders the module page with all components', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <ModulePage moduleId="module-1" />
      </Provider>
    );
    
    // Check if the module title and description are rendered
    expect(screen.getByText('Test Module')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    
    // Check if all components are rendered
    expect(screen.getByTestId('module-content')).toBeInTheDocument();
    expect(screen.getByTestId('module-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('module-progress')).toBeInTheDocument();
  });
  
  it('renders loading state when module is not found', () => {
    const store = createTestStore();
    
    // Override the mock to return null for currentModule and currentPageData
    jest.mock('../hooks/useModuleProgress', () => ({
      __esModule: true,
      default: jest.fn(() => ({
        currentPage: 1,
        progressPercentage: 0,
        currentModule: null,
        currentPageData: null,
        goToNextPage: jest.fn(),
        goToPrevPage: jest.fn(),
        goToPage: jest.fn(),
      })),
    }));
    
    render(
      <Provider store={store}>
        <ModulePage moduleId="non-existent-module" />
      </Provider>
    );
    
    expect(screen.getByText('Modul tidak ditemukan atau sedang dimuat...')).toBeInTheDocument();
  });
});