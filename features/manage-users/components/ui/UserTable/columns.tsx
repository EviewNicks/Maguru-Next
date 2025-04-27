'use client'
import { ColumnDef } from '@tanstack/react-table'
import { User } from '@/types/user'
import { UserRoleCellNew } from './UserRoleCell'
import { UserActionCellNew } from './UserActionCell'
import { Badge } from '@/components/ui/badge'

export const columnsNew: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      return <div className="text-slate-500">{row.original.id.slice(0, 6)}</div>
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      return <div className="text-slate-300">{row.original.email}</div>
    },
  },
  {
    accessorKey: 'name',
    header: 'Nama',
    cell: ({ row }) => {
      return <div className="text-cyan-300">{row.original.name}</div>
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <UserRoleCellNew user={row.original} />,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status

      // Definisikan konfigurasi badge berdasarkan status
      const statusConfig: Record<string, { color: string; text: string }> = {
        active: {
          color: 'green',
          text: 'Active',
        },
        inactive: {
          color: 'red',
          text: 'Inactive',
        },
        pending: {
          color: 'amber',
          text: 'Pending',
        },
      }

      const config = status
        ? statusConfig[status]
        : { color: 'slate', text: 'Unknown' }

      return status ? (
        <Badge
          variant="outline"
          className={` bg-${config.color}-500/10 text-${config.color}-400 border-${config.color}-500/30 text-xs`}
        >
          {config.text}
        </Badge>
      ) : null
    },
    size: 150,
  },
  {
    accessorKey: 'createdAt',
    header: 'Tanggal',
    cell: ({ row }) => {
      const dateValue = row.original.createdAt
      try {
        const date =
          typeof dateValue === 'string' ? new Date(dateValue) : dateValue

        return (
          <div className="text-purple-400">
            {date.toLocaleDateString('id-ID')}
          </div>
        )
      } catch {
        return <div className="text-red-500">Error!</div>
      }
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => <UserActionCellNew user={row.original} />,
  },
]
