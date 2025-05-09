import { ReactNode } from 'react'
import { AdminSidebar } from '../../../components/layouts/AdminSidebar'

interface ModuleLayoutProps {
  children: ReactNode
}

export function ModuleLayout({ children }: ModuleLayoutProps) {
  return (
    <div className="flex h-screen bg-[#09090b] text-white">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 pl-12 pt-4 overflow-auto">
        <div className="px-4">{children}</div>
      </div>
    </div>
  )
}
