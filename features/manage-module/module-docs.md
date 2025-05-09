# Modul Manage-Module

> Template ini mengikuti praktik terbaik dari IEEE 829, ISO/IEC/IEEE 29148:2018, dan standar dokumentasi perangkat lunak lainnya.

## 1. Informasi Umum

### 1.1 Identifikasi Modul

- **Nama Modul**: Manajemen Modul Pembelajaran (Manage Module)
- **Kode Modul**: MODMGMT-001
- **Versi**: 1.2.1
- **Tanggal Terakhir Update**: 14-06-2024 [update+2024-06-14]
- **Penulis**: Tim Maguru
- **Status**: Implemented (Sprint 2)

### 1.2 Ringkasan

Modul ini bertanggung jawab untuk manajemen modul pembelajaran yang memungkinkan admin membuat, mengedit, menghapus, dan mengatur status modul (aktif, draft, diarsipkan). Pada update terbaru, telah dilakukan perbaikan pada fitur filter status modul agar menampilkan semua status (ACTIVE, DRAFT, ARCHIVED) secara benar, serta penambahan dan perbaikan pengujian unit & integrasi untuk memastikan filter status berjalan sesuai kebutuhan. [update+2024-06-14]

## 2. Spesifikasi Kebutuhan

### 2.1 Tujuan dan Sasaran

#### Tujuan Utama

- Implementasi CRUD modul akademik dan manajemen status modul dengan UI admin yang user-friendly.
- Memastikan validasi data yang ketat dan audit trail untuk perubahan modul.
- Memberikan antarmuka yang mempermudah admin dalam mengelola modul pembelajaran.
- Menerapkan Test-Driven Development (TDD) dengan unit testing komprehensif.
- Memastikan filter status modul dapat menampilkan semua status (ACTIVE, DRAFT, ARCHIVED) dan tidak hanya DRAFT. [update+2024-06-14]

#### Masalah yang Diselesaikan

- Kesulitan admin dalam membuat dan mengatur modul pembelajaran secara terstruktur.
- Keterbatasan dalam mengelola status modul (aktif, draft, diarsipkan) yang mempengaruhi visibilitas modul.
- Kebutuhan validasi input dan audit trail untuk menjaga integritas data.
- Proses manajemen modul yang manual dan tidak terstruktur.
- Bug pada filter status modul yang hanya menampilkan DRAFT, kini sudah diperbaiki sehingga semua status dapat difilter dan ditampilkan. [update+2024-06-14]

#### Manfaat yang Diharapkan

- **Untuk Pengguna**: Admin dapat membuat dan mengelola modul dengan interface yang intuitif.
- **Untuk Sistem**: Struktur data modul yang terorganisir dengan status yang jelas dan terdokumentasi.
- **Untuk Bisnis**: Meningkatkan efisiensi dan kualitas konten pembelajaran.
- **Tidak Langsung**:
  - Peningkatan keamanan dengan validasi ketat & audit trail.
  - Efisiensi operasional dengan UI yang mudah digunakan.
  - Mengurangi error data dengan validasi terpusat.
  - Pengalaman pengguna lebih baik karena filter status berjalan sesuai ekspektasi. [update+2024-06-14]

### 2.2 Ruang Lingkup

#### Yang Termasuk dalam Modul

1. Komponen Inti:

   - CRUD modul pembelajaran (title, description, status)
   - DataTable untuk tampilan & manajemen modul
   - Form modal untuk create/edit modul
   - Status management (DRAFT, ACTIVE, ARCHIVED)
   - Validasi input dengan Zod
   - Integrasi React Query untuk state management
   - Middleware autentikasi & audit trail
   - Filter status modul yang kini menampilkan semua status dengan benar. [update+2024-06-14]

2. Fungsionalitas:
   - Menampilkan daftar modul dengan filtering & sorting
   - Menambah modul baru via modal form
   - Mengedit informasi modul yang ada
   - Mengubah status modul (draft ke active/archived)
   - Menghapus modul dengan konfirmasi
   - Pencarian modul berdasarkan judul/deskripsi
   - Pengujian unit & integrasi untuk filter status. [update+2024-06-14]

#### Yang Tidak Termasuk dalam Modul

1. Batasan Teknis:

   - Manajemen konten multi-page (akan diimplementasi di Sprint 4)
   - Version control modul (akan diimplementasi di Sprint 4)
   - Export/import konten modul
   - Upload dan manajemen aset media (gambar, video)

2. Batasan Bisnis:
   - Analitik pembelajaran modul dan engagement metrics
   - Reviewer workflow dan approval multi-level
   - Monetisasi modul dan pembatasan akses premium

### 2.3 Kebutuhan Fungsional

1. MODMGMT-F001: CRUD Modul Pembelajaran

   - **Deskripsi**: Admin dapat membuat, melihat, memperbarui dan menghapus modul pembelajaran.
   - **Kriteria Penerimaan**:
     - Form dengan validasi untuk create/edit modul (title, description)
     - DataTable yang menampilkan judul, deskripsi, status, tanggal pembuatan/update
     - Action button (edit/delete) untuk masing-masing modul
     - Tombol create untuk menambah modul baru
     - Konfirmasi sebelum delete modul
   - **Prioritas**: Critical
   - **Dependensi**: Prisma, React Query, Zod
   - **Estimasi**: 8 Story Points
   - **Status**: Completed

2. MODMGMT-F002: Manajemen Konten Multi-Page

   - **Deskripsi**: Admin dapat membuat, mengedit, menghapus, dan mengelola halaman konten (teks, kode, gambar, video) sebagai bagian dari satu modul pembelajaran. Setiap halaman dapat diisi dengan berbagai tipe konten menggunakan slash command (misal: `/image`, `/code`) seperti di Confluence/Notion. Editor mendukung markdown (lihat package.json: react-markdown, @tiptap) dan toolbar sederhana untuk formatting dasar. Pengelolaan halaman dilakukan di satu halaman khusus dengan navigasi antar halaman di RightSidebar/bagian bawah. Batasan upload gambar maksimal 2MB/file dan video maksimal 20MB/file.
   - **Kriteria Penerimaan**:
     - Admin dapat CRUD halaman konten pada modul.
     - Satu halaman dapat berisi campuran teks, kode, gambar, dan video.
     - Penambahan konten menggunakan slash command.
     - Navigasi antar halaman mudah diakses.
     - Toolbar sederhana untuk formatting.
     - Editor mendukung markdown.
     - Perubahan halaman langsung terlihat di UI (real-time update).
     - Mahasiswa hanya bisa melihat halaman dari modul berstatus ACTIVE.
     - Unit, integration, dan E2E test coverage minimal 80%.
     - Batasan upload gambar maksimal 2MB/file, video maksimal 20MB/file.
   - **Catatan**:
     - Fitur drag & drop urutan halaman, quiz, preview halaman, audit trail, import/export, duplikasi, dan versioning akan dikerjakan di task/sprint terpisah.
   - **Prioritas**: High
   - **Dependensi**: API CRUD Multi-Page, React Query, Zod, Prisma, react-markdown, @tiptap
   - **Estimasi**: 8 Story Points
   - **Status**: In Progress

3. MODMGMT-F003: Future Tasks Multi-Page Management
   - **Deskripsi**: Pengembangan lanjutan untuk fitur multi-page, meliputi:

- **Drag & Drop Urutan Halaman**: Fitur untuk mengubah urutan halaman secara visual.
- **Quiz Page**: Halaman khusus untuk quiz/interaktif.
- **Preview Halaman**: Fitur untuk melihat tampilan halaman sebelum publish.
- **Audit Trail**: Pencatatan detail perubahan setiap halaman.
- **Import/Export & Duplikasi**: Mendukung ekspor, impor, dan duplikasi halaman.
- **Versioning**: Menyimpan riwayat perubahan konten halaman.
  - **Status**: To Do

### 2.4 Kebutuhan Non-Fungsional

1. Performa:

   - Waktu respons API < 500ms untuk operasi CRUD
   - Loading state UI yang responsive < 300ms
   - Pagination efisien untuk dataset besar (> 100 modul)
   - Debounce search untuk optimasi request

2. Keamanan:

   - Middleware autentikasi berbasis Clerk untuk otorisasi admin
   - Validasi input server-side untuk mencegah injeksi
   - Audit trail untuk semua perubahan modul
   - Verifikasi permission sebelum operasi sensitif

3. Skalabilitas:

   - Struktur data yang mendukung penambahan field di masa depan
   - Query optimization untuk dataset yang bertumbuh
   - Modular component-based approach untuk kemudahan ekstensi

4. Testabilitas:
   - Unit test coverage > 80% untuk komponen dan services
   - Integration test untuk flow CRUD & filter status [update+2024-06-14]
   - Mock services untuk testing independen

## 3. Desain dan Implementasi

### 3.1 Arsitektur

#### Diagram Arsitektur

- **High-Level Architecture**
  ```
  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
  │                 │      │                 │      │                 │
  │  React UI       │◄────►│  Next.js API    │◄────►│  PostgreSQL DB  │
  │  Components     │      │  Routes         │      │  (Prisma ORM)   │
  │                 │      │                 │      │                 │
  └─────────────────┘      └────────┬────────┘      └─────────────────┘
          ▲                         │
          │                         ▼
  ┌───────┴───────┐      ┌─────────────────┐
  │               │      │                 │
  │  React Query  │      │  Auth & Audit   │
  │  Tanstack     │      │  Middleware     │
  │               │      │                 │
  └───────────────┘      └─────────────────┘
  ```

#### Komponen Utama

- **ModuleTable**: Komponen utama untuk menampilkan daftar modul dengan DataTable dan filter status
- **ModuleFormModal**: Form modal untuk create/edit modul
- **ErrorNotifier**: Komponen untuk menampilkan error message
- **State management**: React Query
- **Filter status**: Dropdown filter status yang terhubung ke query API [update+2024-06-14]

#### Alur Filter Status Modul [update+2024-06-14]

- State filter status diatur pada komponen ModuleTable
- Nilai default status adalah 'all' (menampilkan semua status)
- Fungsi getStatusFilter mengubah string status menjadi enum untuk API
- Query ke API akan mengirim status sesuai filter, atau undefined untuk semua status
- Perbaikan bug: sebelumnya default status adalah DRAFT, kini sudah undefined sehingga ALL status tampil
- Pengujian dilakukan untuk memastikan filter status berjalan baik (unit & integration test)

### 3.2 Database

#### Skema Database

1. **Entity Relationship Diagram (ERD)**

   ```
   ┌──────────────┐
   │   Module     │
   ├──────────────┤
   │ id           │
   │ title        │
   │ description  │
   │ status       │
   │ createdAt    │
   │ updatedAt    │
   │ createdBy    │
   │ updatedBy    │
   └──────────────┘
   ```

2. **Model Data**

   ```typescript
   // Module model dari types/index.ts
   export enum ModuleStatus {
     DRAFT = 'DRAFT',
     ACTIVE = 'ACTIVE',
     ARCHIVED = 'ARCHIVED',
   }

   export interface Module {
     id: string
     title: string
     description?: string
     status: ModuleStatus
     createdAt: Date
     updatedAt: Date
     createdBy: string
     updatedBy: string
   }

   // Input models
   export interface CreateModuleInput {
     title: string
     description?: string
     status?: ModuleStatus
   }

   export interface UpdateModuleInput {
     title?: string
     description?: string
     status?: ModuleStatus
   }

   // Query params model
   export interface ModuleQueryParams {
     page?: number
     limit?: number
     status?: string
     search?: string
     sortBy?: string
     sortOrder?: 'asc' | 'desc'
   }
   ```

### 3.3 API

#### Endpoint Definitions

1. **REST Endpoints**

   ```typescript
   /**
    * @route GET /api/modules
    * @desc Ambil daftar modul dengan pagination, filter, dan searching
    * @access Private (Admin)
    */

   /**
    * @route POST /api/modules
    * @desc Buat modul baru
    * @access Private (Admin)
    */

   /**
    * @route GET /api/modules/:id
    * @desc Ambil detail modul berdasarkan ID
    * @access Private (Admin)
    */

   /**
    * @route PUT /api/modules/:id
    * @desc Update modul berdasarkan ID
    * @access Private (Admin)
    */

   /**
    * @route PATCH /api/modules/:id/status
    * @desc Update status modul
    * @access Private (Admin)
    */

   /**
    * @route DELETE /api/modules/:id
    * @desc Hapus modul berdasarkan ID
    * @access Private (Admin)
    */
   ```

2. **Request/Response Format**

   ```json
   // GET /api/modules response
   {
     "data": [
       {
         "id": "uuid",
         "title": "Pengenalan Matematika Dasar",
         "description": "Modul ini membahas konsep dasar matematika",
         "status": "ACTIVE",
         "createdAt": "2025-01-15T00:00:00.000Z",
         "updatedAt": "2025-02-20T00:00:00.000Z",
         "createdBy": "user-id",
         "updatedBy": "user-id"
       }
     ],
     "pagination": {
       "page": 1,
       "limit": 10,
       "total": 100,
       "totalPages": 10
     }
   }

   // POST/PUT /api/modules request
   {
     "title": "Pengenalan Matematika Dasar",
     "description": "Modul ini membahas konsep dasar matematika",
     "status": "DRAFT"
   }

   // PATCH /api/modules/:id/status request
   {
     "status": "ACTIVE"
   }
   ```

### 3.4 Antarmuka Pengguna

#### Komponen UI Utama

1. **ModuleTable**

   - Tampilan tabel modul dengan kolom (title, description, status, actions)
   - Fitur sorting per kolom
   - Action buttons (edit, delete, change status)
   - Filter berdasarkan status dan search query

2. **ModuleFormModal**

   - Form modal responsive dengan validasi
   - Fields: title, description, status
   - Error validasi real-time
   - Loading state saat submit

3. **ErrorNotifier**
   - Notifikasi error yang user-friendly
   - Auto-dismiss timer
   - Style berbeda berdasarkan severity (error, warning, success)

#### Wireframes

1. **List View Modul**

   ```
   ┌─────────────────────────────────────────────────┐
   │ Manage Modules                          + Add   │
   ├─────────┬─────────────┬────────┬────────┬───────┤
   │ Title   │ Description │ Status │ Date   │ Action│
   ├─────────┼─────────────┼────────┼────────┼───────┤
   │ Modul 1 │ Deskripsi.. │ ACTIVE │ 01/01  │ ✏️ 🗑️ │
   ├─────────┼─────────────┼────────┼────────┼───────┤
   │ Modul 2 │ Deskripsi.. │ DRAFT  │ 01/02  │ ✏️ 🗑️ │
   ├─────────┼─────────────┼────────┼────────┼───────┤
   │ Modul 3 │ Deskripsi.. │ARCHIVED│ 01/03  │ ✏️ 🗑️ │
   └─────────┴─────────────┴────────┴────────┴───────┘
   ```

2. **Module Form Modal**
   ```
   ┌───────────────────────────────────┐
   │ Add/Edit Module                 ✖️ │
   ├───────────────────────────────────┤
   │ Title*                            │
   │ ┌─────────────────────────────┐   │
   │ │                             │   │
   │ └─────────────────────────────┘   │
   │                                   │
   │ Description                       │
   │ ┌─────────────────────────────┐   │
   │ │                             │   │
   │ │                             │   │
   │ └─────────────────────────────┘   │
   │                                   │
   │ Status                            │
   │ ┌─────────────────────────────┐   │
   │ │ DRAFT                     ▼ │   │
   │ └─────────────────────────────┘   │
   │                                   │
   │       ┌─────────┐ ┌─────────┐     │
   │       │ Cancel  │ │  Save   │     │
   │       └─────────┘ └─────────┘     │
   └───────────────────────────────────┘
   ```

## 4. Pengujian

### 4.1 Test Cases

- **Unit Test**: ModuleTable.test.tsx
  - Memastikan filter status menampilkan data sesuai status yang dipilih
  - Test untuk loading, error, dan empty state
- **Integration Test**: moduleFilterStatus.test.tsx
  - Simulasi interaksi user pada filter status
  - Memastikan API dipanggil dengan parameter status yang benar
  - Memastikan data yang tampil sesuai filter
- **Test Coverage**: > 85% untuk komponen utama dan filter status [update+2024-06-14]

### 4.2 Test Coverage

- **Unit Test Coverage**: > 85% untuk komponen dan services
- **Critical Path Testing**: Create, Edit, Delete modul dan filter/sort DataTable
- **Edge Cases**:
  - Validasi input dengan berbagai skenario (empty, too long, invalid)
  - Error handling (network, server, validation)
  - Permission checks untuk admin-only routes

## 5. Deployment

### 5.1 Prasyarat

1. **Dependencies**

   ```json
   {
     "dependencies": {
       "@tanstack/react-query": "^5.0.0",
       "@tanstack/react-table": "^8.10.0",
       "zod": "^3.22.4",
       "next": "14.0.4",
       "prisma": "^5.8.1",
       "@prisma/client": "^5.8.1",
       "@clerk/nextjs": "^4.29.3",
       "react-hook-form": "^7.49.3"
     },
     "devDependencies": {
       "@testing-library/react": "^14.1.2",
       "@testing-library/jest-dom": "^6.1.5",
       "jest": "^29.7.0",
       "msw": "^2.0.13"
     }
   }
   ```

2. **Environment Variables**

   ```bash
   # Database
   DATABASE_URL="postgresql://..."

   # Auth
   CLERK_SECRET_KEY="..."
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
   ```

## 6. Pemeliharaan

### 6.1 Monitoring

1. **Metrics**

   - API Response Time: < 300ms (p95)
   - Client-side rendering time: < 200ms
   - Error rate: < 1%
   - Jumlah modul dibuat/diedit per hari

2. **Alert Thresholds**
   ```json
   {
     "error_rate": "5%",
     "response_time": "1s",
     "failed_operations": "3 in 10 minutes"
   }
   ```

### 6.2 Troubleshooting

1. **Known Issues**

   - Search dengan unicode/special characters mungkin tidak berfungsi sempurna
   - Paginasi reset saat mengubah filter
   - React Query refetch interval mungkin menyebabkan flicker UI

2. **Support Contact**
   - Technical contact: maguru-dev@example.com
   - Escalation path: Frontend Lead → Backend Lead → CTO

## 7. Referensi

### 7.1 Dokumentasi Teknis

- [React Query Documentation](https://tanstack.com/query/latest)
- [TanStack Table Documentation](https://tanstack.com/table/latest)
- [Zod Validation](https://zod.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Authentication](https://clerk.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## 8. Riwayat Perubahan

| Tanggal    | Versi | Deskripsi Perubahan                                                   | Penulis    |
| ---------- | ----- | --------------------------------------------------------------------- | ---------- | ------------------- |
| 01-03-2025 | 1.0.0 | Initial draft & struktur blueprint                                    | Tim Maguru |
| 07-03-2025 | 1.1.0 | Implementasi UI, services & test case awal                            | Tim Maguru |
| 14-03-2025 | 1.2.0 | Completed CRUD & status management with tests                         | Tim Maguru |
| 14-06-2024 | 1.2.1 | Perbaikan filter status modul, update test unit & integrasi, coverage | Tim Maguru | [update+2024-06-14] |
