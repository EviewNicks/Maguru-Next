'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusIcon, AlertCircle } from 'lucide-react'
import { useModulePages } from '../hooks/useModulePages'
import { ModulePageList } from './ModulePageList'
import { ModulePageFormModal } from './ModulePageFormModal'
import { ContentType } from '../types'
import { EmptyState } from '@/components/ui/empty-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ModulePageType } from '../schemas/modulePageSchema'

interface ModulePageManagementProps {
  moduleId: string
}

export function ModulePageManagement({ moduleId }: ModulePageManagementProps) {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [formModalType, setFormModalType] = useState<ContentType>(ContentType.THEORY)
  
  const { 
    data: pagesData, 
    isLoading, 
    isError, 
    error 
  } = useModulePages(moduleId)

  // Konversi tipe data dari API ke tipe yang diharapkan
  const pages = pagesData ? pagesData.map(page => ({
    ...page,
    type: page.type as ModulePageType,
    language: page.language || undefined // Mengubah null menjadi undefined untuk kompatibilitas
  })) : [];

  const handleAddPage = (type: ContentType) => {
    setFormModalType(type)
    setIsFormModalOpen(true)
  }

  // Fungsi ini akan dipanggil ketika form disubmit
  // Kita hanya perlu menutup modal karena mutasi sudah ditangani di dalam ModulePageFormModal
  const handleFormModalClose = () => {
    setIsFormModalOpen(false)
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data halaman modul'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Halaman Modul</h2>
        <div className="flex space-x-2">
          <Button
            onClick={() => handleAddPage(ContentType.THEORY)}
            variant="outline"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Tambah Teori
          </Button>
          <Button
            onClick={() => handleAddPage(ContentType.CODE)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Tambah Kode
          </Button>
        </div>
      </div>

      {pages.length === 0 && !isLoading ? (
        <EmptyState
          title="Belum ada halaman"
          description="Modul ini belum memiliki halaman. Klik tombol di atas untuk menambahkan halaman baru."
          action={
            <div className="flex space-x-2">
              <Button
                onClick={() => handleAddPage(ContentType.THEORY)}
                variant="outline"
              >
                Tambah Teori
              </Button>
              <Button
                onClick={() => handleAddPage(ContentType.CODE)}
              >
                Tambah Kode
              </Button>
            </div>
          }
        />
      ) : (
        <ModulePageList 
          moduleId={moduleId}
          pages={pages}
          isLoading={isLoading}
        />
      )}

      <ModulePageFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        moduleId={moduleId}
        contentType={formModalType}
        onSubmit={handleFormModalClose}
      />
    </div>
  )
}
