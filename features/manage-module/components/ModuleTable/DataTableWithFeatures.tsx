'use client'

import React, { useState } from 'react'
import { DataTable } from './DataTable'
import { PaginationControls } from './PaginationControls'
import { SearchAndFilter } from './SearchAndFilter'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useModuleQuery } from '../../hooks/useModuleQuery'
import { ModuleStatus } from '../../types/index'

export function DataTableWithFeatures() {
  // State untuk parameter query
  const [queryParams, setQueryParams] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    status: '',
    sortBy: '',
    sortOrder: '' as 'asc' | 'desc' | '',
  })

  // Fetch data dengan useModuleQuery
  const { useModuleListQuery } = useModuleQuery({
    page: queryParams.page,
    pageSize: queryParams.pageSize,
    search: queryParams.search,
    status: queryParams.status as ModuleStatus,
    sortBy: queryParams.sortBy,
    sortOrder: queryParams.sortOrder,
  })

  const { data, isLoading, error } = useModuleListQuery

  // Handler untuk perubahan halaman
  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }))
  }

  // Handler untuk perubahan ukuran halaman
  const handlePageSizeChange = (pageSize: number) => {
    setQueryParams((prev) => ({ ...prev, page: 1, pageSize }))
  }

  // Handler untuk pencarian
  const handleSearch = (search: string) => {
    setQueryParams((prev) => ({ ...prev, page: 1, search }))
  }

  // Handler untuk filter status
  const handleStatusFilter = (status: string) => {
    setQueryParams((prev) => ({ ...prev, page: 1, status }))
  }

  // Handler untuk sorting
  const handleSortChange = (column: string, direction: 'asc' | 'desc' | '') => {
    setQueryParams((prev) => ({ 
      ...prev, 
      page: 1, 
      sortBy: column, 
      sortOrder: direction 
    }))
  }

  // Tampilkan error jika terjadi
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <SearchAndFilter 
        onSearch={handleSearch}
        onFilterChange={handleStatusFilter}
        searchValue={queryParams.search}
        statusFilter={queryParams.status}
      />
      <DataTable 
        data={data?.data || []} 
        isLoading={isLoading}
        onSortChange={handleSortChange}
        sortBy={queryParams.sortBy}
        sortOrder={queryParams.sortOrder}
      />
      {data?.meta && (
        <PaginationControls 
          currentPage={data.meta.currentPage}
          totalPages={data.meta.totalPages}
          pageSize={data.meta.pageSize}
          totalItems={data.meta.totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  )
}
