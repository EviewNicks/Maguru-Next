'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ModuleStatus } from '../types'
import { Search } from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'

interface ModuleFilterProps {
  
  filter: {
    status?: ModuleStatus | 'ALL'
    search: string
    limit: number
    cursor?: string
  }
  onFilterChange: (filter: {
    status?: ModuleStatus | 'ALL'
    search: string
    limit: number
    cursor?: string
  }) => void
}

export function ModuleFilter({ filter, onFilterChange }: ModuleFilterProps) {
  const [searchInput, setSearchInput] = useState(filter.search)
  const debouncedSearch = useDebounce(searchInput, 300)

  // Update search filter when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filter.search) {
      onFilterChange({
        ...filter,
        search: debouncedSearch,
        cursor: undefined, // Reset cursor when search changes
      })
    }
  }, [debouncedSearch, filter, onFilterChange])

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filter,
      status: value === 'ALL' ? 'ALL' : (value as ModuleStatus),
      cursor: undefined, // Reset cursor when status changes
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative w-full sm:w-64">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="search"
          placeholder="Cari modul..."
          className="pl-10"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          value={filter.status || 'ALL'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value={ModuleStatus.ACTIVE}>Aktif</SelectItem>
            <SelectItem value={ModuleStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={ModuleStatus.ARCHIVED}>Diarsipkan</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
