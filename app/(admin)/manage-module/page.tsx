import { Metadata } from 'next'
import RoleProtected from '@/components/RoleProtected'
import { ModuleOverview } from '@/features/manage-module/componentsNew/ModuleOverview'
import { ModuleTable } from '@/features/manage-module/componentsNew/ModuleTable'

// Menambahkan konfigurasi routing untuk mencegah static rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: 'Manajemen Modul Akademik',
  description:
    'Halaman untuk mengelola modul akademik dalam platform pembelajaran',
}

/**
 * Halaman Manajemen Modul Akademik
 * Menampilkan datatable untuk mengelola modul akademik
 * dengan fitur CRUD, filter, search, dan pagination
 */
export default function ModuleManagementPage() {
  return (
    <RoleProtected allowedRoles={['admin']}>
      <div className="space-y-4 max-w-7xl mx-auto my-4">
        <ModuleOverview />
        <ModuleTable />
      </div>
    </RoleProtected>
  )
}
