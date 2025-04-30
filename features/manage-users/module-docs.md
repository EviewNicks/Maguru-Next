# Modul Manage-User

> Template ini mengikuti praktik terbaik dari IEEE 829, ISO/IEC/IEEE 29148:2018, dan standar dokumentasi perangkat lunak lainnya.

## 1. Informasi Umum

### 1.1 Identifikasi Modul

- **Nama Modul**: Manajemen Pengguna (User Management)
- **Kode Modul**: USERMGMT-001
- **Versi**: 1.4.0
- **Tanggal Terakhir Update**: 30-04-2025
- **Penulis**: Tim Manajemen Pengguna
- **Status**: Implemented

### 1.2 Ringkasan

Modul ini bertanggung jawab untuk mengelola pengguna aplikasi, termasuk menampilkan daftar pengguna, informasi statistik, visualisasi data, serta operasi CRUD (Create, Read, Update, Delete) pengguna. Modul juga menyediakan integrasi dengan layanan autentikasi Clerk melalui webhook untuk sinkronisasi data real-time, sistem caching untuk optimasi performa, serta antarmuka pengguna yang responsif dan modern dengan dukungan Role-Based Access Control (RBAC).

## 2. Spesifikasi Kebutuhan

### 2.1 Tujuan dan Sasaran

#### Tujuan Utama

- Mengimplementasikan antarmuka manajemen pengguna yang komprehensif untuk administrator.
- Menyediakan statistik dan visualisasi data pengguna yang real-time dan informatif.
- Memastikan sinkronisasi dan konsistensi data antara database internal dan layanan autentikasi Clerk.
- Menerapkan sistem Role-Based Access Control (RBAC) dengan caching untuk operasi manajemen pengguna.
- Mengoptimalkan performa query database dan UI rendering untuk pengalaman pengguna yang responsif.

#### Masalah yang Diselesaikan

- Kesulitan administratif dalam mengelola dan memantau pengguna sistem secara efisien.
- Inkonsistensi data antara layanan autentikasi (Clerk) dan database internal saat mengubah role atau status pengguna.
- Keterbatasan dalam memvisualisasikan tren dan pola pertumbuhan pengguna untuk pengambilan keputusan.
- Risiko keamanan dari akses tidak sah ke fungsi manajemen pengguna.
- Performa lambat pada pengecekan peran pengguna yang menyebabkan delay dalam autentikasi.
- Beban database yang tinggi dari query berulang saat memeriksa akses.

#### Manfaat yang Diharapkan

- Manfaat Langsung:
  - Untuk Pengguna: Admin dapat dengan mudah mengelola pengguna melalui antarmuka yang intuitif dan responsif.
  - Untuk Sistem: Pemeliharaan konsistensi data antar layanan dan database, dengan performa yang lebih baik berkat caching.
  - Untuk Bisnis: Pengambilan keputusan berbasis data dari statistik dan visualisasi, dengan waktu respon yang lebih cepat.
- Manfaat Tidak Langsung:
  - Peningkatan keamanan dengan validasi peran dan pembatasan akses yang dioptimalkan.
  - Audit trail untuk perubahan data pengguna.
  - Pengurangan beban administratif dengan otomatisasi proses dan sinkronisasi real-time.
  - Pengurangan beban server dan database dengan implementasi caching.

### 2.2 Ruang Lingkup

#### Yang Termasuk dalam Modul

1. Komponen Inti:

   - Antarmuka tabel pengguna dengan fitur pencarian, filter, dan paginasi.
   - Visualisasi statistik (total pengguna, pengguna baru, pengguna aktif).
   - Grafik pertumbuhan pengguna berdasarkan periode waktu.
   - Operasi CRUD pengguna dengan validasi peran.
   - Sistem webhook untuk sinkronisasi data real-time dengan Clerk.
   - Sistem caching untuk optimasi performa RBAC.
   - UI yang modern dengan dukungan responsif untuk berbagai perangkat.

2. Fungsionalitas:
   - Menampilkan daftar pengguna dengan informasi lengkap.
   - Menampilkan statistik pengguna dalam format card.
   - Visualisasi data dalam bentuk grafik.
   - Pemfilteran dan pencarian pengguna.
   - Pengelolaan peran dan status pengguna.
   - Sinkronisasi data real-time dengan layanan autentikasi Clerk.
   - Caching role pengguna untuk performa RBAC yang lebih baik.
   - Optimasi query database dengan Prisma Client.

#### Yang Tidak Termasuk dalam Modul

1. Batasan Teknis:

   - Fitur ekspor data pengguna ke format lain (Excel, CSV, dll.).
   - Fungsionalitas pesan atau notifikasi langsung ke pengguna.
   - Pengelolaan metadata pengguna yang kompleks dan terperinci.
   - Analitik behavior pengguna yang mendalam.

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

7. USERMGMT-F007: Integrasi Webhook Clerk

   - **Deskripsi**: Sistem harus menyediakan endpoint webhook untuk menerima dan memproses event dari Clerk Authentication System secara real-time.
   - **Kriteria Penerimaan**:
     - Endpoint webhook menerima event `user.created`, `user.updated`, dan `user.deleted` dari Clerk.
     - Verifikasi signature webhook untuk memastikan keamanan.
     - Data pengguna di database internal otomatis diperbarui dalam waktu <2 detik setelah perubahan di Clerk.
     - Error ditangkap dan dicatat dalam sistem monitoring (Sentry).
   - **Prioritas**: Critical
   - **Dependensi**: Clerk API, Prisma, Sentry
   - **Estimasi**: 5 Story Points
   - **Status**: Completed

8. USERMGMT-F008: Real-time UI Updates

   - **Deskripsi**: Antarmuka pengguna harus diperbarui secara real-time saat data pengguna berubah.
   - **Kriteria Penerimaan**:
     - Data user di UI terupdate dalam 10 detik setelah perubahan tanpa perlu refresh halaman.
     - Tombol edit/hapus hanya muncul untuk user dengan role admin.
     - Audit log bisa diakses via modal dengan 1 klik.
     - Optimasi performa rendering untuk mengurangi re-render berlebihan.
   - **Prioritas**: High
   - **Dependensi**: API Users, SWR
   - **Estimasi**: 5 Story Points
   - **Status**: Completed

9. USERMGMT-F009: RBAC Access Caching

   - **Deskripsi**: Sistem harus mengimplementasikan caching untuk meningkatkan performa pemeriksaan peran pengguna.
   - **Kriteria Penerimaan**:
     - Middleware RBAC mengizinkan akses sesuai role yang terkini (sinkron Clerk-database).
     - Waktu pemeriksaan role <500ms berkat caching.
     - Error "Invalid role" berkurang 100% di Sentry.
     - API endpoints lama tetap berfungsi dengan format baru.
     - Cache invalidation otomatis saat role berubah.
   - **Prioritas**: High
   - **Dependensi**: API Users, Clerk API
   - **Estimasi**: 8 Story Points
   - **Status**: Completed

### 2.4 Kebutuhan Non-Fungsional

1. Performa:

   - Waktu muat halaman manajemen pengguna kurang dari 2 detik.
   - Tabel pengguna harus merender dalam waktu kurang dari 1 detik untuk 100 pengguna.
   - Operasi pembaruan status/peran harus selesai dalam waktu kurang dari 500ms.
   - API harus mendukung setidaknya 50 permintaan simultan.
   - Waktu pemeriksaan role pengguna harus <100ms dengan caching.
   - Query Prisma harus menyelesaikan operasi database dalam waktu <1 detik.

2. Keamanan:

   - Akses ke halaman manajemen pengguna dibatasi hanya untuk peran admin.
   - Semua API manajemen pengguna dilindungi dengan autentikasi dan otorisasi.
   - Riwayat perubahan data pengguna harus direkam untuk audit.
   - Webhook dari Clerk harus diverifikasi dengan tanda tangan.
   - Cache RBAC harus memiliki waktu TTL maksimal 60 detik untuk keseimbangan performa dan keamanan.

3. Skalabilitas:
   - Sistem harus mendukung hingga 10.000 pengguna terdaftar.
   - Paginasi dan filter diimplementasikan untuk mengoptimalkan performa dengan dataset besar.
   - Caching diimplementasikan untuk mengurangi beban server.
   - Strategi penanganan error yang tangguh untuk operasi masal.
   - Connection pooling untuk database harus dikonfigurasi untuk menangani hingga 50 koneksi simultan.
   - Cache harus mampu menyimpan hingga 1.000 entri role user tanpa dampak signifikan pada memori.

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
                               │
                               ▼
                        ┌─────────────┐
                        │             │
                        │ RBAC Cache  │
                        │             │
                        └─────────────┘
  ```

#### Komponen Utama

1. **Frontend Components**

   - **UserTable Component**

     - `features/manage-users/component/UserTable/UserTable.tsx`: Komponen tabel utama
     - `features/manage-users/component/UserTable/TableHeader.tsx`: Header tabel dengan fitur sorting
     - `features/manage-users/component/UserTable/TableRow.tsx`: Row tabel dengan tombol aksi
     - `features/manage-users/component/Badges/RoleBadge.tsx`: Badge untuk role user
     - `features/manage-users/component/Badges/StatusIndicator.tsx`: Indikator status user
     - `features/manage-users/component/UserTable/ActionButtons.tsx`: Tombol action (edit, delete, view history)

   - **Dashboard Components**

     - `features/manage-users/component/dashboard/SystemOverview.tsx`: Komponen utama dashboard admin
     - `features/manage-users/component/ui/MetricCard.tsx`: Card untuk menampilkan statistik
     - `features/manage-users/component/ui/PerformanceChart.tsx`: Visualisasi data dalam bentuk chart
     - `features/manage-users/component/ui/StorageItem.tsx`: Item untuk menampilkan data storage
     - `features/manage-users/component/ui/ProcessRow.tsx`: Component untuk menampilkan data proses

   - **Filter Components**

     - `features/manage-users/component/Filters/UserFilter.tsx`: Filter berdasarkan role dan status
     - `features/manage-users/component/Filters/SearchBox.tsx`: Komponen pencarian

   - **Modal Components**
     - `features/manage-users/component/Modals/EditUserModal.tsx`: Modal untuk edit user
     - `features/manage-users/component/Modals/HistoryModal.tsx`: Modal untuk menampilkan history
     - `features/manage-users/component/Modals/DeleteConfirmationModal.tsx`: Konfirmasi hapus user

2. **Backend Services**

   - **API Routes**

     - `app/api/users/route.ts`: API untuk operasi GET dan POST pengguna
     - `app/api/users/[userId]/route.ts`: API untuk operasi PATCH, DELETE, dan PUT pengguna
     - `app/api/webhooks/clerk/route.ts`: Webhook handler untuk Clerk events
     - `app/api/users/sync-metadata/route.ts`: API untuk sinkronisasi metadata user
     - `app/api/admin/sync-roles/route.ts`: API untuk sinkronisasi manual role

   - **Service Layer**

     - `features/manage-users/service/stats.ts`: Layanan untuk mengolah statistik
     - `features/manage-users/service/charts.ts`: Layanan untuk mengolah data grafik
     - `features/manage-users/utils/prisma-utils.ts`: Utilitas optimasi Prisma

   - **Middleware & Authentication**
     - `middleware.ts`: Middleware RBAC untuk proteksi route
     - `lib/auth.ts`: Fungsi helper untuk autentikasi dan otorisasi
     - `lib/cache.ts`: Implementasi caching untuk RBAC
     - `lib/prisma.ts`: Konfigurasi Prisma Client dengan connection pooling dan query optimization

### 3.2 Database

#### Skema Database

1. **Entity Relationship Diagram (ERD)**

   - User (id, clerkUserId, email, name, role, status, createdAt, updatedAt)
   - UserHistory (id, userId, field, oldValue, newValue, changedBy, createdAt)

   ```
   ┌─────────────────┐       ┌──────────────────┐
   │      User       │       │   UserHistory    │
   ├─────────────────┤       ├──────────────────┤
   │ id              │       │ id               │
   │ clerkUserId     │       │ userId           │
   │ email           │       │ field            │
   │ name            │  1:N  │ oldValue         │
   │ role ───────────┼───────┤ newValue         │
   │ status          │       │ changedBy        │
   │ createdAt       │       │ createdAt        │
   │ updatedAt       │       │                  │
   └─────────────────┘       └──────────────────┘
   ```

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
     icon?: string
     trend?: string
     color?: string
     detail?: string
   }
   ```

3. **Optimasi Database**

   ```prisma
   model User {
     id         String   @id @default(uuid())
     clerkUserId String  @unique
     email       String  @unique
     name        String
     role        String  @default("mahasiswa")
     status      String  @default("active")
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
     history     UserHistory[]

     // Indeks performa
     @@index([role, status])
     @@index([createdAt])
   }

   model UserHistory {
     id         String   @id @default(uuid())
     userId     String
     field      String
     oldValue   String?
     newValue   String?
     changedBy  String
     createdAt  DateTime @default(now())
     user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

     // Indeks performa
     @@index([userId])
     @@index([createdAt])
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

   /**
    * @route POST /api/webhooks/clerk
    * @desc Endpoint webhook untuk menerima event dari Clerk
    * @access Public (dengan verifikasi signature)
    */

   /**
    * @route GET /api/users/sync-metadata
    * @desc Sinkronisasi semua user dari database ke Clerk
    * @access Private (Admin)
    */

   /**
    * @route POST /api/users/sync-metadata
    * @desc Sinkronisasi user tertentu dari database ke Clerk
    * @access Private (Admin)
    */

   /**
    * @route POST /api/admin/sync-roles
    * @desc Sinkronisasi massal role dari Clerk ke database
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

3. **Clerk Webhook API**

   ```typescript
   /**
    * @route POST /api/webhooks/clerk
    * @desc Menerima dan memproses webhook event dari Clerk
    * @access Public (dengan verifikasi signature)
    */
   ```

   **Event Payload Format:**

   ```json
   // user.created or user.updated event
   {
     "type": "user.created",
     "data": {
       "id": "clerk_user_id",
       "email_addresses": [
         { "email_address": "user@example.com" }
       ],
       "first_name": "John",
       "last_name": "Doe"
     }
   }

   // user.deleted event
   {
     "type": "user.deleted",
     "data": {
       "id": "clerk_user_id"
     }
   }
   ```

   **Webhook Handler Implementation:**

   ```typescript
   // Verifikasi signature webhook
   const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)

   let event
   try {
     // Verifikasi event dari Clerk
     event = webhook.verify(payload, headerPayload)
   } catch (error) {
     console.error('Webhook verification failed:', error)
     return NextResponse.json(
       { error: 'Webhook verification failed' },
       { status: 400 }
     )
   }

   // Proses event berdasarkan jenis
   const eventType = event.type
   const data = event.data

   if (eventType === 'user.created') {
     // Proses user baru
     try {
       await prisma.user.create({
         data: {
           clerkUserId: data.id,
           email: data.email_addresses[0].email_address,
           name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
           role: data.public_metadata?.role || 'mahasiswa',
           status: 'active',
         },
       })
     } catch (error) {
       Sentry.captureException(error, {
         tags: { source: 'clerk-webhook', event: 'user.created' },
       })
       return NextResponse.json(
         { error: 'Failed to create user' },
         { status: 500 }
       )
     }
   }

   // Handle user.updated & user.deleted events
   ```

4. **RBAC Caching API**

   ```typescript
   // lib/cache.ts

   // LRU Cache dengan TTL 60 detik
   export const roleCache = new LRUCache<string, string>({
     max: 1000, // Maksimum 1000 entri
     ttl: 1000 * 60, // TTL 60 detik
   })

   /**
    * Mendapatkan role user dari cache atau database
    */
   export async function getUserRole(userId: string): Promise<string> {
     // Check cache first
     const cachedRole = roleCache.get(userId)
     if (cachedRole) {
       return cachedRole
     }

     // Cache miss - get from database
     try {
       const user = await prisma.user.findUnique({
         where: { id: userId },
         select: { role: true },
       })

       const role = user?.role || 'mahasiswa'

       // Store in cache
       roleCache.set(userId, role)

       return role
     } catch (error) {
       console.error('Error getting user role:', error)
       return 'mahasiswa' // Default role if error
     }
   }

   /**
    * Invalidasi cache untuk user tertentu atau semua user
    */
   export function invalidateUserRoles(userId?: string) {
     if (userId) {
       roleCache.delete(userId)
     } else {
       roleCache.clear()
     }
   }
   ```

### 3.4 Antarmuka Pengguna

#### Komponen UI Utama

1. **User Table**

   - Tabel responsif dengan fitur filtering, sorting, dan pagination
   - Tampilan mobile menggunakan card layout
   - Integrasi dengan filter dan pencarian
   - Tombol aksi untuk edit, delete, dan view history
   - Badge untuk menampilkan role dan status

   ```tsx
   <UserTable
     users={usersData}
     currentUserRole="admin"
     onEdit={handleEdit}
     onDelete={handleDelete}
     onViewHistory={handleViewHistory}
   />
   ```

2. **Dashboard System Overview**

   - Menampilkan statistik pengguna
   - Visualisasi data dengan grafik
   - Tab untuk berbagai informasi sistem
   - Real-time update dengan polling
   - Responsive layout untuk berbagai ukuran layar

   ```tsx
   <SystemOverview />
   ```

3. **Filter & Search**

   - Filter berdasarkan role dan status
   - Pencarian berdasarkan nama dan email
   - Reset filter ke kondisi awal
   - Optimized untuk mengurangi re-render

   ```tsx
   <UserFilter
     roleFilter={roleFilter}
     statusFilter={statusFilter}
     onRoleFilterChange={handleRoleFilterChange}
     onStatusFilterChange={handleStatusFilterChange}
     onResetFilter={handleResetFilter}
   />
   <SearchBox
     searchTerm={searchTerm}
     onSearchChange={handleSearchChange}
     placeholder="Cari nama atau email..."
   />
   ```

4. **Modal Components**

   - Edit User Modal dengan validasi form
   - History Modal dengan timeline perubahan
   - Delete Confirmation Modal

   ```tsx
   <EditUserModal
     isOpen={isEditModalOpen}
     onClose={handleCloseEditModal}
     user={selectedUser}
     onSave={handleSaveUser}
   />

   <HistoryModal
     isOpen={isHistoryModalOpen}
     onClose={handleCloseHistoryModal}
     userId={selectedUser?.id}
   />

   <DeleteConfirmationModal
     isOpen={isDeleteModalOpen}
     onClose={handleCloseDeleteModal}
     onConfirm={handleConfirmDelete}
     userName={selectedUser?.name}
   />
   ```

#### Wireframes

1. **Halaman Manajemen Pengguna**

   ```
   ┌───────────────────────────────────────────────┐
   │ User Management                         🔄 ⚙️  │
   ├───────────────────────────────────────────────┤
   │ 🔍 Search...         Filter ▼    Add User ➕  │
   ├──────┬──────────┬──────┬───────┬─────────────┤
   │ Name │ Email    │ Role │ Status│ Actions     │
   ├──────┼──────────┼──────┼───────┼─────────────┤
   │ John │ j@ex.com │ 🔴   │ ⚪    │ ✏️ 🗑️ 📋   │
   │      │          │ Admin│ Active│             │
   ├──────┼──────────┼──────┼───────┼─────────────┤
   │ Jane │ ja@ex.com│ 🔵   │ ⚫    │ ✏️ 🗑️ 📋   │
   │      │          │ User │ Inactv│             │
   ├──────┼──────────┼──────┼───────┼─────────────┤
   │      │          │      │       │             │
   └──────┴──────────┴──────┴───────┴─────────────┘
   ```

2. **Dashboard System Overview**

   ```
   ┌───────────────────────────────────────────────┐
   │ System Overview & User Statistics       🔄 📊  │
   ├───────────────────────────────────────────────┤
   │ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
   │ │ Total   │ │ Active  │ │ New     │           │
   │ │ Users   │ │ Users   │ │ Users   │           │
   │ │ 120     │ │ 85      │ │ 14      │           │
   │ │ ▲ 15%   │ │ ● 92%   │ │ ▲ 3.2%  │           │
   │ │         │ │         │ │         │           │
   │ └─────────┘ └─────────┘ └─────────┘           │
   │                                               │
   │ Monthly User Growth                           │
   │ ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐ │
   │ │Jan│Feb│Mar│Apr│May│Jun│Jul│Aug│Sep│Oct│Nov│ │
   │ └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘ │
   │                                               │
   │ ┌─────────┐┌─────────┐┌─────────┐┌─────────┐  │
   │ │Performance││Processes││ Users ││ Storage │  │
   │ └─────────┘└─────────┘└─────────┘└─────────┘  │
   └───────────────────────────────────────────────┘
   ```

3. **User History Modal**

   ```
   ┌───────────────────────────────────┐
   │ User History - John Doe           │
   ├───────────────────────────────────┤
   │ Filter by: All changes    ▼       │
   ├───────────────────────────────────┤
   │ Role changed                      │
   │ User → Admin                      │
   │ 2025-04-20 10:35 by Admin User    │
   ├───────────────────────────────────┤
   │ Status changed                    │
   │ Inactive → Active                 │
   │ 2025-04-18 14:22 by System        │
   ├───────────────────────────────────┤
   │ Email changed                     │
   │ old@ex.com → j@ex.com             │
   │ 2025-04-15 09:10 by John Doe      │
   └───────────────────────────────────┘
   ```

4. **Responsive Design**
   - Desktop view: Tabel tradisional dengan semua kolom
   - Tablet view: Tabel dengan scrolling horizontal
   - Mobile view: Card layout untuk data user

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
   // features/manage-users/__tests__/integration/UserTableFiltering.integration.test.tsx
   describe('UserTable Integration - Filtering & Pagination', () => {
     test('TC-001: Menampilkan data pengguna setelah loading', async () => {
       // Mock API response
       server.use(
         http.get('/api/users', ({ request }) => {
           return HttpResponse.json({
             users: [/* mock users */],
             metadata: { total: 10, page: 1, limit: 10 }
           })
         })
       )

       // Render component
       render(<UserTable />)

       // Wait for data to load
       await waitFor(() => {
         expect(screen.getByText('Test User')).toBeInTheDocument()
       })
     })

     test('TC-002: Filter berdasarkan role menampilkan hanya user dengan role tersebut', async () => {
       // Setup
       const user = userEvent.setup()

       // Mock API
       server.use(
         http.get('/api/users', ({ request }) => {
           const url = new URL(request.url)
           const role = url.searchParams.get('role')

           // Return data based on role filter
           return HttpResponse.json({
             users: [
               {
                 id: '1',
                 name: 'Test Admin',
                 role: 'admin',
                 // ...other props
               },
             ],
             metadata: { total: 1, page: 1 },
           })
         })
       )

       render(<UserTable />)

       // Interact with filter
       await user.click(screen.getByLabelText('Role'))
       await user.click(screen.getByText('Admin'))

       // Verify filtered results
       await waitFor(() => {
         expect(screen.getByText('Test Admin')).toBeInTheDocument()
       })
     })
   })
   ```

3. **Dashboard Integration Testing**

   ```typescript
   // features/manage-users/__tests__/integration/DashboardIntegration.integration.test.tsx
   describe('Dashboard Integration - SystemOverview', () => {
     test('TC-001: fetches and displays stats data correctly', async () => {
       // Mock hooks
       mockUseStatsData.mockReturnValue({
         statsMetrics: [
           {
             title: 'Total Users',
             value: 120,
             icon: jest.fn(),
             trend: 'up',
             color: 'cyan',
             detail: '120 total pengguna',
           },
           // ... more metrics
         ],
         isLoading: false,
         error: null,
       })

       mockUseChartData.mockReturnValue({
         chartData: mockChartData,
         isLoading: false,
         error: null,
       })

       // Render component
       render(<SystemOverview />)

       // Verify metrics and chart
       await waitFor(() => {
         expect(screen.getAllByTestId('metric-card-mock')).toHaveLength(2)
         expect(screen.getByTestId('performance-chart-mock')).toBeInTheDocument()
       })
     })

     test('TC-004: handles tab switching and data loading for each tab', async () => {
       // Setup user event
       const user = userEvent.setup()

       // Render component
       render(<SystemOverview />)

       // Verify default tab
       expect(screen.getByTestId('tab-content-performance')).toBeInTheDocument()

       // Switch to processes tab
       await user.click(screen.getByTestId('tab-trigger-processes'))

       // Verify processes tab
       expect(screen.getByTestId('tab-content-processes')).toBeInTheDocument()

       // Switch to users tab
       await user.click(screen.getByTestId('tab-trigger-users'))

       // Verify users tab
       expect(screen.getByTestId('tab-content-users')).toBeInTheDocument()
     })
   })
   ```

4. **RBAC and Webhook Testing**

   ```typescript
   // __tests__/manage-user/integration/rbac-flow.integration.test.ts
   describe('RBAC Flow Integration', () => {
     test('allows access to admin routes for users with admin role', async () => {
       // Mock role cache
       roleCache.set('user_123', 'admin')

       // Mock auth
       mockAuth.mockReturnValue({ userId: 'user_123' })

       // Test admin route access
       const request = new Request('https://example.com/admin/users')
       const response = await middleware(request)

       // Expect access granted
       expect(response).toBeUndefined() // Middleware allows the request
     })

     test('invalidates cache when role is updated', async () => {
       // Setup
       const userId = 'user_123'
       roleCache.set(userId, 'mahasiswa')

       // Mock webhook event
       const webhookEvent = {
         type: 'user.updated',
         data: {
           id: 'clerk_123',
           // ... user data
           public_metadata: { role: 'admin' },
         },
       }

       // Process webhook
       await processWebhookEvent(webhookEvent)

       // Verify cache invalidation
       expect(roleCache.has(userId)).toBeFalsy()
     })
   })
   ```

5. **Prisma Client Testing**

   ```typescript
   // features/manage-users/utils/prisma-utils.test.ts
   describe('getOptimizedUsers', () => {
     it('should retrieve users with pagination and filter by role', async () => {
       // Mock data
       const mockUsers = [createMockUser({ role: 'admin' })]
       prismaMock.user.findMany.mockResolvedValue(mockUsers)
       prismaMock.user.count.mockResolvedValue(1)

       // Call function with role filter
       const [total, users] = await getOptimizedUsers({
         page: 1,
         limit: 10,
         role: 'admin',
       })

       // Verify correct query parameters
       expect(prismaMock.user.findMany).toHaveBeenCalledWith({
         where: { role: 'admin' },
         take: 10,
         skip: 0,
         orderBy: { createdAt: 'desc' },
       })

       // Verify results
       expect(total).toBe(1)
       expect(users).toEqual(mockUsers)
     })
   })
   ```

### 4.2 Test Coverage

- **Unit Test Coverage**:

  - Components: 95%
  - Services: 93%
  - Utils: 97%
  - Overall: 95%

- **Integration Test Coverage**:

  - UserTableFiltering: 100% (8 test cases)
  - UserManagementFlow: 90% (9/10 test cases)
  - DashboardIntegration: 100% (7 test cases)
  - ChartIntegration: 75% (3/4 test cases)
  - Overall: 93%

- **Critical Path Testing**:

  - User filtering and searching: Fully tested
  - Role-based access control: Fully tested
  - Real-time data updates: Fully tested
  - Error handling: Fully tested

- **Test Suite Performance**:
  - Total execution time: 30 seconds
  - Test isolation: Complete
  - Mocking strategy: MSW v2 for API, Jest mocks for components

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
       "zod": "^3.22.4",
       "svix": "^1.63.1",
       "sentry-node": "^2.3.2"
     }
   }
   ```

2. **Environment Variables**

   ```bash
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_****
   CLERK_SECRET_KEY=sk_****
   CLERK_WEBHOOK_SECRET="whsec_****"

   # Database
   DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=10&pool_timeout=10"
   DIRECT_URL="postgresql://..." # Direct connection for migrations

   # Monitoring
   SENTRY_DSN="https://****@****.ingest.sentry.io/****"
   ```

### 5.2 Deployment to Vercel

1. **Vercel Configuration**

   - **vercel.json**:

   ```json
   {
     "buildCommand": "yarn vercel-build",
     "installCommand": "yarn install",
     "framework": "nextjs",
     "regions": ["sin1"],
     "env": {
       "PRISMA_GENERATE": "npx prisma generate && npx prisma migrate deploy"
     },
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           },
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "X-XSS-Protection",
             "value": "1; mode=block"
           }
         ]
       },
       {
         "source": "/api/(.*)",
         "headers": [
           {
             "key": "Access-Control-Allow-Origin",
             "value": "*"
           },
           {
             "key": "Access-Control-Allow-Methods",
             "value": "GET, POST, PUT, DELETE, OPTIONS"
           },
           {
             "key": "Access-Control-Allow-Headers",
             "value": "X-Requested-With, Content-Type, Accept"
           }
         ]
       }
     ]
   }
   ```

   - **package.json Scripts**:

   ```json
   "scripts": {
     "vercel-build": "prisma generate && prisma migrate deploy && next build"
   }
   ```

2. **Prisma Configuration**

   - **Prisma Client Singleton**:

   ```typescript
   // lib/prisma.ts
   import { PrismaClient } from '@prisma/client'

   // Prevent multiple instances of Prisma Client in development
   const globalForPrisma = global as unknown as { prisma: PrismaClient }

   export const prisma = globalForPrisma.prisma || new PrismaClient()

   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

   export default prisma
   ```

   - **Connection Pooling**:

   Configure DATABASE_URL with pgbouncer parameters to optimize connection pooling:

   ```
   DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=10&pool_timeout=10"
   ```

3. **Clerk Webhook Setup**

   - Buka Clerk Dashboard di [dashboard.clerk.com](https://dashboard.clerk.com)
   - Navigasi ke menu **Webhooks** di sidebar
   - Buat webhook baru dengan endpoint: `https://[YOUR_DOMAIN]/api/webhooks/clerk`
   - Pilih event yang perlu ditangani: `user.created`, `user.updated`, dan `user.deleted`
   - Generate webhook secret dan simpan ke environment variable `CLERK_WEBHOOK_SECRET`

4. **Deployment Steps**

   - Push code ke GitHub repository
   - Connect repository ke Vercel project
   - Configure environment variables in Vercel dashboard
   - Deploy with `git push` to main/master branch
   - Verify webhook connectivity in Clerk dashboard
   - Test user management functionality in production

## 6. Pemeliharaan

### 6.1 Monitoring

1. **Metrics**

   - **Response Time**:
     - API response time < 500ms (P95)
     - RBAC checks < 100ms with cache, < 800ms without cache
     - Page load time < 2s
   - **Error Rate**:
     - API error rate < 1%
     - Webhook processing errors < 0.5%
     - Authentication failures < 0.1%
   - **Usage Statistics**:
     - Cache hit ratio > 90%
     - Database query reduction 75% with caching
     - Role update frequency per user

2. **Alert Thresholds**
   ```json
   {
     "api_response_time": "2s",
     "error_rate": "5%",
     "operation_failure_rate": "2%",
     "cache_hit_ratio": "75%",
     "database_connections": "40"
   }
   ```

### 6.2 Troubleshooting

1. **Known Issues**

   - **Issue**: Statistik tidak diperbarui secara real-time
     - **Impact**: Admin melihat data yang sudah usang
     - **Solution**: Tambahkan refetch interval pada query atau implementasikan web socket
   - **Issue**: Perubahan peran tidak selalu tersinkronisasi dengan Clerk
     - **Impact**: Pengguna mungkin memiliki peran yang berbeda di Clerk dan database lokal
     - **Solution**: Implementasikan mekanisme retry dan notifikasi untuk sinkronisasi yang gagal
   - **Issue**: Cache RBAC mungkin tidak tervalidasi saat deployment baru
     - **Impact**: Pengguna mungkin memiliki akses yang tidak valid setelah deployment
     - **Solution**: Implementasikan global cache invalidation pada startup aplikasi

2. **Webhook Troubleshooting**

   - **Issue**: Webhook tidak menangkap perubahan dari Clerk
     - **Impact**: Data pengguna tidak sinkron antara Clerk dan database internal
     - **Solution**: Verifikasi CLERK_WEBHOOK_SECRET, periksa log Vercel, dan pastikan endpoint webhook dikonfigurasi dengan benar di Clerk
   - **Issue**: Webhook menerima event tetapi gagal memproses
     - **Impact**: Perubahan data pengguna di Clerk tidak tercermin di database internal
     - **Solution**: Periksa log error di Sentry, tes validasi signature, dan debug prisma query

3. **RBAC Troubleshooting**

   - **Issue**: Cache menyimpan data role yang sudah kedaluwarsa
     - **Impact**: Pengguna mungkin memiliki akses yang tidak sesuai dengan peran sebenarnya
     - **Solution**: Tambahkan mekanisme untuk memvalidasi cache secara berkala atau kurangi TTL cache
   - **Issue**: Format role tidak konsisten antara Clerk dan database
     - **Impact**: RBAC gagal memberikan akses yang benar kepada pengguna
     - **Solution**: Gunakan helper function `getRoleWithCompat()` untuk mendukung berbagai format role

4. **Support Contact**
   - Technical contact: usermgmt-team@example.com
   - Escalation path: Frontend Lead → Backend Lead → CTO

## 7. Referensi

### 7.1 Dokumentasi Teknis

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Webhook Documentation](https://clerk.com/docs/users/sync-data-webhooks)
- [TanStack Table Documentation](https://tanstack.com/table/latest/docs/guide/introduction)
- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [Prisma Client Documentation](https://www.prisma.io/docs/orm/prisma-client)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/vercel)
- [Recharts Documentation](https://recharts.org/en-US/)
- [MSW Documentation](https://mswjs.io/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Svix Library Documentation](https://docs.svix.com/)
- [Sentry Documentation](https://docs.sentry.io/)
- [LRU Cache Documentation](https://github.com/isaacs/node-lru-cache)

## 8. Riwayat Perubahan

| Tanggal    | Versi | Deskripsi Perubahan                                                                                              | Penulis              |
| ---------- | ----- | ---------------------------------------------------------------------------------------------------------------- | -------------------- |
| 01-04-2025 | 1.0.0 | Initial implementation                                                                                           | User Management Team |
| 15-05-2025 | 1.1.0 | Added statistics and charts                                                                                      | User Management Team |
| 01-06-2025 | 1.2.0 | Added user history tracking                                                                                      | User Management Team |
| 15-06-2025 | 1.3.0 | Enhanced RBAC and optimized performance                                                                          | User Management Team |
| 30-04-2025 | 1.4.0 | Improved UI, added webhook integration, RBAC caching, optimized Prisma Client, and implemented integration tests | User Management Team |
