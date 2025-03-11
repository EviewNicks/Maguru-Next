'use client'

import { useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
  OnChangeFn,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, AlertCircle } from 'lucide-react'
import { Module, Pagination } from '../../types'
import { columns } from './columns'

interface DataTableProps {
  data: Module[]
  isLoading: boolean
  isError: boolean
  pagination?: Pagination
  onLoadMore: () => void
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
}

export function DataTable({
  data,
  isLoading,
  isError,
  pagination,
  onLoadMore,
  sorting,
  onSortingChange,
}: DataTableProps) {
  // Referensi untuk virtual scrolling
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Setup tabel dengan tanstack/react-table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange,
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

  // Render skeleton loading state
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    <Skeleton className="h-4 w-[100px]" />
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
                    <Skeleton className="h-4 w-[100px]" />
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
    <div className="space-y-4">
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
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data modul.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {pagination?.hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
          >
            Muat Lebih Banyak
          </Button>
        </div>
      )}
    </div>
  )
}
