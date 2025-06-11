import { LucideIcon } from 'lucide-react'

// Tipe untuk NavItem
export interface NavItemProps {
  icon: LucideIcon
  label: string
  active?: boolean
  href?: string
}

// Tipe untuk StatusItem
export interface StatusItemProps {
  label: string
  value: number
  color: 'cyan' | 'green' | 'blue' | 'purple'
}

// Tipe untuk MetricCard
export interface MetricCardProps {
  title: string
  value: number
  icon: LucideIcon
  trend: 'up' | 'down' | 'stable'
  color: 'cyan' | 'green' | 'blue' | 'purple'
  detail: string
  showPercent?: boolean
}

// Tipe untuk ProcessRow
export interface ProcessRowProps {
  pid: string
  name: string
  user: string
  cpu: number
  memory: number
  status: string
}

// Tipe untuk StorageItem
export interface StorageItemProps {
  name: string
  total: number
  used: number
  type: string
}

// Tipe untuk AlertItem
export interface AlertItemProps {
  title: string
  time: string
  description: string
  type: 'info' | 'warning' | 'error' | 'success' | 'update'
}

// Tipe untuk CommunicationItem
export interface CommunicationItemProps {
  sender: string
  time: string
  message: string
  avatar: string
  unread?: boolean
}

// Tipe untuk ActionButton
export interface ActionButtonProps {
  icon: LucideIcon
  label: string
}

// Tipe untuk Particle
export interface ParticleProps {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
}
