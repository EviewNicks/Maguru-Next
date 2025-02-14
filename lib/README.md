# Folder `lib`

Folder ini berisi fungsi utilitas, konfigurasi, dan helper yang digunakan di seluruh aplikasi untuk mendukung berbagai fitur, termasuk autentikasi, interaksi dengan database, dan validasi.

---

## Struktur Folder dan File

- `auth.ts`: Helper untuk autentikasi dan manajemen pengguna.
- `getQueryClient.ts`: Wrapper untuk mengelola `QueryClient` dari React Query.
- `prisma.ts`: Konfigurasi dan pengelolaan instance Prisma Client.
- `utils.ts`: Fungsi utilitas untuk manipulasi class dan penggabungan gaya (CSS).
- `validation/`: Folder untuk skema validasi menggunakan `zod`.

---

## Penjelasan File

### **`auth.ts`**

Berisi fungsi-fungsi terkait autentikasi pengguna menggunakan Clerk dan Prisma.

- **`getCurrentUser`**:
  - Mendapatkan data pengguna yang sedang login dari Clerk dan mencocokkannya di database.
  - Return: Data pengguna atau `null` jika pengguna tidak ditemukan.
- **`createOrGetUser`**:
  - Mengecek apakah pengguna sudah ada di database. Jika belum, pengguna baru akan dibuat berdasarkan data dari Clerk.
- **`createUserIfNotExists`**:
  - Memastikan pengguna ada di database. Jika tidak, pengguna baru dibuat dengan data dasar seperti `email`, `name`, dan `role`.

---

### `getQueryClient.ts`

- Fungsi untuk membuat instance `QueryClient` menggunakan `react-query`.
- Memanfaatkan caching melalui `react` untuk menghindari pembuatan instance baru yang tidak diperlukan.

### `prisma.ts`

- Konfigurasi singleton untuk Prisma Client.
- Menghindari pembuatan instance baru Prisma di setiap request pada mode development.

### `utils.ts`

- Fungsi utilitas untuk mengelola class CSS dengan lebih mudah.
- Kombinasi clsx dan tailwind-merge untuk menggabungkan class CSS.


