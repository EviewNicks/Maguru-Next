import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminModulePage from './page'

// Mock komponen yang digunakan dalam halaman
jest.mock('@/components/layouts/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>
  }
})

jest.mock('@/features/manage-module/components/ModuleTable', () => {
  return function MockModuleTable() {
    return <div data-testid="module-table">Module Table</div>
  }
})

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('AdminModulePage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  it('should render the page with correct layout', () => {
    render(<AdminModulePage />)

    // Verifikasi bahwa komponen sidebar dan area utama untuk datatable ada
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('module-table')).toBeInTheDocument()
    expect(screen.getByText(/Manajemen Modul/i)).toBeInTheDocument()
  })

  it('should have the correct page title', () => {
    render(<AdminModulePage />)

    // Verifikasi judul halaman
    expect(screen.getByRole('heading', { name: /Manajemen Modul/i })).toBeInTheDocument()
  })
})
