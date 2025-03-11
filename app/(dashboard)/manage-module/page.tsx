// app/admin/module/page.tsx
'use client'

import { Suspense } from 'react'
import { Metadata } from 'next'
import { ModuleManagement } from '@/features/manage-module/components/ModuleManagement'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/ui/page-header'

export const metadata: Metadata = {
  title: 'Manajemen Modul Akademik | Maguru',
  description: 'Halaman untuk mengelola modul akademik',
}

export default function ModuleManagementPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Manajemen Modul Akademik"
        description="Kelola semua modul akademik dalam sistem"
      />
      
      <Suspense fallback={<ModuleTableSkeleton />}>
        <ModuleManagement />
      </Suspense>
    </div>
  )
}

function ModuleTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
      
      <div className="border rounded-lg p-4">
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}