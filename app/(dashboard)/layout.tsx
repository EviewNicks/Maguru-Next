import Sidebar from '@/components/layouts/Sidebar'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

import { PropsWithChildren } from 'react'

function layout({ children }: PropsWithChildren) {
  return (
    <main className=" w-full">
      {/* TAMPILKAN HANYA UNTUK LG KE ATAS */}
      <div className="hidden lg:flex h-full w-full">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full ">
          {/* Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full">
              <Sidebar />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          {/* Main Content */}
          <ResizablePanel defaultSize={80} minSize={70}>
            <div className="h-full w-full p-4 sm:p-8 lg:px-4 py-8">
              {children}
            </div>
          </ResizablePanel>{' '}
          py-8
        </ResizablePanelGroup>
      </div>

      {/* TAMPILKAN SAAT MD KE BAWAH */}
      <div className="block lg:hidden h-full w-full">
        <div className="h-full w-full p-4 sm:p-8 lg:p-16">{children}</div>
      </div>
    </main>
  )
}
export default layout
