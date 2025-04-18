import { Metadata } from 'next'
import ModuleTable from '@/features/manage-module/components/ModuleTable'
import RoleProtected from '@/components/RoleProtected'

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
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Modul</h1>
          <p className="text-muted-foreground mt-2">
            Kelola modul akademik dengan mudah. Tambahkan, edit, dan hapus modul
            sesuai kebutuhan.
          </p>
        </div>

        <ModuleTable />
      </div>
    </RoleProtected>
  )
}
