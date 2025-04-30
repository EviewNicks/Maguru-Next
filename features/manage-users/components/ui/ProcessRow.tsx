import { Badge } from '@/components/ui/badge'
import { ProcessRowProps } from '../../types'

/**
 * Komponen ProcessRow untuk menampilkan baris proses dalam tabel
 */
export function ProcessRow({
  pid,
  name,
  user,
  cpu,
  memory,
  status,
}: ProcessRowProps) {
  return (
    <div className="grid grid-cols-12 py-2 px-3 text-sm hover:bg-slate-800/50">
      <div className="col-span-1 text-slate-500">{pid}</div>
      <div className="col-span-4 text-slate-300">{name}</div>
      <div className="col-span-2 text-slate-400">{user}</div>
      <div className="col-span-2 text-cyan-400">{cpu}%</div>
      <div className="col-span-2 text-purple-400">{memory} MB</div>
      <div className="col-span-1">
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-400 border-green-500/30 text-xs"
        >
          {status}
        </Badge>
      </div>
    </div>
  )
}
