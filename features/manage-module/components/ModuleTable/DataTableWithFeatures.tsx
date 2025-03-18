'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from './DataTable'
import { PaginationControls } from './PaginationControls'
import { SearchAndFilter } from './SearchAndFilter'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Module } from '../../types/module'
import { getModules } from '../../services/moduleClientService'

interface PaginationMeta {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
}

interface ModuleResponse {
  data: Module[]
  meta: PaginationMeta
}

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

  // Fetch data dengan React Query
  const { data, isLoading, error } = useQuery<ModuleResponse>({
    queryKey: ['modules', queryParams],
    queryFn: () => getModules(queryParams),
  })

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
  const handleFilterChange = (status: string) => {
    setQueryParams((prev) => ({ ...prev, page: 1, status }))
  }

  // Handler untuk sorting
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setQueryParams((prev) => ({ ...prev, sortBy, sortOrder }))
  }

  // Tampilkan error jika ada
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Gagal memuat data modul: {error instanceof Error ? error.message : 'Terjadi kesalahan'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <SearchAndFilter
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
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
