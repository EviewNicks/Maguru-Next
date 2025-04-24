# Folder `api`

Folder ini menyediakan endpoint API untuk komunikasi server-side. Endpoint saat ini berfokus pada operasi pengguna.

## Struktur Folder

- `users/`: Endpoint API untuk pengelolaan pengguna.
  - `[userId]/`: Subfolder untuk operasi spesifik user berdasarkan ID.
  - `route.ts`: Endpoint untuk operasi global user (GET, POST).
- `webhooks/`: Endpoint untuk menerima webhook dari layanan eksternal.
  - `clerk/`: Webhook untuk integrasi dengan Clerk Authentication.

## File Utama

### `users/route.ts`

- **GET**: Mengambil daftar pengguna. Memvalidasi pengguna yang mengakses berdasarkan Clerk authentication.
- **POST**: Menambahkan pengguna baru atau memperbarui data pengguna berdasarkan integrasi dengan Clerk.

### `users/[userId]/route.ts`

- **PATCH**: Memperbarui informasi pengguna tertentu berdasarkan ID.
- **DELETE**: Menghapus pengguna berdasarkan ID.
- Validasi dilakukan menggunakan `auth` dari Clerk dan Prisma sebagai ORM untuk interaksi database.

### `webhooks/clerk/route.ts`

- **POST**: Menerima event webhook dari Clerk Authentication.
- Menangani tiga jenis event utama:
  - `user.created`: Mencatat pengguna baru di database.
  - `user.updated`: Memperbarui informasi pengguna yang sudah ada.
  - `user.deleted`: Menghapus pengguna dari database.
- Implementasi verifikasi signature untuk keamanan webhook.
- Integrasi dengan Sentry untuk monitoring error.

### Catatan

- File ini memanfaatkan validasi skema dengan library seperti `@zod` (termasuk dalam folder `lib/validations`).
- Endpoint webhook (`/api/webhooks/clerk`) diatur sebagai rute publik di `middleware.ts` agar dapat diakses oleh Clerk tanpa autentikasi.
