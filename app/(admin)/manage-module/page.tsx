import { Metadata } from 'next'
import RoleProtected from '@/components/RoleProtected'
import {
  ModuleLayout,
  ModuleOverview,
  ModuleTable,
} from '@/features/manage-module/components'

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
      <ModuleLayout>
        <div className="space-y-8 min-h-[calc(100vh-4rem)]">
          <ModuleOverview />
          <ModuleTable />
        </div>
      </ModuleLayout>
    </RoleProtected>
  )
}
