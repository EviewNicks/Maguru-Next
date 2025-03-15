'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModuleStatus, type Module } from '../../types'
import ModuleActionCell from './ModuleActionCell'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import DOMPurify from 'dompurify'

export const columns: ColumnDef<Module, unknown>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nama Modul
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const title = row.getValue('title') as string
      return <span>{DOMPurify.sanitize(title)}</span>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as ModuleStatus

      const statusMap: Record<ModuleStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
        [ModuleStatus.ACTIVE]: { label: 'Aktif', variant: 'default' },
        [ModuleStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
        [ModuleStatus.ARCHIVED]: { label: 'Diarsipkan', variant: 'outline' },
      }

      const { label, variant } = statusMap[status]

      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Dibuat Pada',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return format(date, 'PPpp', { locale: id })
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ModuleActionCell module={row.original} />,
  },
]
