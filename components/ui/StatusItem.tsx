interface StatusItemProps {
  label: string
  value: number
  color: 'cyan' | 'blue' | 'green' | 'yellow' | 'red'
}

const colorMap = {
  cyan: 'bg-cyan-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
}

export function StatusItem({ label, value, color }: StatusItemProps) {
  const percentage = `${value}%`
  const bgColor = colorMap[color]

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="h-2 w-32 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${bgColor} rounded-full`}
          style={{ width: percentage }}
        ></div>
      </div>
    </div>
  )
}
