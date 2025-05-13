'use client'

import React from 'react'
import { Toaster } from 'sonner'
import ModulePageSidebar from '@/features/manage-module/components/ModulePageSidebar'
import { useModulePagesContext } from '@/features/manage-module/context/ModulePagesContext'

interface ModulePageLayoutProps {
  children: React.ReactNode
}

export default function ModulePageLayout({ children }: ModulePageLayoutProps) {
  const { pages, activePage, handleSelectPage, expandedItems, toggleExpand } =
    useModulePagesContext()

  return (
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
  )
}
