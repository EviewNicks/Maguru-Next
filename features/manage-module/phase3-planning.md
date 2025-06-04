# Rencana Implementasi Phase 3: UI Integration untuk Auto-save Draft

## Ringkasan Tujuan

Mengintegrasikan fitur auto-save draft yang sudah diimplementasikan di server-side dan client-side core ke dalam UI komponen. Fase ini akan fokus pada pengembangan komponen UI yang memberikan feedback visual kepada pengguna tentang status draft, dialog untuk pemulihan draft, dan konfirmasi navigasi saat ada perubahan yang belum tersimpan.

## Analisis Status Implementasi Saat Ini

Berdasarkan implementasi yang sudah dilakukan pada Phase 1 dan 2:

1. **Server-side Implementation (Phase 1)**

   - Schema database sudah diperbarui dengan field untuk draft
   - Service layer (`modulePageService.ts`) sudah diimplementasikan dengan fungsi-fungsi draft
   - API routes untuk operasi draft sudah dibuat dan diuji

2. **Client-side Core Implementation (Phase 2)**
   - Adapter layer (`modulePageAdapter.ts`) sudah diperbarui dengan fungsi-fungsi draft
   - Hooks layer (`useRichTextAutosave`, `useDraftRecovery`, `useUnsavedChangesPrompt`) sudah diimplementasikan
   - Context layer (`ModulePageCRUDContext`) sudah diperbarui dengan state dan handler untuk draft

## Komponen UI yang Perlu Diimplementasikan

Berdasarkan arsitektur dan alur yang ada, berikut adalah komponen UI yang perlu diimplementasikan:

### 1. DraftStatusIndicator

Komponen yang menampilkan status penyimpanan draft kepada pengguna.

```typescript
// features\manage-module\components\feedback\DraftStatusIndicator.tsx
import { DraftSaveStatus } from '../types'

interface DraftStatusIndicatorProps {
  status: DraftSaveStatus
  lastSavedAt: Date | null
  formattedLastSaved: string
  error: Error | null
  onRetry?: () => void
  ariaLive?: 'polite' | 'assertive' | 'off'
}

export function DraftStatusIndicator({
  status,
  lastSavedAt,
  formattedLastSaved,
  error,
  onRetry,
  ariaLive = 'polite',
}: DraftStatusIndicatorProps) {
  // Implementasi komponen
}
```

### 2. UnsavedChangesDialog

Dialog yang muncul saat pengguna mencoba meninggalkan halaman dengan perubahan yang belum tersimpan.

```typescript
// features/manage-module/components/UnsavedChangesDialog.tsx
interface UnsavedChangesDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  message?: string
  initialFocus?: 'confirm' | 'cancel'
}

export function UnsavedChangesDialog({
  isOpen,
  onConfirm,
  onCancel,
  message = 'Perubahan belum tersimpan. Anda yakin ingin meninggalkan halaman?',
  initialFocus = 'cancel',
}: UnsavedChangesDialogProps) {
  // Implementasi dialog
}
```

### 3. DraftRecoveryDialog

Dialog yang muncul saat sistem mendeteksi adanya draft yang belum dipulihkan.

```typescript
// features/manage-module/components/DraftRecoveryDialog.tsx
interface DraftRecoveryDialogProps {
  isOpen: boolean
  onRecover: () => void
  onDiscard: () => void
  onCancel: () => void
  draftSavedAt: Date | null
  formattedDraftTime: string
  editorName?: string
  initialFocus?: 'recover' | 'discard' | 'cancel'
}

export function DraftRecoveryDialog({
  isOpen,
  onRecover,
  onDiscard,
  onCancel,
  draftSavedAt,
  formattedDraftTime,
  editorName,
  initialFocus = 'recover',
}: DraftRecoveryDialogProps) {
  // Implementasi dialog
}
```

### 4. RichTextEditorWithAutosave

Perbarui komponen editor yang sudah ada untuk mengintegrasikan fitur auto-save dengan Tiptap Editor.

```typescript
// features/manage-module/components/RichTextEditorWithAutosave.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useRichTextAutosave } from '../hooks/useRichTextAutosave'
import { DraftStatusIndicator } from './DraftStatusIndicator'

interface RichTextEditorWithAutosaveProps {
  pageId: string
  initialContent: StandardEditorContent
  onChange?: (content: StandardEditorContent) => void
  readOnly?: boolean
  autoSaveConfig?: {
    debounceTime?: number
    throttleTime?: number
    saveOnBlur?: boolean
    saveOnVisibilityChange?: boolean
    saveOnBeforeUnload?: boolean
  }
}

export function RichTextEditorWithAutosave({
  pageId,
  initialContent,
  onChange,
  readOnly = false,
  autoSaveConfig = {
    debounceTime: 5000,
    throttleTime: 30000,
    saveOnBlur: true,
    saveOnVisibilityChange: true,
    saveOnBeforeUnload: true,
  },
}: RichTextEditorWithAutosaveProps) {
  // Inisialisasi Tiptap Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      // Panggil onChange callback jika ada
      if (onChange) {
        onChange(editor.getJSON() as StandardEditorContent)
      }
    },
  })

  // Gunakan useRichTextAutosave hook dengan editor
  const {
    saveStatus,
    lastSavedAt,
    formattedLastSaved,
    hasUnsavedChanges,
    forceSave,
    error,
  } = useRichTextAutosave({
    editor,
    pageId,
    enabled: !readOnly && !!editor,
    config: autoSaveConfig,
  })

  // Implementasi komponen dengan auto-save
}
```

### 5. ActiveEditorIndicator

Komponen yang menampilkan informasi tentang pengguna lain yang sedang mengedit halaman yang sama.

```typescript
// features/manage-module/components/ActiveEditorIndicator.tsx
interface ActiveEditorIndicatorProps {
  editors: Array<{
    id: string
    name: string
    lastActive: Date
    avatar?: string
  }>
  hasConflict?: boolean
  onResolveConflict?: () => void
}

export function ActiveEditorIndicator({
  editors,
  hasConflict = false,
  onResolveConflict,
}: ActiveEditorIndicatorProps) {
  // Implementasi komponen
}
```

## Integrasi dengan DocumentHeader

Perbarui komponen `DocumentHeader` yang sudah ada untuk menampilkan status draft dan tombol aksi terkait draft.

```typescript
// features/manage-module/components/DocumentHeader.tsx
import { DraftStatusIndicator } from './DraftStatusIndicator'
import { ActiveEditorIndicator } from './ActiveEditorIndicator'

interface DocumentHeaderProps {
  title: string
  onTitleChange?: (title: string) => void
  draftSaveStatus: DraftSaveStatus
  lastSavedAt: Date | null
  formattedLastSaved: string
  hasUnpublishedChanges: boolean
  onPublishDraft?: () => void
  onDiscardDraft?: () => void
  onForceSave?: () => void
  draftError: Error | null
  activeEditors?: Array<{
    id: string
    name: string
    lastActive: Date
    avatar?: string
  }>
  hasEditingConflict?: boolean
  onResolveConflict?: () => void
}

export function DocumentHeader(
  {
    // Props implementation
  }: DocumentHeaderProps
) {
  // Implementasi komponen
}
```

## Alur Implementasi

### 1. Implementasi Komponen Dasar (1 hari)

#### 1.1 DraftStatusIndicator

- Implementasi tampilan untuk berbagai status (saving, saved, unsaved, error, offline, retrying)
- Integrasi dengan sistem tema (light/dark mode)
- Implementasi animasi untuk status saving dan retrying
- Implementasi aksesibilitas dengan atribut ARIA (aria-live, role)
- Unit test untuk memastikan tampilan yang benar untuk setiap status

#### 1.2 UnsavedChangesDialog

- Implementasi dialog konfirmasi menggunakan shadcn/ui Dialog
- Styling yang konsisten dengan design system
- Implementasi keyboard shortcuts (Escape untuk cancel, Enter untuk confirm)
- Implementasi aksesibilitas dengan atribut ARIA (aria-modal, aria-labelledby)
- Implementasi focus trap dan focus management
- Unit test untuk memastikan callback yang benar dipanggil

#### 1.3 DraftRecoveryDialog

- Implementasi dialog recovery menggunakan shadcn/ui Dialog
- Tampilan informasi draft (waktu penyimpanan, editor)
- Implementasi tombol aksi (recover, discard, cancel)
- Implementasi aksesibilitas dengan atribut ARIA
- Implementasi focus trap dan focus management
- Unit test untuk memastikan callback yang benar dipanggil

### 2. Integrasi dengan Komponen yang Ada (1 hari)

#### 2.1 RichTextEditorWithAutosave

- Integrasi `useRichTextAutosave` hook dengan Tiptap Editor
- Implementasi debounced save saat pengguna mengetik menggunakan Tiptap events
- Implementasi event-based save menggunakan Tiptap dan browser events:
  - `editor.on('blur')` untuk save on blur
  - `document.addEventListener('visibilitychange')` untuk save on visibility change
  - `window.addEventListener('beforeunload')` untuk save on beforeunload
- Tampilkan `DraftStatusIndicator` di dalam editor
- Implementasi status "retrying" untuk retry mechanism saat terjadi error
- Implementasi offline detection dan sync queue
- Unit test untuk memastikan auto-save berfungsi dengan benar

#### 2.2 DocumentHeader

- Tambahkan `DraftStatusIndicator` ke header
- Tambahkan tombol untuk publish dan discard draft
- Implementasi konfirmasi sebelum discard draft
- Integrasi dengan `ActiveEditorIndicator` untuk concurrent editing
- Implementasi aksesibilitas dengan atribut ARIA
- Unit test untuk memastikan interaksi yang benar

### 3. Implementasi Fitur Concurrent Editing (1 hari)

#### 3.1 ActiveEditorIndicator

- Implementasi komponen untuk menampilkan pengguna aktif
- Integrasi dengan `ConcurrentEditingService`
- Implementasi mekanisme deteksi pengguna aktif:
  - Periodic heartbeat API call (setiap 30 detik)
  - Update status saat user melakukan aksi (save, edit)
  - Timeout untuk inactive users (5 menit)
- Styling yang konsisten dengan design system
- Implementasi aksesibilitas dengan atribut ARIA
- Unit test untuk memastikan tampilan yang benar

#### 3.2 Integrasi dengan ModulePageCRUDContext

- Tambahkan state untuk concurrent editing:
  ```typescript
  activeEditors: Array<{
    id: string
    name: string
    lastActive: Date
    avatar?: string
  }>
  hasEditingConflict: boolean
  ```
- Implementasi polling untuk mendapatkan informasi pengguna aktif:

  ```typescript
  useEffect(() => {
    if (!pageId) return

    const interval = setInterval(async () => {
      const activeUsers =
        await concurrentEditingService.getActiveEditors(pageId)
      setActiveEditors(activeUsers)
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [pageId])
  ```

- Implementasi handler untuk konflik editing:
  ```typescript
  const resolveConflict = async () => {
    // Implementasi resolusi konflik
    // 1. Get latest version
    // 2. Show diff
    // 3. Allow user to choose version
  }
  ```
- Unit test untuk memastikan penanganan konflik yang benar

### 4. Testing dan Refinement (1 hari)

#### 4.1 Unit Testing

- Test untuk setiap komponen UI
- Test untuk hooks dan services
- Test untuk edge cases:
  - Offline mode
  - Recovery setelah crash
  - Concurrent editing conflicts
  - Session timeout
  - Large content handling

#### 4.2 Integration Testing

- Test interaksi antar komponen
- Test alur pengguna untuk skenario umum:
  - Auto-save saat mengetik
  - Recovery draft setelah refresh
  - Publish draft
  - Discard draft
  - Navigasi dengan unsaved changes

#### 4.3 E2E Testing

- Test alur pengguna lengkap menggunakan Playwright
- Test concurrent editing dengan multiple browser sessions
- Test offline mode dengan network throttling

#### 4.4 Performance Testing

- Test performa auto-save dengan large content
- Test memory usage untuk long editing sessions
- Test network usage untuk frequent saves

#### 4.5 Refinement UI

- Perbaikan UI berdasarkan feedback
- Optimasi animasi dan transisi
- Perbaikan aksesibilitas

## Implementasi Detail

### 1. DraftStatusIndicator

Komponen ini akan menampilkan status penyimpanan draft dengan ikon dan teks yang sesuai:

- **Saved**: Ikon checkmark hijau dengan label "Tersimpan" + timestamp
- **Saving**: Animasi loading dengan label "Menyimpan..."
- **Unsaved**: Indikator warna amber dengan label "Belum tersimpan"
- **Error**: Indikator merah dengan label "Gagal menyimpan" dan tombol "Coba lagi"
- **Offline**: Indikator dengan label "Anda offline"
- **Retrying**: Animasi loading dengan label "Mencoba ulang..."

Komponen ini akan menggunakan shadcn/ui Badge dan Tooltip untuk styling yang konsisten.

Implementasi aksesibilitas:

- Menggunakan `aria-live="polite"` untuk mengumumkan perubahan status
- Menggunakan warna yang memenuhi kontras WCAG AA
- Menyediakan informasi status yang jelas melalui teks, tidak hanya warna

### 2. UnsavedChangesDialog

Dialog ini akan muncul saat pengguna mencoba meninggalkan halaman dengan perubahan yang belum tersimpan. Dialog akan menampilkan:

- Pesan peringatan tentang perubahan yang belum tersimpan
- Tombol "Simpan dan Lanjutkan" untuk menyimpan perubahan dan melanjutkan navigasi
- Tombol "Tinggalkan" untuk meninggalkan halaman tanpa menyimpan
- Tombol "Batal" untuk membatalkan navigasi

Dialog ini akan menggunakan shadcn/ui Dialog dan Button untuk styling yang konsisten.

Implementasi aksesibilitas:

- Menggunakan `aria-modal="true"` untuk menandakan dialog modal
- Menggunakan `aria-labelledby` dan `aria-describedby` untuk label dan deskripsi
- Implementasi focus trap untuk memastikan fokus tetap di dalam dialog
- Mengembalikan fokus ke elemen sebelumnya saat dialog ditutup
- Mendukung navigasi keyboard (Tab, Escape, Enter)

### 3. DraftRecoveryDialog

Dialog ini akan muncul saat sistem mendeteksi adanya draft yang belum dipulihkan. Dialog akan menampilkan:

- Informasi tentang draft (waktu penyimpanan, editor)
- Tombol "Pulihkan Draft" untuk memulihkan draft
- Tombol "Buang Draft" untuk membuang draft
- Tombol "Batal" untuk membatalkan dan melihat konten yang sudah dipublish

Dialog ini akan menggunakan shadcn/ui Dialog, Card, dan Button untuk styling yang konsisten.

Implementasi aksesibilitas:

- Menggunakan `aria-modal="true"` untuk menandakan dialog modal
- Menggunakan `aria-labelledby` dan `aria-describedby` untuk label dan deskripsi
- Implementasi focus trap untuk memastikan fokus tetap di dalam dialog
- Mengembalikan fokus ke elemen sebelumnya saat dialog ditutup
- Mendukung navigasi keyboard (Tab, Escape, Enter)

### 4. RichTextEditorWithAutosave

Komponen ini akan mengintegrasikan `useRichTextAutosave` hook dengan Tiptap Editor. Komponen akan:

- Menyimpan perubahan secara otomatis saat pengguna mengetik (debounced) menggunakan Tiptap events:
  ```typescript
  editor.on(
    'update',
    debounce(() => {
      saveContent(editor.getJSON())
    }, debounceTime)
  )
  ```
- Menyimpan perubahan saat editor kehilangan fokus:
  ```typescript
  editor.on('blur', () => {
    if (saveOnBlur && hasUnsavedChanges) {
      saveContent(editor.getJSON())
    }
  })
  ```
- Menyimpan perubahan saat tab/window kehilangan fokus:
  ```typescript
  const handleVisibilityChange = () => {
    if (
      document.visibilityState === 'hidden' &&
      saveOnVisibilityChange &&
      hasUnsavedChanges
    ) {
      saveContent(editor.getJSON())
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  ```
- Menyimpan perubahan sebelum navigasi keluar:
  ```typescript
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (saveOnBeforeUnload && hasUnsavedChanges) {
      saveContent(editor.getJSON())
      e.preventDefault()
      e.returnValue = ''
    }
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
  ```
- Menampilkan `DraftStatusIndicator` di dalam editor
- Implementasi offline detection dan sync queue:

  ```typescript
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const syncQueue = useRef<
    Array<{ content: StandardEditorContent; timestamp: number }>
  >([])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Process sync queue
      if (syncQueue.current.length > 0) {
        processSyncQueue()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const processSyncQueue = async () => {
    if (!isOnline || syncQueue.current.length === 0) return

    setSaveStatus('retrying')

    try {
      // Sort by timestamp
      syncQueue.current.sort((a, b) => a.timestamp - b.timestamp)

      // Get latest content
      const latestContent =
        syncQueue.current[syncQueue.current.length - 1].content

      // Save to server
      await modulePageAdapter.saveDraft(pageId, latestContent, userId)

      // Clear queue
      syncQueue.current = []

      setSaveStatus('saved')
      setLastSavedAt(new Date())
    } catch (error) {
      setSaveStatus('error')
      setError(error as Error)
    }
  }
  ```

### 5. ActiveEditorIndicator

Komponen ini akan menampilkan informasi tentang pengguna lain yang sedang mengedit halaman yang sama. Komponen akan:

- Menampilkan avatar pengguna yang sedang aktif
- Menampilkan nama pengguna dan waktu terakhir aktif
- Memberikan peringatan jika ada potensi konflik editing
- Implementasi deteksi konflik:

  ```typescript
  const hasConflict = useMemo(() => {
    // Check if there are other active editors
    if (editors.length <= 1) return false

    // Check if any editor has edited the same section
    return editors.some(
      (editor) =>
        editor.id !== currentUserId &&
        editor.lastActive > new Date(Date.now() - 5 * 60 * 1000) // Active in the last 5 minutes
    )
  }, [editors, currentUserId])
  ```

Implementasi aksesibilitas:

- Menggunakan `aria-live="polite"` untuk mengumumkan perubahan editor aktif
- Menggunakan warna yang memenuhi kontras WCAG AA
- Menyediakan informasi yang jelas melalui teks, tidak hanya visual

## Pertimbangan Keamanan

1. **Validasi Input**:

   - Validasi konten editor sebelum dikirim ke server
   - Sanitasi konten untuk mencegah XSS attacks
   - Validasi authorId untuk mencegah unauthorized saves

2. **Otorisasi**:

   - Pastikan hanya pengguna yang berwenang yang dapat menyimpan draft
   - Verifikasi permission sebelum publish draft
   - Log semua aktivitas untuk audit trail

3. **Proteksi Data**:
   - Enkripsi data draft yang disimpan di IndexedDB
   - Hapus data sensitif dari sync queue setelah berhasil disimpan
   - Implementasi timeout untuk session yang tidak aktif

## Pertimbangan Performa

1. **Optimasi Penyimpanan**:

   - Gunakan debounce dan throttle untuk mengurangi jumlah request
   - Simpan hanya delta changes jika memungkinkan
   - Batasi ukuran draft yang disimpan

2. **Optimasi Rendering**:

   - Gunakan React.memo untuk mencegah re-render yang tidak perlu
   - Gunakan useMemo dan useCallback untuk memoize fungsi dan nilai
   - Lazy load komponen yang berat seperti dialog

3. **Optimasi Network**:
   - Implementasi caching untuk mengurangi request ke server
   - Gunakan compression untuk mengurangi ukuran payload
   - Implementasi retry mechanism dengan exponential backoff

## Referensi File

### Hooks yang Sudah Diimplementasikan

- `features/manage-module/hooks/useRichTextAutosave.ts`
- `features/manage-module/hooks/useDraftRecovery.ts`
- `features/manage-module/hooks/useUnsavedChangesPrompt.ts`

### Services yang Sudah Diimplementasikan

- `features/manage-module/lib/DraftFeedbackService.ts`
- `features/manage-module/lib/ConcurrentEditingService.ts`

### Context yang Sudah Diperbarui

- `features/manage-module/context/ModulePageCRUDContext.tsx`

### Komponen yang Perlu Diperbarui

- `features/manage-module/components/RichTextEditor.tsx`
- `features/manage-module/components/DocumentHeader.tsx`

## Integrasi dengan Arsitektur yang Ada

Berdasarkan arsitektur yang dijelaskan di `architecture-module-page.md`, implementasi UI akan mengikuti alur:

1. **User Interaction → React Components**

   - Pengguna berinteraksi dengan komponen (misalnya mengetik di editor)
   - Komponen memanggil handler dari context

2. **React Components → Context**

   - Context menerima event dari komponen
   - Context memanggil fungsi dari hooks

3. **Context → Hooks**

   - Hooks mengelola state dan logika bisnis
   - Hooks memanggil fungsi dari adapter

4. **Hooks → Adapter → API**
   - Adapter memanggil API untuk operasi CRUD
   - API memanggil service untuk operasi database

Dengan alur ini, komponen UI yang diimplementasikan akan terintegrasi dengan baik dengan arsitektur yang sudah ada.

## Integrasi dengan Tiptap Editor

Tiptap Editor adalah framework editor berbasis ProseMirror yang digunakan dalam proyek ini. Untuk mengintegrasikan fitur auto-save dengan Tiptap, kita akan:

1. **Memanfaatkan Tiptap Events**:

   - `editor.on('update')` untuk mendeteksi perubahan konten
   - `editor.on('blur')` untuk mendeteksi saat editor kehilangan fokus
   - `editor.on('focus')` untuk mendeteksi saat editor mendapatkan fokus

2. **Mengakses Konten Editor**:

   - `editor.getJSON()` untuk mendapatkan konten dalam format JSON
   - `editor.getHTML()` untuk mendapatkan konten dalam format HTML (jika diperlukan)

3. **Menggunakan Tiptap Extensions**:

   - `StarterKit` untuk fitur dasar editor
   - `Collaboration` extension jika ingin mengimplementasikan collaborative editing di masa depan

4. **Integrasi dengan React**:
   - Menggunakan `useEditor` hook untuk inisialisasi editor
   - Menggunakan `EditorContent` component untuk rendering editor

## Timeline Implementasi

### Hari 1: Implementasi Komponen Dasar

- Implementasi `DraftStatusIndicator`
- Implementasi `UnsavedChangesDialog`
- Implementasi `DraftRecoveryDialog`

### Hari 2: Integrasi dengan Komponen yang Ada

- Integrasi `RichTextEditorWithAutosave`
- Perbarui `DocumentHeader`

### Hari 3: Implementasi Fitur Concurrent Editing

- Implementasi `ActiveEditorIndicator`
- Integrasi dengan `ModulePageCRUDContext`

### Hari 4: Testing dan Refinement

- Unit testing
- Integration testing
- E2E testing
- Performance testing
- Refinement UI

## Kesimpulan

Implementasi Phase 3 UI Integration akan memungkinkan pengguna untuk berinteraksi dengan fitur auto-save draft melalui UI yang intuitif dan informatif. Komponen UI yang diimplementasikan akan memberikan feedback yang jelas tentang status draft, memungkinkan pemulihan draft, dan mencegah kehilangan data saat navigasi.

Dengan pendekatan yang terstruktur dan terintegrasi dengan arsitektur yang sudah ada, implementasi ini akan menjaga konsistensi dan maintainability kode sambil memberikan pengalaman pengguna yang optimal. Penambahan aspek aksesibilitas, keamanan, dan performa akan memastikan bahwa fitur ini dapat digunakan oleh semua pengguna dengan aman dan efisien.
