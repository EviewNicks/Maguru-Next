'use client'

import { useSystemStatus } from '@/features/manage-users/hooks/useSystemStatus'
import { Sidebar } from './Sidebar'

export function ClientSidebar() {
  const { systemStatus, securityLevel, networkStatus } = useSystemStatus()

  return (
    <Sidebar
      systemStatus={systemStatus}
      securityLevel={securityLevel}
      networkStatus={networkStatus}
    />
  )
}
