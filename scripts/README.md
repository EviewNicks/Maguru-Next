# Panduan Mengubah Role User di Maguru

Dokumen ini berisi langkah-langkah untuk mengubah role user dengan aman dan menangani berbagai kasus sinkronisasi.

## 📋 Daftar Isi

1. [Cara Mengubah Role User Menjadi Admin](#1-cara-mengubah-role-user-menjadi-admin)
2. [Menangani Desinkronisasi Role](#2-menangani-desinkronisasi-role)
3. [Memperbaiki Cache Role](#3-memperbaiki-cache-role)
4. [Troubleshooting](#4-troubleshooting)

## 1. Cara Mengubah Role User Menjadi Admin

### A. Menggunakan API

1. **Siapkan environment variable** (jika first-time setup)

   - Tambahkan di file `.env.local`:

   ```
   ADMIN_SETUP_KEY="setrole_secret_key_maguru_2025"
   ```

2. **Metode 1: Gunakan Script Node.js**

   - Jalankan: `node scripts/set-admin-role.js`
   - Script akan otomatis mengubah role user dengan email `eviewnicks@gmail.com` menjadi admin
   - Lihat script untuk detail atau cara mengubah konfigurasi

3. **Metode 2: Gunakan Curl**

   - Lihat file `scripts/set-admin-curl.md` untuk perintah curl lengkap
   - Contoh (PowerShell):

   ```powershell
   $body = @{
     email = "eviewnicks@gmail.com"
     role = "admin"
     setupKey = "setrole_secret_key_maguru_2025"
   } | ConvertTo-Json

   Invoke-RestMethod -Uri "http://localhost:3000/api/admin/set-role" -Method Post -Body $body -ContentType "application/json"
   ```

4. **Setelah Selesai**
   - HAPUS `ADMIN_SETUP_KEY` dari `.env.local` untuk keamanan
   - Mulai gunakan sistem RBAC normal dengan login sebagai admin

### B. Sinkronisasi Role Seluruh User

Jika ada banyak user yang perlu disinkronkan rolenya:

1. Login sebagai admin
2. Akses: `http://localhost:3000/api/admin/sync-roles` dengan metode POST
3. Tunggu hingga proses selesai, semua role akan disinkronkan dari Clerk ke database lokal

## 2. Menangani Desinkronisasi Role

Desinkronisasi role terjadi saat role di Clerk tidak sama dengan role di database lokal.

### A. Deteksi Desinkronisasi

Ciri-ciri desinkronisasi:

- User memiliki akses yang salah (terlalu banyak atau terlalu sedikit)
- Error pada komponen UI yang terkait role
- Pesan error "Invalid role" atau "Role mismatch" di log

### B. Cara Memperbaiki

1. **Perbaiki Role Individual** (untuk 1-2 user)

   ```javascript
   // Panggil API set-role dengan role yang benar
   fetch('/api/admin/set-role', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'user@example.com',
       role: 'admin', // atau 'mahasiswa', 'dosen'
     }),
   })
   ```

2. **Perbaiki Semua Role** (untuk banyak user)
   ```javascript
   // Gunakan endpoint sync-roles
   fetch('/api/admin/sync-roles', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
   })
   ```

## 3. Memperbaiki Cache Role

Jika perubahan role sudah dilakukan tapi masih belum terlihat:

1. **Invalidasi Cache Satu User**

   ```javascript
   fetch('/api/admin/invalidate-cache', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ userId: 'user-id-or-clerk-id' }),
   })
   ```

2. **Invalidasi Semua Cache**

   ```javascript
   fetch('/api/admin/invalidate-cache', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ all: true }),
   })
   ```

3. **Hard Refresh Browser**
   - Lakukan hard refresh dengan `Ctrl+F5` atau `Cmd+Shift+R`
   - Coba logout dan login kembali

## 4. Troubleshooting

### Error "Select.Item must have a value prop"

Masalah ini terjadi karena komponen Select mencoba menggunakan role yang kosong atau tidak valid.

**Solusi**:

1. Pastikan semua user memiliki role yang valid di database
2. Periksa tabel User di database dan pastikan tidak ada nilai NULL atau kosong di kolom role
3. Tambahkan validasi pada komponen UI:
   ```jsx
   <Select.Item value={user.role || 'tidak-ada-role'}>
     {user.role || 'Tidak Ada Role'}
   </Select.Item>
   ```

### Error "Unauthorized" Saat Mengakses API Admin

**Solusi**:

1. Pastikan Anda login sebagai user dengan role admin
2. Periksa bahwa role di Clerk dan di database sama-sama "admin"
3. Periksa role di publicMetadata di Clerk dashboard
4. Gunakan metode setup awal dengan ADMIN_SETUP_KEY jika belum ada admin sama sekali

### Error "Role tidak disinkronkan"

**Solusi**:

1. Gunakan endpoint sync-roles untuk memperbarui semua role dari Clerk ke database
2. Jika masih bermasalah, hubungi tim pengembang untuk bantuan lebih lanjut

## 🔗 Links Penting

- [Dokumentasi RBAC Clerk](https://clerk.com/docs/references/nextjs/basic-rbac)
- [Dokumentasi RBAC Maguru](../docs/auth/rbac.md)
