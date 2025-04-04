// lib/service/stats.ts
import { StatsData } from '../types/stats'
import { User } from '@/types/user'

type ApiResponse = {
  users: User[]
  metadata: { total: number; page: number; limit: number }
}

export async function fetchStatsData(): Promise<StatsData[]> {
  const response = await fetch('/api/users')
  if (!response.ok) {
    throw new Error('Failed to fetch stats data')
  }

  const data: ApiResponse = await response.json()
  const users = data.users
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Calculate stats
  const totalUsers = users.length
  const newUsers = users.filter(
    (user) => new Date(user.createdAt) >= sevenDaysAgo
  ).length
  const activeAdmins = users.filter(
    (user) => user.role === 'admin' && user.status === 'active'
  ).length

  return [
    { title: 'Total Users', value: totalUsers },
    { title: 'New Users (Last 7 Days)', value: newUsers },
    { title: 'Active Admins', value: activeAdmins },
  ]
}
