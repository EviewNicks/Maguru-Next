import { Card, CardContent } from '@/components/ui/card'
import { usePathname } from 'next/navigation'
import { NavItem } from '../../features/manage-users/components/ui/NavItem'
import { StatusItem } from '../../features/manage-users/components/ui/StatusItem'
import adminLinks from '@/components/layouts/adminSidebarLinks'

interface SidebarProps {
  systemStatus: number
  securityLevel: number
  networkStatus: number
}

/**
 * Komponen Sidebar untuk menampilkan menu navigasi dan status sistem
 */
export function AdminSidebar({
  systemStatus,
  securityLevel,
  networkStatus,
}: SidebarProps) {
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
              active={pathname === link.href}
            />
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <div className="text-xs text-slate-500 mb-2 font-mono">
            STATUS SISTEM
          </div>
          <div className="space-y-3">
            <StatusItem
              label="Core Systems"
              value={systemStatus}
              color="cyan"
            />
            <StatusItem label="Security" value={securityLevel} color="blue" />
            <StatusItem label="Network" value={networkStatus} color="green" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
