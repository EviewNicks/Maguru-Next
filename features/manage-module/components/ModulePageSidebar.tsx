'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SidebarContent from './ModulePageEditor/sidebar/SidebarContent'
import SidebarHeader from './ModulePageEditor/sidebar/SidebarHeader'
import SidebarShortcuts from './ModulePageEditor/sidebar/SidebarShortcuts'
import SidebarBlogs from './ModulePageEditor/sidebar/SidebarBlogs'
import { ModulePage } from '../types/modulePageSchema'

interface ModulePageSidebarProps {
  pages?: ModulePage[]
  activePage?: ModulePage | null
  onSelectPage?: (page: ModulePage) => void
  expandedItems?: Record<string, boolean>
  toggleExpand?: (item: string) => void
}

export default function ModulePageSidebar({
  pages = [],
  activePage,
  onSelectPage,
  expandedItems = { SPRINT: true, ModulePages: true },
  toggleExpand = () => {},
}: ModulePageSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsOpen((prev) => !prev)
  }

  // Simpan preferensi di localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('moduleSidebarOpen', isOpen.toString())
    }
  }, [isOpen])

  // Load preferensi dari localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('moduleSidebarOpen')
      if (savedState) {
        setIsOpen(savedState === 'true')
      }
    }
  }, [])

  return (
    <div
      className={`fixed right-0 top-0 h-full transition-all duration-300 z-50 ${
        isOpen ? 'w-64' : 'w-8'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute left-0 top-20 transform -translate-x-full bg-[#242528] p-1 rounded-l-md hover:bg-[#3b3b3b] transition-colors"
        aria-label={isOpen ? 'Tutup sidebar' : 'Buka sidebar'}
      >
        {isOpen ? (
          <ChevronRight size={20} className="text-[#e3e4f2]" />
        ) : (
          <ChevronLeft size={20} className="text-[#e3e4f2]" />
        )}
      </button>

      {/* Sidebar Content */}
      <div
        className={`h-full bg-[#1e1e1e] border-l border-[#3b3b3b] overflow-hidden transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0'
        }`}
      >
        {/* Sidebar konten hanya ditampilkan jika terbuka */}
        {isOpen && (
          <>
            <SidebarHeader />
            <SidebarShortcuts />
            <SidebarContent
              expandedItems={expandedItems}
              toggleExpand={toggleExpand}
              pages={pages}
              activePage={activePage}
              onSelectPage={onSelectPage}
            />
            <SidebarBlogs />

            <div className="p-4">
              <button className="w-full py-2 px-4 border border-[#3b3b3b] rounded bg-transparent text-[#e3e4f2] hover:bg-[#242528]">
                Invite people
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
