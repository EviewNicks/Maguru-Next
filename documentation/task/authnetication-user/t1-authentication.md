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
3. Pengguna diarahkan ke halaman yang ditentukan menggunakan `signInFallbackRedirectUrl` atau `signUpFallbackRedirectUrl`.

### Validasi Token:
1. Token sesi dikirim ke backend melalui middleware.
2. Middleware memvalidasi token untuk mengizinkan akses ke halaman yang dilindungi.

### Sinkronisasi Data User:
1. Clerk mengirimkan data user ke backend melalui webhook.
2. Backend menyimpan atau memperbarui data user di database menggunakan Prisma.

## Konfigurasi ClerkProvider

Untuk mengonfigurasi ClerkProvider dengan benar, gunakan properti berikut:

```tsx
<ClerkProvider
  signInUrl="/auth/sign-in"
  signUpUrl="/auth/sign-up"
  signInFallbackRedirectUrl="/dashboard"
  signUpFallbackRedirectUrl="/dashboard"
>
  {/* Konten aplikasi */}
</ClerkProvider>
```

### Properti Penting:
- **signInUrl**: URL halaman login
- **signUpUrl**: URL halaman pendaftaran
- **signInFallbackRedirectUrl**: URL redirect setelah login berhasil
- **signUpFallbackRedirectUrl**: URL redirect setelah pendaftaran berhasil

> **Catatan Penting**: Properti `,` sudah tidak digunakan lagi (deprecated) dan harus diganti dengan `signInFallbackRedirectUrl` atau `forceRedirectUrl`.

## Dependensi
- Clerk (untuk autentikasi)
- Prisma (untuk ORM dan koneksi database)
- Next.js API Routes (untuk meng-handle request dari Clerk)

## Error Handling
- **Kredensial Salah:** Tampilkan pesan error ke pengguna.
- **Token Tidak Valid:** Redirect ke halaman login.
- **Kegagalan Sinkronisasi:** Log error dan tampilkan pesan yang sesuai.

## Praktik Terbaik
1. Selalu gunakan properti terbaru dari Clerk untuk menghindari peringatan deprecated.
2. Pastikan untuk menangani error dengan baik dan memberikan umpan balik yang jelas kepada pengguna.
3. Gunakan webhook untuk menjaga sinkronisasi data antara Clerk dan database internal.
4. Implementasikan middleware untuk melindungi rute yang memerlukan autentikasi.