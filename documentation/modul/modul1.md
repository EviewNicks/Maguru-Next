# Deskripsi Modul

Modul ini bertanggung jawab untuk mengelola autentikasi pengguna menggunakan layanan Clerk. Proses autentikasi mencakup login, registrasi, dan pengelolaan sesi. Data user yang telah diverifikasi akan diteruskan ke backend untuk keperluan otorisasi dan sinkronisasi dengan database internal.

## Komponen Utama

### Frontend:
- Halaman Login
- Halaman Registrasi
- Clerk UI Component

### Backend:
- API Route untuk menghandle Webhook dari Clerk
- Middleware untuk validasi token sesi
- Prisma untuk sinkronisasi data user

### Eksternal Service:
- Clerk (sebagai Identity Provider)

## Alur Proses

### Login/Registrasi:
1. Pengguna memasukkan kredensial melalui UI Clerk.
2. Clerk memverifikasi dan mengembalikan token sesi.

### Validasi Token:
1. Token sesi dikirim ke backend melalui middleware.
2. Middleware memvalidasi token untuk mengizinkan akses ke halaman yang dilindungi.

### Sinkronisasi Data User:
1. Clerk mengirimkan data user ke backend melalui webhook.
2. Backend menyimpan atau memperbarui data user di database menggunakan Prisma.

## Dependensi
- Clerk (untuk autentikasi)
- Prisma (untuk ORM dan koneksi database)
- Next.js API Routes (untuk meng-handle request dari Clerk)

## Error Handling
- **Kredensial Salah:** Tampilkan pesan error ke pengguna.
- **Token