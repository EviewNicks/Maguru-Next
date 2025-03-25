'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from './ModuleTable/DataTable'
import { Module, ModuleStatus } from '../types/index'

export default function ModuleTable() {
  const { data, isLoading, error } = useQuery<Module[]>({
    queryKey: ['modules'],
    queryFn: async () => {
      // Ini akan diganti dengan API call yang sebenarnya nanti
      // Untuk sementara, kita gunakan data dummy
      return mockModules
    },
  })

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Error: {error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data'}
      </div>
    )
  }

  return <DataTable data={data || []} isLoading={isLoading} />
}

// Data dummy untuk testing
const mockModules: Module[] = [
  {
    id: '1',
    title: 'Pengenalan Matematika Dasar',
    description: 'Modul ini membahas konsep dasar matematika untuk tingkat sekolah dasar, meliputi penjumlahan, pengurangan, perkalian, dan pembagian.',
    status: ModuleStatus.ACTIVE,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-02-20'),
    createdBy: '1',
    updatedBy: '1', 
  },
  {
    id: '2',
    title: 'Bahasa Indonesia untuk Pemula',
    description: 'Modul pembelajaran bahasa Indonesia yang mencakup tata bahasa, kosakata, dan latihan membaca untuk tingkat pemula.',
    status: ModuleStatus.DRAFT,
    createdAt: new Date('2025-02-10'),
    updatedAt: new Date('2025-03-05'),
    createdBy: '1',
    updatedBy: '1',
  },
  {
    id: '3',
    title: 'Pengenalan Sains',
    description: 'Modul pengenalan ilmu pengetahuan alam yang membahas konsep-konsep dasar fisika, kimia, dan biologi untuk siswa sekolah menengah pertama.',
    status: ModuleStatus.ARCHIVED,
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date('2025-01-10'),
    createdBy: '1',
    updatedBy: '1',
  },
]
