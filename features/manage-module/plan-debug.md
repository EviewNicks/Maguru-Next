# 📋 Planning Penyelesaian: Perbaikan Error Tipe Data dan Implementasi Fitur Lanjutan

## 1. Ringkasan Tujuan

Menyelesaikan implementasi ModulePageEditor dengan fokus pada:

- ✅ Perbaikan error tipe data pada komponen
- ✅ Implementasi unit testing untuk komponen UI
- 🚧 Penambahan shortcut keyboard untuk navigasi dan editing
- 🚧 Penyempurnaan aksesibilitas (A11y)

## 2. Analisis Kebutuhan

Berdasarkan status pada plan-task-140.md dan plan-subtask.md, beberapa fitur utama telah diimplementasikan:

- ✅ Toggle right sidebar sudah selesai diimplementasikan
- ✅ TipTap editor sudah terintegrasi dengan baik
- ✅ Sebagian besar UI components sudah dibuat
- ✅ Context state management untuk berbagi data antara editor dan sidebar sudah diimplementasikan
- ✅ Unit testing untuk komponen UI sudah diimplementasikan [update+2025-05-14]

Namun, beberapa hal masih perlu diselesaikan:

- 🚧 Shortcut keyboard untuk navigasi dan editing
- 🚧 Penyempurnaan aksesibilitas dengan ARIA label dan fokus manajemen

## 3. Rincian Implementasi

### A. Perbaikan Error Tipe Data ✅ [update+2023-06-23]

1. **Memperbaiki Definisi Tipe `ModulePage` di modulePageSchema.ts (SELESAI)**

- [x] Hapus redefinisi tipe yang tidak konsisten
- [x] Gunakan union type untuk status: `'DRAFT' | 'PUBLISHED' | 'ARCHIVED'`
- [x] Pastikan field mandatory dan opsional sudah ditandai dengan benar

2. **Memperbaiki Inkonsistensi Impor (SELESAI)**

- [x] Hindari mengimpor tipe yang sama dari tempat berbeda
- [x] Gunakan re-export dari satu sumber tunggal di `index.ts`
- [x] Hapus duplikasi definisi tipe

3. **Menghilangkan Penggunaan `any` (SELESAI)**

- [x] Ganti `any` di `handleSelectPage` dengan tipe `ModulePage`
- [x] Gunakan tipe eksplisit di `ModulePageEditor`
- [x] Buat interface atau type alias untuk parameter yang kompleks

4. **Membersihkan variabel-variabel yang tidak digunakan (SELESAI)**

- [x] Hapus variabel tidak terpakai di ModulePageEditor
- [x] Pastikan semua import yang tidak digunakan juga dihapus

### B. Implementasi Unit Testing ✅ [update+2025-05-14]

1. **Pengaturan Dasar Unit Testing (SELESAI)**

- [x] Buat file-file test dengan pendekatan co-location (berdampingan dengan file yang diuji)
- [x] Siapkan struktur dasar untuk mock (di `__tests__/__mocks__`)
- [x] Buat mock umum untuk TipTap editor dan context

2. **Test untuk Error Handling (SELESAI)**

- [x] Buat test `ErrorNotifier.test.tsx` untuk memverifikasi penanganan berbagai jenis error
- [x] Test hasil formatting error yang konsisten
- [x] Test integrasi dengan toast notification

3. **Test untuk Komponen UI Dasar (SELESAI)**

- [x] Buat test untuk `ModuleLayout.test.tsx` (rendering AdminSidebar dan children)
- [x] Buat test untuk `ModuleOverview.test.tsx` (rendering MetricCards dan data)
- [x] Buat test untuk `page.test.tsx` (ModuleManagementPage)
- [x] Buat test untuk `index.test.ts` (export komponen)

4. **Test untuk Komponen Navigasi (SELESAI)**

- [x] Buat test untuk `ModulePageFooterNav.test.tsx` (interaksi tombol previous/next)
- [x] Buat test untuk `ModulePageSidebar.test.tsx` (toggle sidebar dan state localStorage)

5. **Test untuk Editor dan Fitur Utama (SELESAI)**

- [x] Buat test untuk `RichTextEditor.test.tsx` dengan mock TipTap
- [x] Buat test untuk `ModulePageEditor.test.tsx` (integrasi antar komponen)
- [x] Buat test untuk interaksi pengguna dan perubahan state (content changes, navigasi, dll.)

6. **Validasi Test Coverage (SELESAI)**

- [x] Pastikan coverage setidaknya 80% pada komponen-komponen utama
- [x] Identifikasi dan tambahkan test untuk edge case
- [x] Verifikasi handling error sudah ditest secara menyeluruh

### C. Implementasi Shortcut Keyboard ✅ [update+2025-06-28]

1. **Desain Shortcut Keyboard (SELESAI)**

- [x] Definisikan daftar shortcut keyboard yang perlu diimplementasikan
- [x] Desain hook `useKeyboardShortcuts` untuk menangani event keyboard secara global

2. **Implementasi Shortcut Navigasi (SELESAI)**

- [x] Shortcut untuk navigasi antar halaman (Alt+Left/Right Arrow)
- [x] Shortcut untuk toggle sidebar (Alt+S)
- [x] Shortcut untuk fokus ke editor (Alt+E)

3. **Implementasi Shortcut Editing (SELESAI)**

- [x] Shortcut untuk formatting (Ctrl+B, Ctrl+I, Ctrl+U, dsb)
- [x] Shortcut untuk save (Ctrl+S)
- [x] Shortcut untuk insert block (Ctrl+Shift+K untuk kode, dsb)

4. **UI untuk Shortcut Help (SELESAI)**

- [x] Dialog/modal yang menampilkan daftar shortcut yang tersedia
- [x] Shortcut untuk membuka dialog help (Ctrl+/)

### D. Penyempurnaan Aksesibilitas (A11y) ✅ [update+2025-06-27]

1. **Audit A11y (SELESAI)**

- [x] Jalankan audit aksesibilitas menggunakan axe atau lighthouse
- [x] Identifikasi masalah aksesibilitas yang perlu diperbaiki

2. **Implementasi ARIA Label (SELESAI)**

- [x] Tambahkan ARIA label pada semua elemen interaktif
- [x] Perbaiki hierarki heading untuk screen reader

3. **Fokus Manajemen (SELESAI)**

- [x] Implementasi trap focus untuk modal
- [x] Fokus yang tepat saat navigasi antar halaman
- [x] Visual focus indicator yang jelas

4. **Testing A11y (SELESAI)**

- [x] Buat test untuk A11y menggunakan jest-axe
- [x] Verifikasi navigasi keyboard berfungsi dengan baik

## 4. File yang Perlu Diubah/Dibuat

### Perbaikan Error Tipe Data [update+2023-06-23]

- [x] `features/manage-module/types/modulePageSchema.ts` - Perbaiki definisi tipe
- [x] `features/manage-module/components/ModulePageEditor.tsx` - Perbaiki tipe props dan state
- [x] `features/manage-module/components/RichTextEditor.tsx` - Perbaiki tipe props dan event handlers
- [x] `features/manage-module/hooks/useModulePageEditor.ts` - Perbaiki tipe return values
- [x] `features/manage-module/hooks/useModulePageQuery.ts` - Perbaiki tipe parameter dan return
- [x] `features/manage-module/hooks/useModulePageMutation.ts` - Perbaiki tipe parameter dan return

### Unit Testing [update+2025-05-14]

- [x] `features/manage-module/components/ErrorNotifier.test.tsx` - Unit test untuk error handling
- [x] `features/manage-module/components/ModuleLayout.test.tsx` - Unit test untuk layout
- [x] `features/manage-module/components/ModulePageEditor.test.tsx` - Unit test untuk editor
- [x] `features/manage-module/components/RichTextEditor.test.tsx` - Unit test untuk rich text editor
- [x] `features/manage-module/components/ModulePageSidebar.test.tsx` - Unit test untuk sidebar
- [x] `features/manage-module/components/ModulePageFooterNav.test.tsx` - Unit test untuk navigasi
- [x] `features/manage-module/components/ModuleOverview.test.tsx` - Unit test untuk overview
- [x] `features/manage-module/__tests__/__mocks__/tiptap.tsx` - Mock data untuk TipTap
- [x] `features/manage-module/__tests__/__mocks__/modulePageContext.tsx` - Mock data untuk ModulePageContext
- [x] `__mocks__/styleMock.js` - Mock untuk file CSS

### Shortcut Keyboard

- [x] `features/manage-module/hooks/useKeyboardShortcuts.ts` - Custom hook untuk keyboard shortcuts
- [x] `features/manage-module/utils/shortcutUtils.ts` - Helper functions untuk keyboard shortcuts
- [x] `features/manage-module/components/ShortcutHelp.tsx` - Komponen untuk menampilkan shortcut help

### Aksesibilitas

- [x] `features/manage-module/components/ModulePageEditor.tsx` - Tambahkan ARIA attributes
- [x] `features/manage-module/components/RichTextEditor.tsx` - Tambahkan ARIA attributes
- [x] `features/manage-module/components/ModulePageSidebar.tsx` - Tambahkan ARIA attributes
- [x] `features/manage-module/components/a11y/A11yAnnouncer.tsx` - Komponen untuk pengumuman ke screen reader
- [x] `features/manage-module/components/a11y/FocusTrap.tsx` - Komponen untuk focus management di modal
- [x] `features/manage-module/components/a11y/SkipLink.tsx` - Komponen untuk navigasi cepat dengan keyboard
- [x] `features/manage-module/hooks/useFocusManagement.ts` - Custom hook untuk focus management
- [x] `features/manage-module/hooks/useA11yKeyboard.ts` - Custom hook untuk keyboard accessibility
- [x] `features/manage-module/utils/a11yUtils.ts` - Helper functions untuk aksesibilitas
- [x] `features/manage-module/__tests__/a11y/accessibility.test.tsx` - Test aksesibilitas

## 5. Timeline Pengerjaan

1. **Perbaikan Error Tipe Data** (Prioritas Tinggi): ✅ SELESAI

   - Pemahaman dan analisis struktur tipe - 1 hari ✅
   - Perbaikan modulePageSchema.ts - 1 hari ✅
   - Perbaikan ModulePageEditor dan RichTextEditor - 1 hari ✅
   - Testing manual dan perbaikan - 1 hari ✅

2. **Unit Testing** (Prioritas Tinggi): ✅ SELESAI [update+2025-05-14]

   - Setup test environment dan mock - 1 hari ✅
   - Unit tests untuk editor dan sidebar - 2 hari ✅
   - Unit tests untuk TipTap extensions - 1 hari ✅
   - Test coverage analysis dan improvement - 1 hari ✅

3. **Shortcut Keyboard** (Prioritas Sedang): ✅ SELESAI [update+2025-06-28]

   - Implementasi useKeyboardShortcuts - 1 hari ✅
   - Integrasi shortcut ke komponen - 1 hari ✅
   - Testing dan refinement - 1 hari ✅

4. **Aksesibilitas** (Prioritas Sedang): ✅ SELESAI [update+2025-06-27]
   - Audit aksesibilitas - 1 hari ✅
   - Implementasi ARIA labels dan fokus manajemen - 2 hari ✅
   - Testing aksesibilitas - 1 hari ✅

## 6. Acceptance Criteria

- **Tipe Data**: ✅ SELESAI

  - [x] Tidak ada error TypeScript di ModulePageEditor.tsx dan RichTextEditor.tsx
  - [x] Tipe data ModulePage dan UpdateModulePageDto jelas dan konsisten
  - [x] Custom hooks menggunakan tipe data yang tepat

- **Unit Testing**: ✅ SELESAI

  - [x] Unit test coverage minimal 80% untuk komponen utama
  - [x] Semua test berjalan sukses
  - [x] Edge cases sudah dicover dalam test

- **Shortcut Keyboard**: ✅ SELESAI [update+2025-06-28]

  - [x] Shortcut untuk navigasi halaman (Alt+Left/Right) berfungsi
  - [x] Shortcut formatting (Ctrl+B, Ctrl+I, Ctrl+U) berfungsi
  - [x] Shortcut save (Ctrl+S) berfungsi
  - [x] Help modal menampilkan shortcut yang tersedia

- **Aksesibilitas**: ✅ SELESAI [update+2025-06-27]
  - [x] Semua elemen interaktif memiliki ARIA label yang tepat
  - [x] Focus management berjalan dengan baik
  - [x] Aplikasi dapat digunakan sepenuhnya dengan keyboard
  - [x] Memenuhi standar WCAG AA

## 7. Risiko dan Mitigasi

- **Risiko**:

  - Perubahan tipe data dapat mempengaruhi komponen lain yang menggunakan tipe tersebut
  - Refactoring untuk aksesibilitas dapat mempengaruhi UI yang sudah ada
  - Unit testing komponen kompleks seperti TipTap editor dapat sulit

- **Mitigasi**:
  - Lakukan perubahan tipe data secara inkremental dengan testing di setiap langkah
  - Buat branch terpisah untuk perbaikan aksesibilitas
  - Gunakan mocking untuk menyederhanakan testing komponen kompleks

## 8. Catatan Tambahan [update+2025-06-28]

- ✅ Dokumentasi test sudah diperbarui seiring dengan implementasi unit test
- ✅ Semua komponen utama sudah memiliki unit test yang berjalan dengan baik
- ✅ Aksesibilitas sudah diimplementasikan secara menyeluruh dengan komponen khusus a11y:
  - A11yAnnouncer untuk mengumumkan perubahan status ke screen reader
  - FocusTrap untuk mengelola fokus dalam modal/dialog
  - SkipLink untuk navigasi cepat dengan keyboard
  - ARIA labels dan roles di seluruh komponen interaktif
- ✅ Implementasi shortcut keyboard sudah selesai dengan integrasi useKeyboardShortcuts ke semua komponen interaktif
- 🚧 Langkah selanjutnya: Menyelesaikan implementasi integration testing untuk alur CRUD halaman
- ⚠️ Perhatikan pendekatan testing untuk komponen yang memiliki integrasi dengan TipTap editor, gunakan mocking yang tepat
