'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from './UserTable/DataTable'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

function UsersPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page, limit, role, status, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      if (role && role !== 'all') params.set('role', role)
      if (status && status !== 'all') params.set('status', status)
      if (search) params.set('search', search)

      const response = await fetch(`/api/users?${params.toString()}`)
      const data = await response.json()
      return data
    },
  })

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page when changing limit
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        Error: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Daftar Pengguna</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor="search">Cari</Label>
          <Input
            id="search"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Semua Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={data?.users || []}
        isLoading={isLoading}
        pagination={{
          page,
          limit,
          total: data?.metadata?.total || 0,
          onPageChange: handlePageChange,
          onLimitChange: handleLimitChange,
        }}
      />
    </div>
  )
}

export default UsersPage
