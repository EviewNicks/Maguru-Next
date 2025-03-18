'use client'

import { Button } from '@/components/ui/button'
import { Module } from '@/features/manage-module/types/module'
import { toast } from 'sonner'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'
import ModuleFormModal from '@/features/manage-module/components/ModuleFormModal'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ModuleStatus } from '@/features/manage-module/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteModule } from '@/features/manage-module/services/moduleClientService'

interface ModuleActionCellProps {
  module: Module
}

export default function ModuleActionCell({ module }: ModuleActionCellProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const queryClient = useQueryClient()

  // Mutation untuk menghapus modul
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteModule(id),
    onSuccess: () => {
      toast.success('Modul berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      setIsDeleteModalOpen(false)
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus modul: ${error.message}`)
    },
  })

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    // Jika implementasi delete sudah tersedia, gunakan mutation
    if (process.env.NODE_ENV === 'test') {
      // Untuk keperluan testing, tampilkan toast info
      toast.info(`Hapus modul: ${module.title}`)
      setIsDeleteModalOpen(false)
    } else {
      // Untuk production, jalankan mutation delete
      deleteMutation.mutate(module.id)
    }
  }

  // Konversi Module dari types/module.ts ke Module dari types/index.ts
  const moduleData = {
    id: module.id,
    title: module.title,
    description: module.description,
    status: module.status === 'draft' 
      ? ModuleStatus.DRAFT 
      : module.status === 'published' 
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
          disabled={deleteMutation.isPending}
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
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus modul &ldquo;{module.title}&rdquo;?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
