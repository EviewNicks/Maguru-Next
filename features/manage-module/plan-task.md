# Rencana Implementasi: Integrasi Penuh Backend API dengan UI Komponen (OPS-140)

## 1. Ringkasan Tujuan

Mengintegrasikan komponen UI frontend yang telah dibuat dengan API backend untuk operasi CRUD pada modul pembelajaran multi-page. Fokus pada penyelesaian subtask 5.3 dari file `plan-task-140.md`, termasuk:

1. Integrasi DocumentHeader dengan API update/save
2. Implementasi ModulePageSidebar dengan API endpoint
3. Perbaikan ModulePagesContext untuk state management terpusat

## 2. Analisis Kondisi Saat Ini

### Komponen yang Sudah Ada:

- `ModulePageEditor` (Editor utama)
- `ModulePageFooterNav` (Navigasi halaman)
- `ModulePageSidebar` (Daftar halaman)
- `DocumentHeader` (Header dokumen)
- `RichTextEditor` (Editor teks berbasis TipTap)

### API yang Sudah Dibuat:

- `POST /api/modules/:id/pages` (create page)
- `GET /api/modules/:id/pages` (list pages)
- `PUT /api/pages/:id` (update page)
- `DELETE /api/pages/:id` (delete page)

### Masalah yang Perlu Diselesaikan:

- DocumentHeader belum terintegrasi dengan API save/update
- ModulePageSidebar belum menggunakan API untuk manajemen halaman
- State management masih terpisah-pisah, belum terpusat di ModulePagesContext

## 3. Langkah-Langkah Teknis

### A. Integrasi DocumentHeader dengan API

1. **Perbaiki hook `useModulePageEditor`**

   - Tambahkan mutasi untuk update judul halaman
   - Implementasi debouncing untuk autosave
   - Tambahkan handling status (saving, saved, error)

2. **Update komponen `DocumentHeader`**
   - Hubungkan dengan status penyimpanan
   - Tambahkan indikator visual status (icon/warna)
   - Implementasi toast notification untuk feedback

### B. Integrasi ModulePageSidebar dengan API

1. **Buat/perbaiki hook `useModulePageCRUD`**

   - Implementasi mutation hooks untuk create, update, delete, reorder halaman
   - Gunakan TanStack Query untuk cache management
   - Implementasi optimistic updates untuk UX responsif

2. **Update komponen `ModulePageSidebar`**
   - Tambahkan handler untuk create page
   - Tambahkan handler untuk delete page dengan konfirmasi
   - Tambahkan handler untuk rename page
   - Implementasi indikator status halaman

### C. Perbaikan ModulePagesContext

1. **Refaktor `ModulePagesContext`**

   - Centralisasi state halaman dan operasi CRUD
   - Tambahkan state untuk tracking loading/error
   - Implementasi state caching untuk performa

2. **Buat provider baru `ModulePageCRUDProvider`**
   - Enkapsulasi semua operasi CRUD
   - Buat API wrapper untuk operasi backend
   - Implementasi error handling terpusat

### D. Implementasi Optimistic Updates

1. **Pattern optimistic updates untuk operasi create/update/delete**

   - Update UI segera sebelum API request selesai
   - Rollback jika terjadi error dari API
   - Implementasi retry mechanism

2. **Handling konkuren editing**
   - Implementasi locking atau versioning sederhana
   - Deteksi konflik edit jika diperlukan

## 4. Komponen & File yang Perlu Diubah

### Hooks yang Perlu Diubah/Dibuat:

1. `features/manage-module/hooks/useModulePageEditor.ts` - Perbaiki untuk handling judul & status
2. `features/manage-module/hooks/useModulePageCRUD.ts` - Buat baru untuk operasi CRUD
3. `features/manage-module/hooks/useDebounce.ts` - Pastikan berfungsi untuk autosave

### Komponen yang Perlu Diubah:

1. `features/manage-module/components/ModulePageEditor/document/DocumentHeader.tsx`
2. `features/manage-module/components/ModulePageSidebar.tsx`
3. `features/manage-module/components/ModulePageFooterNav.tsx`

### Context yang Perlu Diubah/Dibuat:

1. `features/manage-module/context/ModulePagesContext.tsx`
2. `features/manage-module/context/ModulePageCRUDContext.tsx` (baru)

### Service yang Perlu Diubah/Dibuat:

1. `features/manage-module/services/modulePageService.ts` - Pastikan semua API endpoint terhubung

## 5. Pendekatan Implementasi

### Strategi Utama:

1. **Bottom-up approach**: Mulai dari service layer → hooks → context → komponen UI
2. **Iterative testing**: Test setiap layer saat diimplementasi
3. **Progressive enhancement**: Tambahkan fitur satu per satu, verifikasi setelah setiap penambahan

### Timeline:

1. **Hari 1**: Service layer & hooks dasar
2. **Hari 2**: Context providers & state management
3. **Hari 3**: Integrasi komponen UI dengan context & hooks
4. **Hari 4**: Testing, debugging, optimasi

## 6. Testing & Validasi

1. **Unit testing**:

   - Test hooks dan utils secara terisolasi
   - Mock API untuk testing response

2. **Integration testing**:

   - Test alur edit-save-refresh
   - Test navigasi antar halaman dengan state preservation
   - Test error handling & recovery

3. **Manual testing checklist**:
   - Verifikasi autosave berfungsi dengan delay yang sesuai
   - Verifikasi status penyimpanan ditampilkan dengan benar
   - Verifikasi optimistic updates bekerja seperti yang diharapkan
   - Verifikasi error handling & recovery berfungsi dengan benar

## 7. Referensi

1. **Dokumentasi Internal**:

   - `features/manage-module/module-docs.md` - Dokumentasi modul
   - `plan-task-140.md` - Rencana task OPS-140

2. **Referensi Kode**:

   - `features/manage-module/components/ModulePageEditor.tsx` - Struktur editor utama
   - `app/(admin)/manage-module/pages/[moduleId]/page.tsx` - Page component

3. **Dokumentasi External**:
   - [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview) - Untuk optimistic updates & mutation
   - [TipTap Editor Documentation](https://tiptap.dev/docs) - Untuk integrasi editor
   - [React Hooks API Reference](https://react.dev/reference/react) - Untuk custom hooks
   - [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) - Untuk backend APIs

## 8. Batasan & Pertimbangan

1. **Performa**:

   - Hindari re-render yang tidak perlu dengan memoization
   - Implementasi debouncing untuk autosave
   - Gunakan optimistic updates untuk UX responsif

2. **UX**:

   - Tampilkan loading state/indikator yang jelas
   - Implementasi feedback visual untuk setiap aksi
   - Pastikan error handling yang user-friendly

3. **Maintenance**:
   - Kode harus terdokumentasi dengan baik
   - Refaktor untuk reusability
   - Struktur modular untuk memudahkan perubahan di masa depan
