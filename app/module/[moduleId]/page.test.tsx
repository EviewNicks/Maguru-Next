// app/module/[moduleId]/page.test.tsx
import { render, screen } from '@testing-library/react';
import ModuleRoute from './page';

// Mock the ModulePage component
jest.mock('@/features/module/components/ModulePage', () => {
  return function MockModulePage({ moduleId }: { moduleId: string }) {
    return <div data-testid="module-page">Module Page for {moduleId}</div>;
  };
});

describe('ModuleRoute', () => {
  it('should render ModulePage with the correct moduleId', () => {
    render(<ModuleRoute params={{ moduleId: 'test-module-1' }} />);
    
    const modulePage = screen.getByTestId('module-page');
    expect(modulePage).toBeInTheDocument();
    expect(modulePage).toHaveTextContent('Module Page for test-module-1');
  });

  it('should pass the moduleId from params to ModulePage', () => {
    render(<ModuleRoute params={{ moduleId: 'test-module-2' }} />);
    
    const modulePage = screen.getByTestId('module-page');
    expect(modulePage).toHaveTextContent('Module Page for test-module-2');
  });
});
