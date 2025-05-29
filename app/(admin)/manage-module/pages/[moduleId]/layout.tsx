'use client'

import React from 'react'
import { Toaster } from 'sonner'
import ModulePageSidebar from '@/features/manage-module/components/ModulePageSidebar'
import { ModulePageCRUDProvider } from '@/features/manage-module/context/ModulePageCRUDContext'
import { useParams } from 'next/navigation'

interface ModulePageLayoutProps {
  children: React.ReactNode
}

function ModulePageLayoutContent({ children }: ModulePageLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Toaster untuk notifikasi */}
      <Toaster position="top-right" />

      {/* Content */}
      <div className="h-screen overflow-hidden">
        {children}

        {/* Right Sidebar */}
        <ModulePageSidebar />
      </div>
    </div>
  )
}

export default function ModulePageLayout({ children }: ModulePageLayoutProps) {
  const params = useParams()
  const moduleId = params.moduleId as string

  return (
    <ModulePageCRUDProvider moduleId={moduleId}>
      <ModulePageLayoutContent>{children}</ModulePageLayoutContent>
    </ModulePageCRUDProvider>
  )
}
