import { MessageSquare, Mic } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CommunicationItem } from '../ui/CommunicationItem'

/**
 * Komponen CommunicationsLog untuk menampilkan log komunikasi
 */
export function CommunicationsLog() {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-slate-100 flex items-center text-base">
          <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
          Communications Log
        </CardTitle>
        <Badge
          variant="outline"
          className="bg-slate-800/50 text-blue-400 border-blue-500/50"
        >
          4 New Messages
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <CommunicationItem
            sender="System Administrator"
            time="15:42:12"
            message="Scheduled maintenance will occur at 02:00. All systems will be temporarily offline."
            avatar="/placeholder.svg?height=40&width=40"
            unread
          />
          <CommunicationItem
            sender="Security Module"
            time="14:30:45"
            message="Unusual login attempt blocked from IP 192.168.1.45. Added to watchlist."
            avatar="/placeholder.svg?height=40&width=40"
            unread
          />
          <CommunicationItem
            sender="Network Control"
            time="12:15:33"
            message="Bandwidth allocation adjusted for priority services during peak hours."
            avatar="/placeholder.svg?height=40&width=40"
            unread
          />
          <CommunicationItem
            sender="Data Center"
            time="09:05:18"
            message="Backup verification complete. All data integrity checks passed."
            avatar="/placeholder.svg?height=40&width=40"
            unread
          />
        </div>
      </CardContent>
      <CardFooter className="border-t border-slate-700/50 pt-4">
        <div className="flex items-center w-full space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <Button size="icon" className="bg-blue-600 hover:bg-blue-700">
            <Mic className="h-4 w-4" />
          </Button>
          <Button size="icon" className="bg-cyan-600 hover:bg-cyan-700">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
