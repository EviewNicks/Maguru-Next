'use client'

import React, { useEffect } from 'react'
import { Toaster } from 'sonner'
import ModulePageSidebar from '@/features/manage-module/components/ModulePageSidebar'
import {
  ModulePagesProvider,
  useModulePagesContext,
} from '@/features/manage-module/context/ModulePagesContext'
import { ModulePageCRUDProvider } from '@/features/manage-module/context/ModulePageCRUDContext'
import { useParams, useSearchParams } from 'next/navigation'
import { useModulePageCRUDContext } from '@/features/manage-module/context/ModulePageCRUDContext'
import { ModulePage } from '@/features/manage-module/types/modulePageSchema'

interface ModulePageLayoutProps {
  children: React.ReactNode
}

function ModulePageLayoutContent({ children }: ModulePageLayoutProps) {
  const searchParams = useSearchParams()
  const pageId = searchParams.get('pageId') || undefined

  // Gunakan context untuk state UI
  const { expandedItems, toggleExpand } = useModulePagesContext()

  // Gunakan CRUD context untuk data dan operasi CRUD
  const { pages, activePage, setActivePage } = useModulePageCRUDContext()

  // Efek untuk mengatur activePage berdasarkan pageId dari URL
  useEffect(() => {
    if (pageId && pages.length > 0) {
      const currentPage = pages.find((page) => page.id === pageId)
      if (currentPage && (!activePage || activePage.id !== pageId)) {
        console.log(
          `[Layout] Setting active page to: ${currentPage.title} (${pageId})`
        )
        setActivePage(currentPage)
      }
    }
  }, [pageId, pages, activePage, setActivePage])

  // Handler untuk navigasi halaman
  const handleSelectPage = (page: ModulePage) => {
    setActivePage(page)
  }

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

export default function ModulePageLayout({ children }: ModulePageLayoutProps) {
  const params = useParams()
  const moduleId = params.moduleId as string

  return (
    <ModulePagesProvider>
      <ModulePageCRUDProvider moduleId={moduleId}>
        <ModulePageLayoutContent>{children}</ModulePageLayoutContent>
      </ModulePageCRUDProvider>
    </ModulePagesProvider>
  )
}
