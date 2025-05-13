import { ClientSidebar } from '@/components/layouts/ClientSidebar'
import { createUserIfNotExists } from '@/lib/auth'
import { PropsWithChildren } from 'react'
import { ModulePagesProvider } from '@/features/manage-module/context/ModulePagesContext'

/**
 * Layout untuk halaman Manajemen Modul
 *
 * Bisa digunakan untuk menambahkan elemen UI yang persisten
 * di semua halaman child dari manajemen modul jika ada
 *
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 */
async function layout({ children }: PropsWithChildren) {
  await createUserIfNotExists()

  return (
    <ModulePagesProvider>
      <main className="w-full">
        {/* TAMPILKAN HANYA UNTUK LG KE ATAS */}
        <div className="hidden lg:flex h-full w-full">
          {/* Sidebar */}
          <div className="h-full my-2">
            <ClientSidebar />
          </div>
          {/* Main Content */}
          <div className="h-full w-full">{children}</div>
        </div>
      </main>
    </ModulePagesProvider>
  )
}

export default layout
