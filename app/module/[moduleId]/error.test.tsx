// app/module/[moduleId]/error.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ModuleError from './error';

describe('ModuleError', () => {
  const mockError = new Error('Test error message');
  const mockReset = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render error state correctly', () => {
    render(<ModuleError error={mockError} reset={mockReset} />);
    
    // Check for error text
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    expect(screen.getByText('Maaf, kami tidak dapat memuat modul pembelajaran yang Anda minta.')).toBeInTheDocument();
    
    // Check for error message
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    
    // Check for buttons
    expect(screen.getByText('Kembali ke Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Coba Lagi')).toBeInTheDocument();
  });
  
  it('should call reset function when "Coba Lagi" button is clicked', () => {
    render(<ModuleError error={mockError} reset={mockReset} />);
    
    const retryButton = screen.getByText('Coba Lagi');
    fireEvent.click(retryButton);
    
    expect(mockReset).toHaveBeenCalledTimes(1);
  });
  
  it('should log error to console', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<ModuleError error={mockError} reset={mockReset} />);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
    
    consoleErrorSpy.mockRestore();
  });
  
  it('should display "Kesalahan tidak diketahui" when error has no message', () => {
    const errorWithoutMessage = new Error();
    render(<ModuleError error={errorWithoutMessage} reset={mockReset} />);
    
    expect(screen.getByText('Kesalahan tidak diketahui')).toBeInTheDocument();
  });
});
