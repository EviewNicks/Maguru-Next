'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { ActiveEditor } from '../../lib/draft/ConcurrentEditingService'

interface ActiveEditorIndicatorProps {
  editors: ActiveEditor[]
}

/**
 * Komponen untuk menampilkan pengguna yang sedang mengedit halaman
 */
export function ActiveEditorIndicator({ editors }: ActiveEditorIndicatorProps) {
  if (!editors || editors.length === 0) return null

  return (
    <div className="flex -space-x-2">
      {editors.slice(0, 3).map((editor) => (
        <TooltipProvider key={editor.userId}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-6 w-6 border border-white">
                {editor.profileImageUrl ? (
                  <AvatarImage
                    src={editor.profileImageUrl}
                    alt={editor.userName}
                  />
                ) : (
                  <AvatarFallback className="text-xs bg-blue-500 text-white">
                    {editor.userName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p className="font-medium">{editor.userName}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(editor.timestamp), {
                    addSuffix: true,
                    locale: id,
                  })}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {editors.length > 3 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-6 w-6 border border-white">
                <AvatarFallback className="text-xs bg-gray-500 text-white">
                  +{editors.length - 3}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p>
                  {editors.length - 3} pengguna lain sedang mengedit halaman ini
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

interface ConflictDialogProps {
  isOpen: boolean
  onClose: () => void
  onUseLocalVersion: () => void
  onUseRemoteVersion: () => void
  editorName?: string
}

/**
 * Dialog untuk menampilkan konflik editing
 */
export function ConflictDialog({
  isOpen,
  onClose,
  onUseLocalVersion,
  onUseRemoteVersion,
  editorName = 'Pengguna lain',
}: ConflictDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konflik Versi Terdeteksi</AlertDialogTitle>
          <AlertDialogDescription>
            <p className="mb-2">
              {editorName} telah membuat perubahan pada halaman ini. Terdapat
              konflik antara versi Anda dan versi yang dibuat oleh pengguna
              tersebut.
            </p>
            <p>Silakan pilih versi mana yang ingin Anda gunakan:</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <AlertDialogCancel
            onClick={onUseRemoteVersion}
            className="sm:order-1"
          >
            Gunakan versi terbaru (reload)
          </AlertDialogCancel>
          <AlertDialogAction onClick={onUseLocalVersion} className="sm:order-2">
            Gunakan versi saya
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
