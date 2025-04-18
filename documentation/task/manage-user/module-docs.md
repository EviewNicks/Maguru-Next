# Modul Manage-User

> Template ini mengikuti praktik terbaik dari IEEE 829, ISO/IEC/IEEE 29148:2018, dan standar dokumentasi perangkat lunak lainnya.

## 1. Informasi Umum

### 1.1 Identifikasi Modul

- **Nama Modul**: Manajemen Pengguna (User Management)
- **Kode Modul**: USERMGMT-001
- **Versi**: 1.3.0
- **Tanggal Terakhir Update**: 15-06-2024
- **Penulis**: Tim Manajemen Pengguna
- **Status**: Implemented

### 1.2 Ringkasan

Modul ini bertanggung jawab untuk mengelola pengguna aplikasi, termasuk menampilkan daftar pengguna, informasi statistik, visualisasi data, serta operasi CRUD (Create, Read, Update, Delete) pengguna. Modul juga menyediakan integrasi dengan layanan autentikasi Clerk untuk sinkronisasi data pengguna.

## 2. Spesifikasi Kebutuhan

### 2.1 Tujuan dan Sasaran

#### Tujuan Utama

- Mengimplementasikan antarmuka manajemen pengguna yang komprehensif untuk administrator.
- Menyediakan statistik dan visualisasi data pengguna yang real-time dan informatif.
- Memastikan sinkronisasi dan konsistensi data antara database internal dan layanan autentikasi Clerk.
- Menerapkan sistem Role-Based Access Control (RBAC) untuk operasi manajemen pengguna.

#### Masalah yang Diselesaikan

- Kesulitan administratif dalam mengelola dan memantau pengguna sistem secara efisien.
- Inkonsistensi data antara layanan autentikasi (Clerk) dan database internal saat mengubah role atau status pengguna.
- Keterbatasan dalam memvisualisasikan tren dan pola pertumbuhan pengguna untuk pengambilan keputusan.
- Risiko keamanan dari akses tidak sah ke fungsi manajemen pengguna.

#### Manfaat yang Diharapkan

- Manfaat Langsung:
  - Untuk Pengguna: Admin dapat dengan mudah mengelola pengguna melalui antarmuka yang intuitif.
  - Untuk Sistem: Pemeliharaan konsistensi data antar layanan dan database.
  - Untuk Bisnis: Pengambilan keputusan berbasis data dari statistik dan visualisasi.
- Manfaat Tidak Langsung:
  - Peningkatan keamanan dengan validasi peran dan pembatasan akses.
  - Audit trail untuk perubahan data pengguna.
  - Pengurangan beban administratif dengan otomatisasi proses.

### 2.2 Ruang Lingkup

#### Yang Termasuk dalam Modul

1. Komponen Inti:

   - Antarmuka tabel pengguna dengan fitur pencarian, filter, dan paginasi.
   - Visualisasi statistik (total pengguna, pengguna baru, pengguna aktif).
   - Grafik pertumbuhan pengguna berdasarkan periode waktu.
   - Operasi CRUD pengguna dengan validasi peran.

2. Fungsionalitas:
   - Menampilkan daftar pengguna dengan informasi lengkap.
   - Menampilkan statistik pengguna dalam format card.
   - Visualisasi data dalam bentuk grafik.
   - Pemfilteran dan pencarian pengguna.
   - Pengelolaan peran dan status pengguna.
   - Sinkronisasi data dengan layanan autentikasi Clerk.

#### Yang Tidak Termasuk dalam Modul

1. Batasan Teknis:

   - Fitur ekspor data pengguna ke format lain (Excel, CSV, dll.).
   - Fungsionalitas pesan atau notifikasi langsung ke pengguna.
   - Pengelolaan metadata pengguna yang kompleks dan terperinci.

2. Batasan Bisnis:
   - Manajemen hirarki peran yang kompleks (hanya mendukung peran dasar).
   - Manajemen hak akses yang sangat terperinci (menggunakan RBAC sederhana).
   - Integrasi dengan sistem SDM atau CRM eksternal.

### 2.3 Kebutuhan Fungsional

1. USERMGMT-F001: Menampilkan Daftar Pengguna

   - **Deskripsi**: Sistem harus menampilkan daftar pengguna dalam bentuk tabel dengan informasi lengkap.
   - **Kriteria Penerimaan**:
     - Tabel menampilkan nama, email, peran, status, dan waktu pembuatan pengguna.
     - Tabel mendukung paginasi dengan 10 pengguna per halaman secara default.
     - Admin dapat mencari pengguna berdasarkan nama atau email.
     - Admin dapat memfilter pengguna berdasarkan peran dan status.
   - **Prioritas**: Critical
   - **Dependensi**: API Users
   - **Estimasi**: 5 Story Points
   - **Status**: Completed

2. USERMGMT-F002: Menampilkan Statistik Pengguna

   - **Deskripsi**: Sistem harus menampilkan statistik ringkasan tentang pengguna dalam format card.
   - **Kriteria Penerimaan**:
     - Menampilkan total pengguna dalam sistem.
     - Menampilkan jumlah pengguna baru dalam 7 hari terakhir.
     - Menampilkan jumlah admin aktif.
     - Statistik diperbarui secara real-time saat data berubah.
   - **Prioritas**: High
   - **Dependensi**: API Users
   - **Estimasi**: 3 Story Points
   - **Status**: Completed

3. USERMGMT-F003: Menampilkan Grafik Pertumbuhan Pengguna

   - **Deskripsi**: Sistem harus menampilkan grafik yang menunjukkan pertumbuhan pengguna berdasarkan bulan.
   - **Kriteria Penerimaan**:
     - Grafik menampilkan jumlah pengguna baru per bulan.
     - Data grafik diperbarui secara real-time.
     - Desain grafik responsif dan mudah dibaca.
   - **Prioritas**: Medium
   - **Dependensi**: API Users
   - **Estimasi**: 3 Story Points
   - **Status**: Completed

4. USERMGMT-F004: Mengelola Peran dan Status Pengguna

   - **Deskripsi**: Admin harus dapat mengubah peran dan status pengguna.
   - **Kriteria Penerimaan**:
     - Admin dapat mengubah peran pengguna (admin, mahasiswa, dosen).
     - Admin dapat mengubah status pengguna (active, inactive, pending).
     - Perubahan peran dan status disinkronkan dengan Clerk.
     - Hanya admin yang dapat melakukan perubahan ini.
   - **Prioritas**: High
   - **Dependensi**: API Users, Clerk API
   - **Estimasi**: 5 Story Points
   - **Status**: Completed

5. USERMGMT-F005: Menghapus Pengguna

   - **Deskripsi**: Admin harus dapat menghapus pengguna dari sistem.
   - **Kriteria Penerimaan**:
     - Admin dapat menghapus pengguna dari database internal.
     - Konfirmasi diperlukan sebelum penghapusan.
     - Pengguna yang dihapus tidak lagi muncul di daftar.
     - Hanya admin yang dapat melakukan penghapusan.
   - **Prioritas**: Medium
   - **Dependensi**: API Users
   - **Estimasi**: 3 Story Points
   - **Status**: Completed

6. USERMGMT-F006: Melacak Riwayat Perubahan Pengguna

   - **Deskripsi**: Sistem harus melacak semua perubahan pada data pengguna untuk audit dan keamanan.
   - **Kriteria Penerimaan**:
     - Setiap perubahan peran, status, atau data penting lainnya dicatat dalam database.
     - Catatan mencakup informasi apa yang berubah, siapa yang mengubah, dan kapan perubahan terjadi.
     - API tersedia untuk mengambil riwayat perubahan untuk pengguna tertentu.
   - **Prioritas**: High
   - **Dependensi**: API Users, UserHistory API
   - **Estimasi**: 8 Story Points
   - **Status**: In Progress

### 2.4 Kebutuhan Non-Fungsional

1. Performa:

   - Waktu muat halaman manajemen pengguna kurang dari 2 detik.
   - Tabel pengguna harus merender dalam waktu kurang dari 1 detik untuk 100 pengguna.
   - Operasi pembaruan status/peran harus selesai dalam waktu kurang dari 500ms.
   - API harus mendukung setidaknya 50 permintaan simultan.

2. Keamanan:

   - Akses ke halaman manajemen pengguna dibatasi hanya untuk peran admin.
   - Semua API manajemen pengguna dilindungi dengan autentikasi dan otorisasi.
   - Riwayat perubahan data pengguna harus direkam untuk audit.
   - Webhook dari Clerk harus diverifikasi dengan tanda tangan.

3. Skalabilitas:
   - Sistem harus mendukung hingga 10.000 pengguna terdaftar.
   - Paginasi dan filter diimplementasikan untuk mengoptimalkan performa dengan dataset besar.
   - Caching diimplementasikan untuk mengurangi beban server.
   - Strategi penanganan error yang tangguh untuk operasi masal.

## 3. Desain dan Implementasi

### 3.1 Arsitektur

#### Diagram Arsitektur

- **High-Level Architecture**
  ```
  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
  │             │       │             │       │             │
  │  Frontend   │◄─────►│  Backend    │◄─────►│  Database   │
  │  Components │       │  API        │       │             │
  │             │       │             │       │             │
  └─────────────┘       └──────┬──────┘       └─────────────┘
                               │                      ▲
                               ▼                      │
                        ┌─────────────┐       ┌─────────────┐
                        │             │       │             │
                        │  Clerk API  │◄─────►│  Webhooks   │
                        │             │       │             │
                        └─────────────┘       └─────────────┘
  ```

#### Komponen Utama

1. **Frontend Components**

   - `features/manage-users/component/UserTable.tsx`: Komponen tabel pengguna
   - `features/manage-users/component/StatsContainer.tsx`: Container untuk statistik
   - `features/manage-users/component/StatsCard.tsx`: Card untuk menampilkan statistik
   - `features/manage-users/component/ChartContainer.tsx`: Container untuk grafik
   - `app/(admin)/manage-users/page.tsx`: Halaman utama manajemen pengguna

2. **Backend Services**
   - `app/api/users/route.ts`: API untuk operasi GET dan POST pengguna
   - `app/api/users/[userId]/route.ts`: API untuk operasi PATCH, DELETE, dan PUT pengguna
   - `features/manage-users/service/stats.ts`: Layanan untuk mengolah statistik
   - `features/manage-users/service/charts.ts`: Layanan untuk mengolah data grafik

### 3.2 Database

#### Skema Database

1. **Entity Relationship Diagram (ERD)**

   - User (id, clerkUserId, email, name, role, status, createdAt, updatedAt)
   - UserHistory (id, userId, field, oldValue, newValue, changedBy, createdAt)

2. **Model Data**

   ```typescript
   // User Model
   interface User {
     id: string
     clerkUserId: string
     email: string
     name: string
     role: 'admin' | 'mahasiswa' | 'dosen'
     status: 'active' | 'inactive' | 'pending'
     createdAt: Date
     updatedAt: Date
   }

   // User History Model
   interface UserHistory {
     id: string
     userId: string
     field: string
     oldValue?: string
     newValue?: string
     changedBy: string
     createdAt: Date
   }

   // Stats Data Model
   interface StatsData {
     title: string
     value: number
   }
   ```

### 3.3 API

#### Endpoint Definitions

1. **REST Endpoints**

   ```typescript
   /**
    * @route GET /api/users
    * @desc Ambil daftar pengguna dengan filter dan paginasi
    * @access Private (Admin)
    */

   /**
    * @route POST /api/users
    * @desc Buat atau perbarui pengguna dari data Clerk
    * @access Private
    */

   /**
    * @route GET /api/users/:userId
    * @desc Ambil detail pengguna tertentu
    * @access Private (Admin)
    */

   /**
    * @route PATCH /api/users/:userId
    * @desc Perbarui peran dan status pengguna
    * @access Private (Admin)
    */

   /**
    * @route DELETE /api/users/:userId
    * @desc Hapus pengguna
    * @access Private (Admin)
    */

   /**
    * @route GET /api/admin/users/:id/history
    * @desc Ambil riwayat perubahan pengguna
    * @access Private (Admin)
    */
   ```

2. **Request/Response Format**

   ```json
   // GET /api/users response
   {
     "users": [
       {
         "id": "uuid",
         "clerkUserId": "clerk_123",
         "email": "user@example.com",
         "name": "John Doe",
         "role": "admin",
         "status": "active",
         "createdAt": "2024-05-01T10:00:00Z",
         "updatedAt": "2024-05-10T15:30:00Z"
       }
     ],
     "metadata": {
       "total": 100,
       "page": 1,
       "limit": 10
     }
   }

   // PATCH /api/users/:userId request
   {
     "role": "admin",
     "status": "active"
   }

   // PATCH /api/users/:userId response
   {
     "id": "uuid",
     "clerkUserId": "clerk_123",
     "email": "user@example.com",
     "name": "John Doe",
     "role": "admin",
     "status": "active",
     "createdAt": "2024-05-01T10:00:00Z",
     "updatedAt": "2024-06-15T08:45:00Z"
   }
   ```

### 3.4 Antarmuka Pengguna

#### Wireframes

1. **Halaman Manajemen Pengguna**

   - Header dengan judul dan navigasi
   - Container statistik dengan 3 card statistik
   - Grafik pertumbuhan pengguna
   - Tabel pengguna dengan kolom: nama, email, peran, status, tanggal dibuat, dan aksi
   - Filter dan pencarian di atas tabel
   - Paginasi di bawah tabel

2. **Modal Konfirmasi**
   - Modal konfirmasi untuk ubah peran/status
   - Modal konfirmasi untuk hapus pengguna
   - Tombol batal dan konfirmasi

## 4. Pengujian

### 4.1 Test Cases

1. **Unit Tests**

   ```typescript
   // features/manage-users/service/stats.test.ts
   describe('fetchStatsData', () => {
     it('should calculate the correct statistics', async () => {
       // Mock data
       const mockUsers = [
         { role: 'admin', status: 'active', createdAt: new Date() },
         // ... more mock users
       ]

       // Test implementation
       const result = await fetchStatsData()

       // Assertions
       expect(result).toHaveLength(3)
       expect(result[0].title).toBe('Total Users')
       expect(result[0].value).toBe(mockUsers.length)
     })
   })
   ```

2. **Integration Tests**

   ```typescript
   // __tests__/integration/users-api.test.ts
   describe('Users API Integration', () => {
     it('should fetch and display users correctly', async () => {
       // Mock API response
       server.use(
         rest.get('/api/users', (req, res, ctx) => {
           return res(
             ctx.json({
               users: [/* mock users */],
               metadata: { total: 10, page: 1, limit: 10 }
             })
           )
         })
       )

       // Render component
       render(<UserTable />)

       // Wait for data to load
       await waitFor(() => {
         expect(screen.getByText('Daftar Pengguna')).toBeInTheDocument()
         expect(screen.getAllByRole('row')).toHaveLength(11) // 10 users + header
       })
     })
   })
   ```

### 4.2 Test Coverage

- Target coverage: 85%
- Critical path testing: CRUD operasi pengguna, tampilan statistik, dan grafik
- Edge cases: Tidak ada pengguna, error API, pengguna tanpa peran
- Error scenarios: Kegagalan API, konflik pembaruan bersamaan

## 5. Deployment

### 5.1 Prasyarat

1. **Dependencies**

   ```json
   {
     "dependencies": {
       "@tanstack/react-query": "^5.0.0",
       "@tanstack/react-table": "^8.10.0",
       "@clerk/nextjs": "^4.29.3",
       "next": "14.0.4",
       "prisma": "^5.8.1",
       "@prisma/client": "^5.8.1",
       "recharts": "^2.8.0",
       "zod": "^3.22.4"
     }
   }
   ```

2. **Environment Variables**
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_****
   CLERK_SECRET_KEY=sk_****
   DATABASE_URL="postgresql://..."
   CLERK_WEBHOOK_SECRET="whsec_****"
   ```

## 6. Pemeliharaan

### 6.1 Monitoring

1. **Metrics**

   - Waktu respons API pengguna
   - Tingkat keberhasilan operasi CRUD
   - Jumlah error sistem
   - Penggunaan resource server

2. **Alert Thresholds**
   ```json
   {
     "api_response_time": "2s",
     "error_rate": "5%",
     "operation_failure_rate": "2%"
   }
   ```

### 6.2 Troubleshooting

1. **Known Issues**

   - Issue: Statistik tidak diperbarui secara real-time
     - Impact: Admin melihat data yang sudah usang
     - Solution: Tambahkan refetch interval pada query atau implementasikan web socket
   - Issue: Perubahan peran tidak selalu tersinkronisasi dengan Clerk
     - Impact: Pengguna mungkin memiliki peran yang berbeda di Clerk dan database lokal
     - Solution: Implementasikan mekanisme retry dan notifikasi untuk sinkronisasi yang gagal

2. **Support Contact**
   - Technical contact: usermgmt-team@example.com
   - Escalation path: Frontend Lead → Backend Lead → CTO

## 7. Referensi

### 7.1 Dokumentasi Teknis

- [Clerk Documentation](https://clerk.com/docs)
- [TanStack Table Documentation](https://tanstack.com/table/latest/docs/guide/introduction)
- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [Prisma Client Documentation](https://www.prisma.io/docs/orm/prisma-client)
- [Recharts Documentation](https://recharts.org/en-US/)

## 8. Riwayat Perubahan

| Tanggal    | Versi | Deskripsi Perubahan                     | Penulis              |
| ---------- | ----- | --------------------------------------- | -------------------- |
| 01-04-2024 | 1.0.0 | Initial implementation                  | User Management Team |
| 15-05-2024 | 1.1.0 | Added statistics and charts             | User Management Team |
| 01-06-2024 | 1.2.0 | Added user history tracking             | User Management Team |
| 15-06-2024 | 1.3.0 | Enhanced RBAC and optimized performance | User Management Team |
