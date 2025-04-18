'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import ModulePage from '@/features/module/components/ModulePage'
import { Skeleton } from '@/components/ui/skeleton'

// Komponen untuk menangani search params
function SearchParamsHandler({
  onParamsReady,
}: {
  onParamsReady: (isQuickView: boolean) => void
}) {
  const searchParams = useSearchParams()
  const quickViewMode = searchParams
    ? searchParams.get('mode') === 'quick'
    : false

  useEffect(() => {
    onParamsReady(quickViewMode)
  }, [quickViewMode, onParamsReady])

  return null
}

export default function ModuleRoute() {
  const params = useParams()
  const moduleId = params ? (params.moduleId as string) : ''
  const [quickViewMode, setQuickViewMode] = useState(false)

  // Jika tidak ada moduleId, tampilkan error atau redirect
  useEffect(() => {
    if (!moduleId) {
      console.error('Module ID tidak ditemukan')
      // Bisa tambahkan redirect ke halaman error di sini jika perlu
    }
  }, [moduleId])

  // Logging untuk analitik
  useEffect(() => {
    // Hanya lanjutkan jika moduleId ada
    if (!moduleId) return

    // Catat waktu akses modul
    const timestamp = new Date().toISOString()
    const accessLog = {
      moduleId,
      timestamp,
      quickViewMode,
    }

    // Simpan log akses ke localStorage untuk analitik
    try {
      const existingLogs = localStorage.getItem('module_access_logs')
      const logs = existingLogs ? JSON.parse(existingLogs) : []
      logs.push(accessLog)

      // Batasi jumlah log yang disimpan (simpan 50 log terakhir)
      if (logs.length > 50) {
        logs.shift() // Hapus log tertua
      }

      localStorage.setItem('module_access_logs', JSON.stringify(logs))
    } catch (error) {
      console.error('Error menyimpan log akses:', error)
    }
  }, [moduleId, quickViewMode])

  // Jika tidak ada moduleId, tampilkan loading atau error state
  if (!moduleId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-6 items-center justify-center min-h-[50vh]">
          <h2 className="text-xl">Module tidak ditemukan</h2>
        </div>
      </div>
    )
  }

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsHandler onParamsReady={setQuickViewMode} />
      </Suspense>

      <Suspense
        fallback={
          <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col gap-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-[400px] w-full" />
              <div className="flex justify-between mt-6">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        }
      >
        <ModulePage moduleId={moduleId} quickViewMode={quickViewMode} />
      </Suspense>
    </>
  )
}
