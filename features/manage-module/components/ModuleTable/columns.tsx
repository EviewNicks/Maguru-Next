'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Module } from '../../types/module'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import DOMPurify from 'isomorphic-dompurify'
import ModuleActionCell from './ModuleActionCell'
import ModuleDescriptionCell from './ModuleDescriptionCell'

export const columns: ColumnDef<Module>[] = [
  {
    accessorKey: 'title',
    header: 'Judul',
    cell: ({ row }) => {
      const title = row.original.title
      // Sanitasi judul untuk mencegah XSS
      const sanitizedTitle = DOMPurify.sanitize(title)
      return <div dangerouslySetInnerHTML={{ __html: sanitizedTitle }} />
    },
  },
  {
    accessorKey: 'description',
    header: 'Deskripsi',
    cell: ({ row }) => <ModuleDescriptionCell module={row.original} />,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge
          variant={
            status === 'published'
              ? 'default'
              : status === 'draft'
              ? 'outline'
              : 'destructive'
          }
        >
          {status === 'published'
            ? 'Dipublikasikan'
            : status === 'draft'
            ? 'Draft'
            : 'Diarsipkan'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Tanggal Dibuat',
    cell: ({ row }) => {
      const dateValue = row.original.createdAt
      try {
        const date =
          typeof dateValue === 'string' ? new Date(dateValue) : dateValue

        return (
          <div>
            {format(date, 'dd MMMM yyyy', { locale: id })}
          </div>
        )
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Terjadi kesalahan'

        return (
          <div className="text-red-500">Error: {errorMessage}</div>
        )
      }
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => <ModuleActionCell module={row.original} />,
  },
]
