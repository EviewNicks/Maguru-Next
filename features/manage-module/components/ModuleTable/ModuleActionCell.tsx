'use client'

import { Button } from '@/components/ui/button'
import { Module } from '../../types/module'
import { toast } from 'sonner'
import { PencilIcon, TrashIcon } from 'lucide-react'

interface ModuleActionCellProps {
  module: Module
}

export default function ModuleActionCell({ module }: ModuleActionCellProps) {
  const handleEdit = () => {
    // Implementasi edit akan ditambahkan di langkah berikutnya
    // Sementara hanya menampilkan toast
    toast.info(`Edit modul: ${module.title}`)
  }

  const handleDelete = () => {
    // Implementasi delete akan ditambahkan di langkah berikutnya
    // Sementara hanya menampilkan toast
    toast.info(`Hapus modul: ${module.title}`)
  }

  return (
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
      >
        <TrashIcon className="h-4 w-4" />
        <span className="sr-only">Hapus</span>
      </Button>
    </div>
  )
}
