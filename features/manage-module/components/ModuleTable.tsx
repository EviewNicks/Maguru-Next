'use client'

import { useState } from 'react'
import { SortingState } from '@tanstack/react-table'
import { DataTable } from './ModuleTable/DataTable'
import { FilterType } from '../types'
import { ModuleFormModal } from './ModuleFormModal'
import { ModuleTableProps } from '../types'



export function ModuleTable({
  modules,
  isLoading,
  isError,
  pagination,
  onLoadMore,
}: ModuleTableProps) {
  // State untuk filter, sorting, dan pagination
  const [filter, setFilter] = useState<FilterType>({
    status: undefined,
    search: '',
    limit: 10,
    cursor: undefined,
  })
  
  const [sorting, setSorting] = useState<SortingState>([])
  
  // State untuk modal tambah modul
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  // Handle load more
  const handleLoadMore = () => {
    if (pagination?.hasMore) {
      const newFilter = {
        ...filter,
        cursor: pagination.nextCursor,
      }
      setFilter(newFilter)
      onLoadMore()
    }
  }
  
  return (
    <div className="space-y-4">
      
      <DataTable 
        data={modules} 
        isLoading={isLoading} 
        isError={isError} 
        pagination={pagination}
        onLoadMore={handleLoadMore}
        sorting={sorting}
        onSortingChange={setSorting}
      />
      
      {/* Modal untuk tambah modul baru */}
      {isAddModalOpen && (
        <ModuleFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          module={undefined}
        />
      )}
    </div>
  )
}
