'use client'

import React from 'react'
import { Toaster } from 'sonner'
import ModulePageSidebar from '@/features/manage-module/components/ModulePageSidebar'
import {
  ModulePagesProvider,
  useModulePagesContext,
} from '@/features/manage-module/context/ModulePagesContext'
import { ModulePageCRUDProvider } from '@/features/manage-module/context/ModulePageCRUDContext'
import { useParams } from 'next/navigation'

interface ModulePageLayoutProps {
  children: React.ReactNode
}

function ModulePageLayoutContent({ children }: ModulePageLayoutProps) {
  const params = useParams()
  const moduleId = params.moduleId as string

  const { pages, activePage, handleSelectPage, expandedItems, toggleExpand } =
    useModulePagesContext()

  return (
    <ModulePageCRUDProvider moduleId={moduleId}>
      <div className="min-h-screen bg-black text-white overflow-hidden">
        {/* Toaster untuk notifikasi */}
        <Toaster position="top-right" />

        {/* Content */}
        <div className="h-screen overflow-hidden">
          {children}

          {/* Right Sidebar */}
          <ModulePageSidebar
            pages={pages}
            activePage={activePage}
            onSelectPage={handleSelectPage}
            expandedItems={expandedItems}
            toggleExpand={toggleExpand}
          />
        </div>
      </div>
    </ModulePageCRUDProvider>
  )
}

export default function ModulePageLayout({ children }: ModulePageLayoutProps) {
  return (
    <ModulePagesProvider>
      <ModulePageLayoutContent>{children}</ModulePageLayoutContent>
    </ModulePagesProvider>
  )
}
