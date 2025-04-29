import React from 'react'
import { User } from '@/types/user'

// Tipe untuk pagination props
interface PaginationProps {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

// Tipe untuk props DataTableMock
interface DataTableMockProps {
  data: User[]
  isLoading: boolean
  pagination?: PaginationProps
}

// Mock untuk DataTable yang memastikan table memiliki role="table"
export const DataTableMock = ({
  data,
  isLoading,
  pagination,
}: DataTableMockProps) => {
  // Selalu render tabel dengan data, bahkan jika data kosong atau loading
  // Ini untuk memastikan tabel selalu dapat ditemukan dalam test
  return (
    <div>
      <table role="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5}>Loading...</td>
            </tr>
          ) : !data || data.length === 0 ? (
            <tr>
              <td colSpan={5}>No data found</td>
            </tr>
          ) : (
            data.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {pagination && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            aria-label="previous"
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of{' '}
            {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            disabled={pagination.page * pagination.limit >= pagination.total}
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            aria-label="next"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
