'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ALL_SHORTCUTS,
  ShortcutCategory,
  getShortcutsByCategory,
} from '../types/shortcuts'
import { formatKeyForPlatform } from '../utils/shortcutUtils'

interface ShortcutHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function ShortcutHelp({ isOpen, onClose }: ShortcutHelpProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<ShortcutCategory | 'all'>('all')

  // Filter shortcuts based on search query
  const filteredShortcuts = searchQuery
    ? ALL_SHORTCUTS.filter(
        (shortcut) =>
          shortcut.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          shortcut.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shortcut.key.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeTab === 'all'
      ? ALL_SHORTCUTS
      : getShortcutsByCategory(activeTab as ShortcutCategory)

  // Save preference to localStorage
  useEffect(() => {
    if (dontShowAgain) {
      localStorage.setItem('shortcutHelpDontShow', 'true')
    }
  }, [dontShowAgain])

  // Handler untuk menutup dialog
  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">Shortcut Keyboard</DialogTitle>
          <DialogDescription>
            Gunakan shortcut keyboard untuk meningkatkan produktivitas dalam
            editor.
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari shortcut..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery('')}
              aria-label="Hapus pencarian"
              title="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as ShortcutCategory | 'all')
          }
          className="w-full"
        >
          <TabsList className="mb-4 w-full justify-start overflow-auto">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="navigation">Navigasi</TabsTrigger>
            <TabsTrigger value="editing">Editing</TabsTrigger>
            <TabsTrigger value="heading">Heading</TabsTrigger>
            <TabsTrigger value="system">Sistem</TabsTrigger>
            <TabsTrigger value="content">Konten</TabsTrigger>
          </TabsList>

          <ScrollArea
            className="flex-1 pr-4"
            style={{ height: 'calc(60vh - 200px)' }}
          >
            <div className="w-full border rounded-md">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2 pl-4 font-medium">Shortcut</th>
                    <th className="text-left p-2 font-medium">Deskripsi</th>
                    <th className="text-left p-2 pr-4 font-medium">Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShortcuts.length > 0 ? (
                    filteredShortcuts.map((shortcut) => (
                      <tr key={shortcut.id} className="border-t">
                        <td className="p-2 pl-4">
                          <kbd className="bg-muted px-2 py-1 rounded text-sm font-mono">
                            {formatKeyForPlatform(shortcut.keyCombination)}
                          </kbd>
                        </td>
                        <td className="p-2">{shortcut.description}</td>
                        <td className="p-2 pr-4 text-muted-foreground">
                          {shortcut.category === 'navigation' && 'Navigasi'}
                          {shortcut.category === 'editing' && 'Editing'}
                          {shortcut.category === 'heading' && 'Heading'}
                          {shortcut.category === 'system' && 'Sistem'}
                          {shortcut.category === 'content' && 'Konten'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-4 text-center text-muted-foreground"
                      >
                        Tidak ada shortcut yang cocok dengan pencarian
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4 sm:justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <label
              htmlFor="dont-show-again"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Jangan tampilkan lagi
            </label>
          </div>
          <Button variant="default" onClick={handleClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ShortcutHelp
