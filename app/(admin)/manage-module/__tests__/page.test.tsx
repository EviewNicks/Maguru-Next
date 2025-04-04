import { render, screen } from '@testing-library/react'
import ModuleManagementPage from '../page'

// Mock untuk ModuleTable component
jest.mock('@/features/manage-module/components/ModuleTable', () => ({
  ModuleTable: () => (
    <div data-testid="mock-module-table">Mocked Module Table</div>
  ),
}))

describe('ModuleManagementPage', () => {
  it('should render the page with correct title and description', () => {
    render(<ModuleManagementPage />)

    // Verify title is rendered
    expect(screen.getByText('Manajemen Modul')).toBeInTheDocument()

    // Verify description is rendered
    expect(
      screen.getByText(
        'Kelola modul akademik dengan mudah. Tambahkan, edit, dan hapus modul sesuai kebutuhan.'
      )
    ).toBeInTheDocument()
  })

  it('should render the ModuleTable component', () => {
    render(<ModuleManagementPage />)

    // Verify ModuleTable is rendered
    expect(screen.getByTestId('mock-module-table')).toBeInTheDocument()
  })
})
