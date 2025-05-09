'use client'

import { useState } from 'react'
import { Module } from '@/features/manage-module/types'
import { Button } from '@/components/ui/button'
import DOMPurify from 'isomorphic-dompurify'

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

  // Sanitasi untuk mencegah XSS attack
  const sanitizedDescription = DOMPurify.sanitize(truncatedDescription)

  return (
    <div>
      <div
        className="text-sm text-slate-300"
        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
      />
      {isTruncated && (
        <Button
          variant="link"
          size="sm"
          className="p-0 h-auto text-cyan-500 hover:text-cyan-400"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Sembunyikan' : 'Lihat Selengkapnya'}
        </Button>
      )}
    </div>
  )
}
