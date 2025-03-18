import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModuleFormModal from './ModuleFormModal';
import { ModuleStatus } from '../../types';
import { toast } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateModuleInput, UpdateModuleInput } from '../../types';

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock React Query mutation
const mockCreateModule = jest.fn();
const mockUpdateModule = jest.fn();

jest.mock('../../services/moduleClientService', () => ({
  createModule: (data: CreateModuleInput) => mockCreateModule(data),
  updateModule: (id: string, data: UpdateModuleInput) => mockUpdateModule(id, data),
}));

// Mock react-hook-form
jest.mock('react-hook-form', () => {
  const originalModule = jest.requireActual('react-hook-form');
  return {
    ...originalModule,
  };
});

describe('ModuleFormModal', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    mode: 'create' as const,
    module: undefined,
  };

  const editProps = {
    isOpen: true,
    onClose: jest.fn(),
    mode: 'edit' as const,
    module: {
      id: '1',
      title: 'Modul Test',
      description: 'Deskripsi test',
      status: ModuleStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      updatedBy: 'user1',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('should render create modal with correct title', () => {
    renderWithProvider(<ModuleFormModal {...defaultProps} />);
    
    expect(screen.getByText('Tambah Modul')).toBeInTheDocument();
  });

  it('should render edit modal with correct title', () => {
    renderWithProvider(<ModuleFormModal {...editProps} />);
    
    expect(screen.getByText('Edit Modul')).toBeInTheDocument();
  });

  it('should pre-fill form fields when in edit mode', () => {
    renderWithProvider(<ModuleFormModal {...editProps} />);
    
    expect(screen.getByLabelText('Judul')).toHaveValue('Modul Test');
    expect(screen.getByLabelText('Deskripsi')).toHaveValue('Deskripsi test');
    
    // Verifikasi status dengan cara yang berbeda karena Select component
    const selectTrigger = screen.getByRole('combobox');
    expect(selectTrigger).toHaveTextContent('Aktif');
  });

  it('should show validation errors for empty title', async () => {
    renderWithProvider(<ModuleFormModal {...defaultProps} />);
    
    // Submit form dengan judul kosong
    const submitButton = screen.getByRole('button', { name: /simpan/i });
    fireEvent.click(submitButton);
    
    // Pesan error akan ditampilkan oleh FormMessage
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/judul minimal 5 karakter/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('should show validation errors for title less than 5 characters', async () => {
    renderWithProvider(<ModuleFormModal {...defaultProps} />);
    
    // Isi judul dengan karakter kurang dari 5
    const titleInput = screen.getByLabelText('Judul');
    fireEvent.change(titleInput, { target: { value: 'Test' } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /simpan/i });
    fireEvent.click(submitButton);
    
    // Pesan error akan ditampilkan oleh FormMessage
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/judul minimal 5 karakter/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('should show validation errors for title more than 100 characters', async () => {
    renderWithProvider(<ModuleFormModal {...defaultProps} />);
    
    // Isi judul dengan karakter lebih dari 100
    const titleInput = screen.getByLabelText('Judul');
    const longTitle = 'a'.repeat(101);
    fireEvent.change(titleInput, { target: { value: longTitle } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /simpan/i });
    fireEvent.click(submitButton);
    
    // Pesan error akan ditampilkan oleh FormMessage
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/judul maksimal 100 karakter/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('should call createModule when form is submitted in create mode', async () => {
    renderWithProvider(<ModuleFormModal {...defaultProps} />);
    
    // Isi form
    const titleInput = screen.getByLabelText('Judul');
    fireEvent.change(titleInput, { target: { value: 'Modul Baru' } });
    
    const descriptionInput = screen.getByLabelText('Deskripsi');
    fireEvent.change(descriptionInput, { target: { value: 'Deskripsi baru' } });
    
    // Set mock return value
    mockCreateModule.mockResolvedValue({ id: '2', title: 'Modul Baru' });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /simpan/i });
    fireEvent.click(submitButton);
    
    // Verifikasi createModule dipanggil
    await waitFor(() => {
      expect(mockCreateModule).toHaveBeenCalled();
    });
  });

  it('should call updateModule when form is submitted in edit mode', async () => {
    renderWithProvider(<ModuleFormModal {...editProps} />);
    
    // Isi form
    const titleInput = screen.getByLabelText('Judul');
    fireEvent.change(titleInput, { target: { value: 'Modul Updated' } });
    
    // Set mock return value
    mockUpdateModule.mockResolvedValue({ id: '1', title: 'Modul Updated' });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /simpan/i });
    fireEvent.click(submitButton);
    
    // Verifikasi updateModule dipanggil
    await waitFor(() => {
      expect(mockUpdateModule).toHaveBeenCalled();
    });
  });

  it('should handle API error during form submission', async () => {
    renderWithProvider(<ModuleFormModal {...defaultProps} />);
    
    // Isi form
    const titleInput = screen.getByLabelText('Judul');
    fireEvent.change(titleInput, { target: { value: 'Modul Baru' } });
    
    // Set mock to throw error
    mockCreateModule.mockRejectedValue(new Error('API Error'));
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /simpan/i });
    fireEvent.click(submitButton);
    
    // Verifikasi error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('should close modal when cancel button is clicked', () => {
    renderWithProvider(<ModuleFormModal {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /batal/i });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
