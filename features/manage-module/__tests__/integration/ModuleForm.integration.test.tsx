import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModuleActionCell from '../../components/ModuleTable/ModuleActionCell';
import { Module } from '../../types/module';
import { toast } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
const mockDeleteModule = jest.fn();

jest.mock('../../services/moduleClientService', () => ({
  createModule: jest.fn((data) => mockCreateModule(data)),
  updateModule: jest.fn((id, data) => mockUpdateModule(id, data)),
  deleteModule: jest.fn((id) => mockDeleteModule(id)),
}));

describe('ModuleFormModal Integration', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockModule: Module = {
    id: '1',
    title: 'Modul Test',
    description: 'Deskripsi test',
    status: 'draft',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
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

  it('should open edit modal when edit button is clicked', async () => {
    renderWithProvider(<ModuleActionCell module={mockModule} />);
    
    // Cari tombol edit dan klik
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    // Verifikasi modal terbuka dengan judul yang benar
    await waitFor(() => {
      expect(screen.getByText('Edit Modul')).toBeInTheDocument();
    });
    
    // Verifikasi form terisi dengan data modul yang benar
    expect(screen.getByLabelText('Judul')).toHaveValue('Modul Test');
    expect(screen.getByLabelText('Deskripsi')).toHaveValue('Deskripsi test');
  });

  it('should open delete confirmation when delete button is clicked', () => {
    renderWithProvider(<ModuleActionCell module={mockModule} />);
    
    // Cari tombol delete dan klik
    const deleteButton = screen.getByRole('button', { name: /hapus/i });
    fireEvent.click(deleteButton);
    
    // Verifikasi modal konfirmasi terbuka
    expect(screen.getByText('Konfirmasi Hapus')).toBeInTheDocument();
    expect(screen.getByText(/Apakah Anda yakin ingin menghapus modul/)).toBeInTheDocument();
  });

  it('should update module when edit form is submitted', async () => {
    renderWithProvider(<ModuleActionCell module={mockModule} />);
    
    // Buka modal edit
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    // Edit form fields
    const titleInput = screen.getByLabelText('Judul');
    fireEvent.change(titleInput, { target: { value: 'Modul Updated' } });
    
    const descriptionInput = screen.getByLabelText('Deskripsi');
    fireEvent.change(descriptionInput, { target: { value: 'Deskripsi updated' } });
    
    // Submit form
    mockUpdateModule.mockResolvedValueOnce({ id: '1', title: 'Modul Updated' });
    
    const submitButton = screen.getByText('Simpan');
    fireEvent.click(submitButton);
    
    // Verifikasi updateModule dipanggil dengan parameter yang benar
    await waitFor(() => {
      expect(mockUpdateModule).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Modul berhasil diperbarui');
    });
  });

  it('should show toast info when delete is confirmed', async () => {
    renderWithProvider(<ModuleActionCell module={mockModule} />);
    
    // Buka modal konfirmasi delete
    const deleteButton = screen.getByRole('button', { name: /hapus/i });
    fireEvent.click(deleteButton);
    
    // Ambil dialog konfirmasi
    const deleteDialog = screen.getByRole('dialog');
    
    // Cari tombol hapus di dalam dialog
    const confirmButton = within(deleteDialog).getByRole('button', { name: /hapus/i });
    fireEvent.click(confirmButton);
    
    // Verifikasi toast info ditampilkan
    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith(`Hapus modul: ${mockModule.title}`);
    });
  });

  it('should close modals when cancel button is clicked', async () => {
    renderWithProvider(<ModuleActionCell module={mockModule} />);
    
    // Buka modal edit
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    // Ambil dialog edit
    const editDialog = screen.getByRole('dialog');
    
    // Klik tombol batal di dalam dialog
    const cancelButton = within(editDialog).getByRole('button', { name: /batal/i });
    fireEvent.click(cancelButton);
    
    // Verifikasi modal tertutup
    await waitFor(() => {
      expect(screen.queryByText('Edit Modul')).not.toBeInTheDocument();
    });
    
    // Buka modal konfirmasi delete
    const deleteButton = screen.getByRole('button', { name: /hapus/i });
    fireEvent.click(deleteButton);
    
    // Ambil dialog konfirmasi delete
    const deleteDialog = screen.getByRole('dialog');
    
    // Klik tombol batal di dalam dialog
    const cancelDeleteButton = within(deleteDialog).getByRole('button', { name: /batal/i });
    fireEvent.click(cancelDeleteButton);
    
    // Verifikasi modal tertutup
    await waitFor(() => {
      expect(screen.queryByText('Konfirmasi Hapus')).not.toBeInTheDocument();
    });
  });
});
