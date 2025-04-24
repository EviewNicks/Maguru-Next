import { useState } from 'react'
import { User } from '@/types/user'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { EditUserDialog } from './EditUserDialog'
import { Check, ChevronDown } from 'lucide-react'

// Komponen baru untuk menangani state dan dispatch
const UserRoleCell = ({ user }: { user: User }) => {
  const [dialogOpen, setDialogOpen] = useState(false)

  // Memastikan user dan user.role selalu ada
  const safeUser = user || ({ role: 'mahasiswa' } as User)

  // Memastikan role selalu memiliki nilai valid
  const safeRole =
    safeUser.role && ['admin', 'mahasiswa'].includes(safeUser.role)
      ? safeUser.role
      : 'mahasiswa'

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 group"
              onClick={() => setDialogOpen(true)}
            >
              {safeRole}
              <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              {safeRole === 'admin' && (
                <Check className="h-4 w-4 text-green-500 opacity-100 transition-opacity" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to change role</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <EditUserDialog
        user={{ ...safeUser, role: safeRole }}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}

export default UserRoleCell
