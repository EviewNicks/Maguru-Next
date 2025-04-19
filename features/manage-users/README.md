# Folder `features/manage-users`

Fitur manage-users menyediakan antarmuka bagi admin untuk mengelola data pengguna, termasuk melihat, mengedit, dan menghapus pengguna.

## Struktur Folder

- `component/`: Berisi komponen UI untuk manajemen pengguna.
- `service/`: Berisi fungsi layanan untuk memproses data pengguna.
- `types/`: Berisi tipe data yang digunakan di fitur manajemen pengguna.

## Webhook Clerk Integration

### Deskripsi

Webhook Clerk digunakan untuk otomatisasi update data user secara real-time di aplikasi. Fitur ini menangani event perubahan data user (email, nama, status) dari Clerk dan memastikan sinkronisasi dengan database via Prisma.

### Setup Webhook di Clerk Dashboard

1. Buka Clerk Dashboard di [dashboard.clerk.com](https://dashboard.clerk.com)
2. Pilih menu **Webhooks** di sidebar
3. Buat webhook baru dengan URL endpoint: `https://[YOUR_DOMAIN]/api/webhooks/clerk`
4. Pilih event yang akan ditangani:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Generate **Webhook Secret** dan simpan ke environment variable `CLERK_WEBHOOK_SECRET`

### Environment Variables

Pastikan environment variables berikut sudah di-set:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
```

### Event yang Ditangani

1. `user.created`: Membuat user baru di database dengan role default 'mahasiswa'
2. `user.updated`: Memperbarui data user yang sudah ada di database
3. `user.deleted`: Menghapus user dari database

### Error Handling

- Semua error dicatat di Sentry dengan tag dan konteks yang sesuai
- Webhook memiliki mekanisme retry otomatis jika terjadi kegagalan
- UI menampilkan pesan fallback jika terjadi masalah sinkronisasi data

### Troubleshooting

- Periksa log Vercel jika webhook tidak berfungsi
- Pastikan signature validation bekerja dengan benar
- Verifikasi bahwa `CLERK_WEBHOOK_SECRET` sudah diatur dengan benar
