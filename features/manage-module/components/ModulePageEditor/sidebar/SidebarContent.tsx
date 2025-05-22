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
import {
  ModulePage,
  ContentBlockType,
  CreateModulePageInput,
} from '@/features/manage-module/types/modulePageSchema'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarContentProps {
  expandedItems: Record<string, boolean>
  toggleExpand: (item: string) => void
  pages?: ModulePage[]
  activePage?: ModulePage | null
  onSelectPage?: (page: ModulePage) => void
}

export default function SidebarContent({
  expandedItems,
  toggleExpand,
  pages = [],
  activePage,
  onSelectPage,
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
    moduleId,
    createPage,
    setActivePage,
    pages: allPages,
  } = useModulePageCRUDContext()
  const router = useRouter()

  // Filter pages based on search term
  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  // Create new page directly without dialog
  const handleCreatePage = async () => {
    if (!moduleId) {
      toast.error('ID Modul tidak ditemukan')
      return
    }

    try {
      setIsCreating(true)

      // Generate default page number
      const pageNumber = allPages.length + 1

      // Generate default title
      const defaultTitle = `Halaman Baru ${pageNumber}`

      // Determine order for the new page (at the end)
      // Gunakan Math.max dengan fallback ke 0 untuk menghindari error jika pages kosong
      const newOrder =
        pages.length > 0
          ? Math.max(...pages.map((page) => page.order || 0)) + 1
          : 1

      // Prepare new page data
      const newPageData: CreateModulePageInput = {
        title: defaultTitle,
        moduleId,
        type: 'content',
        order: newOrder,
        blocks: [
          {
            type: ContentBlockType.TEXT,
            content:
              '<p>Halaman baru Anda telah dibuat. Mulai edit konten disini.</p>',
          },
        ],
      }

      // Create new page with API
      const result = await createPage(newPageData)

      if (result?.data) {
        // Set the new page as active
        setActivePage(result.data)

        // Mark this item as new for highlighting
        setNewItemId(result.data.id)

        // Add a small delay before navigation for better UX
        setTimeout(() => {
          // Navigate to the new page
          router.push(
            `/manage-module/pages/${moduleId}?pageId=${result.data.id}`
          )
        }, 300)

        toast.success('Halaman baru berhasil dibuat')
      }
    } catch (error) {
      console.error('Error creating page:', error)

      // Detail error handling
      let errorMessage = 'Gagal membuat halaman. Silakan coba lagi.'

      if (error instanceof Error) {
        if (error.message.includes('ModuleId tidak ditemukan')) {
          errorMessage =
            'ID Modul tidak ditemukan. Silakan refresh halaman dan coba lagi.'
        } else if (error.message.includes('TypeError')) {
          errorMessage =
            'Terjadi kesalahan teknis. Halaman mungkin perlu di-refresh.'
        } else if (error.message.includes('constraint failed')) {
          errorMessage =
            'Terjadi konflik data. Sistem akan mencoba lagi secara otomatis.'

          // Jika error adalah constraint, coba lagi dengan order yang berbeda
          setTimeout(() => {
            handleCreatePage()
          }, 500)
          return
        } else {
          // Gunakan pesan error asli jika tersedia
          errorMessage = error.message || errorMessage
        }
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
                  {activePage?.id === page.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#669df1] rounded"></div>
                  )}
                  <div className="flex items-center">
                    <div className="flex-grow">
                      <SidebarNestedItem
                        label={page.title || 'Untitled Page'}
                        onClick={() => onSelectPage?.(page)}
                        className={
                          activePage?.id === page.id
                            ? 'text-[#669df1] bg-[#1c2b42]'
                            : ''
                        }
                      />
                    </div>
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

      {/* Dialog hapus halaman */}
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
