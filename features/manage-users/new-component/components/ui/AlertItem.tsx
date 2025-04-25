import { AlertCircle, Check, Download, Info } from 'lucide-react'
import { AlertItemProps } from '../../types'

/**
 * Komponen AlertItem untuk menampilkan peringatan/notifikasi
 */
export function AlertItem({ title, time, description, type }: AlertItemProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'info':
        return {
          icon: Info,
          color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
        }
      case 'warning':
        return {
          icon: AlertCircle,
          color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
        }
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500 bg-red-500/10 border-red-500/30',
        }
      case 'success':
        return {
          icon: Check,
          color: 'text-green-500 bg-green-500/10 border-green-500/30',
        }
      case 'update':
        return {
          icon: Download,
          color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
        }
      default:
        return {
          icon: Info,
          color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
        }
    }
  }

  const { icon: Icon, color } = getTypeStyles()
  const [colorText, colorBg, colorBorder] = color.split(' ')

  return (
    <div className="flex items-start space-x-3">
      <div className={`mt-0.5 p-1 rounded-full ${colorBg} ${colorBorder}`}>
        <Icon className={`h-3 w-3 ${colorText}`} />
      </div>
      <div>
        <div className="flex items-center">
          <div className="text-sm font-medium text-slate-200">{title}</div>
          <div className="ml-2 text-xs text-slate-500">{time}</div>
        </div>
        <div className="text-xs text-slate-400">{description}</div>
      </div>
    </div>
  )
}
