import { render, screen, fireEvent } from '@testing-library/react'
import { columns } from './columns'
import { ModuleStatus, type Module } from '../../types'
import type { HeaderContext, CellContext, ColumnDef, SortDirection } from '@tanstack/react-table'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import DOMPurify from 'dompurify'

// Mock DOMPurify
jest.mock('dompurify', () => ({
  sanitize: jest.fn((str: string) => str),
}))

// Mock komponen UI dari shadcn
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="button" onClick={onClick}>{children}</button>
  ),
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>{children}</span>
  ),
}))

// Mock ModuleActionCell
jest.mock('./ModuleActionCell', () => {
  const ModuleActionCell = () => <div data-testid="module-action-cell">Action Cell</div>
  return ModuleActionCell
})

describe('columns', () => {
  // Mock router
  const createRouter = (pathname = '') => ({
    back: jest.fn(),
    forward: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    pathname,
  })

  // Setup wrapper dengan router
  const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
    <AppRouterContext.Provider value={createRouter()}>
      {children}
    </AppRouterContext.Provider>
  )

  const mockHeaderContext = {
    column: {
      getIsSorted: jest.fn<SortDirection | false, []>(),
      toggleSorting: jest.fn(),
    },
  } as unknown as HeaderContext<Module, unknown>

  const mockModule: Module = {
    id: '1',
    title: 'Test Module',
    description: 'Test Description',
    status: ModuleStatus.ACTIVE,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const createMockCellContext = (value: unknown): CellContext<Module, unknown> => ({
    getValue: () => value,
    row: {
      getValue: (key: string) => {
        if (key === 'status') return value
        if (key === 'title') return mockModule.title
        if (key === 'createdAt') return mockModule.createdAt
        return mockModule[key as keyof Module]
      },
      original: mockModule,
    },
    table: {
      options: {
        meta: {},
      },
    },
  } as CellContext<Module, unknown>)

  describe('Kolom Judul', () => {
    const titleColumn = columns.find(col => 'accessorKey' in col && col.accessorKey === 'title') as ColumnDef<Module, unknown>

    it('memiliki header dengan tombol sorting', () => {
      const header = titleColumn.header as (props: HeaderContext<Module, unknown>) => React.ReactNode
      const headerElement = header(mockHeaderContext)
      const { container } = render(headerElement as React.ReactElement)
      
      expect(container.textContent).toContain('Nama Modul')
      expect(screen.getByTestId('button')).toBeInTheDocument()
    })

    it('memanggil toggleSorting dengan nilai yang benar saat tombol diklik', () => {
      const mockGetIsSorted = jest.fn<SortDirection | false, []>().mockReturnValue('asc')
      mockHeaderContext.column.getIsSorted = mockGetIsSorted
      
      const header = titleColumn.header as (props: HeaderContext<Module, unknown>) => React.ReactNode
      const headerElement = header(mockHeaderContext)
      render(headerElement as React.ReactElement)
      
      fireEvent.click(screen.getByTestId('button'))
      expect(mockHeaderContext.column.toggleSorting).toHaveBeenCalledWith(true)
    })

    it('melakukan sanitasi pada title', () => {
      const cell = titleColumn.cell as (props: CellContext<Module, unknown>) => React.ReactNode
      const cellElement = cell(createMockCellContext(null))
      render(cellElement as React.ReactElement)
      
      expect(DOMPurify.sanitize).toHaveBeenCalledWith('Test Module')
    })
  })

  describe('Kolom Status', () => {
    const statusColumn = columns.find(col => 'accessorKey' in col && col.accessorKey === 'status') as ColumnDef<Module, unknown>

    it('menampilkan badge dengan variant yang benar untuk status ACTIVE', () => {
      const cell = statusColumn.cell as (props: CellContext<Module, unknown>) => React.ReactNode
      const cellElement = cell(createMockCellContext(ModuleStatus.ACTIVE))
      render(cellElement as React.ReactElement)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('data-variant', 'default')
      expect(badge).toHaveTextContent('Aktif')
    })

    it('menampilkan badge dengan variant yang benar untuk status DRAFT', () => {
      const cell = statusColumn.cell as (props: CellContext<Module, unknown>) => React.ReactNode
      const cellElement = cell(createMockCellContext(ModuleStatus.DRAFT))
      render(cellElement as React.ReactElement)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('data-variant', 'secondary')
      expect(badge).toHaveTextContent('Draft')
    })

    it('menampilkan badge dengan variant yang benar untuk status ARCHIVED', () => {
      const cell = statusColumn.cell as (props: CellContext<Module, unknown>) => React.ReactNode
      const cellElement = cell(createMockCellContext(ModuleStatus.ARCHIVED))
      render(cellElement as React.ReactElement)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('data-variant', 'outline')
      expect(badge).toHaveTextContent('Diarsipkan')
    })
  })

  describe('Kolom Actions', () => {
    const actionsColumn = columns.find(col => col.id === 'actions') as ColumnDef<Module, unknown>

    it('merender ModuleActionCell dengan benar', () => {
      const cell = actionsColumn.cell as (props: CellContext<Module, unknown>) => React.ReactNode
      const cellElement = cell(createMockCellContext(null))
      render(
        <RouterWrapper>
          {cellElement as React.ReactElement}
        </RouterWrapper>
      )
      
      expect(screen.getByTestId('module-action-cell')).toBeInTheDocument()
    })
  })
})
