# Folder `dashboard`

Folder ini berisi layout dan halaman untuk dashboard pengguna. Komponen `Sidebar` digunakan untuk navigasi di dalam dashboard.

## Struktur Folder

- `stats/`: Submodul untuk menampilkan statistik pengguna (belum diimplementasikan sepenuhnya).
- `layout.tsx`: Layout utama dashboard.

## File Utama

### `layout.tsx`

- Membagi dashboard menjadi dua panel:
  - **Sidebar**: Panel kiri untuk navigasi.
  - **Main Content**: Panel kanan untuk konten utama.
- Menggunakan komponen `ResizablePanel` untuk membuat panel yang dapat diubah ukurannya.
- Memiliki desain responsif:
  - **Desktop**: Menampilkan sidebar dan konten utama secara berdampingan.
  - **Mobile**: Sidebar disembunyikan, hanya menampilkan konten utama.

### Catatan

- Menggunakan fungsi `createUserIfNotExists` untuk memastikan pengguna terdaftar di sistem.
