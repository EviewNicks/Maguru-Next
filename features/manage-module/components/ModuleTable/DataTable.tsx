'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { columns } from './columns'
import { type Module } from '../../types'

interface DataTableProps {
  data: Module[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
}

export function DataTable({
  data,
  isLoading,
  hasMore,
  onLoadMore,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  const { rows } = table.getRowModel()
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 45,
    overscan: 10,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 data-testid="loading-spinner" className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Memuat data modul...</span>
      </div>
    )
  }

  return (
    <div>
      <div
        ref={tableContainerRef}
        className="virtual-table relative overflow-auto border rounded-md h-[calc(100vh-300px)]"
      >
        <table className="w-full">
          <thead className="sticky top-0 bg-background">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="border-b px-4 py-3 text-left align-middle font-medium text-muted-foreground"
                    data-testid={`header-${header.id}`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const row = rows[virtualRow.index]
              return (
                <tr key={row.id} data-testid="table-row">
                  {row.getVisibleCells().map(cell => {
                    const content = flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )
                    return (
                      <td
                        key={cell.id}
                        className="border-b px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0"
                        data-testid={`cell-${cell.column.id}`}
                      >
                        {content}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button onClick={onLoadMore}>
            Muat Lebih Banyak
          </Button>
        </div>
      )}
    </div>
  )
}
