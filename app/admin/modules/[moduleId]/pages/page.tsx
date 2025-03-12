// app/admin/modules/[moduleId]/pages/page.tsx
'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb'
import { useModulePages } from '@/features/manage-module/hooks/useModulePageQueries'
import { ModulePageList } from '@/features/manage-module/components/ModulePageList'
import { ArrowLeft } from 'lucide-react'

export default function ModulePagesPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.moduleId as string

  // Ambil daftar halaman modul
  const { data: pages, isLoading, error } = useModulePages(moduleId)

  // Handler untuk kembali ke halaman modul
  const handleBack = () => {
    router.push('/admin/modules')
  }

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/modules">Modul</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/admin/modules/${moduleId}/pages`}>
                Konten
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Manajemen Konten Modul</h1>
          <p className="text-muted-foreground mt-1">
            Tambah, edit, dan atur urutan konten untuk modul ini.
          </p>
        </div>

        <Separator />

        {error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            <p>Terjadi kesalahan saat memuat data: {error.message}</p>
          </div>
        ) : (
          <ModulePageList
            moduleId={moduleId}
            pages={pages || []}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}
