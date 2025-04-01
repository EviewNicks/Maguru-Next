'use client'

import { useState } from 'react'
import { Module } from '../../types/index'
import { Button } from '@/components/ui/button'
import { sanitizedMarkup } from '@/features/common/utils/sanitize'

interface ModuleDescriptionCellProps {
  module: Module
}

export default function ModuleDescriptionCell({
  module,
}: ModuleDescriptionCellProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Truncate deskripsi jika lebih dari 100 karakter
  const description = module.description || '' // Menyediakan nilai default
  const isTruncated = description.length > 100
  const truncatedDescription =
    isTruncated && !isExpanded
      ? description.substring(0, 100) + '...'
      : description

  return (
    <div>
      <div dangerouslySetInnerHTML={sanitizedMarkup(truncatedDescription)} />
      {isTruncated && (
        <Button
          variant="link"
          size="sm"
          className="p-0 h-auto text-blue-600"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Sembunyikan' : 'Lihat Selengkapnya'}
        </Button>
      )}
    </div>
  )
}
