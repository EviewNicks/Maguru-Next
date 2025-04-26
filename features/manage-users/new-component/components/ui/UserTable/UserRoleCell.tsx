import { useState } from 'react'
import { User } from '@/types/user'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditUserDialogNew } from './EditUserDialog'
import { Shield, User as UserIcon, ChevronDown } from 'lucide-react'

interface UserRoleCellProps {
  user: User
}

export function UserRoleCellNew({ user }: UserRoleCellProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  // Memastikan user dan user.role selalu ada
  const safeUser = user || ({ role: 'mahasiswa' } as User)

  // Memastikan role selalu memiliki nilai valid
  const safeRole =
    safeUser.role && ['admin', 'mahasiswa'].includes(safeUser.role)
      ? safeUser.role
      : 'mahasiswa'

  // Konfigurasi badge role
  const roleConfig = {
    admin: {
      color: 'cyan',
      icon: <Shield className="h-3 w-3 mr-1" />,
      text: 'Admin',
    },
    mahasiswa: {
      color: 'blue',
      icon: <UserIcon className="h-3 w-3 mr-1" />,
      text: 'Mahasiswa',
    },
  }

  const config = roleConfig[safeRole]

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className={`p-0 mr-8 h-6 text-${config.color}-400 hover:text-${config.color}-300 hover:bg-${config.color}-500/10`}
      >
        <Badge
          variant="outline"
          className={`bg-${config.color}-500/10 text-${config.color}-400 border-${config.color}-500/30 text-xs flex items-center group-hover:bg-${config.color}-500/20`}
        >
          {config.icon}
          {config.text}
          <ChevronDown className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Badge>
      </Button>

      <EditUserDialogNew
        user={{ ...safeUser, role: safeRole }}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
