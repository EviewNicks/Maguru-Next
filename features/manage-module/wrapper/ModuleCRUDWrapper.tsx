'use client'

import { ReactNode } from 'react'
import { ModuleCRUDProvider } from '@/features/manage-module/context/ModuleCRUDContext'

/**
 * Wrapper komponen untuk ModuleCRUDProvider
 *
 * Komponen ini dibuat untuk memisahkan client component (provider context)
 * dari server component (layout) untuk menghindari error
 * 'server-only' tidak dapat diimpor dari Client Component
 *
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 */
export function ModuleCRUDWrapper({ children }: { children: ReactNode }) {
  return <ModuleCRUDProvider>{children}</ModuleCRUDProvider>
}
