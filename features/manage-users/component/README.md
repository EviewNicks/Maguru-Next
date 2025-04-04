# Folder `features/dashboard/component`

Berisi komponen UI yang digunakan di dashboard.

## Struktur Folder

- `UserTable/`: Komponen child untuk menampilkan tabel data pengguna.
- File utama:
  - `ChartContainer.tsx`: Menampilkan grafik pertumbuhan pengguna bulanan.
  - `StatsCard.tsx`: Komponen untuk menampilkan data statistik dalam format kartu.
  - `StatsContainer.tsx`: Mengatur dan menampilkan kumpulan kartu statistik.
  - `UserTable.tsx`: Komponen untuk menampilkan data pengguna dalam tabel.

## File Utama

### `ChartContainer.tsx`

- Menampilkan grafik menggunakan `BarChart` dari Recharts.
- Mengambil data pengguna melalui API dan memprosesnya dengan fungsi `processChartData`.

### `StatsCard.tsx`

- Komponen untuk menampilkan data statistik seperti total pengguna, pengguna baru, dan admin aktif.
- Mendukung tampilan loading melalui `StatsLoadingCard`.

### `StatsContainer.tsx`

- Mengelola pengambilan data statistik dengan React Query.
- Menampilkan data statistik dalam format grid.

### `UserTable.tsx`

- Mengambil data pengguna dari API menggunakan React Query.
- Menggunakan komponen `DataTable` untuk menampilkan data dalam tabel.
