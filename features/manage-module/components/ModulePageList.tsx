// features/manage-module/components/ModulePageList.tsx
'use client'

import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ModulePage } from '../types'
import { ModulePageListItem } from './ModulePageListItem'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ModulePageFormModal } from './ModulePageFormModal'
import { useCreateModulePage, useReorderModulePages } from '../hooks/useModulePageMutations'

interface ModulePageListProps {
  moduleId: string
  pages: ModulePage[]
  isLoading: boolean
}

export function ModulePageList({ moduleId, pages, isLoading }: ModulePageListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [sortedPages, setSortedPages] = useState<ModulePage[]>(pages)

  // Update sortedPages ketika pages berubah
  React.useEffect(() => {
    setSortedPages([...pages].sort((a, b) => a.order - b.order))
  }, [pages])

  // Setup sensors untuk drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Mutations
  const createMutation = useCreateModulePage(moduleId)
  const reorderMutation = useReorderModulePages(moduleId)

  // Handler untuk menambah halaman baru
  const handleAddPage = (data: any) => {
    // Hitung order tertinggi + 1
    const highestOrder = pages.length > 0 
      ? Math.max(...pages.map(page => page.order)) 
      : -1
    
    createMutation.mutate({
      ...data,
      order: highestOrder + 1,
    }, {
      onSuccess: () => {
        setIsFormOpen(false)
      }
    })
  }

  // Handler untuk drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sortedPages.findIndex((page) => page.id === active.id)
      const newIndex = sortedPages.findIndex((page) => page.id === over.id)

      // Perbarui urutan lokal untuk optimistic update
      const newPages = arrayMove(sortedPages, oldIndex, newIndex)
      setSortedPages(newPages)

      // Buat array updates untuk API
      const updates = newPages.map((page, index) => ({
        pageId: page.id,
        order: index,
      }))

      // Panggil API untuk memperbarui urutan
      reorderMutation.mutate({ updates })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Daftar Halaman</h2>
        <Button onClick={() => setIsFormOpen(true)} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Halaman
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Memuat...</div>
      ) : sortedPages.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">
            Belum ada halaman. Klik tombol "Tambah Halaman" untuk membuat halaman baru.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedPages.map((page) => page.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedPages.map((page) => (
                <ModulePageListItem
                  key={page.id}
                  page={page}
                  moduleId={moduleId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ModulePageFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddPage}
        isLoading={createMutation.isPending}
      />
    </div>
  )
}
