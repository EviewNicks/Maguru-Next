# Template Dokumentasi Modul Autentikasi

> Template ini mengikuti praktik terbaik dari IEEE 829, ISO/IEC/IEEE 29148:2018, dan standar dokumentasi perangkat lunak lainnya.

## 1. Informasi Umum

### 1.1 Identifikasi Modul

- **Nama Modul**: Autentikasi Pengguna (User Authentication)
- **Kode Modul**: AUTH-001
- **Versi**: 1.2.0
- **Tanggal Terakhir Update**: 10-05-2024
- **Penulis**: Tim Autentikasi
- **Status**: Implemented

### 1.2 Ringkasan

Modul ini bertanggung jawab untuk mengelola autentikasi pengguna menggunakan layanan Clerk. Proses autentikasi mencakup login, registrasi, pengelolaan sesi, dan sinkronisasi data pengguna antara Clerk dan database internal.

## 2. Spesifikasi Kebutuhan

### 2.1 Tujuan dan Sasaran

#### Tujuan Utama

- Mengimplementasikan sistem autentikasi terpadu menggunakan Clerk dengan validasi role dan sinkronisasi data ke database internal.
- Memastikan pengguna mendapatkan akses sesuai dengan role mereka (admin atau mahasiswa) secara otomatis.
- Menjaga konsistensi data antara Clerk dan database Prisma dengan sinkronisasi dua arah.

#### Masalah yang Diselesaikan

- Inkonsistensi data antara sistem autentikasi (Clerk) dan database internal ketika role pengguna diubah.
- Ketidakmampuan untuk mengelola role pengguna secara terpusat dan efisien.
- Kebutuhan untuk memvalidasi akses pengguna berdasarkan role di tingkat middleware.

#### Manfaat yang Diharapkan

- Manfaat Langsung:
  - Untuk Pengguna: Login/registrasi yang aman dengan UI yang intuitif dan pengalihan ke halaman yang sesuai berdasarkan role.
  - Untuk Sistem: Pengelolaan autentikasi yang lebih terstruktur dengan validasi role terpadu.
  - Untuk Bisnis: Peningkatan keamanan dan kemudahan pengelolaan pengguna dengan dashboard admin.
- Manfaat Tidak Langsung:
  - Peningkatan keamanan dengan validasi token dan role.
  - Pengurangan risiko akses yang tidak sah ke halaman terproteksi.
  - Efisiensi operasional dalam manajemen pengguna.

### 2.2 Ruang Lingkup

#### Yang Termasuk dalam Modul

1. Komponen Inti:

   - Integrasi Clerk untuk login dan registrasi pengguna.
   - Middleware untuk validasi token dan pengecekan role.
   - Webhook handler untuk sinkronisasi data dengan Clerk.
   - Endpoint API untuk manajemen metadata dan sinkronisasi.

2. Fungsionalitas:
   - Login dan registrasi pengguna menggunakan UI Clerk.
   - Validasi role pengguna di tingkat middleware.
   - Sinkronisasi dua arah antara Clerk dan database.
   - Pengelolaan role dan status pengguna.

#### Yang Tidak Termasuk dalam Modul

1. Batasan Teknis:

   - Implementasi autentikasi multi-faktor (akan dikembangkan di fase berikutnya).
   - Integrasi dengan OAuth provider eksternal lainnya.
   - Reset password flow yang disesuaikan (menggunakan default Clerk).

2. Batasan Bisnis:
   - Pengelolaan akun enterprise dan hirarki organisasi.
   - Sistem izin yang sangat terperinci (hanya mendukung role-based access).

### 2.3 Kebutuhan Fungsional

1. AUTH-F001: Login Pengguna

   - **Deskripsi**: Pengguna harus dapat login menggunakan email dan password melalui UI Clerk.
   - **Kriteria Penerimaan**:
     - Pengguna berhasil login dengan kredensial yang valid.
     - Pengguna mendapatkan pesan error yang jelas untuk kredensial yang tidak valid.
     - Setelah login, pengguna diarahkan ke halaman yang sesuai dengan role-nya.
   - **Prioritas**: Critical
   - **Dependensi**: Clerk Authentication Service
   - **Status**: Completed

2. AUTH-F002: Registrasi Pengguna

   - **Deskripsi**: Pengguna baru dapat mendaftar menggunakan email, password, dan nama.
   - **Kriteria Penerimaan**:
     - Pengguna berhasil mendaftar dengan data yang valid.
     - Data pengguna tersimpan di Clerk dan database internal.
     - Role default "mahasiswa" ditetapkan pada pengguna baru.
   - **Prioritas**: Critical
   - **Dependensi**: Clerk Authentication Service, Database
   - **Status**: Completed

3. AUTH-F003: Validasi Role di Middleware

   - **Deskripsi**: Middleware harus memeriksa role pengguna dan mengizinkan/menolak akses ke halaman terproteksi.
   - **Kriteria Penerimaan**:
     - Admin dapat mengakses halaman admin dan dashboard.
     - Mahasiswa hanya dapat mengakses halaman mahasiswa dan modul.
     - Pengguna tanpa otentikasi diarahkan ke halaman login.
   - **Prioritas**: High
   - **Dependensi**: Clerk Authentication Service, Database
   - **Status**: Completed

4. AUTH-F004: Sinkronisasi Metadata
   - **Deskripsi**: Role dan status pengguna harus tetap sinkron antara Clerk dan database internal.
   - **Kriteria Penerimaan**:
     - Perubahan role di database diperbarui di metadata Clerk.
     - Endpoint API tersedia untuk sinkronisasi manual dan massal.
     - Webhook handler memperbarui database saat terjadi perubahan di Clerk.
   - **Prioritas**: High
   - **Dependensi**: Clerk API, Database
   - **Status**: Completed

### 2.4 Kebutuhan Non-Fungsional

1. Performa:

   - Waktu respons login/registrasi maksimum 2 detik.
   - Validasi token di middleware harus selesai dalam 100ms.
   - Sinkronisasi metadata harus selesai dalam 1 detik per pengguna.

2. Keamanan:

   - Token JWT harus divalidasi pada setiap permintaan.
   - Role harus diperiksa untuk akses ke halaman terproteksi.
   - Webhook dari Clerk harus diverifikasi dengan signature.

3. Skalabilitas:
   - Sistem harus mendukung hingga 10.000 pengguna aktif.
   - Middleware harus efisien untuk menangani banyak permintaan simultan.
   - Strategi caching untuk metadata pengguna untuk mengurangi panggilan API.

## 3. Desain dan Implementasi

### 3.1 Arsitektur

#### Diagram Arsitektur

- **High-Level Architecture**
  ```
  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
  │             │       │             │       │             │
  │  Frontend   │◄─────►│  Middleware │◄─────►│  Clerk API  │
  │             │       │             │       │             │
  └─────────────┘       └──────┬──────┘       └─────────────┘
                               │                      ▲
                               ▼                      │
                        ┌─────────────┐       ┌─────────────┐
                        │             │       │             │
                        │  Database   │◄─────►│  Webhooks   │
                        │             │       │             │
                        └─────────────┘       └─────────────┘
  ```

#### Komponen Utama

1. **Frontend Components**

   - `app/auth/sign-in/page.tsx`: Halaman login menggunakan komponen Clerk
   - `app/auth/sign-up/page.tsx`: Halaman registrasi menggunakan komponen Clerk
   - `config/providers.tsx`: Konfigurasi ClerkProvider dan sinkronisasi pengguna
   - `hooks/useAuth.ts`: Custom hook untuk data pengguna gabungan dari Clerk dan database

2. **Backend Services**
   - `middleware.ts`: Middleware untuk validasi token dan role-based access control
   - `app/api/webhooks/clerk/route.ts`: Handler untuk webhook dari Clerk
   - `app/api/users/sync-metadata/route.ts`: Endpoint untuk sinkronisasi metadata
   - `lib/auth.ts`: Utilitas autentikasi dan pengambilan data pengguna

### 3.2 Database

#### Skema Database

1. **Entity Relationship Diagram (ERD)**

   - User (id, clerkUserId, email, name, role, status, createdAt, updatedAt)

2. **Model Data**
   ```typescript
   interface User {
     id: string
     clerkUserId: string
     email: string
     name: string
     role: 'admin' | 'mahasiswa'
     status: 'active' | 'inactive' | 'pending'
     createdAt: Date
     updatedAt: Date
   }
   ```

### 3.3 API

#### Endpoint Definitions

1. **REST Endpoints**

   ```typescript
   /**
    * @route GET /api/users/sync-metadata
    * @desc Sinkronisasi metadata untuk user saat ini
    * @access Private
    */

   /**
    * @route POST /api/users/sync-metadata
    * @desc Sinkronisasi metadata untuk semua user
    * @access Private (Admin)
    */

   /**
    * @route POST /api/webhooks/clerk
    * @desc Webhook handler untuk events dari Clerk
    * @access Public
    */
   ```

2. **Request/Response Format**
   ```json
   // Response format sinkronisasi metadata
   {
     "status": 200,
     "message": "Metadata synced successfully",
     "role": "admin",
     "detailSukses": [
       { "id": "uuid", "email": "user@example.com", "role": "admin" }
     ],
     "detailGagal": [
       {
         "id": "uuid",
         "email": "user2@example.com",
         "error": "User not found in Clerk"
       }
     ]
   }
   ```

### 3.4 Antarmuka Pengguna

#### Wireframes

1. **Login Page**

   - Form login dengan email/password
   - Tombol "Sign Up" untuk registrasi
   - Link "Forgot Password"

2. **Registration Page**
   - Form registrasi dengan nama, email, dan password
   - Validasi password strength
   - Terms of service checkbox

## 4. Pengujian

### 4.1 Test Cases

1. **Unit Tests**

   ```typescript
   describe('Authentication Middleware', () => {
     it('should redirect unauthenticated users to login page', () => {
       // Test implementation
     })

     it('should allow admin to access admin routes', () => {
       // Test implementation
     })

     it('should prevent mahasiswa from accessing admin routes', () => {
       // Test implementation
     })
   })
   ```

2. **Integration Tests**

   ```typescript
   describe('User Authentication Flow', () => {
     it('should register, login, and sync metadata correctly', () => {
       // Test implementation
     })

     it('should handle webhook events correctly', () => {
       // Test implementation
     })
   })
   ```

### 4.2 Test Coverage

- Target coverage: 80%
- Critical path testing: Login, registrasi, validasi role
- Edge cases: User tidak ditemukan di Clerk, token tidak valid
- Error scenarios: Webhook gagal, sinkronisasi gagal

## 5. Deployment

### 5.1 Prasyarat

1. **Dependencies**

   ```json
   {
     "dependencies": {
       "@clerk/nextjs": "^4.29.3",
       "next": "14.0.4",
       "prisma": "^5.8.1",
       "@prisma/client": "^5.8.1"
     }
   }
   ```

2. **Environment Variables**
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_****
   CLERK_SECRET_KEY=sk_****
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   DATABASE_URL="postgresql://..."
   CLERK_WEBHOOK_SECRET="whsec_****"
   ```

## 6. Pemeliharaan

### 6.1 Monitoring

1. **Metrics**

   - Login success rate
   - Registration success rate
   - Role validation success rate
   - Metadata sync success rate

2. **Alert Thresholds**
   ```json
   {
     "login_failure_rate": "5%",
     "metadata_sync_failure_rate": "2%",
     "webhook_failure_rate": "1%"
   }
   ```

### 6.2 Troubleshooting

1. **Known Issues**

   - Issue: "Not found" error saat sinkronisasi metadata

     - Impact: Pengguna di database tidak dapat disinkronkan dengan Clerk
     - Solution: Verifikasi clerkUserId valid dan pengguna masih ada di Clerk

   - Issue: Role tidak terdeteksi di middleware
     - Impact: Pengguna mendapat akses default (mahasiswa)
     - Solution: Jalankan endpoint sinkronisasi metadata

2. **Support Contact**
   - Technical contact: auth-team@example.com
   - Escalation path: Platform Lead -> CTO

## 7. Referensi

### 7.1 Dokumentasi Teknis

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Prisma Client Documentation](https://www.prisma.io/docs/orm/prisma-client)

## 8. Riwayat Perubahan

| Tanggal    | Versi | Deskripsi Perubahan                | Penulis   |
| ---------- | ----- | ---------------------------------- | --------- |
| 01-03-2024 | 1.0.0 | Initial implementation             | Team Auth |
| 15-04-2024 | 1.1.0 | Added sync-metadata endpoint       | Team Auth |
| 10-05-2024 | 1.2.0 | Improved middleware role detection | Team Auth |
