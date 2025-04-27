'use client'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { User } from '@/types/user'
import { columnsNew } from './columns'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface PaginationProps {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

interface DataTableNewProps {
  data: User[]
  isLoading?: boolean
  pagination?: PaginationProps
}

export function DataTableNew({
  data,
  isLoading = false,
  pagination,
}: DataTableNewProps) {
  const table = useReactTable({
    data,
    columns: columnsNew,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1

  // Generate array of page numbers to display (show 5 pages at most)
  const getPageNumbers = () => {
    if (!pagination || totalPages <= 1) return []

    const currentPage = pagination.page
    const pages = []

    // Always show first page
    if (currentPage > 3) pages.push(1)

    // Show ellipsis after first page if there's a gap
    if (currentPage > 4) pages.push('ellipsis-start')

    // Calculate range of pages around current page
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Show ellipsis before last page if there's a gap
    if (currentPage < totalPages - 3) pages.push('ellipsis-end')

    // Always show last page if there are multiple pages
    if (totalPages > 1 && currentPage < totalPages) pages.push(totalPages)

    return pages
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
        <div className="grid grid-cols-12 text-xs text-slate-400 p-3 border-b border-slate-700/50 bg-slate-800/50">
          {table.getAllColumns().map((column, index) => (
            <div key={index} className={`col-span-${getColumnSpan(column.id)}`}>
              <Skeleton className="h-4 w-4/5 bg-slate-700" />
            </div>
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 py-2 px-3 text-sm hover:bg-slate-800/50 border-b border-slate-700/20"
          >
            {table.getAllColumns().map((column, index) => (
              <div
                key={index}
                className={`col-span-${getColumnSpan(column.id)}`}
              >
                <Skeleton className="h-4 w-4/5 bg-slate-700" />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 text-xs text-slate-400 p-3 border-b border-slate-700/50 bg-slate-800/50">
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className={`col-span-${getColumnSpan(header.id)}`}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </div>
            ))
          )}
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-700/30">
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-12 py-2 px-3 text-sm hover:bg-slate-800/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className={`col-span-${getColumnSpan(cell.column.id)}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-slate-500">
              Tidak ada data.
            </div>
          )}
        </div>
      </div>

      {pagination && totalPages > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-400">
            Menampilkan{' '}
            {Math.min(
              pagination.total,
              1 + (pagination.page - 1) * pagination.limit
            )}{' '}
            - {Math.min(pagination.total, pagination.page * pagination.limit)}{' '}
            dari {pagination.total} data
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Baris per halaman</span>
              <Select
                value={pagination.limit.toString()}
                onValueChange={(value) =>
                  pagination.onLimitChange(Number(value))
                }
              >
                <SelectTrigger className="h-8 w-16 bg-slate-800/50 border-slate-700/50 text-slate-200">
                  <SelectValue placeholder={pagination.limit} />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => pagination.onPageChange(pagination.page - 1)}
                    className={
                      pagination.page <= 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer text-cyan-400 hover:text-cyan-300'
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((pageNum, i) => (
                  <PaginationItem key={i}>
                    {pageNum === 'ellipsis-start' ||
                    pageNum === 'ellipsis-end' ? (
                      <div className="px-4 text-slate-400">...</div>
                    ) : (
                      <PaginationLink
                        isActive={pagination.page === pageNum}
                        onClick={() => pagination.onPageChange(Number(pageNum))}
                        className={
                          pagination.page === pageNum
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }
                      >
                        {pageNum}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => pagination.onPageChange(pagination.page + 1)}
                    className={
                      pagination.page >= totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer text-cyan-400 hover:text-cyan-300'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  )
}

// Fungsi helper untuk mendapatkan span kolom berdasarkan id kolom
function getColumnSpan(columnId: string): number {
  switch (columnId) {
    case 'id':
      return 1
    case 'email':
      return 4
    case 'name':
      return 2
    case 'role':
      return 2
    case 'status':
      return 1
    case 'createdAt':
      return 1
    case 'actions':
      return 1
    default:
      return 1
  }
}
