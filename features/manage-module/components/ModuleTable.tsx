'use client'

import { useState } from 'react'
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender,
  ColumnDef,
  SortingState
} from '@tanstack/react-table'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Edit2Icon, 
  Trash2Icon, 
  ChevronDownIcon,
  AlertCircleIcon,
  Loader2Icon
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import { Module, ModuleStatus } from '../types'
import DOMPurify from 'isomorphic-dompurify'

interface ModuleTableProps {
  modules: Module[]
  isLoading: boolean
  isError: boolean
  pagination?: {
    count: number
    hasMore: boolean
    nextCursor?: string
  }
  onLoadMore: () => void
  onEdit?: (module: Module) => void
  onDelete?: (module: Module) => void
}

export function ModuleTable({ 
  modules, 
  isLoading, 
  isError, 
  pagination, 
  onLoadMore,
  onEdit,
  onDelete
}: ModuleTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const columns: ColumnDef<Module>[] = [
    {
      accessorKey: 'title',
      header: 'Judul',
      cell: ({ row }) => {
        const title = row.getValue('title') as string
        return <span className="font-medium">{DOMPurify.sanitize(title)}</span>
      }
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
      cell: ({ row }) => {
        const description = row.getValue('description') as string | null
        if (!description) return <span className="text-muted-foreground italic">Tidak ada deskripsi</span>
        
        // Truncate description to 100 characters
        const truncated = description.length > 100 
          ? `${description.substring(0, 100)}...` 
          : description
        
        return <span>{DOMPurify.sanitize(truncated)}</span>
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as ModuleStatus
        
        return (
          <Badge variant={
            status === ModuleStatus.ACTIVE ? 'success' : 
            status === ModuleStatus.DRAFT ? 'default' : 'destructive'
          }>
            {status === ModuleStatus.ACTIVE ? 'Aktif' : 
             status === ModuleStatus.DRAFT ? 'Draft' : 'Diarsipkan'}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Tanggal Dibuat',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date
        return format(new Date(date), 'dd MMMM yyyy', { locale: id })
      }
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const module = row.original
        
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onEdit?.(module)}
              className="h-8 w-8"
            >
              <Edit2Icon className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onDelete?.(module)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2Icon className="h-4 w-4" />
              <span className="sr-only">Hapus</span>
            </Button>
          </div>
        )
      }
    }
  ]

  const table = useReactTable({
    data: modules,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  })

  // Virtualisasi untuk performa dengan dataset besar
  const { rows } = table.getRowModel()
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 50, // perkiraan tinggi baris
    overscan: 10,
  })

  if (isError) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <AlertCircleIcon className="h-10 w-10 text-destructive" />
          <h3 className="text-lg font-semibold">Gagal memuat data</h3>
          <p className="text-muted-foreground">
            Terjadi kesalahan saat memuat data modul. Silakan coba lagi nanti.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading && modules.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
          <h3 className="text-lg font-semibold">Memuat data...</h3>
          <p className="text-muted-foreground">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    )
  }

  if (modules.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <h3 className="text-lg font-semibold">Tidak ada modul</h3>
          <p className="text-muted-foreground">
            Belum ada modul yang tersedia. Silakan tambahkan modul baru.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <div 
        ref={tableContainerRef} 
        className="relative overflow-auto max-h-[600px]"
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
                  data-state={row.getIsSelected() && "selected"}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="absolute w-full"
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
        <div className="p-4 border-t flex justify-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
            Muat Lebih Banyak
          </Button>
        </div>
      )}
    </div>
  )
}
