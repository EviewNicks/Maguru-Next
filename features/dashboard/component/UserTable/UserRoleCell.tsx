import { useDispatch } from 'react-redux'
import { useState } from 'react'
import { updateUser } from '../../../../store/features/userSlice'
import { User } from '@/types/user'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { EditUserDialog } from './EditUserDialog'
// import { CheckBadgeIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { Check, ChevronDown } from 'lucide-react'

// Komponen baru untuk menangani state dan dispatch
const UserRoleCell = ({ user }: { user: User }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const dispatch = useDispatch()

  const handleUpdateUser = (
    userId: string,
    newRole: string,
    newStatus: string
  ) => {
    dispatch(
      updateUser({
        id: userId,
        role: newRole as User['role'],
        status: newStatus as User['status'],
      })
    )
  }

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
              {user.role}
              <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              {user.role === 'admin' && (
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
        user={user}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleUpdateUser}
      />
    </>
  )
}

export default UserRoleCell
