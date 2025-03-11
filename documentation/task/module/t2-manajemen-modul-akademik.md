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
    │   ├── ModuleTable.tsx
    │   ├── ModuleFilter.tsx
    │   ├── ModuleFormModal.tsx
    │   └── DeleteModuleDialog.tsx
    ├── hooks/
    │   ├── useModules.ts
    │   ├── useModuleMutations.ts
    │   └── useDebounce.ts
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
- [x] Frontend Manajemen Modul
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

---

## 🅷️ Testing

### 🧪 Rencana Pengujian

- **Unit Testing**: Menguji fungsi-fungsi di `moduleService.ts` dan komponen UI menggunakan Jest dan React Testing Library
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

#### Unit Testing untuk Komponen UI
Berikut adalah hasil pengujian untuk komponen UI:

```
PASS  features/manage-module/components/ModuleTable.test.tsx
  ModuleTable
    √ menampilkan loading state saat data sedang dimuat
    √ menampilkan error state saat terjadi kesalahan
    √ menampilkan data modul dalam tabel
    √ menampilkan tombol "Muat Lebih Banyak" jika hasMore true
    √ membuka form modal saat tombol "Tambah Modul" diklik

PASS  features/manage-module/components/ModuleFilter.test.tsx
  ModuleFilter
    √ renders the search input and status filter
    √ updates search filter when input changes
    √ updates status filter when selection changes
    √ resets status filter when "Semua Status" is selected

PASS  features/manage-module/components/ModuleFormModal.test.tsx
  ModuleFormModal
    √ renders form for creating new module when no module is provided
    √ renders form for editing module when module is provided
    √ calls onOpenChange when cancel button is clicked
    √ calls createModule when form is submitted for new module
    √ calls updateModule when form is submitted for existing module
    √ shows validation error for title with less than 5 characters

PASS  features/manage-module/components/DeleteModuleDialog.test.tsx
  DeleteModuleDialog
    √ renders the dialog with module title
    √ calls onOpenChange when cancel button is clicked
    √ calls deleteModule when confirm button is clicked
```

#### Integration Testing
Pengujian integrasi untuk endpoint API akan diimplementasikan pada langkah berikutnya, dengan fokus pada:
- Validasi request
- Otorisasi
- Penanganan error

#### E2E Testing
Pengujian E2E akan diimplementasikan setelah frontend selesai, dengan fokus pada alur pengguna lengkap dari login hingga manajemen modul.

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

---

🚀 **Dokumentasi ini akan terus diperbarui sesuai dengan perkembangan proyek!**
