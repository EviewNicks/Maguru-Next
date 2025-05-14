# 📌 Dokumentasi Modul: Manajemen Modul Akademik [update+2025-04-01]

---

## 🅰️ Pendahuluan Modul / Overview

### 🎯 Tujuan Modul

Modul Manajemen Modul Akademik bertujuan untuk menyediakan sistem pengelolaan materi pembelajaran yang dinamis dan terstruktur bagi admin dan mahasiswa. Modul ini memungkinkan admin untuk membuat, mengedit, mengarsipkan, dan mengaktifkan materi pembelajaran, sementara mahasiswa dapat mengakses modul yang berstatus ACTIVE.

### 👤 Target Pengguna

- **Admin**: Pengelola konten pembelajaran yang memiliki akses penuh untuk CRUD operasi pada modul.
- **Mahasiswa**: Pengguna yang hanya dapat mengakses modul dengan status ACTIVE.

### 📅 Informasi Sprint & Timeline

| Fitur                           | Sprint   | Tanggal Implementasi | Update Terakhir                                    |
| ------------------------------- | -------- | -------------------- | -------------------------------------------------- |
| Backend API CRUD Modul Akademik | Sprint 2 | 2025-03-17           | 2025-03-17 – Implementasi Backend API CRUD         |
| Integrasi React Query           | Sprint 2 | 2025-03-20           | 2025-03-20 – Implementasi Integrasi React Query    |
| Implementasi Frontend UI        | Sprint 2 | 2025-03-25           | 2025-03-30 – Implementasi Halaman Manajemen Modul  |
| E2E Testing                     | Sprint 2 | 2025-04-01           | 2025-04-01 – Implementasi E2E Testing dan Reporter |

---

## 🅱️ Struktur File & Folder

### 🎯 Tujuan

Struktur file dan folder diorganisir untuk memudahkan pengembangan, pengujian, dan pemeliharaan modul Manajemen Modul Akademik.

### 📂 Konten

**Struktur folder:**

```
features/
└── manage-module/
    ├── components/
    │   ├── ModuleFormModal/
    │   │   ├── ModuleFormModal.tsx
    │   │   └── ModuleFormModal.test.tsx
    │   ├── ModuleTable/
    │   │   ├── DataTable.tsx
    │   │   ├── DataTableWithFeatures.tsx
    │   │   ├── ModuleActionCell.tsx
    │   │   ├── ModuleDescriptionCell.tsx
    │   │   ├── PaginationControls.tsx
    │   │   ├── SearchAndFilter.tsx
    │   │   └── *.test.tsx
    │   ├── ErrorNotifier/
    │   │   ├── ErrorNotifier.tsx
    │   │   └── ErrorNotifier.test.tsx
    │   └── ModuleTable.tsx
    ├── hooks/
    │   ├── useModuleForm.ts
    │   ├── useModuleMutation.ts
    │   ├── useModuleQuery.ts
    │   └── *.test.ts
    ├── services/
    │   ├── moduleService.ts
    │   └── moduleService.test.ts
    ├── types/
    │   └── index.ts
    ├── utils/
    │   ├── moduleValidation.ts
    │   ├── validateRequest.ts
    │   ├── authMiddleware.ts
    │   ├── auditMiddleware.ts
    │   └── *.test.ts
    └── __tests__/
        ├── unit/
        ├── integration/
        │   ├── ModuleAPI.integration.test.tsx
        │   ├── ModuleForm.integration.test.tsx
        │   ├── ModuleManagement.integration.test.tsx
        │   ├── XssPrevention.integration.test.tsx
        │   ├── moduleAuth.integration.test.ts
        │   ├── moduleValidation.integration.test.ts
        │   └── modulePerformance.integration.test.ts
        └── e2e/
            ├── ModuleManagement.e2e.spec.ts
            ├── ModuleTable.e2e.spec.ts
            ├── ModuleForm.e2e.spec.ts
            └── README.md

pages/
└── api/
    └── module/
        ├── index.ts
        ├── [id].ts
        └── __tests__/
            ├── index.test.ts
            └── [id].test.ts

services/
├── simpleJsonReporter.js
├── playwrightReporter.js
├── reports/
│   └── test-report-*.json
└── e2e-reports/
    ├── README.md
    └── e2e-report-*.json
```

### ✅ Manfaat

Struktur ini memisahkan komponen, hooks, services, dan types untuk memudahkan pengembangan dan pemeliharaan. Struktur pengujian juga dipisahkan berdasarkan jenis pengujian (unit, integration, e2e).

---

## 🅲️ Fitur Utama

### 📋 Daftar Fitur

- [x] CRUD Modul Akademik
- [x] Manajemen Status Modul (DRAFT, ACTIVE, ARCHIVED)
- [x] Validasi Input yang Ketat
- [x] Middleware Otorisasi (Admin-only)
- [x] Audit Trail Dasar
- [x] Error Handling Terstruktur
- [x] Integrasi React Query
- [x] Notifikasi Real-Time
- [x] Keamanan XSS
- [x] Datatable dengan Fitur Lengkap
- [x] Testing Komprehensif (Unit, Integration, E2E)
- [x] Custom Report untuk E2E Testing
- [x] Aksesibilitas (A11y) Lengkap [update+2025-06-28]
- [x] Keyboard Shortcuts untuk Navigasi [update+2025-06-28]

### 🛠️ Penjelasan Fungsi

- **CRUD Modul Akademik**: Admin dapat membuat, membaca, memperbarui, dan menghapus modul akademik.
- **Manajemen Status Modul**: Modul memiliki tiga status: DRAFT (pengembangan), ACTIVE (tersedia untuk mahasiswa), dan ARCHIVED (tidak tersedia).
- **Validasi Input**: Menggunakan Zod untuk memvalidasi input dengan ketat.
- **Middleware Otorisasi**: Memastikan hanya admin yang dapat melakukan operasi CRUD.
- **Audit Trail**: Mencatat setiap operasi CRUD dengan informasi user, action, dan timestamp.
- **Error Handling**: Mengembalikan pesan error yang terstruktur dan informatif.
- **Integrasi React Query**: Manajemen state dan operasi CRUD dengan optimistic updates.
- **Notifikasi Real-Time**: Implementasi toast notifications menggunakan Sonner.
- **Keamanan XSS**: Sanitasi input menggunakan DOMPurify untuk mencegah serangan cross-site scripting.
- **Datatable dengan Fitur Lengkap**: Implementasi datatable dengan pagination, sorting, filtering, dan searching yang dioptimalkan.
- **Testing Komprehensif**: Implementasi unit testing, integration testing, dan E2E testing untuk memastikan kualitas kode.
- **Custom Report**: Implementasi custom reporter untuk E2E testing yang menghasilkan laporan JSON serupa dengan unit dan integration testing.
- **Aksesibilitas (A11y)**: Implementasi fitur aksesibilitas lengkap termasuk ARIA labels, focus management, dan screen reader announcements untuk memastikan aplikasi dapat digunakan oleh semua pengguna. [update+2025-06-28]
- **Keyboard Shortcuts**: Implementasi shortcut keyboard untuk navigasi dan editing yang meningkatkan efisiensi dan produktivitas pengguna. [update+2025-06-28]

---

## 🅳️ Struktur Data

### 🗄️ Skema Database

```
┌─────────────┐
│   Module    │
├─────────────┤
│ id          │
│ title       │
│ description │
│ status      │
│ createdAt   │
│ updatedAt   │
│ createdBy   │
│ updatedBy   │
└─────────────┘
```

### 🏗️ Definisi Model

```prisma
enum ModuleStatus {
  DRAFT      // Dikembangkan
  ACTIVE     // Aktif
  ARCHIVED   // Tidak Tersedia
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
}
```

---

## 🅴️ API & Integrasi

### 🌐 Endpoint API

| Endpoint          | Metode | Deskripsi                                                |
| ----------------- | ------ | -------------------------------------------------------- |
| `/api/module`     | GET    | Mengambil daftar modul dengan pagination, filter, search |
| `/api/module`     | POST   | Membuat modul baru                                       |
| `/api/module/:id` | GET    | Mengambil detail modul berdasarkan ID                    |
| `/api/module/:id` | PUT    | Memperbarui modul berdasarkan ID                         |
| `/api/module/:id` | DELETE | Menghapus modul berdasarkan ID                           |

### 🔍 Metode dan Parameter

#### GET /api/module

**Query Parameters:**

- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah item per halaman (default: 10)
- `status`: Filter berdasarkan status (DRAFT, ACTIVE, ARCHIVED)
- `search`: Pencarian berdasarkan judul

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Judul Modul",
      "description": "Deskripsi Modul",
      "status": "DRAFT",
      "createdAt": "2025-03-17T00:00:00.000Z",
      "updatedAt": "2025-03-17T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### POST /api/module

**Request Body:**

```json
{
  "title": "Judul Modul",
  "description": "Deskripsi Modul",
  "status": "DRAFT"
}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Judul Modul",
  "description": "Deskripsi Modul",
  "status": "DRAFT",
  "createdAt": "2025-03-17T00:00:00.000Z",
  "updatedAt": "2025-03-17T00:00:00.000Z",
  "createdBy": "admin-id",
  "updatedBy": "admin-id"
}
```

---

## 🅵️ UI/UX & Komponen

### 🎨 Desain UI/UX

Halaman Manajemen Modul terdiri dari:

- **Header** dengan judul dan tombol "Tambah Modul"
- **Area Pencarian dan Filter** untuk memudahkan pencarian dan penyaringan modul
- **DataTable** yang menampilkan daftar modul dengan kolom:
  - Judul
  - Deskripsi (dengan fitur expand/collapse)
  - Status (dengan badge berwarna)
  - Tanggal Dibuat
  - Aksi (Edit, Hapus)
- **Pagination Control** untuk navigasi antar halaman
- **Modal Form** untuk operasi CRUD
- **Aksesibilitas** untuk kemudahan navigasi keyboard dan screen reader [update+2025-06-28]
- **Keyboard Shortcuts** untuk akses cepat ke fitur utama [update+2025-06-28]

### 🏗️ Komponen Utama

1. **ModuleTable**: Komponen utama yang mengintegrasikan semua fitur datatable.

   - **DataTable**: Menampilkan data dalam bentuk tabel dengan kolom yang dapat disesuaikan.
   - **SearchAndFilter**: Komponen untuk pencarian dan penyaringan data.
   - **PaginationControls**: Kontrol untuk navigasi antar halaman.

2. **ModuleFormModal**: Modal untuk operasi Create dan Edit modul.

   - Validasi form dengan react-hook-form dan zod.
   - Sanitasi input untuk mencegah XSS.

3. **ErrorNotifier**: Komponen untuk menampilkan pesan error secara konsisten.

4. **Komponen Aksesibilitas (A11y)**: [update+2025-06-28]
   - **A11yAnnouncer**: Komponen untuk mengumumkan perubahan status ke screen reader.
   - **FocusTrap**: Komponen untuk mengelola fokus dalam modal/dialog.
   - **SkipLink**: Komponen untuk navigasi cepat dengan keyboard.

---

## 🅶️ Kebutuhan Teknis

### 🏗️ Library & Teknologi

- **Backend**: Next.js API Routes, Prisma, Zod
- **Database**: PostgreSQL
- **Frontend**: React, shadcn/ui, Tailwind CSS
- **State Management**: React Query
- **Form Management**: react-hook-form dengan Zod
- **Notifikasi**: Sonner
- **Keamanan**: DOMPurify
- **Testing**: Jest, React Testing Library, Playwright
- **Reporting**: Custom Reporter untuk Unit, Integration, dan E2E Testing

### ⚙️ Konfigurasi Khusus

- **Environment Variables**:
  - `DATABASE_URL`: URL koneksi database PostgreSQL
  - `JWT_SECRET`: Secret untuk JWT (untuk otorisasi)

---

## 🅷️ Testing

### 🧪 Rencana Pengujian

- **Unit Testing**: Menggunakan Jest untuk menguji fungsi dan komponen secara terisolasi.
- **Integration Testing**: Menguji interaksi antar komponen dan integrasi dengan API.
- **End-to-End Testing**: Menggunakan Playwright untuk menguji alur pengguna dari awal hingga akhir.

### 📊 Skema Pengujian

- **Unit Testing**:

  - **Komponen UI**: Memastikan rendering dan interaksi yang benar.
  - **Hooks**: Memastikan logika bisnis yang benar.
  - **Utility Functions**: Memastikan fungsi-fungsi utilitas berfungsi dengan benar.

- **Integration Testing**:

  - **API Integration**: Memastikan integrasi dengan API berfungsi dengan benar.
  - **Component Integration**: Memastikan interaksi antar komponen berfungsi dengan benar.
  - **Form Validation**: Memastikan validasi form berfungsi dengan benar.
  - **XSS Prevention**: Memastikan sanitasi input berfungsi dengan benar.

- **End-to-End Testing**:
  - **CRUD Flow**: Memastikan alur CRUD berfungsi dengan benar dari perspektif pengguna.
  - **Validation**: Memastikan validasi form berfungsi dengan benar pada level UI.
  - **Error Handling**: Memastikan penanganan error berfungsi dengan benar.

### 📑 Reporting

- **Unit & Integration Testing**: Menggunakan SimpleJsonReporter untuk menghasilkan laporan dalam format JSON.
- **E2E Testing**: Menggunakan custom Playwright reporter untuk menghasilkan laporan dalam format JSON yang kompatibel dengan SimpleJsonReporter.
- **Format Report**: Berisi informasi tentang test yang dijalankan, status (pass/fail), dan pesan error jika ada.

---

## 🅸️ Potensi Perkembangan

### 🚀 Fitur Tambahan

- **Version Control**: Menambahkan fitur version control untuk modul.
- **Real-Time Status Propagation**: Memperbarui status modul secara real-time.
- **Enhanced Metadata**: Menambahkan metadata tambahan untuk modul.
- **Queryable Audit Trail**: Meningkatkan audit trail dengan tabel queryable.
- **Batch Operations**: Menambahkan fitur untuk operasi batch pada modul.

### 📈 Saran Optimasi

- **Caching**: Menambahkan caching untuk meningkatkan performa.
- **Rate Limiting**: Menambahkan rate limiting untuk mencegah abuse.
- **Pagination Optimization**: Mengoptimalkan pagination untuk dataset besar.
- **Image Optimization**: Menambahkan dukungan untuk gambar dan optimasinya.

---

🚀 **Dokumentasi ini akan terus diperbarui sesuai dengan perkembangan proyek!**

### 🚀 Fitur Terbaru

- **E2E Testing**: Implementasi E2E testing menggunakan Playwright untuk menguji alur pengguna.
- **Custom Reporter**: Implementasi custom reporter untuk E2E testing yang kompatibel dengan SimpleJsonReporter.
- **Datatable dengan Fitur Lengkap**: Implementasi datatable dengan pagination, sorting, filtering, dan searching yang dioptimalkan.
- **Sanitasi XSS**: Implementasi sanitasi input dan output untuk mencegah serangan XSS.

### 🛡️ Keamanan & Validasi

- **Input Sanitasi**:
  - Gunakan DOMPurify untuk membersihkan input HTML
  - Mencegah eksekusi script berbahaya
  - Mempertahankan struktur HTML dasar

### 📊 Manajemen State

- **React Query Hooks**:
  - `useModuleQuery`: Fetch dan mutasi data modul
  - Dukungan caching dan optimistic updates
  - Penanganan loading dan error states

### 🔔 Notifikasi & Feedback

- **Toast Notifications**:
  - Tampilkan feedback untuk setiap operasi CRUD
  - Konfigurasi pesan sukses dan error
  - Integrasi dengan React Query

### 📋 Daftar Komponen Terkait

- `ModuleFormModal`: Form input modul dengan sanitasi
- `DataTableWithFeatures`: Tabel modul dengan fitur sorting dan filtering
- `ErrorNotifier`: Komponen penanganan error
- `useModuleMutation`: Hook untuk operasi CRUD

### 🧪 Testing Komprehensif

- **Unit Test**:
  - 65+ unit test untuk komponen, hooks, services, dan utils
  - Test coverage > 90%
- **Integration Test**:
  - 30+ integration test untuk memastikan integrasi antar komponen
  - Test untuk XSS prevention, auth, validation, dan performance
- **E2E Test**:
  - Test untuk CRUD flow
  - Test untuk form validation
  - Test untuk error handling
  - Custom reporter untuk JSON reporting

### 🔍 Performa & Optimasi

- **Debounce pada Pencarian**: Mencegah request berlebihan saat user mengetik
- **Virtual Scrolling**: Optimasi rendering untuk dataset besar
- **Optimistic Update**: Meningkatkan UX dengan mengupdate UI sebelum request selesai
- **Keyboard Navigation**: Meningkatkan efisiensi dengan shortcut keyboard [update+2025-06-28]
- **A11y Optimization**: Meningkatkan aksesibilitas untuk semua pengguna [update+2025-06-28]
