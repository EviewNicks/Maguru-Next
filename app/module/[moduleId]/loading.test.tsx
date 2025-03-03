// app/module/[moduleId]/loading.test.tsx
import { render, screen } from '@testing-library/react';
import ModuleLoading from './loading';

describe('ModuleLoading', () => {
  it('should render loading state correctly', () => {
    render(<ModuleLoading />);
    
    // Check for loading text
    expect(screen.getByText('Memuat Modul Pembelajaran...')).toBeInTheDocument();
    
    // Check for BookOpen icon
    const iconContainer = document.querySelector('.bg-primary\\/10');
    expect(iconContainer).toBeInTheDocument();
    
    // Check for skeletons
    const skeletons = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
    
    // Check for card structure
    const card = document.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });
});
