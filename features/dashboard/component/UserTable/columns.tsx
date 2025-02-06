'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { User } from '@/types/user'
import UserRoleCell from './UserRoleCell'

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'name',
    header: 'Nama',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <UserRoleCell user={row.original} />,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status // Menggunakan row.original untuk akses langsung
      return status ? (
        <div
          className={`capitalize ${
            status === 'active' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {status}
        </div>
      ) : null
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Tanggal Bergabung',
    cell: ({ row }) => {
      const dateValue = row.original.createdAt // Menggunakan row.original untuk akses langsung
      try {
        const date =
          typeof dateValue === 'string' ? new Date(dateValue) : dateValue

        return (
          <div className="text-right">{date.toLocaleDateString('id-ID')}</div>
        )
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Terjadi kesalahan'

        return (
          <div className="text-right text-red-500">Error: {errorMessage}</div>
        )
      }
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-center">Aksi</div>,
    cell: () => (
      <div className="text-center space-x-2">
        {/* <Button variant="outline" size="sm">
          Edit
        </Button> */}
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </div>
    ),
  },
]
