// features/module/components/ModuleProgress.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ModuleProgress from './ModuleProgress';

// Mock the Progress component from shadcn/ui
jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: { value: number; className?: string }) => (
    <div data-testid="progress-bar" data-value={value} className={className}>
      Progress Bar
    </div>
  ),
}));

describe('ModuleProgress', () => {
  it('renders the progress component with correct values', () => {
    render(
      <ModuleProgress
        currentPage={3}
        totalPages={5}
        progressPercentage={60}
      />
    );

    // Check if the page information is displayed correctly
    expect(screen.getByText('Halaman 3 dari 5')).toBeInTheDocument();
    
    // Check if the percentage is displayed correctly
    expect(screen.getByText('60% selesai')).toBeInTheDocument();
    
    // Check if the progress bar is rendered with the correct value
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('data-value', '60');
  });

  it('handles zero progress correctly', () => {
    render(
      <ModuleProgress
        currentPage={1}
        totalPages={10}
        progressPercentage={0}
      />
    );

    expect(screen.getByText('Halaman 1 dari 10')).toBeInTheDocument();
    expect(screen.getByText('0% selesai')).toBeInTheDocument();
    
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveAttribute('data-value', '0');
  });

  it('handles 100% progress correctly', () => {
    render(
      <ModuleProgress
        currentPage={10}
        totalPages={10}
        progressPercentage={100}
      />
    );

    expect(screen.getByText('Halaman 10 dari 10')).toBeInTheDocument();
    expect(screen.getByText('100% selesai')).toBeInTheDocument();
    
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveAttribute('data-value', '100');
  });
});
