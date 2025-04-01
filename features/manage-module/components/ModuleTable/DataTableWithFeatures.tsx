'use client'

import React, { useState, useEffect } from 'react'
import { DataTable } from './DataTable'
import { PaginationControls } from './PaginationControls'
import { SearchAndFilter } from './SearchAndFilter'
import { useModuleQuery } from '../../hooks/useModuleQuery'
import { ModuleStatus } from '../../types/index'
import { handleError } from '../ErrorNotifier/ErrorNotifier'
import { toast } from 'sonner'

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
  useEffect(() => {
    if (error) {
      const errorDetails = handleError(error)
      toast.error(errorDetails.message, {
        description: errorDetails.code
      })

      // Log error hanya di lingkungan development
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error fetching modules:', errorDetails)
      }
    }
  }, [error])

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
