'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { User } from '@/types/user'
import { useUserActions } from '@/hooks/useUserActions'
import { Shield, User as UserIcon } from 'lucide-react'

interface EditUserDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditUserDialogNew({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  // Pastikan role selalu salah satu dari nilai yang valid
  const validRole =
    user.role === 'admin' || user.role === 'mahasiswa' ? user.role : 'mahasiswa'

  const [role, setRole] = useState<User['role']>(validRole)
  const [status, setStatus] = useState<User['status']>(
    user.status ?? 'active' // Gunakan nullish coalescing untuk mencegah undefined
  )
  const { updateUser } = useUserActions()

  const handleSave = async () => {
    try {
      await updateUser.mutateAsync({
        id: user.id,
        role,
        status,
        lastKnownUpdate: user.updatedAt,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/80 border border-slate-700/70 backdrop-blur-sm text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Edit User</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update role dan status untuk {user.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">Role</h4>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as User['role'])}
            >
              <SelectTrigger className="bg-slate-800/70 border-slate-700/50 text-slate-200 focus:ring-cyan-500/20">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectItem
                  value="admin"
                  className="focus:bg-cyan-500/10 focus:text-cyan-400"
                >
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-cyan-400" />
                    Admin
                  </div>
                </SelectItem>
                <SelectItem
                  value="mahasiswa"
                  className="focus:bg-blue-500/10 focus:text-blue-400"
                >
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 text-blue-400" />
                    Mahasiswa
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">Status</h4>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as User['status'])}
            >
              <SelectTrigger className="bg-slate-800/70 border-slate-700/50 text-slate-200 focus:ring-cyan-500/20">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectItem
                  value="active"
                  className="focus:bg-green-500/10 focus:text-green-400"
                >
                  <div className="text-green-400">Active</div>
                </SelectItem>
                <SelectItem
                  value="inactive"
                  className="focus:bg-red-500/10 focus:text-red-400"
                >
                  <div className="text-red-400">Inactive</div>
                </SelectItem>
                <SelectItem
                  value="pending"
                  className="focus:bg-amber-500/10 focus:text-amber-400"
                >
                  <div className="text-amber-400">Pending</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="border-t border-slate-700/50 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateUser.isPending}
            className="bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateUser.isPending}
            className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30"
          >
            {updateUser.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
