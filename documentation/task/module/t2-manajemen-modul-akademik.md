# 📌 Manajemen Modul Akademik

## 🅰️ Pendahuluan Modul / Overview

### 🎯 Tujuan Modul

Modul ini memungkinkan admin untuk mengelola materi pembelajaran secara dinamis melalui operasi CRUD dan pengaturan status modul. Dengan validasi input yang ketat, otorisasi berbasis token, audit trail komprehensif, dan notifikasi real-time, admin dapat memperbarui konten modul kapan saja. Mahasiswa hanya dapat mengakses modul dengan status yang valid (misalnya, hanya modul dengan status **ACTIVE**).

### 👤 Target Pengguna

- **Admin**: Pengguna dengan hak akses untuk membuat, mengedit, dan menghapus modul pembelajaran.
- **Mahasiswa**: Pengguna yang hanya dapat mengakses modul dengan status ACTIVE.

### 📅 Informasi Sprint & Timeline

| Fitur                   | Sprint   | Tanggal Implementasi | Update Terakhir                                     |
| ----------------------- | -------- | -------------------- | --------------------------------------------------- |
| Backend API CRUD Modul  | Sprint 2 | 2025-03-10           | 2025-03-11 – Perbaikan Type Error & Testing         |
| Frontend Modul Manager  | Sprint 2 | 2025-03-12           | Belum dimulai                                       |
| Versioning & Audit Trail| Sprint 2 | 2025-03-13           | Belum dimulai                                       |

---

## 🅱️ Struktur File & Folder

### 🎯 Tujuan

Menjelaskan organisasi file dan folder yang digunakan dalam modul untuk memudahkan navigasi dan pengelolaan kode.

### 📂 Konten

Struktur direktori untuk modul Manajemen Modul Akademik:

```
features/
└── manage-module/
    ├── components/
    │   └── (akan diimplementasikan pada langkah 2)
    ├── middleware/
    │   ├── authMiddleware.ts
    │   └── validateRequest.ts
    ├── schemas/
    │   └── moduleSchema.ts
    ├── services/
    │   ├── moduleService.ts
    │   └── moduleService.test.ts
    └── types/
        └── index.ts

app/
└── api/
    └── modules/
        ├── route.ts
        └── [id]/
            └── route.ts

prisma/
└── schema.prisma (ditambahkan model Module)
```

### ✅ Manfaat

Struktur ini memastikan pemisahan yang jelas antara logika bisnis, validasi, dan API endpoints, sehingga memudahkan pengembangan dan pemeliharaan kode.

---

## 🅲️ Fitur Utama

### 📋 Daftar Fitur

- [x] CRUD API untuk Modul Akademik
- [ ] Frontend Manajemen Modul
- [ ] Versioning dan Audit Trail
- [ ] Filter dan Pencarian Modul

### 🛠️ Penjelasan Fungsi

#### CRUD API untuk Modul Akademik
- **Create**: Membuat modul baru dengan validasi input menggunakan Zod
- **Read**: Mengambil daftar modul dengan dukungan pagination, filter, dan pencarian
- **Update**: Memperbarui modul yang sudah ada dengan validasi dan otorisasi
- **Delete**: Menghapus modul dengan otorisasi admin

#### Middleware
- **Validasi Request**: Memastikan data yang dikirim sesuai dengan skema yang ditentukan
- **Otorisasi**: Memastikan hanya admin yang dapat melakukan operasi tertentu

---

## 🅳️ Struktur Data

### 🗄️ Skema Database

Model `Module` dalam database PostgreSQL:

```prisma
enum ModuleStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

model Module {
  id          String       @id @default(uuid())
  title       String
  description String?
  status      ModuleStatus @default(DRAFT)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  createdBy   String
  updatedBy   String

  @@index([status])
  @@index([title])
  @@map("modules")
}
```

### 🏗️ Definisi Model

- **id**: Identifier unik untuk modul (UUID)
- **title**: Judul modul (wajib)
- **description**: Deskripsi modul (opsional)
- **status**: Status modul (DRAFT, ACTIVE, ARCHIVED)
- **createdAt**: Waktu pembuatan modul
- **updatedAt**: Waktu pembaruan terakhir
- **createdBy**: ID pengguna yang membuat modul
- **updatedBy**: ID pengguna yang terakhir memperbarui modul

---

## 🅴️ API & Integrasi

### 🌐 Endpoint API

| Endpoint                | Metode | Deskripsi                               | Otorisasi |
|-------------------------|--------|----------------------------------------|-----------|
| `/api/modules`          | GET    | Mengambil daftar modul                 | Semua     |
| `/api/modules`          | POST   | Membuat modul baru                     | Admin     |
| `/api/modules/:id`      | GET    | Mengambil detail modul berdasarkan ID  | Semua     |
| `/api/modules/:id`      | PUT    | Memperbarui modul                      | Admin     |
| `/api/modules/:id`      | DELETE | Menghapus modul                        | Admin     |

### 🔍 Metode dan Parameter

#### GET /api/modules
**Query Parameters:**
- `status`: Filter berdasarkan status modul (DRAFT, ACTIVE, ARCHIVED)
- `limit`: Jumlah modul per halaman (default: 10)
- `cursor`: ID modul terakhir untuk pagination
- `search`: Kata kunci pencarian untuk judul atau deskripsi

**Response:**
```json
{
  "modules": [
    {
      "id": "uuid-1",
      "title": "Modul Matematika",
      "description": "Pengenalan matematika dasar",
      "status": "ACTIVE",
      "createdAt": "2025-03-10T10:00:00Z",
      "updatedAt": "2025-03-10T10:00:00Z",
      "createdBy": "user-id-1",
      "updatedBy": "user-id-1"
    }
  ],
  "pagination": {
    "count": 1,
    "hasMore": false,
    "nextCursor": null
  }
}
```

#### POST /api/modules
**Request Body:**
```json
{
  "title": "Modul Baru",
  "description": "Deskripsi modul",
  "status": "DRAFT"
}
```

**Response:**
```json
{
  "id": "uuid-new",
  "title": "Modul Baru",
  "description": "Deskripsi modul",
  "status": "DRAFT",
  "createdAt": "2025-03-10T12:00:00Z",
  "updatedAt": "2025-03-10T12:00:00Z",
  "createdBy": "admin-id",
  "updatedBy": "admin-id"
}
```

#### GET /api/modules/:id
**Response:**
```json
{
  "id": "uuid-1",
  "title": "Modul Matematika",
  "description": "Pengenalan matematika dasar",
  "status": "ACTIVE",
  "createdAt": "2025-03-10T10:00:00Z",
  "updatedAt": "2025-03-10T10:00:00Z",
  "createdBy": "user-id-1",
  "updatedBy": "user-id-1"
}
```

#### PUT /api/modules/:id
**Request Body:**
```json
{
  "title": "Modul Matematika (Updated)",
  "description": "Pengenalan matematika dasar yang diperbarui",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "id": "uuid-1",
  "title": "Modul Matematika (Updated)",
  "description": "Pengenalan matematika dasar yang diperbarui",
  "status": "ACTIVE",
  "createdAt": "2025-03-10T10:00:00Z",
  "updatedAt": "2025-03-10T13:00:00Z",
  "createdBy": "user-id-1",
  "updatedBy": "admin-id"
}
```

#### DELETE /api/modules/:id
**Response:**
```json
{
  "id": "uuid-1",
  "title": "Modul Matematika",
  "description": "Pengenalan matematika dasar",
  "status": "ACTIVE",
  "createdAt": "2025-03-10T10:00:00Z",
  "updatedAt": "2025-03-10T10:00:00Z",
  "createdBy": "user-id-1",
  "updatedBy": "user-id-1"
}
```

### 🔗 Integrasi Layanan Eksternal

- **Clerk**: Digunakan untuk autentikasi dan otorisasi pengguna
- **Prisma**: ORM untuk interaksi dengan database PostgreSQL

## 🅵️ UI/UX & Komponen

### 🎨 Desain UI/UX

UI untuk manajemen modul akan diimplementasikan pada Langkah 2, dengan fokus pada:
- Tabel modul dengan pagination dan filter
- Form untuk membuat dan mengedit modul
- Konfirmasi untuk menghapus modul
- Indikator status modul dengan warna yang berbeda

### 🏗️ Komponen Utama

Komponen yang akan diimplementasikan:
- `ModuleTable`: Menampilkan daftar modul dengan pagination
- `ModuleForm`: Form untuk membuat dan mengedit modul
- `ModuleStatusBadge`: Menampilkan status modul dengan warna yang sesuai
- `ModuleFilter`: Filter untuk mencari dan memfilter modul

---

## 🅶️ Kebutuhan Teknis

### 🏗️ Library & Teknologi

- **Next.js**: Framework React untuk frontend dan API routes
- **Prisma**: ORM untuk interaksi dengan database
- **Zod**: Library untuk validasi skema
- **Clerk**: Untuk autentikasi dan otorisasi
- **Tailwind CSS**: Untuk styling
- **shadcn/ui**: Komponen UI yang dapat digunakan kembali

### ⚙️ Konfigurasi Khusus

- **DATABASE_URL**: URL koneksi ke database PostgreSQL
- **DIRECT_URL**: URL koneksi langsung ke database (untuk Prisma)
- **CLERK_SECRET_KEY**: API key untuk Clerk authentication

---

## 🅷️ Testing

### 🧪 Rencana Pengujian

- **Unit Testing**: Menguji fungsi-fungsi di `moduleService.ts` menggunakan Jest
- **Integration Testing**: Menguji endpoint API dengan Supertest
- **E2E Testing**: Menguji alur pengguna lengkap dengan Cypress

### 📊 Implementasi Pengujian

#### Unit Testing untuk moduleService.ts
Berikut adalah hasil pengujian untuk `moduleService.ts`:

```
PASS  features/manage-module/services/moduleService.test.ts
  Module Service
    createModule
      √ should create a new module
      √ should throw an error if creation fails
    getModules
      √ should return all modules
      √ should support filtering by status
      √ should support pagination
    getModuleById
      √ should return a module by id
      √ should return null if module not found
    updateModule
      √ should update a module
      √ should throw an error if update fails
    deleteModule
      √ should delete a module
      √ should throw an error if delete fails
      √ should return null if module not found
```

Pengujian ini memastikan bahwa semua fungsi CRUD di `moduleService.ts` berfungsi dengan baik, termasuk penanganan error dan kasus edge.

#### Integration Testing
Pengujian integrasi untuk endpoint API akan diimplementasikan pada langkah berikutnya, dengan fokus pada:
- Validasi request
- Otorisasi
- Penanganan error

#### E2E Testing
Pengujian E2E akan diimplementasikan setelah frontend selesai, dengan fokus pada alur pengguna lengkap dari login hingga manajemen modul.

---

## 🅸️ Potensi Perkembangan

### 🚀 Fitur Tambahan

- **Bulk Operations**: Kemampuan untuk melakukan operasi pada beberapa modul sekaligus
- **Export/Import**: Fitur untuk mengekspor dan mengimpor modul
- **Advanced Filtering**: Filter yang lebih canggih seperti filter berdasarkan tanggal pembuatan
- **Tagging System**: Sistem tag untuk mengkategorikan modul

### 📈 Saran Optimasi

- **Caching**: Implementasi caching untuk meningkatkan performa
- **Preloading Data**: Preloading data untuk meningkatkan UX
- **Optimistic Updates**: Update UI secara optimis sebelum request selesai

---

🚀 **Dokumentasi ini akan terus diperbarui sesuai dengan perkembangan proyek!**

[update+2025-03-10] Implementasi awal API CRUD dan Middleware
[update+2025-03-11] Perbaikan Type Error dan Implementasi Testing
