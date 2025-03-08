"use client"

import { Suspense, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import ModulePage from '@/features/module/components/ModulePage'
import { Skeleton } from '@/components/ui/skeleton'

export default function ModuleRoute() {
  const params = useParams()
  const searchParams = useSearchParams()
  const moduleId = params.moduleId as string
  const quickViewMode = searchParams.get('mode') === 'quick'
  
  // Logging untuk analitik
  useEffect(() => {
    // Catat waktu akses modul
    const timestamp = new Date().toISOString()
    const accessLog = {
      moduleId,
      timestamp,
      quickViewMode
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
      
      console.log(`Modul diakses: ${moduleId}, Mode: ${quickViewMode ? 'Eksplorasi Cepat' : 'Normal'}`)
    } catch (error) {
      console.error('Error menyimpan log akses:', error)
    }
  }, [moduleId, quickViewMode])
  
  return (
    <Suspense fallback={
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
    }>
      <ModulePage 
        moduleId={moduleId} 
        quickViewMode={quickViewMode}
      />
    </Suspense>
  )
}