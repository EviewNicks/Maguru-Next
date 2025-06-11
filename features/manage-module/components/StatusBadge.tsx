'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type StatusType = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

interface StatusBadgeProps {
  status: StatusType
  className?: string
  showText?: boolean
}

export function StatusBadge({
  status,
  className,
  showText = true,
}: StatusBadgeProps) {
  // Tentukan warna berdasarkan status
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 'PUBLISHED':
        return 'bg-green-500/20 border-green-500/50 text-green-400'
      case 'ARCHIVED':
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
    }
  }

  return (
    <div
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs border',
        getStatusColor(status),
        className
      )}
    >
      <span
        className={cn('w-1.5 h-1.5 rounded-full mr-1', {
          'bg-yellow-400': status === 'DRAFT',
          'bg-green-400': status === 'PUBLISHED',
          'bg-gray-400': status === 'ARCHIVED',
        })}
      />
      {showText && status}
    </div>
  )
}
