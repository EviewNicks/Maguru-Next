'use client'

import React, { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  Row,
  Column,
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
import { Edit, Trash2, Plus, ArrowUpDown, Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import DOMPurify from 'dompurify'
import { Module, ModuleStatus,  FilterType, Pagination } from '../types'
import { ModuleFilter } from './ModuleFilter'
import { ModuleFormModal } from './ModuleFormModal'
import { DeleteModuleDialog } from './DeleteModuleDialog'
import { Badge } from '@/components/ui/badge'

interface ModuleTableProps {
  modules: Module[]
  isLoading: boolean
  isError: boolean
  pagination?: Pagination
  onLoadMore: () => void
}

export function ModuleTable({
  modules,
  isLoading,
  isError,
  pagination,
  onLoadMore,
}: ModuleTableProps) {
  // State untuk filter, sorting, dan pagination
  const [filter, setFilter] = useState<FilterType>({
    status: undefined,
    search: '',
    limit: 10,
    cursor: undefined,
  })
  
  const [sorting, setSorting] = useState<SortingState>([])
  
  // State untuk modal dan dialog
  const [selectedModule, setSelectedModule] = useState<Module | undefined>(undefined)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Referensi untuk virtual scrolling
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  
  // Definisi kolom tabel
  const columns = [
    {
      accessorKey: 'title',
      header: ({ column }: { column: Column<Module> }) => {
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
      cell: ({ row }: { row: Row<Module> }) => {
        const title = row.getValue('title') as string
        const sanitizedTitle = DOMPurify.sanitize(title)
        return <div dangerouslySetInnerHTML={{ __html: sanitizedTitle }} />
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: Row<Module> }) => {
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
      header: ({ column }: { column: Column<Module> }) => {
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
      cell: ({ row }: { row: Row<Module> }) => {
        const date = new Date(row.getValue('updatedAt'))
        return format(date, 'PPpp', { locale: id })
      },
    },
    {
      id: 'actions',
      cell: ({ row }: { row: Row<Module> }) => {
        const currentModule = row.original
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedModule(currentModule)
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
                setSelectedModule(currentModule)
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
    data: modules,
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
      <div className="flex flex-col justify-center items-center h-64">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive text-center">
          Terjadi kesalahan saat memuat data modul. Silakan coba lagi nanti.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Muat Ulang
        </Button>
      </div>
    )
  }
  
  // Handle filter changes
  const handleFilterChange = (newFilter: FilterType) => {
    // Pastikan status memiliki nilai yang valid
    setFilter({
      ...newFilter,
      status: newFilter.status || ModuleStatus.ACTIVE, // Mengatur default jika status tidak ada
      cursor: newFilter.cursor || undefined, // Mengatur cursor
    });
  }
  
  // Handle load more
  const handleLoadMore = () => {
    if (pagination?.hasMore) {
      const newFilter = {
        ...filter,
        cursor: pagination.nextCursor,
      }
      setFilter(newFilter)
      onLoadMore()
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
      
      {pagination?.hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleLoadMore}
            disabled={false}
            variant="outline"
          >
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
