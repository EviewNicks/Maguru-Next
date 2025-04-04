# Folder `features/dashboard/service`

Berisi fungsi untuk memproses data yang digunakan di dashboard.

## File Utama

### `charts.ts`

- Fungsi `processChartData`:
  - Memproses data pengguna untuk ditampilkan dalam grafik.
  - Mengelompokkan data berdasarkan bulan pembuatan akun.

### `stats.ts`

- Fungsi `fetchStatsData`:
  - Mengambil data statistik dari API.
  - Menghitung total pengguna, pengguna baru dalam 7 hari terakhir, dan admin aktif.

## Catatan

- Fungsi-fungsi ini digunakan di komponen utama seperti `ChartContainer` dan `StatsContainer`.
