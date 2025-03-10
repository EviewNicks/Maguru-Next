// features/manage-module/components/ModuleManagement.tsx
'use client'

import { useState } from 'react'
import { ModuleTable } from './ModuleTable'
import { ModuleFilter } from './ModuleFilter'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { ModuleFormModal } from './ModuleFormModal'
import { useModules } from '../hooks/useModules'
import { ModuleStatus } from '../types'

export function ModuleManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState({
    status: undefined as ModuleStatus | undefined,
    search: '',
    limit: 10,
    cursor: undefined as string | undefined,
  })
  
  const { data, isLoading, isError } = useModules(filter)
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ModuleFilter 
          filter={filter} 
          onFilterChange={setFilter} 
        />
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Tambah Modul
        </Button>
      </div>
      
      <ModuleTable 
        modules={data?.modules || []} 
        isLoading={isLoading}
        isError={isError}
        pagination={data?.pagination}
        onLoadMore={() => {
          if (data?.pagination?.nextCursor) {
            setFilter(prev => ({
              ...prev,
              cursor: data.pagination.nextCursor
            }))
          }
        }}
      />
      
      {isModalOpen && (
        <ModuleFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}