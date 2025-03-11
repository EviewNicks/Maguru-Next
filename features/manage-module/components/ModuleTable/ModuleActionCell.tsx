'use client'

import { useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Module } from '../../types'
import { ModuleFormModal } from '../ModuleFormModal'
import { DeleteModuleDialog } from '../DeleteModuleDialog'

interface ModuleActionCellProps {
  module: Module
}

export default function ModuleActionCell({ module }: ModuleActionCellProps) {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFormModalOpen(true)}
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>

      {/* Modal untuk edit modul */}
      {isFormModalOpen && (
        <ModuleFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          module={module}
        />
      )}

      {/* Dialog konfirmasi hapus */}
      {isDeleteDialogOpen && (
        <DeleteModuleDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          module={module}
        />
      )}
    </>
  )
}
