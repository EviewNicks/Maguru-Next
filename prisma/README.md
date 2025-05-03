# Folder `prisma`

Folder ini digunakan untuk mendefinisikan dan mengelola skema database menggunakan Prisma ORM.

## File Utama

### `schema.prisma`

- **Generator**:
  - `client`: Menggunakan provider `prisma-client-js` untuk menghasilkan Prisma Client, yang digunakan untuk berinteraksi dengan database di aplikasi.
- **Datasource**:
  - `db`: Menggunakan provider PostgreSQL.
  - URL koneksi database diambil dari variabel environment (`DATABASE_URL` dan `DIRECT_URL`).

---

## Struktur Model & Enum

### Enum

- **UserRole**: `mahasiswa`, `admin`  
  Digunakan untuk membedakan peran pengguna dalam sistem.
- **UserStatus**: `active`, `inactive`, `pending`  
  Menandai status akun pengguna.
- **ModuleStatus**: `DRAFT`, `ACTIVE`, `ARCHIVED`  
  Menandai status modul pembelajaran.

### Model

#### 1. `User`

- **Fields**:
  - `id`: ID unik (cuid)
  - `clerkUserId`: ID unik dari Clerk (unik)
  - `email`: Email pengguna (unik)
  - `name`: Nama pengguna (opsional)
  - `role`: Enum `UserRole` (default: mahasiswa)
  - `status`: Enum `UserStatus` (default: active)
  - `createdAt`, `updatedAt`: Timestamp otomatis
- **Index & Mapping**:
  - Indeks komposit pada `[role, status]` untuk query filter cepat
  - Indeks pada `createdAt` untuk sorting/filter
  - Mapping ke tabel `users`

#### 2. `Module`

- **Fields**:
  - `id`: UUID unik
  - `title`: Judul modul
  - `description`: Deskripsi (opsional)
  - `status`: Enum `ModuleStatus` (default: DRAFT)
  - `createdAt`, `updatedAt`: Timestamp otomatis
  - `createdBy`, `updatedBy`: ID user pembuat/pengubah
  - `pages`: Relasi ke `ModulePage`
- **Index & Mapping**:
  - Indeks pada `status` dan `title`
  - Mapping ke tabel `modules`

#### 3. `ModulePage`

- **Fields**:
  - `id`: UUID unik
  - `moduleId`: Foreign key ke `Module`
  - `order`: Urutan halaman dalam modul
  - `type`: Jenis halaman ("teori" atau "kode")
  - `content`: Konten (HTML atau kode)
  - `language`: Bahasa pemrograman (opsional, jika type = "kode")
  - `createdAt`, `updatedAt`: Timestamp otomatis
  - `version`: Untuk optimistic locking
  - `module`: Relasi ke `Module`
- **Index & Mapping**:
  - Unique pada `[moduleId, order]` (satu urutan per modul)
  - Indeks pada `[moduleId, order]`
  - Mapping ke tabel `module_pages`

---

## Best Practice & Catatan Penting

- **Indeks**: Pastikan query yang sering digunakan sudah dioptimalkan dengan indeks (lihat deklarasi @@index di schema.prisma).
- **Relasi**: Gunakan relasi Prisma untuk menjaga integritas data antar tabel (misal: `ModulePage` ke `Module`).
- **Enum**: Gunakan enum untuk field yang memiliki pilihan terbatas agar validasi data lebih kuat.
- **Optimistic Locking**: Field `version` pada `ModulePage` digunakan untuk menghindari konflik update data.

### Variabel Environment

- `DATABASE_URL`: URL koneksi database utama.
- `DIRECT_URL`: URL opsional untuk koneksi langsung (misal: admin).

### Migrasi

- Membuat migrasi baru:
  ```bash
  npx prisma migrate dev --name <nama_migrasi>
  ```
- Generate ulang Prisma Client:
  ```bash
  npx prisma generate
  ```
- Semua migrasi tersimpan di folder `prisma/migrations/`.

### Integrasi

- Prisma Client digunakan di aplikasi untuk operasi CRUD pada semua model di atas.

---

## Langkah Selanjutnya

- Pastikan semua variabel environment sudah disiapkan di file `.env`.
- Jika menambah model/enum/relasi baru di `schema.prisma`, update dokumentasi ini.
- Selalu cek dan optimalkan indeks jika ada query baru yang sering digunakan.
- Dokumentasikan setiap migrasi penting di folder `prisma/migrations/`.

---

[update+2024-06-08]
