# Analisis Masalah Tampilan Halaman di SidebarContent

## Ringkasan Masalah

Halaman modul dengan status DRAFT tidak tampil di SidebarContent meskipun data sudah ada di API. Berdasarkan log yang ditampilkan:

```
[useModulePageCRUD] Fetching pages for moduleId: e82e800c-93f5-48ef-b17b-2dfe5624f4fb
[INFO] [DataFlow:SidebarContent] Pages count: 0
[SidebarContent] Data loaded - Pages count: 0
[SidebarContent] Received 0 pages
[ModulePageCRUDContext] Loading pages...
```

Terlihat bahwa meskipun API berhasil mengembalikan data halaman, namun komponen SidebarContent melaporkan bahwa jumlah halaman adalah 0.

## Akar Masalah

Setelah melakukan analisis mendalam, ditemukan beberapa masalah utama:

1. **Masalah Arsitektur Aplikasi**: Aplikasi mencoba mengakses Prisma client di browser, padahal Prisma hanya bisa dijalankan di server. Hal ini menyebabkan error `Cannot read properties of undefined (reading 'findMany')` yang tidak terlihat di UI tetapi mencegah data diambil dengan benar.

2. **Ketidakcocokan Tipe Data**: Tipe `ModulePage` di `modulePageSchema.ts` hanya mendukung status 'DRAFT' dan 'PUBLISHED', sementara API mengembalikan juga status 'ARCHIVED'. Hal ini menyebabkan masalah tipe data yang membuat data tidak bisa diproses dengan benar.

3. **Aliran Data Kompleks**: Data mengalir melalui beberapa lapisan: API → ModulePageCRUD Hook → ModulePageCRUDContext → ModulePageSidebar → SidebarContent. Kompleksitas ini membuat debugging menjadi sulit.

## Solusi yang Diterapkan

1. **Pemisahan Service Client dan Server**:

   - Membuat `modulePageClientService.ts` yang khusus untuk operasi di browser, menggunakan Fetch API untuk berkomunikasi dengan endpoint API.
   - Menghilangkan penggunaan Prisma di browser.

2. **Perbaikan Tipe Data**:

   - Memperbarui tipe `ModulePage` untuk mendukung status 'ARCHIVED'.
   - Menambahkan validasi tipe data di `modulePageSchema.ts`.

3. **Visualisasi Status Halaman**:

   - Membuat komponen `StatusBadge` untuk menampilkan status halaman dengan warna yang sesuai.
   - Menambahkan fitur untuk mengubah status halaman melalui dropdown menu.

4. **Perbaikan Aliran Data**:

   - Menyederhanakan aliran data dengan menghilangkan prop drilling.
   - Menambahkan debugging untuk memantau aliran data.

5. **Endpoint Baru untuk Manajemen Status**:
   - Membuat endpoint `/api/module/[id]/pages/[pageid]/status` untuk mengubah status halaman.

## Perbaikan UI/UX

1. **Indikator Visual Status**:

   - Halaman dengan status 'ARCHIVED' ditampilkan dengan garis coret.
   - Badge warna untuk status: kuning untuk DRAFT, hijau untuk PUBLISHED, abu-abu untuk ARCHIVED.

2. **Aksi Kontekstual**:
   - Menambahkan opsi di dropdown menu sesuai dengan status halaman saat ini.
   - Opsi publikasi hanya tersedia untuk halaman DRAFT.
   - Opsi kembali ke draft hanya tersedia untuk halaman PUBLISHED.
   - Opsi arsip tersedia untuk semua status kecuali ARCHIVED.
   - Opsi pulihkan hanya tersedia untuk halaman ARCHIVED.

## Rekomendasi Untuk Pengembangan Selanjutnya

1. **Pemisahan Lebih Jelas antara Client dan Server**:

   - Gunakan Next.js Server Actions untuk operasi yang memerlukan akses database.
   - Hindari mencoba mengakses Prisma di browser.

2. **Implementasi State Management yang Lebih Baik**:

   - Pertimbangkan menggunakan Zustand atau Redux untuk state management yang lebih terstruktur.
   - Implementasikan pattern yang lebih jelas untuk aliran data.

3. **Optimasi Performa**:

   - Implementasikan pagination untuk daftar halaman yang banyak.
   - Gunakan virtualisasi untuk daftar yang panjang.

4. **Peningkatan Testing**:
   - Tambahkan test untuk memastikan halaman dengan berbagai status ditampilkan dengan benar.
   - Tambahkan test untuk perubahan status halaman.

## Kesimpulan

Masalah tampilan halaman di SidebarContent disebabkan oleh kombinasi masalah arsitektur aplikasi, ketidakcocokan tipe data, dan aliran data yang kompleks. Dengan pemisahan yang jelas antara client dan server, perbaikan tipe data, dan peningkatan UI/UX, halaman modul sekarang dapat ditampilkan dengan benar dan status halaman dapat dikelola dengan lebih baik.
