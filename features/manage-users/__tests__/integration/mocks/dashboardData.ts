import { Users, Shield, Activity } from 'lucide-react'
import { MetricCardProps } from '../../../types'

/**
 * Mock data untuk statistik pengguna yang dikembalikan oleh API
 */
export const mockStatsData = [
  {
    title: 'Total Users',
    value: 120,
    icon: 'Activity',
    trend: 'up',
    color: 'cyan',
    detail: '15 new this week',
  },
  {
    title: 'Active Users',
    value: 85,
    icon: 'Activity',
    trend: 'stable',
    color: 'purple',
    detail: '92% retention rate',
  },
  {
    title: 'New Users',
    value: 14,
    icon: 'Activity',
    trend: 'up',
    color: 'green',
    detail: '+3.2% from last month',
  },
]

/**
 * Mock data untuk statistik pengguna yang sudah dimapping untuk MetricCard
 */
export const mockMappedStatsData: MetricCardProps[] = [
  {
    title: 'Total Users',
    value: 120,
    icon: Users,
    trend: 'up',
    color: 'cyan',
    detail: '120 total pengguna',
  },
  {
    title: 'Active Users',
    value: 85,
    icon: Users,
    trend: 'stable',
    color: 'purple',
    detail: '85 pengguna',
  },
  {
    title: 'New Users',
    value: 14,
    icon: Users,
    trend: 'up',
    color: 'green',
    detail: '14 pengguna baru (7 hari terakhir)',
  },
]

/**
 * Mock data untuk chart performa
 */
export const mockChartData = [
  { month: 'Jan', users: 42 },
  { month: 'Feb', users: 54 },
  { month: 'Mar', users: 63 },
  { month: 'Apr', users: 86 },
  { month: 'May', users: 75 },
  { month: 'Jun', users: 93 },
  { month: 'Jul', users: 109 },
  { month: 'Aug', users: 122 },
  { month: 'Sep', users: 145 },
  { month: 'Oct', users: 160 },
  { month: 'Nov', users: 178 },
  { month: 'Dec', users: 195 },
]

/**
 * Mock data untuk sistem status
 */
export const mockSystemStatus = {
  cpuUsage: 65,
  memoryUsage: 78,
  networkStatus: 92,
  diskSpace: 43,
  processes: [
    {
      pid: '1234',
      name: 'system_core.exe',
      user: 'System',
      cpu: 5.2,
      memory: 345,
      status: 'Running',
    },
    {
      pid: '2345',
      name: 'database.exe',
      user: 'Admin',
      cpu: 12.5,
      memory: 1024,
      status: 'Running',
    },
  ],
  storage: [
    { name: 'System Drive (C:)', total: 512, used: 256, type: 'SSD' },
    { name: 'Data Drive (D:)', total: 1024, used: 512, type: 'HDD' },
  ],
}
