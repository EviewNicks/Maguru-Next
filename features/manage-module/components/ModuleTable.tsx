'use client'

import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Edit, Trash2, Plus, ArrowUpDown, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import DOMPurify from 'dompurify'
import { Module, ModuleStatus } from '../types'
import { ModuleFilter } from './ModuleFilter'
import { useModules } from '../hooks/useModules'
import { ModuleFormModal } from './ModuleFormModal'
import { DeleteModuleDialog } from './DeleteModuleDialog'
import { Badge } from '@/components/ui/badge'

export function ModuleTable() {
  // State untuk filter, sorting, dan pagination
  const [filter, setFilter] = useState({
    status: undefined as ModuleStatus | undefined,
    search: '',
    limit: 10,
    cursor: undefined as string | undefined,
  })
  
  const [sorting, setSorting] = useState<SortingState>([])
  
  // State untuk modal dan dialog
  const [selectedModule, setSelectedModule] = useState<Module | undefined>(undefined)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Fetch data menggunakan React Query
  const { data, isLoading, isError, error, fetchNextPage, isFetchingNextPage } = useModules(filter)
  
  // Referensi untuk virtual scrolling
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  
  // Definisi kolom tabel
  const columns = [
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Judul
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const title = row.getValue('title') as string
        const sanitizedTitle = DOMPurify.sanitize(title)
        return <div dangerouslySetInnerHTML={{ __html: sanitizedTitle }} />
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as ModuleStatus
        
        let badgeVariant: 'default' | 'secondary' | 'outline'
        let badgeText: string
        
        switch (status) {
          case ModuleStatus.ACTIVE:
            badgeVariant = 'default'
            badgeText = 'Aktif'
            break
          case ModuleStatus.DRAFT:
            badgeVariant = 'secondary'
            badgeText = 'Draft'
            break
          case ModuleStatus.ARCHIVED:
            badgeVariant = 'outline'
            badgeText = 'Diarsipkan'
            break
          default:
            badgeVariant = 'outline'
            badgeText = 'Unknown'
        }
        
        return <Badge variant={badgeVariant}>{badgeText}</Badge>
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Terakhir Diperbarui
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('updatedAt'))
        return format(date, 'PPpp', { locale: id })
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const module = row.original
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedModule(module)
                setIsFormModalOpen(true)
              }}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedModule(module)
                setIsDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )
      },
    },
  ]
  
  // Setup tabel dengan tanstack/react-table
  const table = useReactTable({
    data: data?.modules || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })
  
  // Setup virtual scrolling dengan tanstack/react-virtual
  const { rows } = table.getRowModel()
  
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 50, // estimasi tinggi baris
    overscan: 10,
  })
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Memuat data modul...</span>
      </div>
    )
  }
  
  // Render error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-64 text-destructive">
        <p>Error: {error?.message || 'Terjadi kesalahan saat memuat data'}</p>
      </div>
    )
  }
  
  // Handle filter changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
  }
  
  // Handle load more
  const handleLoadMore = () => {
    if (data?.pagination.hasMore) {
      const newFilter = {
        ...filter,
        cursor: data.pagination.nextCursor,
      }
      setFilter(newFilter)
      fetchNextPage()
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ModuleFilter filter={filter} onFilterChange={handleFilterChange} />
        
        <Button
          onClick={() => {
            setSelectedModule(undefined)
            setIsFormModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Modul
        </Button>
      </div>
      
      <div
        ref={tableContainerRef}
        className="rounded-md border h-[500px] overflow-auto"
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      
      {data?.pagination.hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Muat Lebih Banyak
          </Button>
        </div>
      )}
      
      {/* Modal untuk tambah/edit modul */}
      {isFormModalOpen && (
        <ModuleFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          module={selectedModule}
        />
      )}
      
      {/* Dialog konfirmasi hapus */}
      {isDeleteDialogOpen && selectedModule && (
        <DeleteModuleDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          module={selectedModule}
        />
      )}
    </div>
  )
}
