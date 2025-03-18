'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Sidebar from '@/components/layouts/Sidebar'
import ModuleTable from '@/features/manage-module/components/ModuleTable'

const queryClient = new QueryClient()

export default function AdminModulePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen">
        <div className="w-64">
          <Sidebar />
        </div>
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Manajemen Modul</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <ModuleTable />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}
