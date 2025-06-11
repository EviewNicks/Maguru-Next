---
description: 
globs: plan-task.md
alwaysApply: false
---
# Phase 2: Implementasi Client-side Core untuk Auto-save Draft (3-4 hari)

## Ringkasan Fase 2

Pada fase ini, kita akan mengimplementasikan komponen-komponen client-side untuk fitur auto-save draft. Fokus utama adalah membuat hook autosave yang robust, mengimplementasikan adapter untuk komunikasi dengan API, dan memastikan UI dapat memberikan feedback yang baik ke pengguna.

## Tujuan Fase 2

1. Mengembangkan feedback service untuk menampilkan status penyimpanan draft
2. Mengupgrade hooks dan adapter untuk mendukung operasi draft
3. Implementasi mekanisme auto-save dengan debounce dan throttle
4. Handling error dan offline state
5. Implementasi mekanisme recovery draft dan penanganan konflik

## Langkah-langkah Implementasi

### 0. Verifikasi Dependency (0.5 hari)

- [x] Verifikasi dan tambahkan library yang dibutuhkan
  ```bash
  yarn add use-debounce lodash date-fns
  ```

- [x] Sesuaikan TypeScript types untuk library yang digunakan
  ```typescript
  // Tambahkan types untuk library jika diperlukan
  yarn add --save-dev @types/lodash
  ```

### 1. Upgrade Adapter (1 hari)

#### 1.1. Update modulePageAdapter.ts

**File:** `features/manage-module/adapters/modulePageAdapter.ts`

- [x] Tambahkan metode `saveDraft`
  ```typescript
  saveDraft(
    pageId: string, 
    editorContent: unknown, 
    authorId: string
  ): Promise<ModulePage | null>
  ```

- [x] Tambahkan metode `getDraft`
  ```typescript
  getDraft(pageId: string): Promise<ModulePage | null>
  ```

- [x] Tambahkan metode `publishDraft`
  ```typescript
  publishDraft(pageId: string): Promise<ModulePage | null>
  ```

- [x] Tambahkan metode `discardDraft`
  ```typescript
  discardDraft(pageId: string): Promise<boolean>
  ```

- [x] Tambahkan metode `hasDraft` untuk memeriksa keberadaan draft
  ```typescript
  hasDraft(pageId: string): Promise<boolean>
  ```

- [x] Implementasi cache invalidation untuk operasi draft
  ```typescript
  invalidateDraftCache(pageId: string): void
  ```

- [x] Tambahkan penanganan konflik saat editing simultan
  ```typescript
  // Implementasi di metode saveDraft
  async saveDraft(
    pageId: string,
    editorContent: unknown,
    authorId: string
  ): Promise<ModulePage | null> {
    try {
      // ... kode yang sudah ada
      
      // Tambahkan handling untuk konflik
      if (response.status === 409) { // Conflict status
        const errorData = await response.json()
        throw new Error(`Draft conflict: ${errorData.error || 'Another user has edited this page'}`)
      }
      
      // ... kode yang sudah ada
    } catch (error) {
      // ... error handling
    }
  }
  ```

**Dependency:** Memerlukan API routes untuk draft operations yang sudah diimplementasikan di Phase 1.

### 2. Develop Feedback Service (1 hari)

#### 2.1. Buat DraftFeedbackService

**File:** `features/manage-module/lib/DraftFeedbackService.ts`

- [x] Implementasi kelas `DraftFeedbackService` dengan metode:
  ```typescript
  class DraftFeedbackService {
    getStatusMessage(status: DraftSaveStatus, timestamp?: Date): string
    formatTimeAgo(timestamp: Date): string
    getStatusColor(status: DraftSaveStatus): string
    getStatusIcon(status: DraftSaveStatus): React.ReactNode
  }
  ```

- [x] Tambahkan enum untuk status penyimpanan
  ```typescript
  enum DraftSaveStatus {
    SAVING = 'SAVING',
    SAVED = 'SAVED',
    UNSAVED = 'UNSAVED',
    ERROR = 'ERROR',
    OFFLINE = 'OFFLINE',
    CONFLICT = 'CONFLICT' // Tambahkan status CONFLICT untuk handling konflik
  }
  ```

#### 2.2. Update types.ts untuk Feedback Service

**File:** `features/manage-module/types/index.ts`

- [x] Tambahkan tipe untuk status draft
  ```typescript
  export enum DraftSaveStatus {
    SAVING = 'SAVING',
    SAVED = 'SAVED',
    UNSAVED = 'UNSAVED',
    ERROR = 'ERROR',
    OFFLINE = 'OFFLINE',
    CONFLICT = 'CONFLICT'
  }
  ```

- [x] Tambahkan interface untuk format status feedback
  ```typescript
  export interface DraftStatusFeedback {
    status: DraftSaveStatus
    message: string
    timestamp?: Date
    color: string
    icon: React.ReactNode
  }
  ```

### 3. Upgrade Hooks Layer (1-2 hari)

#### 3.1. Enhance useRichTextAutosave Hook

**File:** `features/manage-module/hooks/useRichTextAutosave.ts`

- [x] Implementasi debounce save (menyimpan setelah pengguna berhenti mengetik selama 5 detik)
  ```typescript
  const debouncedSave = useDebouncedCallback(
    (content: StandardEditorContent) => saveContentToServer(content),
    5000
  )
  ```

- [x] Implementasi throttle save (maksimal satu penyimpanan setiap 30 detik)
  ```typescript
  const throttledSave = useThrottleCallback(
    (content: StandardEditorContent) => saveContentToServer(content),
    30000
  )
  ```

- [x] Tambahkan monitoring online/offline status
  ```typescript
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  ```

- [x] Tambahkan event listeners untuk save triggers
  ```typescript
  // Blur event
  useEffect(() => {
    const handleBlur = () => {
      if (editor && hasChanges) saveContentToServer(editor.getJSON())
    }
    
    const editorElement = editor?.options.element
    if (editorElement) {
      editorElement.addEventListener('blur', handleBlur)
      return () => editorElement.removeEventListener('blur', handleBlur)
    }
  }, [editor, hasChanges])
  
  // Visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && editor && hasChanges) {
        saveContentToServer(editor.getJSON())
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [editor, hasChanges])
  
  // Before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        saveContentToServer(editor?.getJSON())
        e.preventDefault()
        e.returnValue = ''
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [editor, hasChanges])
  ```

- [x] Implementasi Optimistic UI
  ```typescript
  // Di saveContent
  const saveContent = useCallback(async () => {
    if (!isOnline || !contentRef.current) return
    
    setSaveStatus(DraftSaveStatus.SAVING)
    try {
      // Optimistic update
      const timestamp = new Date()
      setLastSavedAt(timestamp)
      
      await onSave(contentRef.current)
      setSaveStatus(DraftSaveStatus.SAVED)
      hasChangesRef.current = false
    } catch (error) {
      console.error('Error saving content:', error)
      
      // Check if it's a conflict error
      if (error instanceof Error && error.message.includes('conflict')) {
        setSaveStatus(DraftSaveStatus.CONFLICT)
      } else {
        setSaveStatus(DraftSaveStatus.ERROR)
      }
    }
  }, [isOnline, onSave])
  ```

- [x] Pastikan integrasi yang tepat dengan Tiptap API
  ```typescript
  useEffect(() => {
    if (!editor) return
    
    const handleUpdate = ({ editor }: { editor: Editor }) => {
      // Menggunakan API Tiptap untuk mendapatkan konten
      const content = editor.getJSON() as StandardEditorContent
      contentRef.current = content
      hasChangesRef.current = true
      
      // Sisanya sama seperti sebelumnya
    }
    
    // Gunakan API event Tiptap yang benar
    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, debouncedSave, throttledSave, isOnline])
  ```

#### 3.2. Update useModulePageData Hook

**File:** `features/manage-module/hooks/useModulePageData.ts`

- [x] Tambahkan fungsi untuk draft operations
  ```typescript
  const saveDraft = async (
    pageId: string,
    content: StandardEditorContent,
    authorId: string
  ): Promise<ModulePage | null> => {
    try {
      return await modulePageAdapter.saveDraft(pageId, content, authorId)
    } catch (error) {
      toast.error('Gagal menyimpan draft')
      console.error('Error saving draft:', error)
      return null
    }
  }
  
  const getDraft = async (pageId: string): Promise<ModulePage | null> => {
    try {
      return await modulePageAdapter.getDraft(pageId)
    } catch (error) {
      console.error('Error getting draft:', error)
      return null
    }
  }
  
  const publishDraft = async (pageId: string): Promise<ModulePage | null> => {
    try {
      const result = await modulePageAdapter.publishDraft(pageId)
      if (result) {
        toast.success('Draft berhasil dipublikasikan')
        invalidateQueries()
      }
      return result
    } catch (error) {
      toast.error('Gagal mempublikasikan draft')
      console.error('Error publishing draft:', error)
      return null
    }
  }
  
  const discardDraft = async (pageId: string): Promise<boolean> => {
    try {
      const result = await modulePageAdapter.discardDraft(pageId)
      if (result) {
        toast.success('Draft berhasil dibuang')
        invalidateQueries()
      }
      return result
    } catch (error) {
      toast.error('Gagal membuang draft')
      console.error('Error discarding draft:', error)
      return false
    }
  }
  ```

- [x] Tambahkan fungsi untuk memeriksa dan recover draft
  ```typescript
  const checkForDraft = async (pageId: string): Promise<boolean> => {
    try {
      return await modulePageAdapter.hasDraft(pageId)
    } catch (error) {
      console.error('Error checking for draft:', error)
      return false
    }
  }
  ```

### 4. Update Context Layer (0.5 hari)

#### 4.1. Enhance ModulePageCRUDContext

**File:** `features/manage-module/context/ModulePageCRUDContext.tsx`

- [x] Tambahkan state dan handler untuk draft management
  ```typescript
  // Draft status state
  const [draftStatus, setDraftStatus] = useState<DraftSaveStatus>(DraftSaveStatus.SAVED)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [showDraftRecoveryDialog, setShowDraftRecoveryDialog] = useState(false)
  
  // Draft operations
  const saveDraft = async (
    pageId: string,
    content: StandardEditorContent
  ): Promise<ModulePage | null> => {
    if (!auth?.userId) return null
    
    setDraftStatus(DraftSaveStatus.SAVING)
    try {
      const result = await modulePageData.saveDraft(pageId, content, auth.userId)
      if (result) {
        setDraftStatus(DraftSaveStatus.SAVED)
        setLastSavedAt(result.draftSavedAt || new Date())
      }
      return result
    } catch (error) {
      if (error instanceof Error && error.message.includes('conflict')) {
        setDraftStatus(DraftSaveStatus.CONFLICT)
      } else {
        setDraftStatus(DraftSaveStatus.ERROR)
      }
      return null
    }
  }
  
  const handlePublishDraft = async (pageId: string): Promise<void> => {
    const result = await modulePageData.publishDraft(pageId)
    if (result) {
      setDraftStatus(DraftSaveStatus.SAVED)
      // Update active page jika ada
      if (activePage?.id === pageId) {
        setActivePage(result)
      }
    }
  }
  
  const handleDiscardDraft = async (pageId: string): Promise<void> => {
    const success = await modulePageData.discardDraft(pageId)
    if (success) {
      setDraftStatus(DraftSaveStatus.SAVED)
      // Reload page data
      const updatedPage = await modulePageData.getPage(pageId)
      if (updatedPage && activePage?.id === pageId) {
        setActivePage(updatedPage)
      }
    }
  }
  
  // Implementasi mekanisme draft recovery
  const checkForDraft = async (pageId: string): Promise<void> => {
    if (!pageId) return
    
    try {
      const hasDraft = await modulePageData.checkForDraft(pageId)
      if (hasDraft) {
        // Tampilkan dialog untuk recover draft
        setShowDraftRecoveryDialog(true)
      }
    } catch (error) {
      console.error('Error checking for draft:', error)
    }
  }
  
  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      if (draftStatus === DraftSaveStatus.OFFLINE) {
        setDraftStatus(DraftSaveStatus.UNSAVED)
      }
    }
    
    const handleOffline = () => {
      setDraftStatus(DraftSaveStatus.OFFLINE)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [draftStatus])
  
  // Panggil checkForDraft saat activePage berubah
  useEffect(() => {
    if (activePage?.id) {
      checkForDraft(activePage.id)
    }
  }, [activePage?.id])
  ```

- [x] Tambahkan nilai context baru ke provider
  ```typescript
  const contextValue = {
    // Existing values...
    
    // Draft-related values
    draftStatus,
    lastSavedAt,
    saveDraft,
    handlePublishDraft,
    handleDiscardDraft,
    showDraftRecoveryDialog,
    setShowDraftRecoveryDialog,
    
    // For UI feedback
    getDraftFeedback: () => ({
      status: draftStatus,
      timestamp: lastSavedAt,
      message: DraftFeedbackService.getStatusMessage(draftStatus, lastSavedAt),
      color: DraftFeedbackService.getStatusColor(draftStatus),
      icon: DraftFeedbackService.getStatusIcon(draftStatus)
    })
  }
  ```

## Kode Template untuk Implementasi

### 1. Module Page Adapter - Draft Operations

```typescript
// Di modulePageAdapter.ts

async saveDraft(
  pageId: string,
  editorContent: unknown,
  authorId: string
): Promise<ModulePage | null> {
  try {
    this.validatePageId(pageId)
    
    // Pastikan content valid dan dalam format yang benar
    const validContent = ensureValidEditorContent(editorContent)
    
    // Kirim request ke API
    const response = await fetch(`/api/module/${moduleId}/pages/${pageId}/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: validContent,
        authorId,
      }),
    })
    
    // Handle conflict
    if (response.status === 409) {
      const errorData = await response.json()
      throw new Error(`Draft conflict: ${errorData.error || 'Another user has edited this page'}`)
    }
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to save draft')
    }
    
    const data = await response.json()
    
    // Invalidate cache
    this.invalidatePageCache(pageId)
    
    return data.data
  } catch (error) {
    console.error('Error saving draft:', error)
    throw error // Re-throw untuk penanganan error di layer hooks
  }
}

// Method untuk memeriksa keberadaan draft
async hasDraft(pageId: string): Promise<boolean> {
  try {
    this.validatePageId(pageId)
    
    const moduleId = modulePageService.getModuleIdFromStorage()
    if (!moduleId) throw new Error('Module ID is required')
    
    const response = await fetch(`/api/module/${moduleId}/pages/${pageId}/draft`)
    
    if (!response.ok) {
      return false
    }
    
    const data = await response.json()
    return data.success && data.data && data.data.hasUnpublishedChanges
  } catch (error) {
    console.error('Error checking for draft:', error)
    return false
  }
}
```

### 2. useRichTextAutosave Hook

```typescript
// Di useRichTextAutosave.ts

export const useRichTextAutosave = ({
  editor,
  pageId,
  onSave,
  onStatusChange,
}: RichTextAutosaveProps) => {
  const [saveStatus, setSaveStatus] = useState<DraftSaveStatus>(DraftSaveStatus.SAVED)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const contentRef = useRef<StandardEditorContent | null>(null)
  const hasChangesRef = useRef(false)
  
  // Deteksi Online/Offline status
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (hasChangesRef.current) {
        setSaveStatus(DraftSaveStatus.UNSAVED)
      }
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setSaveStatus(DraftSaveStatus.OFFLINE)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Implement save function with optimistic updates
  const saveContent = useCallback(async () => {
    if (!isOnline || !contentRef.current) return
    
    setSaveStatus(DraftSaveStatus.SAVING)
    try {
      // Optimistic update
      const timestamp = new Date()
      setLastSavedAt(timestamp)
      
      await onSave(contentRef.current)
      setSaveStatus(DraftSaveStatus.SAVED)
      hasChangesRef.current = false
    } catch (error) {
      console.error('Error saving content:', error)
      
      // Check if it's a conflict error
      if (error instanceof Error && error.message.includes('conflict')) {
        setSaveStatus(DraftSaveStatus.CONFLICT)
      } else {
        setSaveStatus(DraftSaveStatus.ERROR)
      }
    }
  }, [isOnline, onSave])
  
  // Debounced save (after 5 seconds of inactivity)
  const debouncedSave = useDebouncedCallback(saveContent, 5000)
  
  // Throttled save (at most once every 30 seconds)
  const throttledSave = useThrottleCallback(saveContent, 30000)
  
  // Handle editor updates with proper Tiptap integration
  useEffect(() => {
    if (!editor) return
    
    const handleUpdate = ({ editor }: { editor: Editor }) => {
      // Proper Tiptap API usage
      const content = editor.getJSON() as StandardEditorContent
      contentRef.current = content
      hasChangesRef.current = true
      
      if (isOnline) {
        setSaveStatus(DraftSaveStatus.UNSAVED)
        // Both debounce and throttle
        debouncedSave()
        throttledSave()
      } else {
        setSaveStatus(DraftSaveStatus.OFFLINE)
      }
    }
    
    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, debouncedSave, throttledSave, isOnline])
  
  // Handle blur save
  useEffect(() => {
    if (!editor) return
    
    const handleBlur = () => {
      if (hasChangesRef.current && isOnline) {
        // Cancel debounced save dan lakukan save langsung
        debouncedSave.cancel()
        saveContent()
      }
    }
    
    editor.on('blur', handleBlur)
    return () => {
      editor.off('blur', handleBlur)
    }
  }, [editor, saveContent, debouncedSave, isOnline])
  
  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasChangesRef.current && isOnline) {
        // Cancel debounced save dan lakukan save langsung
        debouncedSave.cancel()
        saveContent()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [saveContent, debouncedSave, isOnline])
  
  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        if (isOnline) {
          // Mencoba untuk menyimpan sebelum halaman ditutup
          // Note: ini bersifat best-effort, tidak ada jaminan berhasil
          saveContent()
        }
        
        // Tampilkan dialog konfirmasi native browser
        e.preventDefault()
        e.returnValue = ''
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [saveContent, isOnline])
  
  // Notify status change
  useEffect(() => {
    onStatusChange?.(saveStatus, lastSavedAt)
  }, [saveStatus, lastSavedAt, onStatusChange])
  
  // Expose save method for manual saving
  const forceSave = useCallback(() => {
    if (contentRef.current && isOnline) {
      debouncedSave.cancel()
      saveContent()
    }
  }, [saveContent, debouncedSave, isOnline])
  
  return {
    saveStatus,
    lastSavedAt,
    isOnline,
    forceSave,
    hasUnsavedChanges: () => hasChangesRef.current,
  }
}
```

### 3. Draft Recovery Dialog Component

```tsx
// components/DraftRecoveryDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@/components/ui'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface DraftRecoveryDialogProps {
  open: boolean
  onClose: () => void
  onRestore: () => void
  onDiscard: () => void
  draftSavedAt?: Date
}

export const DraftRecoveryDialog = ({
  open,
  onClose,
  onRestore,
  onDiscard,
  draftSavedAt
}: DraftRecoveryDialogProps) => {
  const timeAgo = draftSavedAt
    ? formatDistanceToNow(draftSavedAt, { addSuffix: true, locale: id })
    : 'sebelumnya'

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogTitle>Pulihkan Draft</DialogTitle>
      <DialogContent>
        <p className="mb-4">
          Ditemukan draft yang tersimpan {timeAgo}. Apakah Anda ingin memulihkannya?
        </p>
        <p className="text-sm text-muted-foreground">
          Memulihkan draft akan menggantikan konten saat ini dengan versi draft.
          Membuang draft akan menghapus versi draft dan mempertahankan konten saat ini.
        </p>
      </DialogContent>
      <DialogActions>
        <Button variant="outline" onClick={onClose}>
          Tutup
        </Button>
        <Button variant="destructive" onClick={onDiscard}>
          Buang Draft
        </Button>
        <Button onClick={onRestore}>
          Pulihkan Draft
        </Button>
      </DialogActions>
    </Dialog>
  )
}
```

## Timeline Fase 2

| Hari | Tugas                                      | File                                                   |
|------|--------------------------------------------|---------------------------------------------------------|
| 0.5  | Verifikasi Dependency                      | package.json                                           |
| 1    | Upgrade modulePageAdapter.ts               | features/manage-module/adapters/modulePageAdapter.ts    |
| 2    | Develop DraftFeedbackService               | features/manage-module/lib/DraftFeedbackService.ts     |
|      | Update types.ts                            | features/manage-module/types/index.ts                  |
| 3-4  | Enhance useRichTextAutosave Hook           | features/manage-module/hooks/useRichTextAutosave.ts    |
|      | Update useModulePageData Hook              | features/manage-module/hooks/useModulePageData.ts      |
|      | Update ModulePageCRUDContext               | features/manage-module/context/ModulePageCRUDContext.tsx|
|      | Create DraftRecoveryDialog                 | features/manage-module/components/DraftRecoveryDialog.tsx|

## Testing Plan untuk Fase 2

1. **Unit Testing:**
   - DraftFeedbackService
   - useRichTextAutosave hook
   - Draft recovery mechanism

2. **Integration Testing:**
   - Draft operations via modulePageAdapter
   - Auto-save mechanism in hooks
   - Conflict handling
   - Online/offline handling

3. **Edge Case Testing:**
   - Simulasi network interruption
   - Simulasi concurrent editing
   - Browser crash/refresh
   - Tab/window focus handling

## Dependency dan Prerequisites

1. Struktur API sudah dibuat di Phase 1
2. Tipe-tipe data sudah didefinisikan di `types/index.ts`
3. UI Components akan diimplementasikan di Phase 3
4. Memerlukan library:
   - `use-debounce` - Untuk implementasi debounced save
   - `lodash` - Untuk implementasi throttled save dan utility functions
   - `date-fns` - Untuk formatting timestamps

## Catatan Penting

- **Error Handling:** Pastikan setiap operasi memiliki error handling yang baik, dengan penanganan khusus untuk konflik editing
- **Online/Offline Detection:** Fitur autosave harus bisa mendeteksi status koneksi internet dan memberikan feedback yang tepat
- **Performance:** Gunakan debounce dan throttle dengan tepat untuk mengurangi jumlah request ke server
- **User Experience:** Pastikan status penyimpanan selalu akurat dan up-to-date
- **Tiptap Integration:** Pastikan integrasi dengan Tiptap API dilakukan dengan benar untuk mendapatkan konten dari editor
- **Optimistic UI:** Implementasikan pendekatan optimistic UI untuk feedback yang lebih responsif
- **Draft Recovery:** Sediakan mekanisme untuk pemulihan draft yang belum dipublikasikan
- **Concurrent Editing:** Tangani konflik saat terjadi pengeditan simultan


















