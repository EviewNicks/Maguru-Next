// UserTable.tsx
'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchUsers } from '@/store/features/userSlice'
import { DataTable } from './UserTable/DataTable'

function UsersPage() {
  const dispatch = useAppDispatch()
  const { data: users, loading, error } = useAppSelector((state) => state.users)

  useEffect(() => {
  dispatch(fetchUsers()
  }, [dispatch])

  console.log('Users dari Redux:', users)

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Daftar Pengguna</h1>
      <DataTable data={users} isLoading={loading} />
    </div>
  )
}

export default UsersPage
