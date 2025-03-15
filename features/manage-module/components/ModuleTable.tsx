'use client'

import { useState } from 'react'
import { DataTable } from './ModuleTable/DataTable'
import { FilterType } from '../types'
import { ModuleFormModal } from './ModuleFormModal'
import { ModuleTableProps } from '../types'
import { Button } from '@/components/ui/button'
import { ModuleFilter } from './ModuleFilter'
import { Loader2, AlertCircle } from 'lucide-react'

export function ModuleTable({
  modules,
  isLoading,
  isError,
  pagination,
  onLoadMore,
}: ModuleTableProps) {
  // State untuk filter dan pagination
  const [filter, setFilter] = useState<FilterType>({
    status: undefined,
    search: '',
    limit: 10,
    cursor: undefined,
  })
  
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 data-testid="loading-spinner" className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Memuat data modul...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive text-center">
          Terjadi kesalahan saat memuat data modul. Silakan coba lagi nanti.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Muat Ulang
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ModuleFilter 
          filter={filter} 
          onFilterChange={setFilter} 
        />
        <Button onClick={() => setIsAddModalOpen(true)}>Tambah Modul</Button>
      </div>
      
      <DataTable 
        data={modules} 
        isLoading={isLoading} 
        hasMore={pagination?.hasMore || false}
        onLoadMore={handleLoadMore}
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
