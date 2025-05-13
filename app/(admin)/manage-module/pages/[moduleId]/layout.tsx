'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Toaster } from 'sonner'

interface ModulePageLayoutProps {
  children: React.ReactNode
}

export default function ModulePageLayout({ children }: ModulePageLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Toaster untuk notifikasi */}
      <Toaster position="top-right" />

      {/* Content */}
      <div className="h-screen overflow-hidden">{children}</div>
    </div>
  )
}
