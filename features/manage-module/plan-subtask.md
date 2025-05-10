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

### b. Pembuatan/Integrasi Komponen

- Buat komponen **ModulePageList**:
  - Tampilan daftar halaman dengan indikator halaman aktif
  - Indikator status halaman (draft/published) seperti pada referensi Confluence
  - Tombol tambah halaman baru
  - Opsi expandable/collapsible untuk perangkat mobile
- Buat/extend komponen **ModulePageEditor**:
  - Toolbar formatting di bagian atas editor (Bold, Italic, Headers, Link, dll)
  - Implementasi slash command menu (`/image`, `/code`, `/video`, dll)
  - Rich text editor dengan dukungan markdown (via TipTap)
  - Area drop untuk upload gambar/video dengan preview
  - Indikator status perubahan (saved, saving, unsaved)
- Buat komponen **ModulePageFooterNav**:
  - Tombol Previous/Next untuk navigasi antar halaman
  - Indikator progres (halaman x dari y)
- Integrasi komponen ke dalam layout utama (ModuleLayout/page.tsx).

### c. Integrasi Data & State Management

- Gunakan React Query untuk fetch, create, update, delete halaman (integrasi dengan modulePageService).
- Implementasi state management untuk:
  - Daftar halaman dalam modul
  - Halaman aktif yang sedang dibuka
  - Status konten editor (unsaved changes)
  - Status upload file
- Optimasi update UI secara real-time setelah operasi CRUD.
- Implementasi autosave dengan debounce (2000ms).

### d. Navigasi & UX

- Implementasi navigasi antar halaman via:
  - RightSidebar (klik pada judul halaman)
  - Tombol Previous/Next di bagian bawah
  - Shortcut keyboard (Alt+Left/Right Arrow)
- Indikator status simpan, loading, dan error (gunakan shadcn/ui toast/snackbar).
- Indikator visual halaman aktif di sidebar (highlight, perubahan warna background).
- Konfirmasi sebelum meninggalkan halaman dengan perubahan yang belum disimpan.

### e. Validasi & Error Handling

- Validasi input judul (min 5 karakter), tipe konten, dan batasan file upload.
- Validasi ukuran file:
  - Maksimal 2MB untuk gambar (format: JPEG, PNG, WebP, GIF)
  - Maksimal 20MB untuk video (format: MP4, WebM)
- Tampilkan notifikasi error/sukses di UI dengan pesan yang jelas.
- Fallback UI untuk jenis konten yang tidak didukung atau gagal dimuat.

### f. Accessibility (A11y)

- Pastikan navigasi halaman dan editor dapat diakses keyboard.
- Tambahkan ARIA label pada elemen interaktif.
- Implementasi fokus manajemen yang tepat saat berpindah antar halaman.
- Pastikan kontras warna sesuai standar WCAG AA minimal.

### g. Testing

- Tulis unit test untuk komponen utama (editor, page list, navigasi).
- Integration test untuk alur CRUD halaman dan navigasi.
- E2E test untuk alur admin mengelola halaman modul (simulasi user flow).
- Test A11y menggunakan axe atau similar tools.

### h. Dokumentasi

- Update module-docs.md dan user guide terkait fitur multi-page.
- Tambahkan contoh payload API & skenario penggunaan di dokumentasi.
- Buat dokumentasi cara penggunaan editor dan shortcut keyboard.

## 3. Perkiraan File/Komponen yang Perlu Diubah/Dibuat

- `features/manage-module/components/ModulePageList.tsx` _(baru)_ - Navigasi sidebar kanan
- `features/manage-module/components/ModulePageEditor.tsx` _(baru)_ - Editor utama dengan toolbar
- `features/manage-module/components/ModulePageFooterNav.tsx` _(baru)_ - Navigasi bawah (prev/next)
- `features/manage-module/components/ModulePageLayout.tsx` _(baru)_ - Layout 3-kolom untuk page editor
- `features/manage-module/components/SlashCommandMenu.tsx` _(baru)_ - Menu pop-up untuk slash commands
- `features/manage-module/components/page.tsx` _(update integrasi)_ - Update untuk menggunakan ModulePageLayout
- `features/manage-module/components/ModuleLayout.tsx` _(update)_ - Menyesuaikan layout untuk sidebar tambahan
- `features/manage-module/services/modulePageService.ts` _(pastikan CRUD ready)_ - Service untuk operasi CRUD halaman
- `features/manage-module/hooks/useModulePageQuery.ts` _(baru)_ - Custom hook untuk query halaman
- `features/manage-module/hooks/useModulePageMutation.ts` _(baru)_ - Custom hook untuk mutasi halaman
- `features/manage-module/hooks/useModulePageEditor.ts` _(baru)_ - Custom hook untuk state editor dan autosave
- `features/manage-module/__tests__/unit/ModulePageEditor.test.tsx` _(unit test)_
- `features/manage-module/__tests__/unit/ModulePageList.test.tsx` _(unit test)_
- `features/manage-module/__tests__/integration/ModulePageUI.integration.test.tsx` _(integration test)_
- `features/manage-module/__tests__/e2e/ModulePage.e2e.spec.ts` _(E2E test)_
- `features/manage-module/module-docs.md` _(update dokumentasi)_

## 4. UI Referensi & Wireframes

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

### ModulePageList (RightSidebar)

```
┌─────────────────────────────┐
│ Daftar Halaman              │
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

### ModulePageEditor dengan SlashCommand

```
┌─────────────────────────────────────────────────────────────┐
│ [B] [I] [Code] [Link] [Image] [H1] [H2] ...                 │
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
- [Visual Reference: hasil_modulePageList.png](path/to/image) - Contoh tampilan daftar halaman
- [Visual Reference: modulePageEditorWithSideBar.png](path/to/image) - Layout dengan sidebar
- [Visual Reference: ui_modulePageEditor.png](path/to/image) - Referensi UI editor
- [features/manage-module/module-docs.md](./module-docs.md)
- [features/manage-module/services/modulePageService.ts](./services/modulePageService.ts)
- [features/manage-module/types/modulePageSchema.ts](./types/modulePageSchema.ts)
