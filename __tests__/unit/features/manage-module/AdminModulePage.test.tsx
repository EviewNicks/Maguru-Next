import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminModulePage from '@/app/admin/modules/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock komponen yang digunakan dalam halaman
jest.mock('@/components/layouts/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

jest.mock('@/features/manage-module/components/ModuleTable', () => {
  return function MockModuleTable() {
    return <div data-testid="module-table">Module Table</div>;
  };
});

describe('AdminModulePage', () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should render the page with correct layout', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminModulePage />
      </QueryClientProvider>
    );

    // Verifikasi bahwa komponen sidebar dan area utama untuk datatable ada
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('module-table')).toBeInTheDocument();
    expect(screen.getByText(/Manajemen Modul/i)).toBeInTheDocument();
  });

  it('should have the correct page title', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminModulePage />
      </QueryClientProvider>
    );

    // Verifikasi judul halaman
    expect(screen.getByRole('heading', { name: /Manajemen Modul/i })).toBeInTheDocument();
  });
});
