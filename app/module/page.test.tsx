// app/module/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import ModulesPage from './page';
import { fetchModules } from '@/features/module/services/moduleService';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the moduleService
jest.mock('@/features/module/services/moduleService', () => ({
  fetchModules: jest.fn(),
}));

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

describe('ModulesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('should render loading state initially', () => {
    (fetchModules as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    
    render(<ModulesPage />);
    
    expect(screen.getByText('Modul Pembelajaran')).toBeInTheDocument();
    expect(screen.getByText('Pilih modul pembelajaran yang ingin Anda pelajari.')).toBeInTheDocument();
    
    // Check for loading skeletons
    const skeletons = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render modules when data is loaded', async () => {
    const mockModules = [
      {
        id: 'module-1',
        title: 'Test Module 1',
        description: 'Test Description 1',
        totalPages: 5,
        estimatedTime: 30,
      },
      {
        id: 'module-2',
        title: 'Test Module 2',
        description: 'Test Description 2',
        totalPages: 3,
        estimatedTime: 20,
      },
    ];
    
    (fetchModules as jest.Mock).mockResolvedValue(mockModules);
    
    render(<ModulesPage />);
    
    // Wait for modules to be rendered
    await waitFor(() => {
      expect(screen.getByText('Test Module 1')).toBeInTheDocument();
      expect(screen.getByText('Test Module 2')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    expect(screen.getByText('Test Description 2')).toBeInTheDocument();
    
    // Check for page counts
    expect(screen.getByText('5 halaman')).toBeInTheDocument();
    expect(screen.getByText('3 halaman')).toBeInTheDocument();
    
    // Check for estimated times
    expect(screen.getByText('±30 menit')).toBeInTheDocument();
    expect(screen.getByText('±20 menit')).toBeInTheDocument();
  });

  it('should render "Tidak ada modul" message when no modules are available', async () => {
    (fetchModules as jest.Mock).mockResolvedValue([]);
    
    render(<ModulesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tidak ada modul pembelajaran yang tersedia saat ini.')).toBeInTheDocument();
    });
  });

  it('should show progress for modules with saved progress', async () => {
    const mockModules = [
      {
        id: 'module-1',
        title: 'Test Module 1',
        description: 'Test Description 1',
        totalPages: 5,
        estimatedTime: 30,
      },
    ];
    
    (fetchModules as jest.Mock).mockResolvedValue(mockModules);
    
    // Set up mock progress in localStorage
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'module_progress_module-1') {
        return JSON.stringify({
          progressPercentage: 60,
          currentPage: 3,
          lastUpdated: new Date().toISOString(),
        });
      }
      return null;
    });
    
    render(<ModulesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Module 1')).toBeInTheDocument();
    });
    
    // Check for progress display
    await waitFor(() => {
      expect(screen.getByText('Progress: 60%')).toBeInTheDocument();
    });
    
    // Check for "Lanjutkan" button instead of "Mulai Belajar"
    expect(screen.getByText('Lanjutkan')).toBeInTheDocument();
  });

  it('should handle errors when fetching modules', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    (fetchModules as jest.Mock).mockRejectedValue(new Error('Failed to fetch modules'));
    
    render(<ModulesPage />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    // Should still render the page without crashing
    expect(screen.getByText('Modul Pembelajaran')).toBeInTheDocument();
    
    consoleErrorSpy.mockRestore();
  });
});
