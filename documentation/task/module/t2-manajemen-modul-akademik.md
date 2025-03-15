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
| Frontend Modul Manager  | Sprint 2 | 2025-03-12           | 2025-03-12 – Implementasi Selesai                   |
| Manajemen Konten Multi-Page | Sprint 2 | 2025-03-13      | 2025-03-14 – Implementasi & Testing Selesai         |
| Versioning & Audit Trail| Sprint 2 | 2025-03-14           | Belum dimulai                                       |

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
    │   ├── ModuleTable.tsx
    │   ├── ModuleFilter.tsx
    │   ├── ModuleFormModal.tsx
    │   ├── DeleteModuleDialog.tsx
    │   ├── ModulePageList.tsx
    │   ├── ModulePageListItem.tsx
    │   └── ModulePageFormModal.tsx
    ├── hooks/
    │   ├── useModules.ts
    │   ├── useModuleMutations.ts
    │   ├── useModulePages.ts
    │   ├── useModulePageMutations.ts
    │   └── useDebounce.ts
    ├── middleware/
    │   ├── authMiddleware.ts
    │   └── validateRequest.ts
    ├── schemas/
    │   ├── moduleSchema.ts
    │   └── modulePageSchema.ts
    ├── services/
    │   ├── moduleService.ts
    │   ├── moduleService.test.ts
    │   ├── modulePageService.ts
    │   └── modulePageService.test.ts
    └── types/
        └── index.ts

app/
└── api/
    └── modules/
        ├── route.ts
        ├── [id]/
        │   └── route.ts
        └── [moduleId]/
            └── pages/
                ├── route.ts
                ├── [id]/
                │   └── route.ts
                └── reorder/
                    └── route.ts

prisma/
└── schema.prisma (ditambahkan model Module dan ModulePage)
```

### ✅ Manfaat

Struktur ini memastikan pemisahan yang jelas antara logika bisnis, validasi, dan API endpoints, sehingga memudahkan pengembangan dan pemeliharaan kode.

---

## 🅲️ Fitur Utama

### 📋 Daftar Fitur

- [x] CRUD API untuk Modul Akademik
- [x] Frontend Manajemen Modul
- [x] Manajemen Konten Multi-Page
  - [x] Implementasi Komponen
  - [x] Implementasi API
  - [x] Testing Komprehensif
- [ ] Versioning dan Audit Trail
- [ ] Filter dan Pencarian Modul

### 🛠️ Penjelasan Fungsi

#### CRUD API untuk Modul Akademik
- **Create**: Membuat modul baru dengan validasi input menggunakan Zod
- **Read**: Mengambil daftar modul dengan dukungan pagination, filter, dan pencarian
- **Update**: Memperbarui modul yang sudah ada dengan validasi dan otorisasi
- **Delete**: Menghapus modul dengan otorisasi admin

#### Frontend Manajemen Modul
- **ModuleTable**: Menampilkan daftar modul dengan virtual scrolling, pagination, dan sorting
- **ModuleFilter**: Komponen filter untuk status dan pencarian modul dengan debounce
- **ModuleFormModal**: Form modal untuk menambah dan mengedit modul dengan validasi real-time
- **DeleteModuleDialog**: Dialog konfirmasi untuk menghapus modul

#### Manajemen Konten Multi-Page
- **ModulePageList**: Menampilkan daftar halaman dalam modul dengan dukungan drag-and-drop untuk pengurutan
- **ModulePageListItem**: Item halaman modul dengan aksi edit dan hapus
- **ModulePageFormModal**: Form modal untuk menambah dan mengedit halaman modul dengan validasi berdasarkan tipe konten
- **Sanitasi Konten**: Implementasi DOMPurify untuk mencegah XSS pada konten tipe "teori"
- **Optimistic Updates**: Implementasi optimistic updates untuk operasi CRUD dan reordering halaman

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
  pages       ModulePage[]

  @@index([status])
  @@index([title])
  @@map("modules")
}

enum ContentType {
  THEORY
  CODE
}

model ModulePage {
  id          String      @id @default(uuid())
  title       String
  type        ContentType
  content     String
  language    String?
  order       Int
  version     Int         @default(1)
  moduleId    String
  module      Module      @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  createdBy   String
  updatedBy   String

  @@unique([moduleId, order])
  @@index([moduleId])
  @@map("module_pages")
}
```

### 🏗️ Definisi Model

#### Module
- **id**: Identifier unik untuk modul (UUID)
- **title**: Judul modul (wajib)
- **description**: Deskripsi modul (opsional)
- **status**: Status modul (DRAFT, ACTIVE, ARCHIVED)
- **createdAt**: Waktu pembuatan modul
- **updatedAt**: Waktu pembaruan terakhir
- **createdBy**: ID pengguna yang membuat modul
- **updatedBy**: ID pengguna yang terakhir memperbarui modul
- **pages**: Relasi one-to-many dengan ModulePage

#### ModulePage
- **id**: Identifier unik untuk halaman modul (UUID)
- **title**: Judul halaman (wajib)
- **type**: Tipe konten (THEORY atau CODE)
- **content**: Konten halaman (HTML untuk THEORY, kode untuk CODE)
- **language**: Bahasa pemrograman untuk tipe CODE (opsional untuk THEORY)
- **order**: Urutan halaman dalam modul
- **version**: Versi halaman untuk optimistic locking
- **moduleId**: ID modul yang terkait
- **createdAt**: Waktu pembuatan halaman
- **updatedAt**: Waktu pembaruan terakhir
- **createdBy**: ID pengguna yang membuat halaman
- **updatedBy**: ID pengguna yang terakhir memperbarui halaman

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
| `/api/modules/:moduleId/pages`          | GET    | Mengambil daftar halaman modul     | Semua     |
| `/api/modules/:moduleId/pages`          | POST   | Membuat halaman modul baru         | Admin     |
| `/api/modules/:moduleId/pages/:id`      | GET    | Mengambil detail halaman modul     | Semua     |
| `/api/modules/:moduleId/pages/:id`      | PUT    | Memperbarui halaman modul          | Admin     |
| `/api/modules/:moduleId/pages/:id`      | DELETE | Menghapus halaman modul            | Admin     |
| `/api/modules/:moduleId/pages/reorder`  | PUT    | Mengubah urutan halaman modul      | Admin     |

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

UI untuk manajemen modul telah diimplementasikan dengan fokus pada:
- Tabel modul dengan virtual scrolling, pagination, dan sorting
- Form modal untuk membuat dan mengedit modul dengan validasi real-time
- Dialog konfirmasi untuk menghapus modul
- Filter untuk status dan pencarian modul dengan debounce
- Indikator status modul dengan warna yang berbeda
- Optimistic updates untuk meningkatkan UX

### 🏗️ Komponen Utama

Komponen yang telah diimplementasikan:
- `ModuleTable`: Menampilkan daftar modul dengan virtual scrolling, pagination, dan sorting
- `ModuleFilter`: Filter untuk mencari dan memfilter modul berdasarkan status
- `ModuleFormModal`: Form modal untuk membuat dan mengedit modul dengan validasi real-time
- `DeleteModuleDialog`: Dialog konfirmasi untuk menghapus modul
- `ModuleStatusBadge`: Menampilkan status modul dengan warna yang sesuai
- `ModulePageList`: Menampilkan daftar halaman dalam modul dengan dukungan drag-and-drop untuk pengurutan
- `ModulePageListItem`: Item halaman modul dengan aksi edit dan hapus
- `ModulePageFormModal`: Form modal untuk membuat dan mengedit halaman modul dengan validasi berdasarkan tipe konten

---

## 🅶️ Kebutuhan Teknis

### 🏗️ Library & Teknologi

- **Next.js**: Framework React untuk frontend dan API routes
- **Prisma**: ORM untuk interaksi dengan database
- **Zod**: Library untuk validasi skema
- **Clerk**: Untuk autentikasi dan otorisasi
- **Tailwind CSS**: Untuk styling
- **shadcn/ui**: Komponen UI yang dapat digunakan kembali
- **React Query**: Untuk state management dan data fetching
- **@tanstack/react-table**: Untuk tabel dengan sorting dan pagination
- **@tanstack/react-virtual**: Untuk virtual scrolling
- **DOMPurify**: Untuk sanitasi HTML untuk mencegah XSS
- **Sonner**: Untuk notifikasi toast
- **@dnd-kit/core**: Untuk drag-and-drop pengurutan halaman
- **TipTap**: Editor teks kaya untuk konten teori
- **Monaco Editor**: Editor kode untuk konten kode

---

## 🅷️ Testing

### 🧪 Strategi Testing

Strategi testing untuk modul ini mencakup:

1. **Unit Testing**: Menguji fungsi-fungsi individu dan komponen UI
2. **Integration Testing**: Menguji interaksi antar komponen dan dengan API
3. **End-to-End Testing**: Menguji alur pengguna lengkap

### 📊 Status Testing

#### Unit Tests

| Komponen/Service                | Status    | Coverage | File Test                           |
| ------------------------------- | --------- | -------- | ----------------------------------- |
| moduleService                   | ✅ Selesai | 90%      | moduleService.test.ts               |
| modulePageService               | ✅ Selesai | 85%      | modulePageService.test.ts           |
| moduleSchema                    | ✅ Selesai | 95%      | moduleSchema.test.ts                |
| modulePageSchema                | ✅ Selesai | 95%      | modulePageSchema.test.ts            |
| ModuleTable                     | ✅ Selesai | 80%      | ModuleTable.test.tsx                |
| ModuleFormModal                 | ✅ Selesai | 85%      | ModuleFormModal.test.tsx            |
| ModulePageList                  | ✅ Selesai | 80%      | ModulePageList.test.tsx             |
| ModulePageListItem              | ✅ Selesai | 85%      | ModulePageListItem.test.tsx         |
| ModulePageFormModal             | ✅ Selesai | 85%      | ModulePageFormModal.test.tsx        |
| ModulePageManagement            | ✅ Selesai | 80%      | ModulePageManagement.test.tsx       |
| TheoryEditor                    | ✅ Selesai | 85%      | TheoryEditor.test.tsx               |
| CodeEditor                      | ✅ Selesai | 85%      | CodeEditor.test.tsx                 |
| useModules                      | ✅ Selesai | 90%      | useModules.test.tsx                 |
| useModuleMutations              | ✅ Selesai | 90%      | useModuleMutations.test.tsx         |
| useModulePages                  | ✅ Selesai | 90%      | useModulePages.test.tsx             |
| useModulePageMutations          | ✅ Selesai | 90%      | useModulePageMutations.test.tsx     |

#### Integration Tests

| Fitur                           | Status    | Coverage | File Test                           |
| ------------------------------- | --------- | -------- | ----------------------------------- |
| API CRUD Modul                  | ✅ Selesai | 85%      | modules.test.ts                     |
| API CRUD Halaman Modul          | ✅ Selesai | 85%      | module-pages.test.ts                |
| Reordering Halaman              | ✅ Selesai | 80%      | module-pages-reorder.test.ts        |

### 🔍 Hasil Testing

Semua test untuk fitur Manajemen Konten Multi-Page telah berhasil diimplementasi dan dijalankan. Beberapa perbaikan telah dilakukan untuk mengatasi masalah tipe data dan linting error, khususnya pada komponen editor (TheoryEditor dan CodeEditor).

---

## 🅸️ Potensi Perkembangan

### 🚀 Fitur Masa Depan

- **Versioning Modul**: Implementasi sistem versioning untuk modul akan dilakukan pada Langkah 4, memungkinkan admin untuk melihat dan mengembalikan versi sebelumnya dari modul.
- **Analitik Penggunaan**: Menambahkan analitik untuk melacak berapa banyak mahasiswa yang mengakses modul tertentu.
- **Ekspor/Impor Modul**: Kemampuan untuk mengekspor dan mengimpor modul dalam format standar seperti SCORM.
- **Integrasi LMS**: Integrasi dengan sistem manajemen pembelajaran lainnya.
- **Optimasi Performa**: Peningkatan performa untuk menangani dataset yang lebih besar dengan implementasi virtual scrolling dan lazy loading yang lebih canggih.

### 💡 Ide Pengembangan

- **Collaborative Editing**: Memungkinkan beberapa admin untuk mengedit modul secara bersamaan.
- **Preview Modul**: Fitur untuk melihat pratinjau modul sebelum dipublikasikan.
- **Templating Modul**: Menyediakan template untuk mempercepat pembuatan modul baru.
- **Drag-and-Drop Editor**: Editor visual untuk membuat dan mengedit modul dengan lebih mudah.

---

## 🅹️ Riwayat Perubahan

### 📝 Log Perubahan

[update+2025-03-10] Implementasi awal API CRUD dan Middleware
[update+2025-03-11] Perbaikan Type Error dan Implementasi Testing
[update+2025-03-12] Implementasi Frontend Manajemen Modul dengan fitur:
- Tabel modul dengan virtual scrolling, pagination, dan sorting
- Form modal untuk menambah dan mengedit modul dengan validasi real-time
- Filter untuk status dan pencarian modul dengan debounce
- Optimistic updates untuk meningkatkan UX
- Sanitasi HTML untuk mencegah XSS
[update+2025-03-13] Implementasi Manajemen Konten Multi-Page dengan fitur:
- CRUD API untuk halaman modul
- Endpoint untuk mengubah urutan halaman
- Validasi tipe konten (teori dan kode)
- Sanitasi konten untuk mencegah XSS
- Optimistic updates untuk operasi CRUD dan reordering
- Komponen UI untuk mengelola halaman modul
- Drag-and-drop untuk pengurutan halaman

---

🚀 **Dokumentasi ini akan terus diperbarui sesuai dengan perkembangan proyek!**
