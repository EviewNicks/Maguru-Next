# Dashboard Admin

## 1. Deskripsi Modul

Modul Dashboard Admin bertanggung jawab atas pengelolaan pengguna dalam aplikasi Maguru. Admin dapat mengakses dashboard untuk melihat, mengedit, menambah, dan menghapus data pengguna. Modul ini menghubungkan frontend yang dibangun dengan Next.js dan Tailwind CSS ke backend melalui API Routes, dengan autentikasi yang dikelola oleh Clerk dan data yang disimpan menggunakan Prisma sebagai ORM.

## 2. Fitur Utama

### Melihat Daftar Pengguna:

- Admin dapat melihat daftar pengguna dengan informasi lengkap seperti nama, email, role, dan status.
- Data ditampilkan dalam tabel yang mendukung paginasi dan pencarian.

### Menambah Pengguna:

- Admin dapat menambahkan pengguna baru melalui form khusus.
- Data dikirim ke API dan disimpan di database.

### Mengedit Pengguna:

- Admin dapat mengedit informasi pengguna (misalnya role atau status) melalui dialog edit.
- Perubahan dikirim ke API untuk memperbarui data di database.

### Menghapus Pengguna:

- Admin dapat menghapus pengguna melalui dialog konfirmasi.
- API menghapus data pengguna dari database.

## 3. Komponen Utama

- **UserTable**: Menampilkan daftar pengguna dengan opsi tindakan (edit, hapus).
- **EditUserDialog**: Form untuk mengedit informasi pengguna.
- **DeleteUserDialog**: Konfirmasi sebelum menghapus pengguna.

## 4. Alur Data

### Mengambil Data Pengguna:

1. Komponen `UserTable` melakukan request `GET /api/users`.
2. Server mengembalikan daftar pengguna untuk ditampilkan.

### Menambah Pengguna:

1. Admin mengisi form dan mengirim request `POST /api/users`.
2. Server membuat user baru di database.

### Mengedit Pengguna:

1. Admin mengubah data dan mengirim request `PUT /api/users/[id]`.
2. Server memperbarui data pengguna.

### Menghapus Pengguna:

1. Admin mengonfirmasi penghapusan dan mengirim request `DELETE /api/users/[id]`.
2. Server menghapus data pengguna dari database.

## 5. Dependensi

- **Next.js** (Frontend dan Backend API Routes)
- **Clerk** (Autentikasi pengguna)
- **Prisma** (ORM untuk interaksi database)

## 6. Validasi dan Error Handling

- **Validasi Input**: Form validasi untuk memastikan data yang dikirim sesuai format.
- **Error Handling**: Penanganan error pada API response (misalnya validasi gagal atau user tidak ditemukan).

## 7. Keamanan

- **Middleware Autentikasi**: Melindungi API dengan memastikan request hanya bisa dilakukan oleh admin yang terautentikasi.
- **Rate Limiting**: (Opsional) Membatasi jumlah request untuk menghindari abuse.

## 8. Future Improvement

- **Bulk Action**: Mengelola banyak user sekaligus.
- **Export Data**: Mengizinkan admin mengunduh daftar pengguna dalam format CSV/Excel.
