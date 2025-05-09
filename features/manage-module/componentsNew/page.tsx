'use client'

import { ModuleLayout } from './ModuleLayout'
import { ModuleOverview } from './ModuleOverview'
import { ModuleTable } from './ModuleTable'

export default function ModuleManagementPage() {
  return (
    <ModuleLayout>
      <ModuleOverview />
      <ModuleTable />
    </ModuleLayout>
  )
}
