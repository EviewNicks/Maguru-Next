# Rencana Implementasi Subtask 3: Integrasi UI Multi-Page (OPS-140)

## 1. Ringkasan Tujuan

Subtask ini bertujuan mengintegrasikan fitur manajemen konten multi-page ke dalam UI admin modul pembelajaran. Admin dapat membuat, mengedit, menghapus, dan menavigasi halaman konten (teks, kode, gambar, video) secara dinamis dalam satu modul. Editor mendukung markdown, toolbar sederhana, dan slash command (`/image`, `/code`, dll). Navigasi antar halaman tersedia di RightSidebar/bagian bawah. Semua perubahan halaman langsung terlihat di UI.

## 2. Langkah-Langkah Teknis

### a. Analisis & Desain UI

- Review desain visual referensi (Confluence Editor) untuk layout multi-page.
- Implementasikan layout 3-kolom:
  - **Kolom Kiri**: AdminSidebar (navigasi utama)
  - **Kolom Tengah**: Editor konten (main content area)
  - **Kolom Kanan**: ModulePageList (navigasi halaman modul)
- Desain UI sesuai dengan tema gelap yang konsisten dengan UI saat ini.
- Implementasikan navigasi bottom untuk berpindah antar halaman (Previous/Next).

### b. Pembuatan/Integrasi Komponen [update+2025-06-18]

✅ **Komponen yang sudah dibuat**:

- Struktur dasar ModulePageEditor dengan komponen-komponen:
  - `TopNavigation`: Navigasi atas aplikasi
  - `DocumentHeader`: Header dokumen dengan status dan aksi (✅ diperbarui dengan input judul dan status penyimpanan)
  - `FormattingToolbar`: Diganti dengan `EditorToolbar` dari TipTap (✅ implementasi selesai)
  - `DocumentContent`: Diganti dengan `RichTextEditor` berbasis TipTap (✅ implementasi selesai)
  - `Sidebar`: Sidebar kanan untuk navigasi halaman (✅ diperbarui dengan daftar halaman dan pencarian)
  - Komponen sidebar: `SidebarHeader`, `SidebarContent`, `SidebarItem`, `SidebarNestedItem`, `SidebarShortcuts`, `SidebarBlogs`
  - `ModulePageFooterNav`: Navigasi bawah halaman (prev/next) (✅ implementasi selesai)

✅ **Komponen/fitur editor yang sudah diimplementasikan**:

- TipTap rich text editor dengan extension:
  - `StarterKit`: Fitur editing dasar (heading, list, blockquote, dll)
  - `Color`: Mengubah warna teks
  - `Highlight`: Menyorot teks dengan warna
  - `Link`: Menambahkan hyperlink
  - `TextAlign`: Perataan teks
  - `Typography`: Fitur tipografi lanjutan
  - `Image`: Penambahan dan pengaturan gambar
  - `Placeholder`: Teks placeholder untuk node kosong
  - `SearchAndReplace`: Pencarian dan penggantian teks
- Toolbar komprehensif dengan tombol formatting
- Floating toolbar untuk format teks yang dipilih
- Floating menu dengan slash command
- Autosave dengan debounce 2000ms

🚧 **Komponen yang perlu diintegrasikan**:

- ✅ Integrasi `app/(admin)/manage-module/pages/[moduleId]/page.tsx`:
  - Menggunakan komponen ModulePageEditor
  - Mengatur state untuk halaman aktif dan daftar halaman
  - Mengintegrasikan dengan API melalui React Query
- ✅ Integrasi `app/(admin)/manage-module/pages/[moduleId]/layout.tsx`:
  - Layout khusus untuk editor halaman
  - Memuat AdminSidebar
- ✅ Integrasi hook:
  - `useModulePageQuery`: Untuk fetch data halaman
  - `useModulePageMutation`: Untuk operasi CRUD halaman
  - `useModulePageEditor`: Untuk state editor dan autosave
  - `useDebounce`: Untuk debounce input dan autosave
  - `useImageUpload`: Untuk upload dan preview gambar
  - `useMediaQuery`: Untuk responsive design
- 🚧 Perbaikan tipe data:
  - Menyesuaikan tipe `ModulePage` di komponen dengan schema di backend

### c. Integrasi Data & State Management

- ✅ Gunakan React Query untuk fetch, create, update, delete halaman (integrasi dengan modulePageService).
- ✅ Implementasi state management untuk:
  - Daftar halaman dalam modul
  - Halaman aktif yang sedang dibuka
  - Status konten editor (unsaved changes)
  - Status upload file
- ✅ Optimasi update UI secara real-time setelah operasi CRUD.
- ✅ Implementasi autosave dengan debounce (2000ms).

### d. Navigasi & UX

- ✅ Implementasi navigasi antar halaman via:
  - RightSidebar (klik pada judul halaman)
  - Tombol Previous/Next di bagian bawah
  - Shortcut keyboard (Alt+Left/Right Arrow) - 🚧 dalam pengerjaan
- ✅ Indikator status simpan, loading, dan error (gunakan shadcn/ui toast/snackbar).
- ✅ Indikator visual halaman aktif di sidebar (highlight, perubahan warna background).
- ✅ Konfirmasi sebelum meninggalkan halaman dengan perubahan yang belum disimpan.

### e. Validasi & Error Handling

- ✅ Validasi input judul (min 5 karakter), tipe konten, dan batasan file upload.
- 🚧 Validasi ukuran file:
  - Maksimal 2MB untuk gambar (format: JPEG, PNG, WebP, GIF)
  - Maksimal 20MB untuk video (format: MP4, WebM)
- ✅ Tampilkan notifikasi error/sukses di UI dengan pesan yang jelas.
- ✅ Fallback UI untuk jenis konten yang tidak didukung atau gagal dimuat.

### f. Accessibility (A11y)

- ✅ Pastikan navigasi halaman dan editor dapat diakses keyboard.
- 🚧 Tambahkan ARIA label pada elemen interaktif.
- 🚧 Implementasi fokus manajemen yang tepat saat berpindah antar halaman.
- ✅ Pastikan kontras warna sesuai standar WCAG AA minimal.

### g. Testing

- 🚧 Tulis unit test untuk komponen utama (editor, page list, navigasi).
- 🚧 Integration test untuk alur CRUD halaman dan navigasi.
- ⬜ E2E test untuk alur admin mengelola halaman modul (simulasi user flow).
- ⬜ Test A11y menggunakan axe atau similar tools.

### h. Dokumentasi

- ✅ Update module-docs.md dan user guide terkait fitur multi-page.
- ✅ Tambahkan contoh payload API & skenario penggunaan di dokumentasi.
- 🚧 Buat dokumentasi cara penggunaan editor dan shortcut keyboard.

## 3. Status Implementasi [update+2025-06-18]

### 3.1 Selesai Diimplementasikan

- ✅ Struktur dasar ModulePageEditor (TopNavigation, DocumentHeader)
- ✅ TipTap rich text editor dengan berbagai extension
- ✅ Toolbar formatting komprehensif
- ✅ Floating toolbar dan floating menu
- ✅ Sidebar komponen dengan daftar halaman dan pencarian
- ✅ Footer navigasi (prev/next)
- ✅ Status penyimpanan (saved, saving, unsaved)
- ✅ Autosave dengan debounce

### 3.2 Sedang Dikerjakan

- 🚧 Perbaikan error tipe data ModulePage
- 🚧 Unit testing untuk komponen UI
- 🚧 Validasi ukuran file upload
- 🚧 Layout dan page untuk editor multi-page
- 🚧 Integrasi dengan API dan React Query
- 🚧 Navigasi halaman (prev/next)

### 3.3 Belum Dimulai

- ⬜ Slash command menu untuk tipe konten
- ⬜ Upload gambar dan video
- ⬜ Autosave dengan debounce
- ⬜ Unit dan integration testing
- ⬜ Dokumentasi fitur
- ⬜ Implementasi shortcut keyboard
- ⬜ E2E testing
- ⬜ A11y testing

## 4. Perkiraan File/Komponen yang Perlu Diubah/Dibuat

- ✅ `app/(admin)/manage-module/pages/[moduleId]/page.tsx` - Halaman utama editor multi-page
- ✅ `app/(admin)/manage-module/pages/[moduleId]/layout.tsx` - Layout khusus untuk editor multi-page
- ✅ `features/manage-module/components/ModulePageEditor.tsx` - Update dengan TipTap editor
- ✅ `features/manage-module/components/RichTextEditor.tsx` - TipTap editor dengan extensions
- ✅ `features/manage-module/components/ModulePageFooterNav.tsx` - Navigasi bawah (prev/next)
- ✅ `features/manage-module/hooks/useModulePageQuery.ts` - Custom hook untuk query halaman
- ✅ `features/manage-module/hooks/useModulePageMutation.ts` - Custom hook untuk mutasi halaman
- ✅ `features/manage-module/hooks/useModulePageEditor.ts` - Custom hook untuk state editor dan autosave
- ✅ `features/manage-module/hooks/useDebounce.ts` - Custom hook untuk debounce
- ✅ `features/manage-module/hooks/useImageUpload.ts` - Custom hook untuk upload gambar
- 🚧 `features/manage-module/__tests__/unit/ModulePageEditor.test.tsx` - Unit test
- 🚧 `features/manage-module/__tests__/unit/RichTextEditor.test.tsx` - Unit test
- 🚧 `features/manage-module/__tests__/integration/ModulePageUI.integration.test.tsx` - Integration test
- ⬜ `features/manage-module/__tests__/e2e/ModulePage.e2e.spec.ts` - E2E test
- ✅ `features/manage-module/module-docs.md` - Update dokumentasi

## 5. Langkah Selanjutnya

1. ✅ Implementasi TipTap editor dan extensions:

   - Integrasi editor rich text dengan toolbars
   - Implementasi extensions untuk berbagai fitur formatting

2. ✅ Perbaikan UI dan UX:

   - Implementasi status penyimpanan
   - Tampilan yang konsisten dengan tema aplikasi

3. 🚧 Perbaikan tipe data:

   - Menyesuaikan tipe `ModulePage` pada komponen
   - Mengatasi error TypeScript pada file `ModulePageEditor.tsx`

4. 🚧 Testing dan validasi:

   - Menulis unit test untuk komponen UI
   - Integrasi test untuk flow CRUD

5. 🚧 Dokumentasi dan finishing:
   - Melengkapi dokumentasi API dan penggunaan editor
   - Mempersiapkan release fitur

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

### ModulePageList (RightSidebar) [update+2025-06-18]

```
┌─────────────────────────────┐
│ Daftar Halaman [Search]     │
├─────────────────────────────┤
│ ● Introduction   [ACTIVE]   │
│                             │
│ ○ Getting Started           │
│                             │
│ ○ Basic Syntax    [DRAFT]   │
│                             │
│ ○ Advanced Features         │
│                             │
│ + Tambah Halaman            │
└─────────────────────────────┘
```

### ModulePageEditor dengan TipTap dan Toolbars [update+2025-06-18]

```
┌─────────────────────────────────────────────────────────────┐
│ [B] [I] [U] [Code] [Link] [Image] [H1] [H2] [▣ Align] [...] │
├─────────────────────────────────────────────────────────────┤
│ # Judul Halaman                                             │
│                                                             │
│ Ini adalah paragraf teks yang menjelaskan tentang...        │
│                                                             │
│ /                                                           │
│ ┌─────────────────────┐                                     │
│ │ /text               │                                     │
│ │ /heading            │                                     │
│ │ /code               │                                     │
│ │ /image              │                                     │
│ │ /video              │                                     │
│ └─────────────────────┘                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 5. Referensi

- [shadcn/ui Docs](https://ui.shadcn.com/docs)
- [TanStack React Query](https://tanstack.com/query/latest)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-relations)
- [TipTap Editor](https://tiptap.dev/) - Editor rich text extensible
- [Visual Reference: Confluence Editor](https://confluence.atlassian.com/) - Inspirasi layout dan navigasi
- [Visual Reference: hasil_modulePageList.png](features/manage-module/task/visualize/hasil_modulePageList.png) - Contoh tampilan daftar halaman
- [Visual Reference: modulePageEditorWithSideBar.png](features/manage-module/task/visualize/modulePageEditorWithSideBar.png) - Layout dengan sidebar
- [Visual Reference: ui_modulePageEditor.png](features/manage-module/task/visualize/ui_modulePageEditor.png) - Referensi UI editor
- [features/manage-module/module-docs.md](./module-docs.md)
- [features/manage-module/services/modulePageService.ts](./services/modulePageService.ts)
- [features/manage-module/types/modulePageSchema.ts](./types/modulePageSchema.ts)
