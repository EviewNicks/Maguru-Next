# Folder `prisma`

Folder ini digunakan untuk mendefinisikan dan mengelola skema database menggunakan Prisma ORM.

## File Utama

### `schema.prisma`

- **Generator**:
  - `client`: Menggunakan provider `prisma-client-js` untuk menghasilkan Prisma Client, yang digunakan untuk berinteraksi dengan database di aplikasi.
- **Datasource**:
  - `db`: Menggunakan provider PostgreSQL.
  - URL koneksi database diambil dari variabel environment (`DATABASE_URL` dan `DIRECT_URL`).

### Model `User`

- Model ini mendefinisikan tabel `users` di database.
- **Fields**:
  - `id`: ID unik pengguna, dihasilkan secara otomatis menggunakan `cuid()`.
  - `clerkUserId`: ID unik pengguna dari integrasi Clerk.
  - `email`: Alamat email pengguna, harus unik.
  - `name`: Nama pengguna, bersifat opsional.
  - `role`: Peran pengguna, defaultnya adalah `mahasiswa`. Bisa digunakan untuk manajemen akses (contoh: `admin`, `dosen`).
  - `status`: Status pengguna, defaultnya `active`. Bisa digunakan untuk mengelola pengguna yang tidak aktif.
  - `createdAt`: Waktu saat data pengguna dibuat, diatur secara otomatis.
  - `updatedAt`: Waktu saat data pengguna diperbarui, diperbarui otomatis setiap ada perubahan.
- **Mapping**:
  - Tabel ini di-mapping sebagai `users` di database.

## Catatan Penting

- **Variabel Environment**:
  - `DATABASE_URL`: URL untuk koneksi ke database utama.
  - `DIRECT_URL`: URL opsional untuk koneksi langsung ke database (misalnya untuk manajemen admin).
- **Migrasi**:
  - Gunakan perintah berikut untuk membuat migrasi:
    ```bash
    npx prisma migrate dev --name <nama_migrasi>
    ```
  - Untuk menghasilkan ulang Prisma Client:
    ```bash
    npx prisma generate
    ```
- **Integrasi**:
  - Prisma Client digunakan di aplikasi untuk berinteraksi dengan database, termasuk CRUD untuk model `User`.

---

## Langkah Selanjutnya

- Pastikan semua variabel environment sudah disiapkan di file `.env`.
- Jika ada model tambahan yang akan ditambahkan ke `schema.prisma`, tambahkan dokumentasinya di sini.
