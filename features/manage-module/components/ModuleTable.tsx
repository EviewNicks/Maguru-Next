'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  BookText,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useModuleQuery } from '@/features/manage-module/hooks/useModuleQuery'
import { ModuleStatus, Module } from '@/features/manage-module/types'
import ModuleFormModal from './ModuleTable/ModuleFormModal'
import { Skeleton } from '@/components/ui/skeleton'
import ModuleActionCell from './ModuleTable/ModuleActionCell'
import { showErrorNotification } from './ErrorNotifier'
import ModuleDescriptionCell from './ModuleTable/ModuleDescriptionCell'

export function ModuleTable() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeView, setActiveView] = useState<'table' | 'card'>('table')
  const [searchInputValue, setSearchInputValue] = useState('')

  // State untuk parameter query
  const [queryParams, setQueryParams] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    status: 'all' as string,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  })

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInputValue !== queryParams.search) {
        setQueryParams((prev) => ({
          ...prev,
          page: 1,
          search: searchInputValue,
        }))
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInputValue, queryParams.search])

  // Konversi status untuk API
  const getStatusFilter = (): ModuleStatus | undefined => {
    switch (queryParams.status) {
      case 'active':
        return ModuleStatus.ACTIVE
      case 'draft':
        return ModuleStatus.DRAFT
      case 'archived':
        return ModuleStatus.ARCHIVED
      case 'all':
      default:
        return undefined
    }
  }

  // Fetch data menggunakan hook
  const { useModuleListQuery } = useModuleQuery({
    page: queryParams.page,
    pageSize: queryParams.pageSize,
    search: queryParams.search,
    status: getStatusFilter(),
    sortBy: queryParams.sortBy,
    sortOrder: queryParams.sortOrder,
  })

  const { data, isLoading, error } = useModuleListQuery

  // Handler untuk filter status
  const handleStatusFilter = (status: string) => {
    setQueryParams((prev) => ({ ...prev, page: 1, status }))
  }

  // Handler untuk perubahan halaman
  const handlePageChange = (newPage: number) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }))
  }

  // Handler untuk perubahan ukuran halaman
  const handlePageSizeChange = (newSize: number) => {
    setQueryParams((prev) => ({ ...prev, page: 1, pageSize: newSize }))
  }

  // Hitung jumlah items yang ditampilkan
  const calculateItemRange = () => {
    if (!data?.meta || data.data.length === 0) return '0 dari 0'

    const start = (data.meta.currentPage - 1) * data.meta.pageSize + 1
    const end = Math.min(
      data.meta.currentPage * data.meta.pageSize,
      data.meta.totalItems
    )

    return `${start} - ${end} dari ${data.meta.totalItems}`
  }

  // Tambahkan useLayoutEffect untuk mengatasi hydration mismatch
  useEffect(() => {
    // suppressHydrationWarning akan diaplikasikan pada elemen root
    // untuk mengatasi masalah hydration pada children
    const rootElement = document.getElementById('__next')
    if (rootElement) {
      rootElement.setAttribute('suppresshydrationwarning', 'true')
    }
  }, [])

  // Tampilkan error jika terjadi
  useEffect(() => {
    if (error) {
      showErrorNotification(error)
    }
  }, [error])

  return (
    <>
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-slate-700/50 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-100 flex items-center">
              <BookText className="mr-2 h-5 w-5 text-cyan-500" />
              Daftar Modul
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-cyan-500/10 text-cyan-500 border-cyan-500/30 hover:bg-cyan-500/20"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Modul
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Tabs */}
          <div className="border-b border-slate-700/50 p-4 flex justify-between items-center">
            <Tabs
              defaultValue="table"
              value={activeView}
              onValueChange={(v) => setActiveView(v as 'table' | 'card')}
              className="w-auto"
            >
              <TabsList className="bg-slate-800/50">
                <TabsTrigger
                  value="table"
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                >
                  Table
                </TabsTrigger>
                <TabsTrigger
                  value="card"
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                >
                  Card
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Legend */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-xs text-slate-400">Aktif</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-slate-500"></span>
                <span className="text-xs text-slate-400">Draft</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <span className="text-xs text-slate-400">Diarsipkan</span>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari judul modul..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-md py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-200"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={queryParams.status}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-[180px] bg-slate-800/50 border border-slate-700/50 text-slate-200">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-slate-200">
                    Semua Status
                  </SelectItem>
                  <SelectItem value="active" className="text-slate-200">
                    Aktif
                  </SelectItem>
                  <SelectItem value="draft" className="text-slate-200">
                    Draft
                  </SelectItem>
                  <SelectItem value="archived" className="text-slate-200">
                    Diarsipkan
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="bg-slate-800/50 border border-slate-700/50"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Table View */}
          {activeView === 'table' && (
            <div>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-700/50 bg-slate-800/50">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Judul</th>
                    <th className="px-4 py-3 font-medium">Deskripsi</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    // Loading skeleton
                    Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <tr
                          key={`skeleton-${index}`}
                          className="border-b border-slate-700/30"
                        >
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-10 bg-slate-800" />
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-40 bg-slate-800" />
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-60 bg-slate-800" />
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-6 w-20 bg-slate-800" />
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-24 bg-slate-800" />
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-8 w-20 bg-slate-800" />
                          </td>
                        </tr>
                      ))
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-red-400"
                      >
                        Gagal memuat data. Silakan coba lagi.
                      </td>
                    </tr>
                  ) : data?.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-400"
                      >
                        Tidak ada data modul yang tersedia.
                      </td>
                    </tr>
                  ) : (
                    data?.data.map((module: Module) => (
                      <tr
                        key={module.id}
                        className="border-b border-slate-700/30 text-sm"
                      >
                        <td className="px-4 py-3 text-slate-500">
                          {module.id.substring(0, 8)}...
                        </td>
                        <td className="px-4 py-3 text-slate-200 font-medium">
                          {module.title}
                        </td>
                        <td className="px-4 py-3">
                          <ModuleDescriptionCell module={module} />
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`
                              ${
                                module.status === ModuleStatus.ACTIVE
                                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                  : module.status === ModuleStatus.DRAFT
                                    ? 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                              } rounded-md text-xs font-medium border`}
                          >
                            {module.status === ModuleStatus.ACTIVE
                              ? 'Aktif'
                              : module.status === ModuleStatus.DRAFT
                                ? 'Draft'
                                : 'Diarsipkan'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-purple-400">
                            {new Date(module.createdAt).toLocaleDateString(
                              'id-ID',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              }
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ModuleActionCell module={module} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Card View */}
          {activeView === 'card' && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                // Loading skeleton untuk card view
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={`card-skeleton-${index}`}
                      className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4"
                    >
                      <Skeleton className="h-6 w-40 bg-slate-700 mb-2" />
                      <Skeleton className="h-4 w-full bg-slate-700 mb-2" />
                      <Skeleton className="h-4 w-3/4 bg-slate-700 mb-4" />
                      <div className="flex justify-between items-center mt-4">
                        <Skeleton className="h-6 w-20 bg-slate-700" />
                        <Skeleton className="h-8 w-20 bg-slate-700" />
                      </div>
                    </div>
                  ))
              ) : error ? (
                <div className="col-span-full text-center py-8 text-red-400">
                  Gagal memuat data. Silakan coba lagi.
                </div>
              ) : data?.data.length === 0 ? (
                <div className="col-span-full text-center py-8 text-slate-400">
                  Tidak ada data modul yang tersedia.
                </div>
              ) : (
                data?.data.map((module: Module) => (
                  <div
                    key={module.id}
                    className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4"
                  >
                    <h3 className="text-slate-200 font-medium text-lg mb-2">
                      {module.title}
                    </h3>
                    <p className="text-cyan-400 text-sm mb-4 line-clamp-2">
                      <ModuleDescriptionCell module={module} />
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <Badge
                        className={`
                          ${
                            module.status === ModuleStatus.ACTIVE
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : module.status === ModuleStatus.DRAFT
                                ? 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                          } rounded-md text-xs font-medium border`}
                      >
                        {module.status === ModuleStatus.ACTIVE
                          ? 'Aktif'
                          : module.status === ModuleStatus.DRAFT
                            ? 'Draft'
                            : 'Diarsipkan'}
                      </Badge>
                      <ModuleActionCell module={module} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination - Jaga agar tetap di bawah tetapi mengurangi spasi jika diperlukan */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-slate-700/50">
            <div className="text-xs text-slate-400">
              Menampilkan {calculateItemRange()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-slate-800 text-slate-200 border-slate-700"
                disabled={!data?.meta || data.meta.currentPage <= 1}
                onClick={() =>
                  handlePageChange((data?.meta?.currentPage ?? 1) - 1)
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-300">
                {data?.meta ? data?.meta?.currentPage : 1} /{' '}
                {data?.meta ? data?.meta?.totalPages : 1}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="bg-slate-800 text-slate-200 border-slate-700"
                disabled={
                  !data?.meta || data.meta.currentPage >= data.meta.totalPages
                }
                onClick={() =>
                  handlePageChange((data?.meta?.currentPage ?? 1) + 1)
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Select
                value={queryParams.pageSize.toString()}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-[90px] bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="5" className="text-slate-200">
                    5 baris
                  </SelectItem>
                  <SelectItem value="10" className="text-slate-200">
                    10 baris
                  </SelectItem>
                  <SelectItem value="25" className="text-slate-200">
                    25 baris
                  </SelectItem>
                  <SelectItem value="50" className="text-slate-200">
                    50 baris
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal untuk Tambah Modul */}
      <ModuleFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />
    </>
  )
}
