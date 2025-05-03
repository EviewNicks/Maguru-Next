'use client'

// import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface NavSearchProps {
  className?: string
}

function NavSearch({ className }: NavSearchProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      className={cn(
        `hidden md:flex items-center space-x-2 rounded-full px-3 py-1.5 border transition-all duration-300 bg-background/70 backdrop-blur-sm`,
        focused ? 'border-primary/50 pr-4 w-52' : 'border-border w-40',
        className
      )}
    >
      <Search className="h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Cari modul..."
        className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-muted-foreground/70"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

export default NavSearch
