import React from 'react'

interface SkipLinkProps {
  targetId: string
  label?: string
  className?: string
}

/**
 * Komponen SkipLink membuat link tersembunyi yang muncul saat mendapat fokus
 * untuk mengizinkan navigasi cepat ke konten utama, membantu pengguna keyboard
 * dan screen reader melewati navigasi berulang
 */
export function SkipLink({
  targetId,
  label = 'Lewati ke konten utama',
  className = '',
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={`sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:p-3 focus:bg-white focus:text-black focus:border focus:border-primary focus:rounded-md ${className}`}
      onClick={(e) => {
        e.preventDefault()
        const target = document.getElementById(targetId)
        if (target) {
          target.focus()
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }}
    >
      {label}
    </a>
  )
}

export default SkipLink
