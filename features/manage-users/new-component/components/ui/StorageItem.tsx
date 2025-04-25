import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StorageItemProps } from '../../types'

/**
 * Komponen StorageItem untuk menampilkan informasi penyimpanan
 */
export function StorageItem({ name, total, used, type }: StorageItemProps) {
  const percentage = Math.round((used / total) * 100)

  const getBarColor = () => {
    if (percentage > 90) return 'bg-red-500'
    if (percentage > 70) return 'bg-amber-500'
    return 'bg-cyan-500'
  }

  return (
    <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-300">{name}</div>
        <Badge
          variant="outline"
          className="bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs"
        >
          {type}
        </Badge>
      </div>
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-slate-500">
            {used} GB / {total} GB
          </div>
          <div className="text-xs text-slate-400">{percentage}%</div>
        </div>
        <Progress value={percentage} className="h-1.5 bg-slate-700">
          <div
            className={`h-full rounded-full ${getBarColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </Progress>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="text-slate-500">Free: {total - used} GB</div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs px-2 text-slate-400 hover:text-slate-100"
        >
          Details
        </Button>
      </div>
    </div>
  )
}
