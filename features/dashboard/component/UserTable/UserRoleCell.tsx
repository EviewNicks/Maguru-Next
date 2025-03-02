import { useAppDispatch } from '@/store/hooks'
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
import { Check, ChevronDown } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

// Komponen baru untuk menangani state dan dispatch
const UserRoleCell = ({ user }: { user: User }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const dispatch = useAppDispatch()

  const handleUpdateUser = async (
    userId: string,
    newRole: string,
    newStatus: string
  ) => {
    try {
      await dispatch(
        updateUser({
          id: userId,
          role: newRole as User['role'],
          status: newStatus as User['status'],
        })
      ).unwrap()

      toast({ title: 'Success', description: 'User role updated successfully' })
      setDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      })
    }
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
      />
    </>
  )
}

export default UserRoleCell
