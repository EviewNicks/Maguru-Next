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
  - Modularisasi cell/action (misal: ModuleActionCell, ModuleDescriptionCell)
- Mapping fitur-fitur tersebut ke struktur dan UI baru:
  - Pastikan semua fitur tetap tersedia di UI baru
  - Tentukan bagian mana yang perlu refactor (misal: hooks, context, dsb)

### B. Refactor Data Logic

- Pindahkan logic data fetching (React Query) dari komponen lama ke komponen baru (`componentsNew/ModuleTable.tsx`)
- Integrasikan state loading, error, dan data ke dalam Card/Table baru
- Pastikan data dummy diganti dengan data dari backend/API (mock/real)
- Refactor handler aksi (edit, delete, dsb) agar sesuai dengan UI baru (misal: pakai modal, toast, dsb)

### C. Integrasi Fitur CRUD & Interaksi

- Integrasikan fitur tambah/edit/hapus modul ke dalam UI baru:
  - Gunakan modal atau drawer untuk form tambah/edit
  - Gunakan toast/alert untuk feedback aksi
  - Pastikan aksi update data otomatis refresh table (optimistic update/react query invalidate)
- Integrasikan filter, search, dan pagination ke UI baru
- Pastikan semua aksi tetap accessible dan responsif

### D. Testing & QA

- Buat/ubah unit test & integration test untuk komponen baru
- Pastikan semua fitur berjalan baik (CRUD, filter, dsb)
- Lakukan review visual dan UX
- Siapkan fallback/error state yang user-friendly

## 3. Estimasi File/Komponen yang Perlu Diubah/Dibuat

- `features/manage-module/componentsNew/ModuleTable.tsx` (logic utama + UI baru)
- `features/manage-module/componentsNew/ModuleFormModal.tsx` (modal tambah/edit)
- `features/manage-module/componentsNew/ModuleActionCell.tsx` (aksi per modul)
- `features/manage-module/services/moduleService.ts` (API service, jika perlu update)
- `features/manage-module/types/index.ts` (update tipe data jika ada perubahan)
- `features/manage-module/hooks/useModuleData.ts` (refactor hooks data, jika perlu)
- `features/manage-module/components/__tests__/ModuleTable.test.tsx` (unit/integration test)

## 4. Catatan & Klarifikasi

- Jika ada fitur baru yang ingin ditambahkan, tambahkan ke planning ini.
- Jika ingin mengubah cara data fetching (misal: pakai SWR, context, dsb), tambahkan di bagian refactor.
- Pastikan dokumentasi dan test selalu diupdate setiap perubahan signifikan.

---

**Silakan review dan tambahkan feedback jika ada kebutuhan khusus atau fitur tambahan yang diinginkan.**
