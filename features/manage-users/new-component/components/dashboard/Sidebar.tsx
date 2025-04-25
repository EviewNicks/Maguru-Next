import { Card, CardContent } from '@/components/ui/card'
import {
  Activity,
  Command,
  Database,
  Globe,
  MessageSquare,
  Settings,
  Shield,
  Terminal,
} from 'lucide-react'
import { NavItem } from '../ui/NavItem'
import { StatusItem } from '../ui/StatusItem'

interface SidebarProps {
  systemStatus: number
  securityLevel: number
  networkStatus: number
}

/**
 * Komponen Sidebar untuk menampilkan menu navigasi dan status sistem
 */
export function Sidebar({
  systemStatus,
  securityLevel,
  networkStatus,
}: SidebarProps) {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full">
      <CardContent className="p-4">
        <nav className="space-y-2">
          <NavItem icon={Command} label="Dashboard" active />
          <NavItem icon={Activity} label="Diagnostics" />
          <NavItem icon={Database} label="Data Center" />
          <NavItem icon={Globe} label="Network" />
          <NavItem icon={Shield} label="Security" />
          <NavItem icon={Terminal} label="Console" />
          <NavItem icon={MessageSquare} label="Communications" />
          <NavItem icon={Settings} label="Settings" />
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <div className="text-xs text-slate-500 mb-2 font-mono">
            SYSTEM STATUS
          </div>
          <div className="space-y-3">
            <StatusItem label="Core Systems" value={systemStatus} />
            <StatusItem label="Security" value={securityLevel} />
            <StatusItem label="Network" value={networkStatus} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
