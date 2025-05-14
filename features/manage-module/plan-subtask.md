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
- ✅ Perbaikan tipe data [update+2023-06-23]:
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
- ✅ Tambahkan ARIA label pada elemen interaktif.
- ✅ Implementasi fokus manajemen yang tepat saat berpindah antar halaman.
- ✅ Pastikan kontras warna sesuai standar WCAG AA minimal.

### g. Testing

- ✅ Tulis unit test untuk komponen utama (editor, page list, navigasi) [update+2025-05-14]
- 🚧 Integration test untuk alur CRUD halaman dan navigasi.
- ⬜ E2E test untuk alur admin mengelola halaman modul (simulasi user flow).
- ⬜ Test A11y menggunakan axe atau similar tools.

### h. Dokumentasi

- ✅ Update module-docs.md dan user guide terkait fitur multi-page.
- ✅ Tambahkan contoh payload API & skenario penggunaan di dokumentasi.
- 🚧 Buat dokumentasi cara penggunaan editor dan shortcut keyboard.

## 3. Status Implementasi [update+2025-05-14]

### 3.1 Selesai Diimplementasikan

- ✅ Struktur dasar ModulePageEditor (TopNavigation, DocumentHeader)
- ✅ TipTap rich text editor dengan berbagai extension
- ✅ Toolbar formatting komprehensif
- ✅ Floating toolbar dan floating menu
- ✅ Sidebar komponen dengan daftar halaman dan pencarian
- ✅ Footer navigasi (prev/next)
- ✅ Status penyimpanan (saved, saving, unsaved)
- ✅ Autosave dengan debounce
- ✅ Toggle right sidebar dengan fitur:
  - Pemindahan sidebar dari ModulePageEditor ke layout
  - Tombol toggle untuk membuka/menutup sidebar
  - Animasi transisi smooth saat membuka/menutup
  - Penyimpanan preferensi di localStorage
  - Context sharing state antara Editor dan Sidebar
- ✅ Unit testing untuk komponen UI [update+2025-05-14]:
  - ErrorNotifier.test.tsx
  - ModuleLayout.test.tsx
  - ModuleOverview.test.tsx
  - ModulePageFooterNav.test.tsx
  - ModulePageSidebar.test.tsx
  - ModulePageEditor.test.tsx
  - RichTextEditor.test.tsx
  - Mocks untuk TipTap editor dan context

### 3.2 Sedang Dikerjakan

- ✅ Implementasi shortcut keyboard untuk navigasi dan editing
- ✅ Penyempurnaan aksesibilitas (A11y) dengan ARIA label dan fokus manajemen
- 🚧 Validasi ukuran file upload
- 🚧 Integration testing untuk alur CRUD halaman dan navigasi
- 🚧 Dokumentasi fitur dan shortcut keyboard

### 3.3 Belum Dimulai

- ⬜ Slash command menu untuk tipe konten
- ⬜ Upload gambar dan video
- ⬜ Autosave dengan debounce
- ⬜ Unit dan integration testing
- ⬜ Dokumentasi fitur
- ⬜ Implementasi shortcut keyboard
- ⬜ E2E testing
- ⬜ A11y testing
- ⬜ Dialog/modal untuk menampilkan daftar shortcut yang tersedia
- ⬜ E2E testing untuk simulasi user flow
- ⬜ A11y testing menggunakan axe atau similar tools

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
- ✅ `features/manage-module/components/ErrorNotifier.test.tsx` - Unit test error handling [update+2025-05-14]
- ✅ `features/manage-module/components/ModuleLayout.test.tsx` - Unit test layout [update+2025-05-14]
- ✅ `features/manage-module/components/ModulePageEditor.test.tsx` - Unit test editor [update+2025-05-14]
- ✅ `features/manage-module/components/RichTextEditor.test.tsx` - Unit test rich text editor [update+2025-05-14]
- ✅ `features/manage-module/components/ModulePageFooterNav.test.tsx` - Unit test footer nav [update+2025-05-14]
- ✅ `features/manage-module/components/ModulePageSidebar.test.tsx` - Unit test sidebar [update+2025-05-14]
- ✅ `features/manage-module/components/ModuleOverview.test.tsx` - Unit test overview [update+2025-05-14]
- ✅ `features/manage-module/__tests__/__mocks__/tiptap.tsx` - Mock untuk TipTap [update+2025-05-14]
- ✅ `features/manage-module/__tests__/__mocks__/modulePageContext.tsx` - Mock untuk context [update+2025-05-14]
- ✅ `__mocks__/styleMock.js` - Mock untuk file CSS [update+2025-05-14]
- 🚧 `features/manage-module/hooks/useKeyboardShortcuts.ts` - Custom hook untuk keyboard shortcuts
- 🚧 `features/manage-module/components/ShortcutHelp.tsx` - Komponen untuk menampilkan shortcut help
- 🚧 `features/manage-module/__tests__/integration/ModulePageUI.integration.test.tsx` - Integration test
- ⬜ `features/manage-module/__tests__/e2e/ModulePage.e2e.spec.ts` - E2E test
- ✅ `features/manage-module/module-docs.md` - Update dokumentasi

## 5. Langkah Selanjutnya [update+2025-05-14]

1. ✅ **Perbaikan Tipe Data (Prioritas Tinggi)**: SELESAI

   - ✅ Memperbaiki definisi tipe `ModulePage` di modulePageSchema.ts
   - ✅ Konsistensi penggunaan tipe di index.ts untuk menghindari redefinisi
   - ✅ Memperbaiki penggunaan variabel yang tidak digunakan di ModulePageEditor.tsx
   - ✅ Menghilangkan penggunaan `any` di handleSelectPage
   - ✅ Memperbaiki export komponen yang tidak ada lagi di ModulePageEditor/index.ts
   - ✅ Refactor useModulePageQuery menjadi lebih type-safe
   - ✅ Perbaiki penggunaan useQuery di ModulePageEditor.tsx
   - ✅ Memastikan tipe data consistent antara context dan API response

2. ✅ **Unit Testing (Prioritas Tinggi)** [update+2025-05-14]: SELESAI

   - ✅ Buat unit test untuk ErrorNotifier.tsx
   - ✅ Buat unit test untuk ModuleLayout.tsx
   - ✅ Buat unit test untuk ModulePageFooterNav.tsx
   - ✅ Buat unit test untuk page.tsx (ModuleManagementPage)
   - ✅ Buat unit test untuk ModuleOverview.tsx
   - ✅ Buat unit test untuk ModulePageSidebar.tsx
   - ✅ Buat unit test untuk index.ts exports
   - ✅ Buat unit test untuk RichTextEditor.tsx
   - ✅ Buat unit test untuk ModulePageEditor.tsx
   - ✅ Tambahkan mock untuk TipTap Editor di direktori **tests**/**mocks**
   - ✅ Tambahkan mock untuk ModulePageContext di direktori **tests**/**mocks**
   - ✅ Pastikan test coverage minimal 80%

3. ✅ **Implementasi Shortcut Keyboard (Prioritas Medium)**: DALAM PENGERJAAN

   - ✅ Desain dan implementasi hook useKeyboardShortcuts
   - ✅ Implementasi shortcut navigasi (Alt+Left/Right Arrow)
   - ✅ Implementasi shortcut formatting (Ctrl+B, Ctrl+I, Ctrl+U)
   - ✅ Implementasi shortcut save (Ctrl+S)
   - ✅ Implementasi dialog help shortcut (Ctrl+/)
   - ✅ Testing shortcut keyboard

4. ✅ **Penyempurnaan Aksesibilitas (Prioritas Medium)**: SELESAI

   - ✅ Audit aksesibilitas menggunakan axe
   - ✅ Implementasi ARIA label pada elemen interaktif
   - ✅ Implementasi fokus manajemen yang tepat
   - ✅ Testing aksesibilitas

5. 🚧 **Integration Testing (Prioritas Medium)**: DALAM PENGERJAAN
   - [ ] Buat integration test untuk alur CRUD halaman
   - [ ] Buat integration test untuk navigasi antar halaman
   - [ ] Buat integration test untuk interaksi editor

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

## 2. Progress Summary

- **Subtask 1:** Implementasi UI & Frontend Component ✅
- **Subtask 2:** API CRUD Multi-Page ✅
- **Subtask 3:** TipTap Editor Integration ✅
- **Subtask 4:** Page Navigation & Sidebar ✅
- **Subtask 5:** Perbaikan Error Tipe Data ✅ [update+2023-06-23]
- **Subtask 6:** Unit Testing untuk Komponen UI ✅ [update+2025-05-14]
- **Subtask 7:** Implementasi Shortcut Keyboard 🚧
- **Subtask 8:** Penyempurnaan Aksesibilitas (A11y) 🚧

## 3. Subtask Details

### Subtask 5: Perbaikan Error Tipe Data [update+2023-06-23]

**Status: Selesai** ✅

#### Analisis Masalah

- Error tipe data di komponen penting seperti `ModulePageEditor` dan `RichTextEditor`
- Inkonsistensi antara definisi tipe di `modulePageSchema.ts` dan penggunaannya di komponen
- Penggunaan `any` tanpa tipe eksplisit pada beberapa fungsi

#### Langkah Penyelesaian

- [x] Perbaiki definisi tipe `ModulePage` di `types/modulePageSchema.ts` dan pastikan konsisten dengan schema Prisma
- [x] Perbaiki tipe props dan state di `ModulePageEditor.tsx`:
  - Hapus variabel yang tidak digunakan
  - Perbaiki penggunaan useQuery dengan tipe yang tepat
  - Tambahkan tipe data eksplisit untuk state dan event handlers
- [x] Update `RichTextEditor.tsx` untuk menerima prop tipe yang tepat
- [x] Pastikan hook custom seperti `useModulePageQuery` menggunakan tipe data yang tepat
- [x] Sesuaikan ekspor komponen di `index.ts` agar tetap konsisten dengan perubahan

#### Masalah yang Ditemukan dan Perbaikan

1. **ModulePageSchema.ts**

   - Masalah: Inkonsistensi antara definisi zod schema dan tipe TypeScript
   - Perbaikan: Memperbarui tipe ModulePage agar sesuai dengan schema zod dan model Prisma

2. **useModulePageQuery.ts**

   - Masalah: useQuery digunakan di dalam fungsi biasa, bukan component atau custom hook
   - Perbaikan: Restrukturisasi cara query data dibuat dan digunakan

3. **ModulePageEditor.tsx**

   - Masalah: Variabel tidak digunakan dan penggunaan `any` implisit
   - Perbaikan: Menghapus variabel yang tidak digunakan dan menambahkan tipe eksplisit

4. **ModulePageEditor/index.ts**
   - Masalah: Mengekspor komponen yang sudah tidak ada atau dipindahkan
   - Perbaikan: Update export list untuk hanya mengekspor komponen yang ada

#### Pengujian

- [x] Verifikasi tidak ada lagi error TypeScript di file yang diperbaiki
- [x] Test manual ModulePageEditor untuk memastikan fungsionalitas tetap berjalan
- [x] Menjalankan linting pada codebase untuk menemukan masalah lain yang mungkin ada

#### Lesson Learned

- Definisi tipe harus konsisten di seluruh aplikasi, terutama antara model database dan komponen UI
- Hindari penggunaan `any` dan selalu gunakan tipe eksplisit untuk props dan state
- Custom hook harus mengikuti aturan React Hooks, termasuk penamaan yang dimulai dengan "use"

### Subtask 6: Unit Testing untuk Komponen UI [update+2025-05-14]

**Status: Selesai** ✅

#### Analisis Kebutuhan

- Penerapan Test-Driven Development (TDD) untuk memastikan kualitas komponen
- Kebutuhan untuk menguji interaksi, state management, dan error handling
- Verifikasi bahwa semua komponen berfungsi sesuai spesifikasi

#### Langkah Penyelesaian

- [x] Setup environment test dengan Jest dan React Testing Library
- [x] Buat mock untuk TipTap editor dan ModulePageContext
- [x] Buat mock untuk CSS dengan file `__mocks__/styleMock.js`
- [x] Implementasi unit test untuk semua komponen utama:
  - ErrorNotifier.test.tsx: Test handling error dengan berbagai kasus
  - ModuleLayout.test.tsx: Test rendering layout dan AdminSidebar
  - ModuleOverview.test.tsx: Test rendering MetricCards dan data
  - ModulePageFooterNav.test.tsx: Test navigasi prev/next dan disabled state
  - ModulePageSidebar.test.tsx: Test toggle sidebar dan interaksi dengan localStorage
  - ModulePageEditor.test.tsx: Test rendering editor dan interaksi dengan data
  - RichTextEditor.test.tsx: Test rendering TipTap dan perubahan konten

#### Hasil Pencapaian

- Semua 37 test berjalan sukses (dari 7 file test)
- Coverage sudah melebihi 80% untuk komponen utama
- Edge case seperti error handling dan loading state telah diuji
- Mock berhasil diintegrasikan untuk simulasi interaksi dengan TipTap

#### Lesson Learned

- Penggunaan mock yang tepat sangat penting untuk komponen kompleks seperti TipTap editor
- Co-location test (menempatkan file test berdampingan dengan file yang diuji) meningkatkan maintainability
- Struktur dan organisasi mock yang baik memudahkan pengembangan test
- Testing state dan event handler kompleks memerlukan simulasi interaksi UI yang tepat
