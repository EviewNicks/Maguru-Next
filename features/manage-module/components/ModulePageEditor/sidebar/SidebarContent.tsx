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
import { useState, useEffect, useMemo } from 'react'
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
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0)
  const [newlyCreatedPage, setNewlyCreatedPage] = useState<ModulePage | null>(
    null
  )

  const {
    handleSelectPage: contextHandleSelectPage,
    pages,
    activePage,
    error,
    updatePageStatus,
    handleCreateNewPage,
    refetch,
    isLoading,
  } = useModulePageCRUDContext()

  // Set debug level to INFO in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setDebugLevel(DebugLevel.DEBUG)
    }
  }, [])

  // Filter pages based on search term using useMemo with forceUpdateCounter dependency
  const filteredPages = useMemo(() => {
    console.log(
      `[SidebarContent] Recalculating filteredPages, pages count: ${Array.isArray(pages) ? pages.length : 'undefined'}, force update: ${forceUpdateCounter}`
    )

    // Pastikan array halaman valid
    const pagesArray = Array.isArray(pages) ? [...pages] : []

    if (pagesArray.length === 0) {
      console.log(
        '[SidebarContent] Warning: No pages available or pages is not an array'
      )

      // Jika pages kosong dan bukan karena loading, coba muat ulang data
      if (!error && !isLoading && forceUpdateCounter > 0) {
        console.log(
          '[SidebarContent] Pages array is empty but not in loading state, triggering refetch'
        )
        setTimeout(() => {
          refetch().then(() => {
            console.log(
              '[SidebarContent] Refetch completed after empty pages array'
            )
            setForceUpdateCounter((prev) => prev + 1)
          })
        }, 500)
      }
    }

    // Tambahkan halaman baru jika ada dan belum ada dalam array
    if (newlyCreatedPage) {
      // Double check that newlyCreatedPage is valid
      if (newlyCreatedPage && newlyCreatedPage.id) {
        const pageExists = pagesArray.some(
          (page) => page.id === newlyCreatedPage.id
        )
        if (!pageExists) {
          console.log(
            `[SidebarContent] Adding newly created page to list: ${newlyCreatedPage.title || 'Untitled'}`
          )
          pagesArray.push(newlyCreatedPage)
        }
      }
    }

    try {
      // Filter berdasarkan search term with error handling
      return pagesArray.filter(
        (page) =>
          page &&
          page.title &&
          page.title.toLowerCase().includes((searchTerm || '').toLowerCase())
      )
    } catch (error) {
      console.error('[SidebarContent] Error filtering pages:', error)
      return pagesArray // Return unfiltered array on error
    }
  }, [
    pages,
    searchTerm,
    forceUpdateCounter,
    newlyCreatedPage,
    error,
    isLoading,
    refetch,
  ])

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

  // Tambahkan debugging untuk memahami data yang ada
  useEffect(() => {
    if (Array.isArray(pages)) {
      console.log(`[SidebarContent] Data loaded - Pages count: ${pages.length}`)
      if (pages.length > 0 && pages[0]) {
        console.log(
          `[SidebarContent] First page title: ${pages[0].title || 'Untitled'}`
        )
        console.log(
          `[SidebarContent] First page status: ${pages[0].status || 'Unknown'}`
        )
      }
    } else {
      console.log(
        `[SidebarContent] Data loaded - Pages is not an array: ${typeof pages}`
      )
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
    if (Array.isArray(pages)) {
      console.log(`[SidebarContent] Received ${pages.length} pages`)

      // Log pages IDs untuk debugging
      if (pages.length > 0) {
        console.log(
          `[SidebarContent] Page IDs: ${pages.map((p) => p.id).join(', ')}`
        )
      }
    } else {
      console.log(
        `[SidebarContent] Received pages but it's not an array: ${typeof pages}`
      )
    }
  }, [pages])

  // Add effect to log pages when forceUpdateCounter changes
  useEffect(() => {
    if (forceUpdateCounter > 0) {
      console.log(
        `[SidebarContent] Force update triggered (${forceUpdateCounter}), pages count: ${pages.length}`
      )
    }
  }, [forceUpdateCounter, pages.length])

  // Clear newlyCreatedPage when it's found in the pages array
  useEffect(() => {
    if (newlyCreatedPage && Array.isArray(pages)) {
      const pageExists = pages.some((page) => page.id === newlyCreatedPage.id)
      if (pageExists) {
        console.log(
          `[SidebarContent] Newly created page found in pages array, clearing local state`
        )
        setNewlyCreatedPage(null)
      }
    }
  }, [pages, newlyCreatedPage])

  // Add effect to auto-refetch if pages array is empty but not in loading state
  useEffect(() => {
    if (Array.isArray(pages) && pages.length === 0 && !isLoading && !error) {
      console.log(
        '[SidebarContent] Empty pages array detected, triggering refetch'
      )
      refetch().catch((err) =>
        console.error('[SidebarContent] Refetch error:', err)
      )
    }
  }, [pages, isLoading, error, refetch])

  // Handle opening delete dialog
  const handleOpenDeleteDialog = (page: ModulePage) => {
    setPageToDelete({
      id: page.id,
      title: page.title || 'Untitled Page',
    })
    setDeleteDialogOpen(true)
  }

  // Force update helper function to pass to DeletePageConfirmation
  const handleForceUpdate = () => {
    console.log('[SidebarContent] Force updating after page deletion')

    // Increment counter to trigger re-render
    setForceUpdateCounter((prev) => prev + 1)

    // Force a refetch to ensure we have latest data
    refetch().catch((err) =>
      console.error('[SidebarContent] Error during force refetch:', err)
    )

    // Ensure "ModuleContent" is expanded
    if (!expandedItems['ModuleContent']) {
      toggleExpand('ModuleContent')
    }
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

        // Store the newly created page locally
        setNewlyCreatedPage(newPage)

        // Pastikan memiliki moduleId yang valid
        if (newPage.moduleId) {
          // Log untuk debug
          console.log(
            `[SidebarContent] Created page with moduleId: ${newPage.moduleId}, id: ${newPage.id}`
          )

          // Pastikan "Module Content" terbuka agar halaman baru terlihat
          if (!expandedItems['ModuleContent']) {
            toggleExpand('ModuleContent')
          }
        }

        // Force component to re-render after refetch
        setForceUpdateCounter((prev) => prev + 1)

        // Debug to verify pages are updated
        console.log(
          `[SidebarContent] After refetch - Pages count: ${pages.length}`
        )

        toast.success('Halaman baru berhasil dibuat')

        // Secara otomatis pilih halaman baru
        contextHandleSelectPage(newPage)
      }
    } catch (error) {
      console.error('Error creating new page:', error)

      // Detail error handling
      let errorMessage = 'Gagal membuat halaman. Silakan coba lagi.'

      if (error instanceof Error) {
        errorMessage = error.message || errorMessage
      }

      toast.error(errorMessage)
    } finally {
      setIsCreating(false)
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
          onForceUpdate={handleForceUpdate}
        />
      )}
    </div>
  )
}
