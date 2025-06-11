import { ClientSidebar } from '@/components/layouts/ClientSidebar'
import { createUserIfNotExists } from '@/lib/auth'
import { PropsWithChildren } from 'react'

async function layout({ children }: PropsWithChildren) {
  await createUserIfNotExists()

  return (
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
  )
}
export default layout
