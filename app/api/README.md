# Folder `api`

Folder ini menyediakan endpoint API untuk komunikasi server-side. Endpoint saat ini berfokus pada operasi pengguna.

## Struktur Folder

- `users/`: Endpoint API untuk pengelolaan pengguna.
  - `[userId]/`: Subfolder untuk operasi spesifik user berdasarkan ID.
  - `route.ts`: Endpoint untuk operasi global user (GET, POST).

## File Utama

### `users/route.ts`

- **GET**: Mengambil daftar pengguna. Memvalidasi pengguna yang mengakses berdasarkan Clerk authentication.
- **POST**: Menambahkan pengguna baru atau memperbarui data pengguna berdasarkan integrasi dengan Clerk.

### `users/[userId]/route.ts`

- **PATCH**: Memperbarui informasi pengguna tertentu berdasarkan ID.
- **DELETE**: Menghapus pengguna berdasarkan ID.
- Validasi dilakukan menggunakan `auth` dari Clerk dan Prisma sebagai ORM untuk interaksi database.

### Catatan

- File ini memanfaatkan validasi skema dengan library seperti `@zod` (termasuk dalam folder `lib/validations`).
