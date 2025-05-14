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

### C. Frontend UI/UX [update+2025-05-14] 🟡

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
  - **Unit Testing yang Sudah Diimplementasikan:** ✅ [update+2025-05-14]
    - ErrorNotifier.test.tsx: Test error handling dengan berbagai kasus
    - ModuleLayout.test.tsx: Test rendering layout dan AdminSidebar
    - ModuleOverview.test.tsx: Test rendering MetricCards dan data
    - ModulePageFooterNav.test.tsx: Test navigasi prev/next dan disabled state
    - ModulePageSidebar.test.tsx: Test toggle sidebar dan interaksi dengan localStorage
    - ModulePageEditor.test.tsx: Test rendering editor dan interaksi dengan data
    - RichTextEditor.test.tsx: Test rendering TipTap dan perubahan konten
    - Mock untuk TipTap editor dan konteks di direktori `__tests__/__mocks__`
  - **Yang Perlu Diselesaikan:** 🔄
    - Implementasi shortcut keyboard untuk navigasi dan editing
    - Penyempurnaan aksesibilitas (A11y) dengan ARIA label
    - Integration testing untuk alur CRUD dan navigasi

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

### E. Testing 🟡

- Unit test untuk fungsi utama (form, editor, API handler) ✅ [update+2025-05-14]
- Integration test untuk alur CRUD halaman - 20% Selesai
- E2E test untuk user flow admin mengelola halaman - Belum dimulai
- UI Testing untuk komponen-komponen baru - Dalam pengerjaan

### F. Dokumentasi 🟡

- Update dokumentasi modul & user guide - On progress
- Contoh payload API & skenario penggunaan - Sebagian selesai

## 3. Status Komponen & File

### Backend (Selesai ✅)

- `prisma/schema.prisma` ✅
- `app/api/modules/[id]/pages/route.ts` ✅
- `app/api/pages/[id]/route.ts` ✅
- `lib/validation/modulePageSchema.ts` ✅
- `middleware.ts` ✅

### Frontend (On Progress 🟡)

- **Selesai ✅**

  - `features/manage-module/components/ModulePageEditor.tsx` ✅ (Diperbarui dengan TipTap editor)
  - `features/manage-module/components/RichTextEditor.tsx` ✅ (Implementasi TipTap editor)
  - `features/manage-module/components/ModulePageFooterNav.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/navigation/TopNavigation.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/document/DocumentHeader.tsx` ✅ (Diperbarui dengan status penyimpanan)
  - `features/manage-module/components/ModulePageEditor/sidebar/Sidebar.tsx` ✅ (Diperbarui dengan daftar halaman)
  - `features/manage-module/components/ModulePageEditor/sidebar/SidebarContent.tsx` ✅ (Diperbarui dengan pencarian)
  - `features/manage-module/components/ModulePageEditor/toolbars/EditorToolbar.tsx` ✅ (Toolbar TipTap)
  - `features/manage-module/components/ModulePageEditor/extension/FloatingToolbar.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/extension/FloatingMenu.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/extension/Image.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/extension/ImagePlaceholder.tsx` ✅
  - `features/manage-module/components/ModulePageEditor/extension/SearchAndReplace.tsx` ✅
  - `app/(admin)/manage-module/pages/[moduleId]/page.tsx` ✅
  - `app/(admin)/manage-module/pages/[moduleId]/layout.tsx` ✅
  - `features/manage-module/hooks/useModulePageQuery.ts` ✅
  - `features/manage-module/hooks/useModulePageMutation.ts` ✅
  - `features/manage-module/hooks/useModulePageEditor.ts` ✅
  - `features/manage-module/hooks/useDebounce.ts` ✅
  - `features/manage-module/hooks/useImageUpload.ts` ✅
  - `features/manage-module/hooks/useMediaQuery.ts` ✅
  - `features/manage-module/services/modulePageService.ts` ✅
  - `features/manage-module/lib/content.ts` ✅
  - `features/manage-module/lib/TipTapUtils.ts` ✅
  - `features/manage-module/components/ErrorNotifier.test.tsx` ✅ [update+2025-05-14]
  - `features/manage-module/components/ModuleLayout.test.tsx` ✅ [update+2025-05-14]
  - `features/manage-module/components/ModuleOverview.test.tsx` ✅ [update+2025-05-14]
  - `features/manage-module/components/ModulePageFooterNav.test.tsx` ✅ [update+2025-05-14]
  - `features/manage-module/components/ModulePageSidebar.test.tsx` ✅ [update+2025-05-14]
  - `features/manage-module/components/ModulePageEditor.test.tsx` ✅ [update+2025-05-14]
  - `features/manage-module/components/RichTextEditor.test.tsx` ✅ [update+2025-05-14]
  - `features/manage-module/__tests__/__mocks__/tiptap.tsx` ✅ [update+2025-05-14]
  - `features/manage-module/__tests__/__mocks__/modulePageContext.tsx` ✅ [update+2025-05-14]
  - `__mocks__/styleMock.js` ✅ [update+2025-05-14]

- **Perlu Dikerjakan 🔄**
  - `features/manage-module/hooks/useKeyboardShortcuts.ts` - Custom hook untuk keyboard shortcuts
  - `features/manage-module/components/ShortcutHelp.tsx` - Komponen untuk menampilkan shortcut help
  - `features/manage-module/__tests__/integration/ModulePageUI.integration.test.tsx` - Integration test
  - Implementasi aksesibilitas (ARIA label, fokus manajemen)

### Dokumentasi

- `features/manage-module/module-docs.md` 🟡 (Sebagian selesai)
- `docs/implementation-plan/sprint-4/story-143/task-ops-140.md` 🟡 (Sebagian selesai)

## 4. Langkah Selanjutnya [update+2025-05-14]

1. **Perbaikan Error Tipe Data (Prioritas Tinggi)** ✅ SELESAI

   - Sudah selesai mengimplementasikan tipe data yang konsisten
   - Sudah selesai memperbaiki error TypeScript

2. **Unit Testing untuk Komponen UI (Prioritas Tinggi)** ✅ SELESAI

   - Sudah selesai mengimplementasikan unit test untuk semua komponen utama
   - Coverage sudah mencapai >80% untuk komponen-komponen kritis
   - Mock untuk TipTap dan context sudah berfungsi dengan baik

3. **Implementasi Shortcut Keyboard (Prioritas Sedang)** 🚧 DALAM PENGERJAAN

   - Implementasi hook `useKeyboardShortcuts`
   - Shortcut navigasi antar halaman (Alt+Left/Right Arrow)
   - Shortcut formatting (Ctrl+B, Ctrl+I, Ctrl+U)
   - Shortcut save (Ctrl+S)
   - Dialog help untuk shortcut

4. **Penyempurnaan Aksesibilitas (Prioritas Sedang)** 🚧 DALAM PENGERJAAN

   - Menambahkan ARIA label pada elemen interaktif
   - Implementasi fokus manajemen yang benar
   - Testing aksesibilitas dengan axe

5. **Integration Testing (Prioritas Sedang)** 🚧 DALAM PENGERJAAN
   - Implementasi integration test untuk alur CRUD halaman
   - Implementasi integration test untuk navigasi antar halaman
   - Verifikasi interaksi antara komponen

---

**Catatan:**

- Fitur drag & drop urutan halaman, quiz page, preview, audit trail detail, import/export, duplikasi, dan versioning akan dikerjakan di future task (sudah dicatat di backlog).
- Setelah menyelesaikan unit testing dengan baik, fokus selanjutnya adalah implementasi shortcut keyboard dan penyempurnaan aksesibilitas, diikuti dengan integration testing.
