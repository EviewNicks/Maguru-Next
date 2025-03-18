'use client'

import { useState } from 'react'
import { Module } from '../../types/module'
import { Button } from '@/components/ui/button'
import DOMPurify from 'isomorphic-dompurify'

interface ModuleDescriptionCellProps {
  module: Module
}

export default function ModuleDescriptionCell({ module }: ModuleDescriptionCellProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Sanitasi deskripsi untuk mencegah XSS
  const sanitizedDescription = DOMPurify.sanitize(module.description)
  
  // Truncate deskripsi jika lebih dari 100 karakter
  const isTruncated = sanitizedDescription.length > 100
  const truncatedDescription = isTruncated && !isExpanded
    ? sanitizedDescription.substring(0, 100) + '...'
    : sanitizedDescription

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: truncatedDescription }} />
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
