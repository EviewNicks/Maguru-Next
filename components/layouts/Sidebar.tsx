'use client'

import linksSidebar from '@/config/linksSidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'
function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="py-4 px-8 bg-muted h-full">
      {/* <Image src={Logo} alt="logo" className="mx-auto" /> */}
      <div className="flex flex-col mt-8 gap-y-4">
        {linksSidebar.map((link) => {
          return (
            <Button
              asChild
              key={link.href}
              variant={pathname === link.href ? 'default' : 'link'}
            >
              <Link href={link.href} className="flex items-center gap-x-2 ">
                {link.icon} <span className="capitalize">{link.label}</span>
              </Link>
            </Button>
          )
        })}
      </div>
    </aside>
  )
}
export default Sidebar
