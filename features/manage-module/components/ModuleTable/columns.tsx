'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import DOMPurify from 'dompurify'
import { Module, ModuleStatus } from '../../types'
import ModuleActionCell from './ModuleActionCell'

export const columns: ColumnDef<Module>[] = [
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
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => <ModuleActionCell module={row.original} />,
  },
]
