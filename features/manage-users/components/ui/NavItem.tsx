import { Button } from '@/components/ui/button'
import { NavItemProps } from '../../types'

/**
 * Komponen NavItem untuk menampilkan item navigasi
 */
export function NavItem({ icon: Icon, label, active }: NavItemProps) {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-start ${active ? 'bg-slate-800/70 text-cyan-400' : 'text-slate-400 hover:text-slate-100'}`}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
