import { Metadata } from 'next'
import RoleProtected from '@/components/RoleProtected'
import {
  ModuleLayout,
  ModuleOverview,
  ModuleTable,
} from '@/features/manage-module/components'
import { ModuleCRUDProvider } from '@/features/manage-module/context/ModuleCRUDContext'

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
 *
 * Navigasi ke halaman editor modul:
 * - Gunakan tombol "Kelola Halaman" yang akan mengarahkan ke /manage-module/pages/[moduleId]
 * - Di halaman editor, kita dapat mengelola konten modul dengan rich text editor
 */
export default function ModuleManagementPage() {
  return (
    <RoleProtected allowedRoles={['admin']}>
      <ModuleLayout>
        <ModuleCRUDProvider>
          <div className="space-y-8 min-h-[calc(100vh-4rem)]">
            <ModuleOverview />
            <ModuleTable />
          </div>
        </ModuleCRUDProvider>
      </ModuleLayout>
    </RoleProtected>
  )
}
