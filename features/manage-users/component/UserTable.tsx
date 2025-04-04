'use client'

import { useQuery } from '@tanstack/react-query'
import { DataTable } from './UserTable/DataTable'

function UsersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users')
      const data = await response.json()
      return data.users
    },
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div>
        Error: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Daftar Pengguna</h1>
      <DataTable data={data || []} isLoading={isLoading} />
    </div>
  )
}

export default UsersPage
