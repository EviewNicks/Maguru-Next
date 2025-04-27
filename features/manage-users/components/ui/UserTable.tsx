'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTableNew } from './UserTable/DataTable'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Search, FilterX } from 'lucide-react'
import { Button } from '@/components/ui/button'

function UserTableNew() {
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

  const resetFilters = () => {
    setRole('all')
    setStatus('all')
    setSearch('')
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-md text-red-200">
        Error: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-slate-700/50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100 flex items-center">
            <Users className="mr-2 h-5 w-5 text-cyan-500" />
            User Management
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              id="search"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:ring-cyan-500/30"
            />
          </div>

          <div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger
                id="role"
                className="bg-slate-800/50 border-slate-700/50 text-slate-200 focus:ring-cyan-500/30"
              >
                <SelectValue placeholder="Semua Role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2">
            <div className="flex-grow">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger
                  id="status"
                  className="bg-slate-800/50 border-slate-700/50 text-slate-200 focus:ring-cyan-500/30"
                >
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={resetFilters}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DataTableNew
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
      </CardContent>
    </Card>
  )
}

export default UserTableNew
