import { Card } from '@/components/ui/card'
import { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: ReactNode
  indicatorColor: string
  borderColor: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  indicatorColor,
  borderColor,
}: MetricCardProps) {
  return (
    <Card className={`bg-[#0f172a] border ${borderColor} rounded-lg p-4`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-[#94a3b8]">{title}</p>
        </div>
        <div className="p-2 bg-[#27272a]/50 rounded-lg">{icon}</div>
      </div>
      <h2 className="text-3xl font-bold mb-1 bg-gradient-to-r from-[#f1f5f9] to-[#cbd5e1] bg-clip-text text-transparent">
        {value}
      </h2>
      <p className="text-xs text-[#06b6d4]">{subtitle}</p>
      <div className="mt-4 flex justify-end">
        <svg
          className={`h-5 w-5 ${indicatorColor}`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 10L12 14L16 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Card>
  )
}
