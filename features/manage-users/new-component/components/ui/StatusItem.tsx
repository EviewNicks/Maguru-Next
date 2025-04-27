import { StatusItemProps } from '../../types'
import { Progress } from '@/components/ui/progress'
import { memo, useMemo } from 'react'

/**
 * Komponen StatusItem untuk menampilkan status dengan progress bar
 * Di-memoize untuk mengurangi render berlebihan
 */
const StatusItem = memo(function StatusItem({
  label,
  value,
  color,
}: StatusItemProps) {
  // Hitung kelas gradient sekali saja untuk nilai color yang sama
  const gradientClass = useMemo(() => {
    switch (color) {
      case 'cyan':
        return 'bg-gradient-to-r from-cyan-500 to-blue-500'
      case 'green':
        return 'bg-gradient-to-r from-green-500 to-emerald-500'
      case 'blue':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500'
      case 'purple':
        return 'bg-gradient-to-r from-purple-500 to-pink-500'
      default:
        return 'bg-gradient-to-r from-cyan-500 to-blue-500'
    }
  }, [color])

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-xs text-slate-400">{value} %</div>
      </div>
      <Progress
        value={value}
        className="w-full"
        indicatorClassName={gradientClass}
      />
    </div>
  )
})

StatusItem.displayName = 'StatusItem'

export { StatusItem }
