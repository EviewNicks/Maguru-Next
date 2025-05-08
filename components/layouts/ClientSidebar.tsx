'use client'

import { useSystemStatus } from '@/features/manage-users/hooks/useSystemStatus'
// import Sidebar from '@/components/layouts/Sidebar'
import { AdminSidebar } from './AdminSidebar'

export function ClientSidebar() {
  const { systemStatus, securityLevel, networkStatus } = useSystemStatus()

  return (
    <AdminSidebar
      systemStatus={systemStatus}
      securityLevel={securityLevel}
      networkStatus={networkStatus}
    />
  )
}
