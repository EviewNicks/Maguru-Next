// lib/service/charts.ts
import { User } from '@/types/user'

type MonthlyData = { month: string; users: number }

export function processChartData(users: User[]): MonthlyData[] {
  const monthlyData = new Map<string, number>()
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  users.forEach((user) => {
    const date = new Date(user.createdAt)
    const monthKey = months[date.getMonth()]
    monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1)
  })

  return months
    .map((month) => ({ month, users: monthlyData.get(month) || 0 }))
    .filter((data) => data.users > 0)
}
