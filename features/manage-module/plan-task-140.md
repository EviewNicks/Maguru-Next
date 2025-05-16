# Planning Task OPS-140: Manajemen Konten Multi-Page

## 1. Ringkasan Tujuan

- Mengimplementasikan fitur manajemen konten multi-page pada modul pembelajaran.
- Admin dapat membuat, mengedit, menghapus, dan mengelola halaman konten secara dinamis dalam satu modul.
- **Setiap halaman dapat berisi berbagai tipe konten (teks, kode, gambar, video) secara fleksibel dalam satu halaman yang sama.**
- Editor mendukung penambahan blok konten menggunakan slash command (misal: `/image`, `/code`) seperti di Confluence/Notion.
- Blok teks mendukung format markdown dan toolbar sederhana untuk formatting dasar.
- Navigasi antar halaman tersedia di RightSidebar/bagian bawah.
- Batasan upload gambar maksimal 2MB/file dan video maksimal 20MB/file.
- Semua perubahan halaman langsung terlihat di UI.

## 2. Langkah-Langkah Teknis

### A. Database & Model [update+2024-06-14] ✅

- Update skema Prisma:
  - Tambahkan tabel `ModulePage` (relasi one-to-many ke `Module`)
  - Field: `id`, `moduleId`, `title`, `order`, `content` (sebagai JSON), `createdAt`, `updatedAt`
  - Field `content` menyimpan array dari blok konten dengan struktur:
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
- Jalankan migrasi database

### B. API Backend ✅

- Buat/Update API route:
  - `POST /api/modules/:id/pages` (create page)
  - `GET /api/modules/:id/pages` (list pages)
  - `PUT /api/pages/:id` (update page)
  - `DELETE /api/pages/:id` (delete page)
- Validasi input dengan Zod
- Middleware autentikasi admin
- Integrasi dengan audit trail (future task, log sederhana dulu)

### C. Frontend UI/UX [update+2025-06-28] ✅

- **Halaman Khusus Multi-Page Editor**
  - Route: `/manage-module/pages/[moduleId]` ✅ (Sudah dibuat)
  - Komponen utama: `ModulePageEditor` ✅ (Sudah dibuat & diperbarui dengan TipTap editor)
- **Komponen Utama**

  - **Komponen yang Sudah Diimplementasikan:** ✅
    - `ModulePageEditor`: Editor utama yang mengintegrasikan semua komponen
    - `ModulePageFooterNav`: Navigasi bawah untuk prev/next
    - `TopNavigation`: Navigasi atas aplikasi
    - `DocumentHeader`: Header dokumen dengan judul & status penyimpanan
    - `RichTextEditor`: Editor rich text berbasis TipTap yang menggantikan DocumentContent
    - `EditorToolbar`: Toolbar format teks berbasis TipTap yang menggantikan FormattingToolbar
    - `ModulePageSidebar`: Sidebar kanan dengan fitur toggle yang dapat dibuka/ditutup
    - `ModulePagesContext`: Context provider untuk berbagi state antara Editor dan Sidebar
  - **Fitur Toggle Sidebar yang Sudah Diimplementasikan:** ✅
    - Pemindahan sidebar dari ModulePageEditor ke tingkat layout
    - Tombol toggle untuk membuka/menutup sidebar
    - Animasi transisi smooth saat membuka/menutup sidebar
    - Penyimpanan preferensi sidebar (buka/tutup) di localStorage
    - Integrasi dengan context untuk berbagi data pages dan active page
  - **Komponen Editor TipTap yang Sudah Diimplementasikan:** ✅
    - TipTap extensions: Color, Highlight, Link, Subscript, Superscript, TextAlign, TextStyle, Typography, Underline, Image, Placeholder
    - `FloatingToolbar`: Toolbar yang muncul saat memilih teks
    - `TipTapFloatingMenu`: Menu slash command yang muncul saat mengetik '/'
    - Editor mendukung berbagai format teks, heading, list, blockquote, alignment, dll.
  - **Fitur Aksesibilitas (A11y) yang Sudah Diimplementasikan:** ✅ [update+2025-06-27]
    - `A11yAnnouncer.tsx`: Komponen untuk mengumumkan perubahan status ke screen reader
    - `FocusTrap.tsx`: Komponen untuk manajemen fokus dalam modal/dialog
    - `SkipLink.tsx`: Komponen untuk navigasi cepat dengan keyboard
    - ARIA labels dan roles di semua komponen interaktif
    - Fokus manajemen yang tepat saat navigasi halaman
    - Dukungan penuh navigasi keyboard
  - **Implementasi Shortcut Keyboard:** ✅ [update+2025-06-28]
    - `useKeyboardShortcuts.ts`: Custom hook untuk mengelola shortcut keyboard
    - `shortcutUtils.ts`: Helper functions untuk keyboard shortcuts
    - `ShortcutHelp.tsx`: Komponen dialog untuk menampilkan daftar shortcut
    - Shortcut navigasi: Alt+Left/Right Arrow untuk halaman prev/next
    - Shortcut editor: Ctrl+B, Ctrl+I, Ctrl+U untuk formatting
    - Shortcut sistem: Ctrl+S untuk save, Ctrl+/ untuk help, Alt+S untuk toggle sidebar
  - **File Routing yang Sudah Diimplementasikan:** ✅
    - `app/(admin)/manage-module/pages/[moduleId]/page.tsx`
    - `app/(admin)/manage-module/pages/[moduleId]/layout.tsx`
  - **Custom Hooks yang Sudah Diimplementasikan:** ✅
    - `useModulePageQuery`: Query data halaman
    - `useModulePageMutation`: Mutasi data halaman
    - `useModulePageEditor`: State editor dan autosave
    - `useDebounce`: Untuk debouncing input dan autosave
    - `useMediaQuery`: Untuk responsive design
    - `useImageUpload`: Untuk upload dan preview gambar
    - `useKeyboardShortcuts`: Untuk manajemen keyboard shortcuts [update+2025-06-28]
    - `useFocusManagement`: Untuk manajemen fokus [update+2025-06-27]
    - `useA11yKeyboard`: Untuk a11y keyboard handling [update+2025-06-27]
  - **Unit Testing yang Sudah Diimplementasikan:** ✅ [update+2025-05-14]
    - ErrorNotifier.test.tsx: Test error handling dengan berbagai kasus
    - ModuleLayout.test.tsx: Test rendering layout dan AdminSidebar
    - ModuleOverview.test.tsx: Test rendering MetricCards dan data
    - ModulePageFooterNav.test.tsx: Test navigasi prev/next dan disabled state
    - ModulePageSidebar.test.tsx: Test toggle sidebar dan interaksi dengan localStorage
    - ModulePageEditor.test.tsx: Test rendering editor dan interaksi dengan data
    - RichTextEditor.test.tsx: Test rendering TipTap dan perubahan konten
    - Mock untuk TipTap editor dan konteks di direktori `__tests__/__mocks__`
    - ShortcutHelp.test.tsx: Test rendering shortcut help dialog [update+2025-06-28]
    - useKeyboardShortcuts.test.tsx: Test custom hook untuk keyboard shortcuts [update+2025-06-28]

- **Integrasi**
  - ✅ React Query untuk fetch/mutasi data
  - ✅ Autosave dengan debounce (2000ms)
  - ✅ Notifikasi sukses/error dengan toaster
  - ✅ Loading state & error handling

### D. Validasi & Batasan ✅

- Validasi judul halaman (minimal 5 karakter)
- Validasi blok konten (minimal 1 blok)
- Validasi ukuran file gambar/video
- Validasi format konten untuk setiap tipe blok

### E. Testing [update+2025-06-28] 🟡

- Unit test untuk fungsi utama (form, editor, API handler) ✅
- Unit test untuk komponen aksesibilitas (A11y) ✅
- Unit test untuk keyboard shortcuts ✅
- Integration test untuk alur CRUD halaman - 40% Selesai
- E2E test untuk user flow admin mengelola halaman - Belum dimulai
- UI Testing untuk komponen-komponen baru - Dalam pengerjaan

### F. Dokumentasi 🟡

- Update dokumentasi modul & user guide - On progress
- Contoh payload API & skenario penggunaan - Sebagian selesai
- Dokumentasi aksesibilitas dan keyboard shortcuts - Selesai [update+2025-06-28]

## 3. Status Komponen & File [update+2025-06-28]

### Backend (Selesai ✅)

- `prisma/schema.prisma` ✅
- `app/api/modules/[id]/pages/route.ts` ✅
- `app/api/pages/[id]/route.ts` ✅
- `lib/validation/modulePageSchema.ts` ✅
- `middleware.ts` ✅

### Frontend (Selesai ✅)

- **Komponen Utama**

  - `features/manage-module/components/ModulePageEditor.tsx` ✅
  - `features/manage-module/components/RichTextEditor.tsx` ✅
  - `features/manage-module/components/ModulePageFooterNav.tsx` ✅
  - `features/manage-module/components/ModulePageSidebar.tsx` ✅
  - `features/manage-module/components/ShortcutHelp.tsx` ✅ [update+2025-06-28]

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

  - `features/manage-module/components/a11y/A11yAnnouncer.tsx` ✅ [update+2025-06-27]
  - `features/manage-module/components/a11y/FocusTrap.tsx` ✅ [update+2025-06-27]
  - `features/manage-module/components/a11y/SkipLink.tsx` ✅ [update+2025-06-27]
  - `features/manage-module/utils/a11yUtils.ts` ✅ [update+2025-06-27]

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
  - `features/manage-module/hooks/useKeyboardShortcuts.ts` ✅ [update+2025-06-28]
  - `features/manage-module/hooks/useFocusManagement.ts` ✅ [update+2025-06-27]
  - `features/manage-module/hooks/useA11yKeyboard.ts` ✅ [update+2025-06-27]

- **Services & Utilities**

  - `features/manage-module/services/modulePageService.ts` ✅
  - `features/manage-module/lib/content.ts` ✅
  - `features/manage-module/lib/TipTapUtils.ts` ✅
  - `features/manage-module/constants/shortcuts.ts` ✅ [update+2025-06-28]
  - `features/manage-module/utils/shortcutUtils.ts` ✅ [update+2025-06-28]

- **Unit Tests**

  - `features/manage-module/components/ErrorNotifier.test.tsx` ✅
  - `features/manage-module/components/ModuleLayout.test.tsx` ✅
  - `features/manage-module/components/ModuleOverview.test.tsx` ✅
  - `features/manage-module/components/ModulePageFooterNav.test.tsx` ✅
  - `features/manage-module/components/ModulePageSidebar.test.tsx` ✅
  - `features/manage-module/components/ModulePageEditor.test.tsx` ✅
  - `features/manage-module/components/RichTextEditor.test.tsx` ✅
  - `features/manage-module/components/ShortcutHelp.test.tsx` ✅ [update+2025-06-28]
  - `features/manage-module/hooks/useKeyboardShortcuts.test.tsx` ✅ [update+2025-06-28]
  - `features/manage-module/__tests__/__mocks__/tiptap.tsx` ✅
  - `features/manage-module/__tests__/__mocks__/modulePageContext.tsx` ✅
  - `__mocks__/styleMock.js` ✅

- **Integration Tests**
  - `features/manage-module/__tests__/integration/ModulePageUI.integration.test.tsx` 🚧 (40% Selesai)

### Dokumentasi

- `features/manage-module/module-docs.md` 🟡 (Sebagian selesai)
- `docs/implementation-plan/sprint-4/story-143/task-ops-140.md` 🟡 (Sebagian selesai)

## 4. Langkah Selanjutnya [update+2025-06-28]

1. **Perbaikan Error Tipe Data** ✅ SELESAI

   - Sudah selesai mengimplementasikan tipe data yang konsisten
   - Sudah selesai memperbaiki error TypeScript

2. **Unit Testing** ✅ SELESAI

   - Sudah selesai mengimplementasikan unit test untuk semua komponen utama
   - Coverage sudah mencapai >80% untuk komponen-komponen kritis
   - Mock untuk TipTap dan context sudah berfungsi dengan baik

3. **Implementasi Shortcut Keyboard** ✅ SELESAI

   - Hook `useKeyboardShortcuts` sudah selesai diimplementasikan
   - Shortcut navigasi (Alt+Left/Right Arrow) berfungsi dengan baik
   - Shortcut formatting (Ctrl+B, Ctrl+I, Ctrl+U) sudah terintegrasi ke TipTap
   - Shortcut save (Ctrl+S) berfungsi untuk menyimpan perubahan
   - Dialog help shortcut (Ctrl+/) sudah diimplementasikan
   - Unit test untuk keyboard shortcuts sudah selesai dan berjalan dengan baik

4. **Penyempurnaan Aksesibilitas (A11y)** ✅ SELESAI

   - Sudah menambahkan komponen A11yAnnouncer untuk screen reader
   - Sudah mengimplementasikan FocusTrap untuk modal dialog
   - Sudah menambahkan SkipLink untuk navigasi keyboard
   - ARIA label sudah ditambahkan ke semua elemen interaktif
   - Fokus manajemen sudah diimplementasikan dengan baik
   - Aksesibilitas sudah diuji dan memenuhi standar WCAG AA

5. **Integration Testing** 🚧 DALAM PENGERJAAN
   - Implementasi integration test untuk alur CRUD halaman (40% selesai)
   - Implementasi integration test untuk navigasi antar halaman (25% selesai)
   - Verifikasi interaksi antar komponen (30% selesai)

## 5. Tugas Integrasi UI dan Backend yang Harus Diselesaikan [update+2025-06-29]

### 5.1 Implementasi ModulePageFooterNav di layout.tsx 🚧 BELUM SELESAI

- **Deskripsi**: ModulePageFooterNav belum diimplementasikan dengan benar pada page.tsx untuk halaman editor
- **Tugas**:
  - Menambahkan komponen ModulePageFooterNav ke dalam layout.tsx atau pag pada rute `/manage-module/pages/[moduleId]`
  - Menghubungkan navigasi prev/next dengan API yang ada untuk berpindah antar halaman
  - Memastikan state halaman saat ini (currentPage) dan total halaman (totalPages) diambil dari API
  - Menambahkan state handler untuk fungsi onPrevious dan onNext
  - Implementasi loading state saat navigasi antar halaman

### 5.2 Menghilangkan Footer Global pada Halaman Admin 🚧 BELUM SELESAI

- **Deskripsi**: Footer dari Footer.tsx muncul di halaman admin, padahal seharusnya tidak ada untuk memaksimalkan ruang
- **Tugas**:
  - Memodifikasi layout.tsx pada app/(admin) untuk menghilangkan footer global
  - Membuat conditional rendering pada app/layout.tsx agar Footer hanya muncul pada halaman non-admin
  - Menambahkan pengecekan route path untuk mengidentifikasi halaman admin
  - Alternatif: Membuat layout yang benar-benar terpisah untuk admin dan non-admin
  - Pastikan pengecekan client-side dan server-side berjalan dengan konsisten

### 5.3 Integrasi Penuh Backend API dengan UI Komponen 🚧 BELUM SELESAI

- **Deskripsi**: Beberapa komponen frontend belum terintegrasi penuh dengan API backend yang sudah dibuat
- **Tugas**:

  #### 5.3.1 ModulePageEditor dan DocumentHeader

  - Menghubungkan DocumentHeader dengan API update/save untuk menyimpan judul halaman
  - Mengimplementasikan indikator status penyimpanan (saving, saved, error) dengan API calls
  - Menambahkan Toast notification untuk status operasi API
  - Menambahkan debounce untuk autosave konten dan judul

  #### 5.3.2 ModulePageSidebar

  - Mengimplementasikan fetch daftar halaman dari API pada ModulePageSidebar
  - Menambahkan fitur tambah halaman baru via API
  - Menambahkan fitur delete halaman via API dengan konfirmasi
  - Membuat fitur reorder halaman dengan drag and drop (jika waktu mencukupi)
  - Menampilkan status halaman (draft/published) dengan indikator visual

  #### 5.3.3 ModulePageContext

  - Memperbaiki ModulePagesContext agar menyediakan state terpusat untuk operasi CRUD halaman
  - Menambahkan mutation hooks untuk operasi create, update, delete, reorder
  - Memastikan optimistic updates untuk UI responsif
  - Menambahkan error handling untuk kegagalan operasi API

### 5.4 Refactoring File Structure 🚧 BELUM SELESAI

- **Deskripsi**: Struktur file saat ini perlu dioptimalkan untuk maintainability jangka panjang
- **Tugas**:
  - Reorganisasi komponen-komponen terkait module page ke dalam folder terstruktur
  - Membuat index exports file untuk semua komponen
  - Memperbaiki path imports yang terlalu panjang dengan alias path
  - Menerapkan pattern co-location untuk menempatkan komponen, hooks, dan tests berdekatan

### 5.5 Edge Cases dan Error Handling 🚧 BELUM SELESAI

- **Deskripsi**: Penanganan edge cases dan error perlu ditingkatkan
- **Tugas**:
  - Menambahkan handling untuk kasus tidak ada halaman pada modul
  - Menangani kasus error saat fetch/mutate data
  - Menambahkan skeleton loaders untuk state loading
  - Implementasi fallback UI saat data tidak tersedia
  - Penanganan khusus untuk offline mode atau koneksi buruk

## 6. UI Referensi & Wireframes

### ModulePageLayout (3-kolom)

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

### Keyboard Shortcuts [update+2025-06-28]

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

## 7. Subtask Progress [update+2025-06-29]

- **Subtask 1:** Implementasi UI & Frontend Component ✅
- **Subtask 2:** API CRUD Multi-Page ✅
- **Subtask 3:** TipTap Editor Integration ✅
- **Subtask 4:** Page Navigation & Sidebar ✅
- **Subtask 5:** Perbaikan Error Tipe Data ✅
- **Subtask 6:** Unit Testing untuk Komponen UI ✅
- **Subtask 7:** Implementasi Shortcut Keyboard ✅
- **Subtask 8:** Penyempurnaan Aksesibilitas (A11y) ✅
- **Subtask 9:** Integration Testing 🚧 (40% selesai)
- **Subtask 10:** Integrasi Penuh Backend API dengan UI 🚧 (0% selesai)
- **Subtask 11:** Implementasi ModulePageFooterNav di page.tsx 🚧 (0% selesai)
- **Subtask 12:** Menghilangkan Footer Global pada Halaman Admin 🚧 (0% selesai)

## 8. Timeline Revisi [update+2025-06-29]

- **Day 1-2:** Implementasi ModulePageFooterNav & menghilangkan footer global
- **Day 3-5:** Integrasi penuh backend API dengan UI komponen
- **Day 6-7:** Refactoring file structure & edge case handling
- **Day 8-10:** Testing, debugging, dan dokumentasi

---

**Catatan:**

- Fitur drag & drop urutan halaman, quiz, preview, audit trail detail, import/export, duplikasi, dan versioning akan dikerjakan di future task (sudah dicatat di backlog).
- Semua fitur utama sekarang sudah selesai diimplementasikan (TipTap Editor, Sidebar, Navigation, Shortcut Keyboard, Aksesibilitas).
- Integration testing sedang dalam pengerjaan dan akan menjadi fokus utama berikutnya.
- Tugas baru terkait integrasi UI dengan backend API perlu diprioritas untuk mencapai versi yang fully functional.
