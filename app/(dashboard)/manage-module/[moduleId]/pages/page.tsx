import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { getModuleById } from '@/features/manage-module/services/moduleService'
import { ModulePageManagement } from '@/features/manage-module/components/ModulePageManagement'

interface ModulePageManagementPageProps {
  params: {
    moduleId: string
  }
}

export async function generateMetadata({
  params,
}: ModulePageManagementPageProps): Promise<Metadata> {
  const moduleId = params.moduleId
  const moduleData = await getModuleById(moduleId)

  if (!moduleData) {
    return {
      title: 'Modul Tidak Ditemukan | Maguru',
      description: 'Modul yang Anda cari tidak ditemukan',
    }
  }

  return {
    title: `Manajemen Halaman: ${moduleData.title} | Maguru`,
    description: `Kelola halaman untuk modul ${moduleData.title}`,
  }
}

export default async function ModulePageManagementPage({
  params,
}: ModulePageManagementPageProps) {
  const moduleId = params.moduleId
  const moduleData = await getModuleById(moduleId)

  if (!moduleData) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={`Manajemen Halaman: ${moduleData.title}`}
        description="Kelola halaman konten dalam modul ini"
        backLink="/manage-module"
        backLinkText="Kembali ke Daftar Modul"
      />
      
      <Suspense fallback={<ModulePageListSkeleton />}>
        <ModulePageManagement moduleId={moduleId} />
      </Suspense>
    </div>
  )
}

function ModulePageListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
      
      <div className="border rounded-lg p-4">
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
