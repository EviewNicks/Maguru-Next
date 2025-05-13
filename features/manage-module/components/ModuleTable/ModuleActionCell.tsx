'use client'

import { Button } from '@/components/ui/button'
import { Module } from '@/features/manage-module/types'
import { Edit, Trash2, FileText, BookOpen } from 'lucide-react'
import { useState, useEffect } from 'react'
import ModuleFormModal from './ModuleFormModal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { useModuleMutation } from '@/features/manage-module/hooks/useModuleMutation'
import { showErrorNotification } from '../ErrorNotifier'
import { useRouter } from 'next/navigation'

interface ModuleActionCellProps {
  module: Module
}

export default function ModuleActionCell({ module }: ModuleActionCellProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const router = useRouter()

  // Gunakan hook useModuleMutation
  const { deleteModuleMutation } = useModuleMutation()

  // Tangani error jika ada
  useEffect(() => {
    if (deleteModuleMutation.error) {
      showErrorNotification(deleteModuleMutation.error)
    }
  }, [deleteModuleMutation.error])

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

  // Navigasi ke halaman editor konten modul
  const handleManagePages = () => {
    router.push(`/manage-module/pages/${module.id}`)
  }

  return (
    <>
      <div className="flex justify-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManagePages}
          className="h-8 w-8 p-0 text-green-400 hover:bg-green-600/20 hover:text-green-300"
          title="Kelola Halaman"
        >
          <BookOpen className="h-4 w-4" />
          <span className="sr-only">Kelola Halaman</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="h-8 w-8 p-0 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
          title="Edit Modul"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          disabled={deleteModuleMutation.isPending}
          title="Hapus Modul"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Hapus</span>
        </Button>
      </div>

      {/* Modal Edit */}
      <ModuleFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        module={module}
      />

      {/* Modal Konfirmasi Hapus */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700/50 text-slate-100">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Modul</DialogTitle>
            <DialogDescription className="text-slate-400">
              Apakah Anda yakin ingin menghapus modul &ldquo;{module.title}
              &rdquo;?
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteModuleMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteModuleMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
