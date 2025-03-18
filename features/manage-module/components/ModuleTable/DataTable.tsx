'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnFiltersState,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  OnChangeFn,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Module } from '../../types/module'
import { columns } from './columns'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useRef, useState } from 'react'

interface DataTableProps {
  data: Module[]
  isLoading?: boolean
  onSortChange?: (column: string, direction: 'asc' | 'desc') => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc' | ''
}

export function DataTable({ 
  data, 
  isLoading = false,
  onSortChange,
  sortBy = '',
  sortOrder = '',
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  
  // Sinkronkan state sorting internal dengan props
  useEffect(() => {
    if (sortBy && sortOrder) {
      setSorting([{ id: sortBy, desc: sortOrder === 'desc' }])
    } else {
      setSorting([])
    }
  }, [sortBy, sortOrder])

  // Handler untuk perubahan sorting internal
  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    // Konversi updater function atau nilai langsung menjadi nilai baru
    const updatedSorting = typeof updaterOrValue === 'function' 
      ? updaterOrValue(sorting) 
      : updaterOrValue
    
    setSorting(updatedSorting)
    
    // Jika ada handler onSortChange dan ada sorting yang aktif
    if (onSortChange && updatedSorting.length > 0) {
      const { id, desc } = updatedSorting[0]
      onSortChange(id, desc ? 'desc' : 'asc')
    } else if (onSortChange && updatedSorting.length === 0) {
      // Reset sorting
      onSortChange('', '' as 'asc' | 'desc')
    }
  }
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: handleSortingChange,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  // Referensi untuk container tabel
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Implementasi virtual scrolling
  const { rows } = table.getRowModel()
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 50, // Perkiraan tinggi baris dalam piksel
    overscan: 10, // Jumlah baris tambahan yang di-render di luar viewport
  })

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    <Skeleton data-testid="skeleton" className="h-4 w-[100px]" />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                {Array.from({ length: columns.length }).map((_, cellIdx) => (
                  <TableCell key={cellIdx}>
                    <Skeleton data-testid="skeleton" className="h-4 w-[100px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div 
        ref={tableContainerRef} 
        className="max-h-[600px] overflow-auto"
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = rows[virtualRow.index]
                  return (
                    <TableRow
                      key={row.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
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
              </div>
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Belum ada data modul
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
