# Planning Update UI: Halaman Manage-Module (FE Only)

## 1. Ringkasan Tujuan

- Membuat ulang tampilan halaman manage-module agar konsisten dan modern seperti halaman manage-users.
- Membuat komponen utama mirip `SystemOverview` (manage-users), namun menampilkan data summary/statistik modul (bukan user).
- Fokus pada frontend (FE) saja, integrasi backend akan dilakukan di tahap berikutnya.
- Menggunakan style, struktur, dan komponen shadcn/ui yang sama agar UX konsisten di seluruh admin panel.

## 2. Langkah-Langkah Teknis

### A. Analisis & Desain

- Analisis struktur dan style `SystemOverview.tsx` di manage-users.
- Rancang wireframe/struktur komponen untuk module overview (misal: summary jumlah modul, status modul, dsb).
- Tentukan data dummy/statistik yang akan ditampilkan (misal: total modul, modul aktif, draft, archived, dsb).

### B. Implementasi Komponen

- Buat komponen baru `ModuleOverview.tsx` di `features/manage-module/components/`.
- Komponen utama:
  - Card utama dengan background, border, dan efek blur seperti SystemOverview
  - Header dengan judul dan badge status (misal: LIVE, jumlah modul, dsb)
  - Section statistik (jumlah modul, status, dsb) dengan MetricCard
  - Tabs (jika diperlukan) untuk statistik lain (misal: statistik penggunaan modul, dsb)
  - Placeholder untuk chart atau tabel (jika ingin menambah visualisasi)
- Gunakan data dummy untuk semua statistik (FE only)
- Tambahkan loading state dan error state (dummy)

### C. Integrasi & Layout

- Update halaman utama manage-module (`app/(admin)/manage-module/page.tsx`) untuk menggunakan komponen baru
- Pastikan layout konsisten dengan manage-users (spacing, padding, warna, dsb)
- Tambahkan placeholder komponen lain jika diperlukan (misal: tabel daftar modul, dsb)

### D. Testing & Review

- Pastikan komponen responsif dan konsisten di berbagai ukuran layar
- Lakukan review visual dan UX
- Siapkan file test dasar (snapshot/component test)

## 3. Estimasi File/Komponen yang Perlu Diubah/Dibuat

- `features/manage-module/components/ModuleOverview.tsx` (komponen utama)
- `features/manage-module/components/MetricCard.tsx` (jika belum ada, bisa reuse dari manage-users)
- `app/(admin)/manage-module/page.tsx` (update untuk gunakan komponen baru)
- `features/manage-module/components/__tests__/ModuleOverview.test.tsx` (unit test FE)

## 4. Pertanyaan Klarifikasi (Opsional)

- Statistik/summary apa saja yang ingin ditampilkan di overview module? (misal: total modul, aktif, draft, archived, dsb)
- Apakah ingin ada chart/tabel statistik lain di overview (seperti performance chart di manage-users)?
- Apakah ingin ada fitur refresh data (dummy) seperti di SystemOverview?
- Apakah ingin ada tabs (misal: statistik, daftar modul, dsb) atau cukup satu panel summary saja?

---

**Silakan jawab pertanyaan di atas jika ingin menyesuaikan detail UI. Jika tidak, saya akan lanjut dengan asumsi default (summary total modul, breakdown status, dan layout mirip SystemOverview).**

# Planning Update UI & Backend Integration: Halaman Manage-Module

## 1. Ringkasan Tujuan

- Melakukan migrasi logic backend/data fetching dari komponen lama (`components/ModuleTable.tsx` dan turunannya) ke UI baru (`componentsNew/ModuleTable.tsx`).
- Memastikan seluruh fitur utama (CRUD, filter, pagination, error/loading state) tetap berjalan dengan tampilan baru yang lebih modern dan konsisten.
- Menyatukan keunggulan arsitektur lama (data hooks, modularity) dengan keunggulan UI/UX baru (Card, Table, dsb).

## 2. Langkah-Langkah Teknis

### A. Analisis & Mapping Fitur

- Identifikasi seluruh fitur utama di komponen lama:

  - Data fetching (React Query)
  - CRUD (Create, Read, Update, Delete)
  - Filter, search, dan pagination
  - Error & loading state
  - Modularisasi cell/rendering lainnya

- Mapping dengan file-file utama:
  - `useModuleQuery.ts` - Fetch data dengan React Query
  - `useModuleMutation.ts` - Operasi CRUD dengan React Query
  - `ModuleTable/ErrorNotifier.tsx` - Handling error
  - `ModuleTable/SearchAndFilter.tsx` - Filter dan search
  - `ModuleFormModal/` - Modal create & edit
  - `ModuleTable/columns.tsx` - Definisi kolom dan rendering cell
  - `ModuleTable/ModuleActionCell.tsx` - Button aksi (edit, delete, dll)

### B. Strategi Refactoring

1. **Pendekatan "Cut & Transform"**:

   - Tidak langsung replace file lama
   - Buat komponen baru dengan UI baru di folder `componentsNew/`
   - Migrasi logic secara bertahap sambil menyesuaikan dengan UI baru

2. **File-file yang Tetap Dipertahankan**:

   - `hooks/useModuleQuery.ts`
   - `hooks/useModuleMutation.ts`
   - `services/moduleClientService.ts`

3. **Struktur Komponen Baru**
   - `ModuleTable.tsx` - Main table dengan aksi dan view modes
   - `ModuleFormModal.tsx` - Modal create/edit
   - `ModuleActionCell.tsx` - Cell aksi (edit, delete)
   - `ModuleDescriptionCell.tsx` - Cell description dengan expand/collapse
   - `ErrorNotifier.tsx` - Handling error

### C. UI/UX Enhancement

1. **Card View vs Table View**

   - Tambahkan opsi melihat modul dalam bentuk card grid
   - Toggle antara table view dan card view

2. **Loading State**

   - Table skeleton
   - Card skeleton
   - Disabled buttons saat loading

3. **Error Handling**

   - Toast berbasis error code
   - Fallback UI saat error
   - Mekanisme retry

4. **Filter & Search**

   - Debounce search
   - Filter status (Aktif, Draft, Diarsipkan)
   - Pagination & item count

5. **Responsiveness**
   - Layout responsif untuk mobile & desktop
   - Penyesuaian grid untuk card view

### D. Testing

1. **Unit Test Updates**

   - Update semua test untuk menyesuaikan dengan UI baru
   - Test fitur baru (card view, dll)

2. **Integration Test**
   - Pastikan data flow tetap berfungsi end-to-end

## 3. Timeline

1. **Phase 1: Component Building** ✅

   - Struktur UI dasar untuk table dan card view
   - Static state (hardcoded data)

2. **Phase 2: Data Integration** ✅

   - Integrasi hooks data fetching
   - Error handling komprehensif
   - Filter, search, pagination

3. **Phase 3: UI Enhancement**

   - Polish animasi & transisi
   - Accessibility improvements
   - Ekspor data & bulk actions
   - Konfirmasi batch delete

4. **Phase 4: Testing & Deployment**
   - Memperbarui unit test
   - Integration test
   - Deployment ke staging

## 4. Checklist Implementasi

### A. Files to Create/Modify:

- ✅ `features/manage-module/componentsNew/ModuleTable.tsx` (main container)
- ✅ `features/manage-module/componentsNew/ModuleFormModal.tsx` (modal tambah/edit)
- ✅ `features/manage-module/componentsNew/ModuleActionCell.tsx` (cell aksi)
- ✅ `features/manage-module/componentsNew/ModuleDescriptionCell.tsx` (cell deskripsi)
- ✅ `features/manage-module/componentsNew/ErrorNotifier.tsx` (error handler)
- ✅ `app/(admin)/manage-module/page.tsx` (page container)

### B. Required Tests:

- `features/manage-module/componentsNew/__tests__/ModuleTable.test.tsx`
- `features/manage-module/componentsNew/__tests__/ModuleFormModal.test.tsx`
- `features/manage-module/componentsNew/__tests__/ModuleActionCell.test.tsx`

## 5. Rekap Perubahan yang Sudah Dilakukan

### Komponen yang Sudah Dibuat

1. **ModuleTable.tsx** ✅

   - Implementasi tampilan tabel modern dengan dukungan filter dan pencarian
   - Integrasi dengan API data via React Query
   - Fitur mode tampilan card/table
   - Skeletons loading state
   - Pagination dengan kontrol halaman dan item per halaman

2. **ModuleFormModal.tsx** ✅

   - Form modal untuk menambah/edit modul
   - Validasi input menggunakan zod
   - Integrasi dengan API via mutasi React Query
   - Menampilkan error form dengan format yang konsisten
   - Loading state saat submit

3. **ModuleActionCell.tsx** ✅

   - Tombol aksi untuk edit dan hapus modul
   - Konfirmasi dialog untuk hapus modul
   - Error handling terintegrasi

4. **ModuleDescriptionCell.tsx** ✅

   - Tampilan deskripsi dengan fitur expand/collapse
   - Sanitasi HTML untuk mencegah XSS

5. **ErrorNotifier.tsx** ✅
   - Sistem penanganan error yang konsisten
   - Format toast dengan kode dan pesan error
   - Utilitas untuk menampilkan error di berbagai konteks

### Integrasi dan Perubahan Lainnya

1. **Layout dan Navigasi** ✅

   - Integrasi dengan ModuleLayout
   - Header dan judul halaman

2. **Struktur Ekspor** ✅

   - File index.ts untuk ekspor terpusat
   - Modularisasi untuk penggunaan ulang komponen

3. **Peningkatan UX** ✅
   - Filter status yang intuitif
   - Indikator loading state
   - Feedback saat operasi CRUD

### Langkah Berikutnya

1. **Pengujian (Testing)** 🔄

   - Menambahkan unit tests untuk komponen baru
   - Memastikan semua fungsi bekerja sesuai ekspektasi

2. **UI/UX Enhancement** 🔄
   - Fine-tuning animasi dan transisi
   - Peningkatan responsivitas
3. **Fitur Tambahan** 🔄
   - Bulk actions (hapus banyak, ubah status)
   - Ekspor data ke CSV/Excel
   - Filter dan pencarian tambahan
