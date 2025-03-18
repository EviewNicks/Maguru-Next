import React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  backLink?: string
  backLinkText?: string
}

export function PageHeader({ title, description, backLink, backLinkText }: PageHeaderProps) {
  return (
    <div className="flex flex-col space-y-2">
      {backLink && backLinkText && (
        <Link 
          href={backLink} 
          className="flex items-center text-sm text-muted-foreground hover:text-primary mb-2"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {backLinkText}
        </Link>
      )}
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
