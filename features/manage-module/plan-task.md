# Rencana Implementasi untuk OPS-140: Integrasi ModulePageFooterNav dan Perbaikan Layout Admin

## 1. Ringkasan Tujuan

Rencana ini akan menyelesaikan dua tugas dari OPS-140 yang belum dikerjakan:

1. **Implementasi ModulePageFooterNav**: Mengintegrasikan komponen navigasi halaman ke dalam halaman editor modul
2. **Menghilangkan Footer Global pada Halaman Admin**: Memperbaiki struktur layout agar footer tidak muncul pada halaman admin

Implementasi ini akan meningkatkan pengalaman pengguna admin saat mengelola halaman modul dengan:

- Navigasi antar halaman yang lancar
- Layout yang lebih optimal dan bersih

## 2. Analisis Masalah

### 2.1 Masalah ModulePageFooterNav

- Komponen `ModulePageFooterNav.tsx` sudah ada dan berfungsi, tetapi belum diimplementasikan di `page.tsx`
- Dari kode yang ada, `page.tsx` hanya merender `ModulePageEditor` tanpa navigasi footer
- Komponen navigasi membutuhkan data tentang halaman saat ini, total halaman, dan handler navigasi

### 2.2 Masalah Footer Global

- Footer global dirender di `app/layout.tsx` yang mencakup semua halaman, termasuk halaman admin
- Layout admin (`app/(admin)/layout.tsx`) tidak memiliki logika untuk menghilangkan footer
- Footer global mengambil ruang yang seharusnya digunakan untuk editing konten

## 3. Langkah-Langkah Teknis

### 3.1 Implementasi ModulePageFooterNav

1. **Modifikasi Komponen ModulePageEditor**

   - Menambahkan state untuk melacak halaman saat ini dan total halaman
   - Mendefinisikan fungsi navigasi untuk pindah antar halaman
   - Mengirimkan data dan fungsi tersebut ke ModulePageFooterNav

2. **Update Halaman Editor**

   - Mengintegrasikan `ModulePageFooterNav` ke dalam struktur halaman
   - Memastikan styling konsisten dengan layout yang sudah ada
   - Menambahkan loading state saat navigasi

3. **Menerapkan State Management**
   - Menggunakan React Query untuk fetch data halaman
   - Memastikan navigasi mengubah URL dengan parameter pageId
   - Mengimplementasikan efek samping saat halaman berubah

### 3.2 Menghilangkan Footer Global di Halaman Admin

1. **Metode 1: Kondisional di Root Layout**

   - Memodifikasi `app/layout.tsx` untuk memeriksa apakah route saat ini berada di `/admin/`
   - Menampilkan Footer hanya jika bukan halaman admin
   - Menambahkan fungsi utilitas untuk memeriksa route

2. **Metode 2: Layout Nested**

   - Memindahkan Footer dari root layout ke layout khusus non-admin
   - Membuat struktur layout yang lebih jelas untuk admin vs non-admin
   - Memastikan komponen shared tetap dirender di semua halaman

3. **Metode 3: Route Group (Direkomendasikan)**
   - Membuat route group terpisah untuk halaman publik dengan Footer
   - Menggunakan `app/(public)/layout.tsx` yang mencakup Footer
   - Memastikan `app/(admin)/layout.tsx` tidak mewarisi Footer

## 4. File yang Perlu Diubah

### 4.1 ModulePageFooterNav Implementation

- `app/(admin)/manage-module/pages/[moduleId]/page.tsx` - Menambahkan komponen dan logic untuk navigasi halaman
- `features/manage-module/components/ModulePageEditor.tsx` - Kemungkinan update untuk memfasilitasi navigasi

### 4.2 Footer Global Fix

- `app/layout.tsx` - Menghapus atau mengondisikan Footer
- `app/(admin)/layout.tsx` - Memastikan layout admin tidak merender Footer
- Kemungkinan membuat file baru: `app/(public)/layout.tsx` - Untuk layout khusus halaman non-admin

## 5. Pendekatan Implementasi

### 5.1 ModulePageFooterNav

1. **Fase Persiapan**

   - Memeriksa bagaimana `ModulePageEditor` mendapatkan data halaman saat ini
   - Memastikan hooks untuk query halaman sudah berfungsi dengan baik

2. **Fase Implementasi**

   - Mengintegrasikan handler navigasi dengan React Query
   - Menambahkan ModulePageFooterNav ke template

3. **Fase Pengujian**
   - Memastikan navigasi prev/next mengubah halaman dengan benar
   - Memastikan state UI (disabled, current page) selalu akurat

### 5.2 Footer Global Removal

1. **Fase Persiapan**

   - Mengidentifikasi opsi terbaik berdasarkan struktur project
   - Memastikan perubahan tidak akan mempengaruhi halaman non-admin

2. **Fase Implementasi**

   - Mengimplementasikan solusi yang dipilih (konsisten dengan struktur yang ada)
   - Refaktor struktur layout jika diperlukan

3. **Fase Pengujian**
   - Memverifikasi Footer tidak muncul di halaman admin
   - Memastikan Footer tetap muncul di halaman non-admin

## 6. Potensi Risiko dan Mitigasi

- **Risiko**: Perubahan layout global dapat mempengaruhi semua halaman

  - **Mitigasi**: Gunakan pendekatan route group untuk isolasi perubahan

- **Risiko**: Navigasi halaman dengan parameter URL dapat menyebabkan masalah hydration

  - **Mitigasi**: Gunakan pendekatan client-side routing yang benar dengan useRouter/useSearchParams

- **Risiko**: State navigasi ModulePageFooterNav mungkin tidak sinkron dengan state editor
  - **Mitigasi**: Gunakan context atau state yang dikelola dengan baik untuk berbagi data

## 7. Timeline Perkiraan

1. **ModulePageFooterNav Integration**: 2-3 jam

   - Investigasi struktur halaman saat ini: 30 menit
   - Implementasi logic navigasi: 1 jam
   - Styling dan testing: 1-1,5 jam

2. **Footer Global Removal**: 1-2 jam
   - Investigasi struktur layout dan inheritance: 30 menit
   - Implementasi solusi: 30 menit
   - Testing di berbagai halaman: 30 menit - 1 jam

Total estimasi waktu: 3-5 jam
