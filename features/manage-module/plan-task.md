# Rencana Implementasi Fitur Edit Title Module

## Ringkasan Tujuan

Mengimplementasikan fitur edit judul modul di DocumentHeader.tsx dengan trigger save yang spesifik (enter key atau blur event), bukan auto-save saat pengetikan.

## Alur Kerja Fitur

1. **User Interaction Flow**:

   - User mengklik input judul → Input menjadi fokus
   - User mengedit judul
   - User menekan Enter ATAU mengklik di luar input (blur event)
   - Sistem menyimpan judul baru ke database
   - UI menampilkan status penyimpanan (saving → saved/error)

2. **Data Flow (sesuai architecture-module-page.md)**:

   - DocumentHeader.tsx (UI) → ModulePageCRUDContext.tsx (Context)
   - ModulePageCRUDContext.tsx → useModulePageData.ts (Hook)
   - useModulePageData.ts → modulePageAdapter.ts (Adapter)
   - modulePageAdapter.ts → route.ts (API Route)
   - route.ts → Database

3. **Handling Status**:
   - 'unsaved': Saat user mulai mengedit (onChange)
   - 'saving': Saat proses save dimulai
   - 'saved': Saat save berhasil
   - 'error': Jika terjadi error saat save

## Langkah-langkah Teknis

### 1. Perbarui DocumentHeader.tsx

- Modifikasi `handleTitleChange` untuk hanya mengubah state lokal tanpa mengubah status save
- Tambahkan fungsi `handleTitleSave` untuk menyimpan judul
- Implementasikan event handlers:
  - `onKeyDown` untuk menangkap Enter key
  - `onBlur` untuk menangkap saat user mengklik di luar input
- Gunakan `savePage` dari context untuk menyimpan judul baru
- Tambahkan validasi judul (minimal 5 karakter)
- Perbarui UI untuk menampilkan status penyimpanan

### 2. Pastikan ModulePageCRUDContext.tsx Mendukung

- Verifikasi fungsi `savePage` dapat menangani pembaruan judul
- Pastikan cache invalidation berjalan dengan baik setelah update

### 3. Verifikasi useModulePageData.ts

- Pastikan hook memiliki fungsi untuk update page title
- Verifikasi bahwa hook menggunakan adapter dengan benar

### 4. Verifikasi modulePageAdapter.ts

- Pastikan adapter memiliki fungsi untuk memanggil API update page
- Verifikasi bahwa cache diinvalidasi setelah update

### 5. Verifikasi API Route (route.ts)

- Pastikan endpoint PUT tersedia untuk update page title
- Verifikasi bahwa validasi input berjalan dengan baik

## File yang Perlu Diubah

1. **features/manage-module/components/ModulePageEditor/document/DocumentHeader.tsx** (Primary)
   - Implementasi utama fitur edit title

## File yang Perlu Diperiksa (Referensi)

1. **features/manage-module/context/ModulePageCRUDContext.tsx**

   - Verifikasi fungsi `savePage`
   - Pastikan context menyediakan state dan handler yang diperlukan

2. **features/manage-module/hooks/useModulePageData.ts**

   - Verifikasi fungsi update page title
   - Pastikan hook menangani error dengan baik

3. **features/manage-module/adapters/modulePageAdapter.ts**

   - Verifikasi fungsi `updatePage` untuk title update
   - Pastikan cache diinvalidasi dengan benar

4. **app/api/module/[id]/pages/[pageid]/route.ts**
   - Verifikasi endpoint PUT untuk update page
   - Pastikan validasi input berjalan dengan baik

## Error Handling

- Validasi judul sebelum save (minimal 5 karakter)
- Tampilkan toast error jika save gagal
- Berikan opsi retry jika network error
- Tampilkan status error di UI

## UI/UX Considerations

- Berikan visual feedback saat status berubah
- Pastikan input judul mudah diakses dan jelas
- Tampilkan indikator loading saat proses save
- Berikan konfirmasi visual saat save berhasil
