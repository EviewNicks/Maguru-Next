# Planning Task OPS-140: Manajemen Konten Multi-Page

## 1. Ringkasan Proyek

### 1.1 Deskripsi

Mengimplementasikan fitur manajemen konten multi-page pada modul pembelajaran. Admin dapat membuat, mengedit, menghapus, dan mengelola halaman konten secara dinamis dalam satu modul.

### 1.2 Tujuan Utama

- **Setiap halaman dapat berisi berbagai tipe konten** (teks, kode, gambar, video) secara fleksibel dalam satu halaman yang sama
- Editor mendukung penambahan blok konten menggunakan slash command (misal: `/image`, `/code`)
- Blok teks mendukung format markdown dan toolbar sederhana untuk formatting dasar
- Navigasi antar halaman tersedia di RightSidebar/bagian bawah
- Semua perubahan halaman langsung terlihat di UI

### 1.3 Batasan Teknis

- Batasan upload gambar maksimal 2MB/file
- Batasan upload video maksimal 20MB/file
- Validasi judul halaman minimal 5 karakter
- Validasi minimal 1 blok konten per halaman

## 2. Arsitektur & Implementasi Teknis

### 2.1 Database & Model [update+2024-06-14] ✅

#### 2.1.1 Skema Prisma

```prisma
model ModulePage {
  id        String   @id @default(uuid())
  moduleId  String   @map("module_id")
  order     Int
  type      String
  content   String
  language  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  version   Int      @default(1)
  title     String
  module    Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  @@unique([moduleId, order])
  @@index([moduleId, order])
  @@index([moduleId, type])
  @@map("module_pages")
}
```

#### 2.1.2 Struktur Konten (JSON)

    ```json
    [
      {
        "type": "text",
        "content": "<p>Konten HTML/markdown</p>"
      },
      {
        "type": "code",
        "content": "function example() { return 'hello'; }",
        "language": "javascript"
      },
      {
        "type": "image",
        "content": "https://url-to-image.jpg",
        "caption": "Deskripsi gambar"
      }
    ]
    ```

### 2.2 API Backend ✅

#### 2.2.1 Endpoint API

- `POST /api/modules/:id/pages` (create page)
- `GET /api/modules/:id/pages` (list pages)
- `PUT /api/pages/:id` (update page)
- `DELETE /api/pages/:id` (delete page)

#### 2.2.2 Implementasi

- Validasi input dengan Zod
- Middleware autentikasi admin
- Integrasi dengan audit trail

### 2.3 Frontend UI/UX [update+2025-06-28] ✅

#### 2.3.1 Halaman & Routes

- Route: `/manage-module/pages/[moduleId]`
- Layout: `app/(admin)/manage-module/pages/[moduleId]/layout.tsx`
- Page: `app/(admin)/manage-module/pages/[moduleId]/page.tsx`

#### 2.3.2 Komponen Utama

- **Komponen yang Sudah Diimplementasikan:** ✅
  - `ModulePageEditor`: Editor utama yang mengintegrasikan semua komponen
  - `ModulePageFooterNav`: Navigasi bawah untuk prev/next
  - `TopNavigation`: Navigasi atas aplikasi
  - `DocumentHeader`: Header dokumen dengan judul & status penyimpanan
- `RichTextEditor`: Editor rich text berbasis TipTap
- `EditorToolbar`: Toolbar format teks berbasis TipTap
- `ModulePageSidebar`: Sidebar kanan dengan fitur toggle
- `ModulePagesContext`: Context provider untuk berbagi state

#### 2.3.3 Editor TipTap

- **Extensions:** Color, Highlight, Link, Subscript, Superscript, TextAlign, TextStyle, Typography, Underline, Image, Placeholder
- **Toolbars:**
  - `EditorToolbar`: Toolbar utama di bagian atas
    - `FloatingToolbar`: Toolbar yang muncul saat memilih teks
    - `TipTapFloatingMenu`: Menu slash command yang muncul saat mengetik '/'

#### 2.3.4 Aksesibilitas (A11y) [update+2025-06-27]

    - `A11yAnnouncer.tsx`: Komponen untuk mengumumkan perubahan status ke screen reader
    - `FocusTrap.tsx`: Komponen untuk manajemen fokus dalam modal/dialog
    - `SkipLink.tsx`: Komponen untuk navigasi cepat dengan keyboard
    - ARIA labels dan roles di semua komponen interaktif

#### 2.3.5 Keyboard Shortcuts [update+2025-06-28]

    - `useKeyboardShortcuts.ts`: Custom hook untuk mengelola shortcut keyboard
    - `shortcutUtils.ts`: Helper functions untuk keyboard shortcuts
    - `ShortcutHelp.tsx`: Komponen dialog untuk menampilkan daftar shortcut

- **Implementasi Shortcuts:**
  - Navigasi: Alt+Left/Right Arrow untuk halaman prev/next
  - Editor: Ctrl+B, Ctrl+I, Ctrl+U untuk formatting
  - Sistem: Ctrl+S untuk save, Ctrl+/ untuk help

#### 2.3.6 Custom Hooks

    - `useModulePageQuery`: Query data halaman
    - `useModulePageMutation`: Mutasi data halaman
    - `useModulePageEditor`: State editor dan autosave
    - `useDebounce`: Untuk debouncing input dan autosave
    - `useMediaQuery`: Untuk responsive design
    - `useImageUpload`: Untuk upload dan preview gambar

- `useKeyboardShortcuts`: Untuk manajemen keyboard shortcuts
- `useFocusManagement`: Untuk manajemen fokus
- `useA11yKeyboard`: Untuk a11y keyboard handling

### 2.4 Testing [update+2025-06-28] 🟡

#### 2.4.1 Unit Testing ✅

- **Files:**
  - `ErrorNotifier.test.tsx`: Test error handling
  - `ModuleLayout.test.tsx`: Test rendering layout
  - `ModuleOverview.test.tsx`: Test rendering MetricCards
  - `ModulePageFooterNav.test.tsx`: Test navigasi prev/next
  - `ModulePageSidebar.test.tsx`: Test toggle sidebar
  - `ModulePageEditor.test.tsx`: Test rendering editor
  - `RichTextEditor.test.tsx`: Test rendering TipTap
  - `ShortcutHelp.test.tsx`: Test rendering shortcut help dialog
  - `useKeyboardShortcuts.test.tsx`: Test custom hook untuk keyboard shortcuts

#### 2.4.2 Integration Testing 🚧

- Status: 40% Selesai
- Focus: Alur CRUD halaman dan navigasi
- Files: `ModulePageUI.integration.test.tsx`

#### 2.4.3 E2E Testing 🚧

- Status: Belum dimulai
- Planned: User flow admin mengelola halaman

## 3. Status Implementasi [update+2025-06-28]

### 3.1 Backend (Selesai ✅)

- `prisma/schema.prisma` ✅
- `app/api/modules/[id]/pages/route.ts` ✅
- `app/api/pages/[id]/route.ts` ✅
- `lib/validation/modulePageSchema.ts` ✅
- `middleware.ts` ✅

### 3.2 Frontend (Selesai ✅)

- **Komponen Utama**

  - `features/manage-module/components/ModulePageEditor.tsx` ✅
  - `features/manage-module/components/RichTextEditor.tsx` ✅
  - `features/manage-module/components/ModulePageFooterNav.tsx` ✅
  - `features/manage-module/components/ModulePageSidebar.tsx` ✅
  - `features/manage-module/components/ShortcutHelp.tsx` ✅

- **Komponen Document & Navigation**

  - `features/manage-module/components/ModulePageEditor/navigation/TopNavigation.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/document/DocumentHeader.tsx` ✅

- **Sidebar Components**

  - `features/manage-module/components/ModulePageEditor/sidebar/Sidebar.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/sidebar/SidebarContent.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/sidebar/SidebarHeader.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/sidebar/SidebarShortcuts.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/sidebar/SidebarBlogs.tsx` ✅

- **Editor Toolbars & Extensions**

  - `features/manage-module/components/ModulePageEditor/toolbars/EditorToolbar.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/toolbars/ToolbarProvider.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/extension/FloatingToolbar.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/extension/FloatingMenu.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/extension/Image.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/extension/ImagePlaceholder.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/extension/SearchAndReplace.tsx` ✅

- **Aksesibilitas (A11y)**

  - `features/manage-module/components/a11y/A11yAnnouncer.tsx` ✅
  - `features/manage-module/components/a11y/FocusTrap.tsx` ✅
  - `features/manage-module/components/a11y/SkipLink.tsx` ✅
  - `features/manage-module/utils/a11yUtils.ts` ✅

- **Routing**

  - `app/(admin)/manage-module/pages/[moduleId]/page.tsx` ✅
  - `app/(admin)/manage-module/pages/[moduleId]/layout.tsx` ✅

- **Hooks & State**

  - `features/manage-module/hooks/useModulePageQuery.ts` ✅
  - `features/manage-module/hooks/useModulePageMutation.ts` ✅
  - `features/manage-module/hooks/useModulePageEditor.ts` ✅
  - `features/manage-module/hooks/useDebounce.ts` ✅
  - `features/manage-module/hooks/useImageUpload.ts` ✅
  - `features/manage-module/hooks/useMediaQuery.ts` ✅
  - `features/manage-module/hooks/useKeyboardShortcuts.ts` ✅
  - `features/manage-module/hooks/useFocusManagement.ts` ✅
  - `features/manage-module/hooks/useA11yKeyboard.ts` ✅

- **Services & Utilities**
  - `features/manage-module/services/modulePageService.ts` ✅
  - `features/manage-module/lib/content.ts` ✅
  - `features/manage-module/lib/TipTapUtils.ts` ✅
  - `features/manage-module/constants/shortcuts.ts` ✅
  - `features/manage-module/utils/shortcutUtils.ts` ✅

### 3.3 Dokumentasi

- `features/manage-module/module-docs.md` 🟡 (Sebagian selesai)
- `docs/implementation-plan/sprint-4/story-143/task-ops-140.md` 🟡 (Sebagian selesai)

## 4. Tugas yang Perlu Diselesaikan [update+2025-06-29]

### 4.1 Tugas Integrasi UI dan Backend

#### 4.1.1 Implementasi ModulePageFooterNav di layout.tsx 🚧 BELUM SELESAI

- **Deskripsi**: ModulePageFooterNav belum diimplementasikan dengan benar pada page.tsx untuk halaman editor
- **Tugas**:
  - Menambahkan komponen ModulePageFooterNav ke dalam layout.tsx atau page pada rute `/manage-module/pages/[moduleId]`
  - Menghubungkan navigasi prev/next dengan API yang ada
  - Memastikan state halaman saat ini (currentPage) dan total halaman (totalPages) diambil dari API
  - Menambahkan state handler untuk fungsi onPrevious dan onNext
  - Implementasi loading state saat navigasi antar halaman

#### 4.1.2 Menghilangkan Footer Global pada Halaman Admin 🚧 BELUM SELESAI

- **Deskripsi**: Footer dari Footer.tsx muncul di halaman admin, padahal seharusnya tidak ada
- **Tugas**:
  - Memodifikasi layout.tsx pada app/(admin) untuk menghilangkan footer global
  - Membuat conditional rendering pada app/layout.tsx
  - Menambahkan pengecekan route path untuk mengidentifikasi halaman admin
  - Alternatif: Membuat layout yang benar-benar terpisah untuk admin dan non-admin
  - Pastikan pengecekan client-side dan server-side berjalan dengan konsisten

#### 4.1.3 Integrasi Penuh Backend API dengan UI Komponen 🚧 BELUM SELESAI

- **Deskripsi**: Beberapa komponen frontend belum terintegrasi penuh dengan API backend
- **Tugas**:
  - **ModulePageEditor dan DocumentHeader**
    - Menghubungkan DocumentHeader dengan API update/save untuk menyimpan judul
    - Mengimplementasikan indikator status penyimpanan dengan API calls
  - Menambahkan Toast notification untuk status operasi API
  - Menambahkan debounce untuk autosave konten dan judul
  - **ModulePageSidebar**
  - Mengimplementasikan fetch daftar halaman dari API pada ModulePageSidebar
  - Menambahkan fitur tambah halaman baru via API
  - Menambahkan fitur delete halaman via API dengan konfirmasi
  - Membuat fitur reorder halaman dengan drag and drop (jika waktu mencukupi)
  - Menampilkan status halaman (draft/published) dengan indikator visual
  - **ModulePageContext**
    - Memperbaiki ModulePagesContext agar menyediakan state terpusat untuk operasi CRUD
  - Menambahkan mutation hooks untuk operasi create, update, delete, reorder
  - Memastikan optimistic updates untuk UI responsif
  - Menambahkan error handling untuk kegagalan operasi API

### 4.2 Tugas Lanjutan

#### 4.2.1 Refactoring File Structure 🚧 BELUM SELESAI

- **Deskripsi**: Struktur file saat ini perlu dioptimalkan untuk maintainability jangka panjang
- **Tugas**:
  - Reorganisasi komponen-komponen terkait module page ke dalam folder terstruktur
  - Membuat index exports file untuk semua komponen
  - Memperbaiki path imports yang terlalu panjang dengan alias path
  - Menerapkan pattern co-location untuk menempatkan komponen, hooks, dan tests berdekatan

#### 4.2.2 Edge Cases dan Error Handling 🚧 BELUM SELESAI

- **Deskripsi**: Penanganan edge cases dan error perlu ditingkatkan
- **Tugas**:
  - Menambahkan handling untuk kasus tidak ada halaman pada modul
  - Menangani kasus error saat fetch/mutate data
  - Menambahkan skeleton loaders untuk state loading
  - Implementasi fallback UI saat data tidak tersedia
  - Penanganan khusus untuk offline mode atau koneksi buruk

## 5. Tugas Baru: Integrasi Backend API dengan UI [update+2025-06-30]

Berdasarkan analisis sistem, berikut adalah tugas-tugas yang perlu diselesaikan untuk mengintegrasikan Backend API dengan UI komponen secara penuh:

### 5.1 Perbaikan Integrasi ModulePageEditor dengan API [SELESAI ✅] [update+2025-07-01]

- **Masalah**: Saat ini implementasi `useRichTextAutosave` mencoba mem-parse konten sebagai JSON, yang dapat menyebabkan error karena format konten dari TipTap adalah HTML.
- **Solusi**:
  - ✅ Modifikasi `useRichTextAutosave.ts` untuk menangani konten HTML dari TipTap dengan benar
  - ✅ Pastikan format data yang dikirim ke backend sesuai dengan yang diharapkan oleh API
  - ✅ Implementasi error handling yang lebih baik dengan pesan yang informatif
- **Implementasi**:
  - Dibuat fungsi `convertHtmlToContentBlock` untuk mengkonversi konten HTML dari TipTap ke format ContentBlock yang diharapkan oleh API
  - Dihapus logika yang mencoba mem-parse konten sebagai JSON
  - Diperbarui unit test untuk memastikan konversi konten berjalan dengan benar
- **Status**: Selesai

### 5.2 Optimalisasi State Management ModulePageCRUD [SELESAI ✅] [update+2025-07-02]

- **Masalah**: Terdapat duplikasi state antara `ModulePagesContext` dan `ModulePageCRUDContext` yang dapat menyebabkan inkonsistensi data.
- **Solusi**:
  - ✅ Refaktor kedua context untuk memiliki tanggung jawab yang jelas dan terpisah
  - ✅ `ModulePagesContext` fokus pada UI state (sidebar, expanded items)
  - ✅ `ModulePageCRUDContext` fokus pada data state dan operasi CRUD
  - ✅ Implementasi sinkronisasi state yang lebih baik antara kedua context
- **Implementasi**:
  - Dihapus state `pages` dan `activePage` dari `ModulePagesContext`
  - Ditambahkan fungsi helper `useModulePagesContextSafely()` untuk akses yang aman ke `ModulePageCRUDContext`
  - Diperbarui `handleSelectPage` untuk menggunakan `setActivePage` dari `ModulePageCRUDContext`
  - Ditambahkan fungsi navigasi halaman di `ModulePageCRUDContext`: `getNextPage`, `getPreviousPage`, `getFirstPage`, `getLastPage`
  - Dioptimalkan error handling di semua operasi CRUD dengan `showErrorNotification`
  - Diperbarui `ModulePageSidebar` dan `ModulePageEditor` untuk menggunakan struktur context yang baru
  - Ditulis test baru untuk `ModulePagesContext` yang merefleksikan perubahan tanggung jawab
- **Status**: Selesai

### 5.3 Implementasi Optimistic Updates untuk Editing [PRIORITAS MENENGAH]

- **Masalah**: Saat ini tidak ada optimistic updates untuk editing konten, yang dapat membuat UX terasa lambat.
- **Solusi**:
  - Implementasi optimistic updates di `useModulePageCRUD.ts` untuk operasi update
  - Tambahkan rollback mechanism jika update gagal
  - Tingkatkan feedback visual saat proses update berjalan
- **Estimasi**: 1 hari

### 5.4 Perbaikan Error Handling dan Notifikasi [PRIORITAS MENENGAH]

- **Masalah**: Error handling saat ini masih basic dan tidak memberikan informasi yang cukup kepada pengguna.
- **Solusi**:
  - Standarisasi format error di seluruh aplikasi
  - Implementasi error boundary untuk mencegah crash UI
  - Perbaiki `ErrorNotifier.tsx` untuk menampilkan pesan yang lebih informatif dan user-friendly
  - Tambahkan retry mechanism untuk operasi yang gagal
- **Estimasi**: 1 hari

### 5.5 Integrasi Penuh DocumentHeader dengan API [PRIORITAS TINGGI] [update+2025-07-07]

- **Masalah**:

  - DocumentHeader belum sepenuhnya terintegrasi dengan API untuk autosave judul
  - Tombol-tombol utama di DocumentHeader belum berfungsi, termasuk Create dan Close draft
  - Tidak ada konfirmasi visual saat menyimpan perubahan judul
  - Antarmuka pengguna belum konsisten dengan fungsionalitas yang tersedia

- **Solusi**:

  - Perbaiki integrasi antara DocumentHeader dan ModulePageCRUDContext
  - Implementasi fungsionalitas tombol Create untuk membuat halaman baru
  - Implementasi tombol Close draft untuk menghapus halaman saat ini
  - Tingkatkan indikator status save dengan animation dan pesan yang lebih jelas
  - Implementasi debounce yang lebih baik untuk autosave judul
  - Tambahkan dialog konfirmasi saat mengakses fitur yang berdampak tinggi (seperti menghapus halaman)
  - Tambahkan feedback visual yang jelas dan notifikasi toast untuk setiap aksi

- **Implementasi**:

  - Menghubungkan tombol Create dengan fungsi createPage dari ModulePageCRUDContext
  - Integrasi tombol Close draft dengan fungsi deletePage
  - Perbaikan indikator status save dengan animasi loading dan success
  - Implementasi dialog konfirmasi untuk aksi berbahaya
  - Refaktor DocumentHeader untuk lebih modular dan testable

- **Estimasi**: 1 hari

### 5.6 Validasi Data dan Type Safety [PRIORITAS RENDAH]

- **Masalah**: Beberapa bagian kode masih menggunakan `any` type dan validasi data tidak konsisten.
- **Solusi**:
  - Perbaiki type definitions untuk menghindari penggunaan `any`
  - Implementasi validasi data yang konsisten di semua layer (client dan server)
  - Gunakan zod schemas untuk validasi runtime
- **Estimasi**: 1 hari

### 5.7 Refactoring Arsitektur untuk Optimasi Pemanggilan API [SELESAI ✅] [update+2025-07-08]

- **Masalah**:

  - Terjadi pemanggilan API PUT yang tidak perlu saat navigasi antar halaman
  - Konten halaman baru tertulis dengan data dari halaman sebelumnya
  - Komponen-komponen child melakukan fetch data sendiri-sendiri, menyebabkan duplikasi request dan data tidak konsisten

- **Solusi**:

  - ✅ Memindahkan logika fetching data ke level page (fetch once, use everywhere)
  - ✅ Mengimplementasikan flag navigasi untuk membedakan antara navigasi halaman dan perubahan konten
  - ✅ Memindahkan fungsi-fungsi handler dari komponen child ke level page
  - ✅ Menggunakan React Query untuk caching dan state management yang lebih baik

- **Implementasi**:

  - **Task 1: Implementasi Flag Navigasi**
    - Ditambahkan flag navigasi di `SidebarContent.tsx` dan `page.tsx` untuk menandai bahwa navigasi sedang berlangsung
    - Ditambahkan pengecekan flag navigasi di `useRichTextAutosave.ts` dan `useModulePageEditor.ts` untuk melewati autosave saat navigasi
    - Dihapus flag navigasi setelah navigasi selesai dengan setTimeout
  - **Task 2: Optimasi Pemanggilan API di Level Page**
    - Direfaktor `app/(admin)/manage-module/pages/[moduleId]/page.tsx` untuk menjadi single source of truth
    - Dipindahkan fungsi `handleSelectPage` dan `handleCreatePage` dari komponen child ke level page
    - Dipindahkan logic fetching data ke `page.tsx` menggunakan React Query
    - Diteruskan data sebagai props ke komponen-komponen child
    - Dihapus pemanggilan API yang tidak perlu di `layout.tsx`
    - Digunakan data yang diteruskan di `ModulePageEditor.tsx` alih-alih fetch sendiri
    - Ditambahkan AbortController di `RichTextEditorWithAutosave.tsx` untuk membatalkan request saat navigasi

- **Status**: Selesai

## 6. Timeline & Prioritas Implementasi

### 6.1 Timeline Implementasi Tugas Baru

1. **Hari 1-2**: Perbaikan Integrasi ModulePageEditor dengan API dan Optimalisasi State Management
2. **Hari 3-4**: Implementasi Optimistic Updates dan Perbaikan Error Handling
3. **Hari 5**: Integrasi DocumentHeader dan Validasi Data

### 6.2 Prioritas Implementasi

1. **Perbaikan Integrasi ModulePageEditor dengan API** - Prioritas tertinggi karena memengaruhi fungsi utama aplikasi
2. **Optimalisasi State Management ModulePageCRUD** - Penting untuk konsistensi data dan mencegah bug
3. **Implementasi Optimistic Updates** - Meningkatkan UX secara signifikan
4. **Perbaikan Error Handling** - Meningkatkan robustness aplikasi
5. **Integrasi DocumentHeader dengan API** - Meningkatkan UX untuk editing judul
6. **Validasi Data dan Type Safety** - Meningkatkan maintainability kode jangka panjang

## 7. Subtask Progress [update+2025-07-08]

- **Subtask 1:** Implementasi UI & Frontend Component ✅
- **Subtask 2:** API CRUD Multi-Page ✅
- **Subtask 3:** TipTap Editor Integration ✅
- **Subtask 4:** Page Navigation & Sidebar ✅
- **Subtask 5:** Perbaikan Error Tipe Data ✅
- **Subtask 6:** Unit Testing untuk Komponen UI ✅
- **Subtask 7:** Implementasi Shortcut Keyboard ✅
- **Subtask 8:** Penyempurnaan Aksesibilitas (A11y) ✅
- **Subtask 9:** Integration Testing 🚧 (40% selesai)
- **Subtask 10:** Integrasi Penuh Backend API dengan UI 🚧 (93% selesai)
  - ✅ Task 5.1: Perbaikan Integrasi ModulePageEditor dengan API
  - ✅ Task 5.2: Optimalisasi State Management ModulePageCRUD
  - ✅ Task 5.3: Implementasi Optimistic Updates untuk Editing [update+2025-07-05]
  - ✅ Task 5.4: Perbaikan Error Handling dan Notifikasi [update+2025-07-06]
  - ✅ Task 5.5: Integrasi Penuh DocumentHeader dengan API [update+2025-07-07]
  - ✅ Task 5.7: Refactoring Arsitektur untuk Optimasi Pemanggilan API [update+2025-07-08]
  - 🚧 Task 5.6: Validasi Data dan Type Safety
- **Subtask 11:** Implementasi ModulePageFooterNav di page.tsx 🚧 (0% selesai)
- **Subtask 12:** Menghilangkan Footer Global pada Halaman Admin 🚧 (0% selesai)

## 8. UI Referensi & Wireframes

### 8.1 ModulePageLayout (3-kolom)

```
┌─────────────────┬───────────────────────────────┬─────────────────┐
│                 │                               │                 │
│                 │       ToolBar Editor          │                 │
│  AdminSidebar   │                               │  ModulePageList │
│                 │                               │                 │
│   (Navigasi     │       ModulePageEditor        │   (Daftar       │
│    Utama App)   │       (Area Konten)           │    Halaman)     │
│                 │                               │                 │
│                 │                               │                 │
│                 │                               │                 │
│                 │                               │                 │
│                 ├───────────────────────────────┤                 │
│                 │       ModulePageFooterNav     │                 │
│                 │ [Prev]    Hal 3 dari 5 [Next] │                 │
└─────────────────┴───────────────────────────────┴─────────────────┘
```

### 8.2 Keyboard Shortcuts [update+2025-06-28]

| Kategori         | Shortcut        | Fungsi                            |
| ---------------- | --------------- | --------------------------------- |
| **Navigasi**     | Alt+Left Arrow  | Navigasi ke halaman sebelumnya    |
|                  | Alt+Right Arrow | Navigasi ke halaman berikutnya    |
|                  | Alt+S           | Toggle sidebar kanan (buka/tutup) |
|                  | Alt+E           | Fokus ke editor                   |
| **Formatting**   | Ctrl+B          | Format teks bold                  |
|                  | Ctrl+I          | Format teks italic                |
|                  | Ctrl+U          | Format teks underline             |
|                  | Ctrl+K          | Sisipkan link                     |
|                  | Ctrl+`          | Formatting kode                   |
|                  | Ctrl+Shift+1-6  | Heading level 1-6                 |
| **Penyuntingan** | Ctrl+S          | Simpan perubahan                  |
|                  | Ctrl+Z          | Undo                              |
|                  | Ctrl+Shift+Z    | Redo                              |
| **Bantuan**      | Ctrl+/          | Tampilkan dialog bantuan shortcut |

## 9. Catatan Tambahan

- Fitur drag & drop urutan halaman, quiz, preview, audit trail detail, import/export, duplikasi, dan versioning akan dikerjakan di future task (sudah dicatat di backlog).
- Semua fitur utama sekarang sudah selesai diimplementasikan (TipTap Editor, Sidebar, Navigation, Shortcut Keyboard, Aksesibilitas).
- Integration testing sedang dalam pengerjaan dan akan menjadi fokus utama berikutnya.
- Tugas baru terkait integrasi UI dengan backend API perlu diprioritas untuk mencapai versi yang fully functional.
