import {
  Activity,
  Command,
  Database,
  Globe,
  MessageSquare,
  Settings,
  Shield,
  Terminal,
  LucideIcon,
} from 'lucide-react'

type AdminNavLink = {
  icon: LucideIcon
  label: string
  href: string
  active?: boolean
}

const adminLinks: AdminNavLink[] = [
  {
    icon: Command,
    label: 'Dashboard',
    href: '/manage-users',
  },
  {
    icon: Activity,
    label: 'Kelola Module',
    href: '/manage-module',
  },
  {
    icon: Database,
    label: 'Data Center',
    href: '/admin/data-center',
  },
  {
    icon: Globe,
    label: 'Network',
    href: '/admin/network',
  },
  {
    icon: Shield,
    label: 'Security',
    href: '/admin/security',
  },
  {
    icon: Terminal,
    label: 'Console',
    href: '/admin/console',
  },
  {
    icon: MessageSquare,
    label: 'Communications',
    href: '/admin/communications',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/admin/settings',
  },
]

export default adminLinks
