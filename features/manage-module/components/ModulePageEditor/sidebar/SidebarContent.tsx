'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Folder,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  MoreVertical,
  Loader2,
  FileText,
  Eye,
  EyeOff,
  Archive,
} from 'lucide-react'
import SidebarItem from './SidebarItem'
import SidebarNestedItem from './SIdebarNestedItem'
import { useState, useEffect } from 'react'
import { DeletePageConfirmation } from '../dialogs/DeletePageConfirmation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useModulePageCRUDContext } from '@/features/manage-module/context/ModulePageCRUDContext'
import { ModulePage, ModulePageStatus } from '@/features/manage-module/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  debugDataFlow,
  debugExpandedItems,
  DebugLevel,
  setDebugLevel,
} from '@/features/manage-module/utils/debugUtils'

interface SidebarContentProps {
  expandedItems: Record<string, boolean>
  toggleExpand: (item: string) => void
}

export default function SidebarContent({
  expandedItems,
  toggleExpand,
}: SidebarContentProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newItemId, setNewItemId] = useState<string | null>(null)
  const [pageToDelete, setPageToDelete] = useState<{
    id: string
    title: string
  } | null>(null)

  const {
    handleSelectPage: contextHandleSelectPage,
    pages,
    activePage,
    error,
    updatePageStatus,
    handleCreateNewPage,
  } = useModulePageCRUDContext()

  // Set debug level to INFO in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setDebugLevel(DebugLevel.DEBUG)
    }
  }, [])

  // Filter pages based on search term
  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Debug data flow when pages change
  useEffect(() => {
    debugDataFlow('SidebarContent', pages)
  }, [pages])

  // Debug expandedItems when they change
  useEffect(() => {
    debugExpandedItems(expandedItems)
  }, [expandedItems])

  // Tambahkan debugging untuk memahami data yang ada
  useEffect(() => {
    console.log(`[SidebarContent] Data loaded - Pages count: ${pages.length}`)
    if (pages.length > 0) {
      console.log(`[SidebarContent] First page title: ${pages[0].title}`)
      console.log(`[SidebarContent] First page status: ${pages[0].status}`)
    }
    if (error) {
      console.error(`[SidebarContent] Error loading pages:`, error)
    }
  }, [pages, error])

  // Highlight new item for 2 seconds
  useEffect(() => {
    if (newItemId) {
      const timer = setTimeout(() => {
        setNewItemId(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [newItemId])

  // Add effect to log pages when they change
  useEffect(() => {
    console.log(`[SidebarContent] Received ${pages.length} pages`)
  }, [pages])

  // Handle opening delete dialog
  const handleOpenDeleteDialog = (page: ModulePage) => {
    setPageToDelete({
      id: page.id,
      title: page.title || 'Untitled Page',
    })
    setDeleteDialogOpen(true)
  }

  // Handle status change
  const handleStatusChange = (
    page: ModulePage,
    newStatus: ModulePageStatus
  ) => {
    if (page.status === newStatus) return

    updatePageStatus({
      pageId: page.id,
      status: newStatus,
    })
  }

  // Handle creating a new page - versi yang disederhanakan
  const handleCreatePage = async () => {
    try {
      setIsCreating(true)

      // Gunakan fungsi dari context untuk membuat halaman baru
      const newPage = await handleCreateNewPage()

      if (newPage) {
        // Tandai halaman baru untuk highlighting
        setNewItemId(newPage.id)

        toast.success('Halaman baru berhasil dibuat')
      }
    } catch (error) {
      console.error('Error creating new page:', error)

      // Detail error handling
      let errorMessage = 'Gagal membuat halaman. Silakan coba lagi.'

      if (error instanceof Error) {
        errorMessage = error.message || errorMessage
      }

      toast.error(errorMessage, {
        action: {
          label: 'Coba Lagi',
          onClick: () => handleCreatePage(),
        },
        position: 'top-center',
        duration: 5000,
      })
    } finally {
      // Add small delay before turning off loading state for better UX
      setTimeout(() => {
        setIsCreating(false)
      }, 300)
    }
  }

  return (
    <div className="p-4 border-b border-[#3b3b3b]">
      <div className="flex items-center justify-between mb-2">
        <span>Content</span>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCreatePage}
            disabled={isCreating}
            aria-label="Tambah halaman baru"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative mb-2">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#96999e]" />
        <Input
          placeholder="Search by title"
          className="pl-8 bg-[#1f1f21] border-[#3b3b3b] h-9 focus-visible:ring-[#669df1]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-1 mt-4">
        {/* Struktur folder modul */}
        <SidebarItem
          icon={<Folder className="h-4 w-4" />}
          label="Modul Content"
          onClick={() => toggleExpand('ModuleContent')}
        />

        {expandedItems['ModuleContent'] && (
          <div className="ml-4 space-y-1">
            {/* Daftar halaman modul */}
            {filteredPages.length > 0 ? (
              filteredPages.map((page) => (
                <div
                  key={page.id}
                  className={cn(
                    'relative group transition-all duration-300',
                    newItemId === page.id &&
                      'animate-pulse bg-[#1c2b42]/30 rounded'
                  )}
                >
                  <SidebarNestedItem
                    label={page.title || 'Untitled Page'}
                    onClick={() => contextHandleSelectPage(page)}
                    isActive={activePage?.id === page.id}
                    isArchived={page.status === ModulePageStatus.ARCHIVED}
                    status={page.status}
                    icon={<FileText className="h-3.5 w-3.5 mr-1.5" />}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 top-1"
                        aria-label="Opsi halaman"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-[#1f1f21] border-[#3b3b3b] text-[#e3e4f2]"
                    >
                      {page.status === ModulePageStatus.DRAFT && (
                        <DropdownMenuItem
                          className="flex items-center cursor-pointer hover:bg-[#242528]"
                          onClick={() =>
                            handleStatusChange(page, ModulePageStatus.PUBLISHED)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2 text-green-400" />
                          <span>Publikasikan</span>
                        </DropdownMenuItem>
                      )}

                      {page.status === ModulePageStatus.PUBLISHED && (
                        <DropdownMenuItem
                          className="flex items-center cursor-pointer hover:bg-[#242528]"
                          onClick={() =>
                            handleStatusChange(page, ModulePageStatus.DRAFT)
                          }
                        >
                          <EyeOff className="h-4 w-4 mr-2 text-yellow-400" />
                          <span>Kembalikan ke Draft</span>
                        </DropdownMenuItem>
                      )}

                      {page.status !== ModulePageStatus.ARCHIVED && (
                        <DropdownMenuItem
                          className="flex items-center cursor-pointer hover:bg-[#242528]"
                          onClick={() =>
                            handleStatusChange(page, ModulePageStatus.ARCHIVED)
                          }
                        >
                          <Archive className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Arsipkan</span>
                        </DropdownMenuItem>
                      )}

                      {page.status === ModulePageStatus.ARCHIVED && (
                        <DropdownMenuItem
                          className="flex items-center cursor-pointer hover:bg-[#242528]"
                          onClick={() =>
                            handleStatusChange(page, ModulePageStatus.DRAFT)
                          }
                        >
                          <FileText className="h-4 w-4 mr-2 text-yellow-400" />
                          <span>Pulihkan ke Draft</span>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        className="flex items-center cursor-pointer hover:bg-[#242528]"
                        onClick={() => handleOpenDeleteDialog(page)}
                      >
                        <Trash className="h-4 w-4 mr-2 text-red-400" />
                        <span>Hapus Halaman</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <div className="text-sm text-[#a9abaf] px-2 py-1">
                {searchTerm
                  ? 'Tidak ada halaman ditemukan'
                  : 'Belum ada halaman'}
              </div>
            )}

            {/* Tombol tambah halaman baru dalam folder */}
            <Button
              variant="ghost"
              className="w-full justify-start text-[#a9abaf] text-xs pl-6"
              onClick={handleCreatePage}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  <span>Membuat halaman...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-2" />
                  <span>Tambah Halaman</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {pageToDelete && (
        <DeletePageConfirmation
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          pageId={pageToDelete.id}
          pageTitle={pageToDelete.title}
        />
      )}
    </div>
  )
}
