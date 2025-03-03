// features/module/hooks/useModuleProgress.test.tsx
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import progressReducer from '../../../store/features/progressSlice';
import useModuleProgress from './useModuleProgress';
import React, { ReactNode } from 'react';

// Mock store
const createTestStore = () => {
  return configureStore({
    reducer: {
      progress: progressReducer,
    },
  });
};
interface WrapperProps {
  children: React.ReactNode
  store: ReturnType<typeof createTestStore>
}

// Wrapper component with Redux provider
const Wrapper: React.FC<WrapperProps> = ({ children, store }) => (
  <Provider store={store}>{children}</Provider>
);

// Helper function to create a wrapper for renderHook
const createWrapper = () => {
  const store = createTestStore();
  return function WrapperComponent({ children }: { children: ReactNode }) {
    return <Wrapper store={store}>{children}</Wrapper>;
  };
};

describe('useModuleProgress', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useModuleProgress(), { 
      wrapper: createWrapper() as () => JSX.Element
    });
    
    expect(result.current.currentPage).toBe(1);
    expect(result.current.isModuleCompleted).toBe(false);
    expect(result.current.progressPercentage).toBe(0);
    expect(result.current.currentModule).toBeUndefined();
    expect(result.current.currentPageData).toBeUndefined();
  });

  it('should start a module when moduleId and userId are provided', () => {
    const { result } = renderHook(() => useModuleProgress({ moduleId: 'module-1', userId: 'user-123' }), { 
      wrapper: createWrapper() as () => JSX.Element
    });
    
    expect(result.current.currentModule).toBeDefined();
    expect(result.current.currentModule?.id).toBe('module-1');
    expect(result.current.currentPage).toBe(1);
    expect(result.current.progressPercentage).toBe(0); // Corrected to 0% since the module has just started
  });

  it('should navigate to next page', () => {
    const { result } = renderHook(() => useModuleProgress({ moduleId: 'module-1', userId: 'user-123' }), { 
      wrapper: createWrapper() as () => JSX.Element
    });
    
    act(() => {
      result.current.goToNextPage();
    });
    
    expect(result.current.currentPage).toBe(2);
    expect(result.current.progressPercentage).toBe(40); // 2/5 * 100 = 40%
    expect(result.current.isModuleCompleted).toBe(false);
  });

  it('should navigate to previous page', () => {
    const { result } = renderHook(() => useModuleProgress({ moduleId: 'module-1', userId: 'user-123' }), { 
      wrapper: createWrapper() as () => JSX.Element
    });
    
    // Go to page 3 first
    act(() => {
      result.current.navigateToPage(3);
    });
    
    expect(result.current.currentPage).toBe(3);
    
    // Then go back
    act(() => {
      result.current.goToPrevPage();
    });
    
    expect(result.current.currentPage).toBe(2);
    expect(result.current.progressPercentage).toBe(40); // 2/5 * 100 = 40%
    expect(result.current.isModuleCompleted).toBe(false);
  });

  it('should navigate to specific page', () => {
    const { result } = renderHook(() => useModuleProgress({ moduleId: 'module-1', userId: 'user-123' }), { 
      wrapper: createWrapper() as () => JSX.Element
    });
    
    act(() => {
      result.current.navigateToPage(4);
    });
    
    expect(result.current.currentPage).toBe(4);
    expect(result.current.progressPercentage).toBe(80); // 4/5 * 100 = 80%
    expect(result.current.isModuleCompleted).toBe(false);
  });

  it('should mark module as completed when reaching the last page', () => {
    const { result } = renderHook(() => useModuleProgress({ moduleId: 'module-1', userId: 'user-123' }), { 
      wrapper: createWrapper() as () => JSX.Element
    });
    
    act(() => {
      result.current.navigateToPage(5); // Last page of module-1
    });
    
    expect(result.current.currentPage).toBe(5);
    expect(result.current.progressPercentage).toBe(100);
    expect(result.current.isModuleCompleted).toBe(true);
  });

  it('should reset progress', () => {
    const { result } = renderHook(() => useModuleProgress({ moduleId: 'module-1', userId: 'user-123' }), { 
      wrapper: createWrapper() as () => JSX.Element
    });
    
    // Go to page 3 first
    act(() => {
      result.current.navigateToPage(3);
    });
    
    // Then reset
    act(() => {
      result.current.resetProgress();
    });
    
    expect(result.current.currentPage).toBe(1);
    expect(result.current.progressPercentage).toBe(20); // 1/5 * 100 = 20%
  });

  it('should update progress percentage correctly', () => {
    const { result } = renderHook(() => useModuleProgress({ moduleId: 'module-1', userId: 'user-123' }), { 
      wrapper: createWrapper() as () => JSX.Element
    });
    
    act(() => {
      result.current.navigateToPage(3);
    });
    
    expect(result.current.progressPercentage).toBe(60); // 3/5 * 100 = 60%
  });

  it('should handle module completion', () => {
    const { result } = renderHook(() => useModuleProgress({ moduleId: 'module-1', userId: 'user-123' }), { 
      wrapper: createWrapper() as () => JSX.Element
    });
    
    // Sebagai gantinya, kita akan menggunakan navigateToPage ke halaman terakhir
    act(() => {
      result.current.navigateToPage(5); // Halaman terakhir akan menandai modul sebagai selesai
    });
    
    expect(result.current.isModuleCompleted).toBe(true);
  });

  it('should handle module restart', () => {
    const { result } = renderHook(() => useModuleProgress({ moduleId: 'module-1', userId: 'user-123' }), { 
      wrapper: createWrapper() as () => JSX.Element
    });
    
    // Pertama, selesaikan modul
    act(() => {
      result.current.navigateToPage(5); // Halaman terakhir akan menandai modul sebagai selesai
    });
    
    expect(result.current.isModuleCompleted).toBe(true);
    
    // Kemudian reset progress sebagai pengganti restartModule
    act(() => {
      result.current.resetProgress();
    });
    
    expect(result.current.isModuleCompleted).toBe(false);
    expect(result.current.currentPage).toBe(1);
  });
});
