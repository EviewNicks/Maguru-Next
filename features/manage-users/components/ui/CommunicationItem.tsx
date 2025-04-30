import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CommunicationItemProps } from '../../types'

/**
 * Komponen CommunicationItem untuk menampilkan pesan komunikasi
 */
export function CommunicationItem({
  sender,
  time,
  message,
  avatar,
  unread,
}: CommunicationItemProps) {
  return (
    <div
      className={`flex space-x-3 p-2 rounded-md ${unread ? 'bg-slate-800/50 border border-slate-700/50' : ''}`}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar} alt={sender} />
        <AvatarFallback className="bg-slate-700 text-cyan-500">
          {sender.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-slate-200">{sender}</div>
          <div className="text-xs text-slate-500">{time}</div>
        </div>
        <div className="text-xs text-slate-400 mt-1">{message}</div>
      </div>
      {unread && (
        <div className="flex-shrink-0 self-center">
          <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
        </div>
      )}
    </div>
  )
}
