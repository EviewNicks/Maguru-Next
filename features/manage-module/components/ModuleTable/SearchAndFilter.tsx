'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import debounce from 'lodash.debounce'
import { Button } from '@/components/ui/button'

interface SearchAndFilterProps {
  onSearch: (value: string) => void
  onFilterChange: (value: string) => void
  searchValue: string
  statusFilter: string
}

export function SearchAndFilter({
  onSearch,
  onFilterChange,
  searchValue,
  statusFilter,
}: SearchAndFilterProps) {
  const [searchInputValue, setSearchInputValue] = useState(searchValue)

  // Debounce search untuk mencegah terlalu banyak request saat user mengetik
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearch(value)
    }, 300),
    [onSearch]
  )

  // Update searchInputValue saat searchValue berubah dari luar komponen
  useEffect(() => {
    setSearchInputValue(searchValue)
  }, [searchValue])

  // Handle perubahan input pencarian
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInputValue(value)
    debouncedSearch(value)
  }

  // Handle clear pencarian
  const handleClearSearch = () => {
    setSearchInputValue('')
    onSearch('')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari modul..."
          value={searchInputValue}
          onChange={handleSearchChange}
          className="pl-8 pr-8"
        />
        {searchInputValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-9 w-9"
            onClick={handleClearSearch}
            aria-label="Hapus pencarian"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Select
        value={statusFilter}
        onValueChange={onFilterChange}
      >
        <SelectTrigger className="w-[180px]" aria-label="Filter status">
          <SelectValue placeholder="Filter status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Semua Status</SelectItem>
          <SelectItem value="published">Aktif</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="archived">Diarsipkan</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
