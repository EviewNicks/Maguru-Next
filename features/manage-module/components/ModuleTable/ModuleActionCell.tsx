'use client'

import { Button } from '@/components/ui/button'
import { Module } from '@/features/manage-module/types/index'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'
import ModuleFormModal from '@/features/manage-module/components/ModuleFormModal'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { ModuleStatus } from '@/features/manage-module/types'
import { useModuleMutation } from '../../hooks/useModuleMutation'

interface ModuleActionCellProps {
  module: Module
}

export default function ModuleActionCell({ module }: ModuleActionCellProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Gunakan hook useModuleMutation
  const { deleteModuleMutation } = useModuleMutation()

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    // Gunakan mutation delete dari useModuleMutation
    deleteModuleMutation.mutate(module.id)
    setIsDeleteModalOpen(false)
  }

  // Konversi Module dari types/module.ts ke Module dari types/index.ts
  const moduleData = {
    id: module.id,
    title: module.title,
    description: module.description,
    status: module.status === ModuleStatus.DRAFT 
      ? ModuleStatus.DRAFT 
      : module.status === ModuleStatus.ACTIVE 
        ? ModuleStatus.ACTIVE 
        : ModuleStatus.ARCHIVED,
    createdAt: new Date(module.createdAt),
    updatedAt: new Date(module.updatedAt),
    createdBy: 'system', // Default value
    updatedBy: 'system', // Default value
  }

  return (
    <>
      <div className="flex justify-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleEdit}
          className="h-8 w-8 p-0"
        >
          <PencilIcon className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleDelete}
          className="h-8 w-8 p-0"
          disabled={deleteModuleMutation.isPending}
        >
          <TrashIcon className="h-4 w-4" />
          <span className="sr-only">Hapus</span>
        </Button>
      </div>

      {/* Modal Edit */}
      <ModuleFormModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        module={moduleData}
      />

      {/* Modal Konfirmasi Hapus */}
      <Dialog 
        open={isDeleteModalOpen} 
        onOpenChange={setIsDeleteModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Modul</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus modul &ldquo;{module.title}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteModuleMutation.isPending}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
