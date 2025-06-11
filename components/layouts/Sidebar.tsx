'use client'

import { Card, CardContent } from '@/components/ui/card'
import { usePathname } from 'next/navigation'
import { NavItem } from '../ui/NavItem'
import { StatusItem } from '../ui/StatusItem'
import adminLinks from '@/components/layouts/adminSidebarLinks'

function Sidebar() {
  const pathname = usePathname()

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full">
      <CardContent className="p-4">
        <nav className="space-y-2">
          {adminLinks.map((link) => (
            <NavItem
              key={link.href}
              icon={link.icon}
              label={link.label}
              href={link.href}
              active={pathname === link.href || link.active}
            />
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <div className="text-xs text-slate-500 mb-2 font-mono">
            STATUS SISTEM
          </div>
          <div className="space-y-3">
            <StatusItem label="Core Systems" value={85} color="cyan" />
            <StatusItem label="Security" value={90} color="blue" />
            <StatusItem label="Network" value={75} color="green" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Sidebar
