'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export default function DarkMode() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Efek untuk memastikan SSR compatibility
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full opacity-0" />
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full"
    >
      {theme === 'dark' ? (
        <Sun className="size-[18px]" />
      ) : (
        <Moon className="size-[18px]" />
      )}
      <span className="sr-only">Toggle tema</span>
    </Button>
  )
}
