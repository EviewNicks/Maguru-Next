# 📌 Dokumentasi Modul: Manajemen Modul Akademik

---

## 🅰️ Pendahuluan Modul / Overview

### 🎯 Tujuan Modul

Modul Manajemen Modul Akademik bertujuan untuk menyediakan sistem pengelolaan materi pembelajaran yang dinamis dan terstruktur bagi admin dan mahasiswa. Modul ini memungkinkan admin untuk membuat, mengedit, mengarsipkan, dan mengaktifkan materi pembelajaran, sementara mahasiswa dapat mengakses modul yang berstatus ACTIVE.

### 👤 Target Pengguna

- **Admin**: Pengelola konten pembelajaran yang memiliki akses penuh untuk CRUD operasi pada modul.
- **Mahasiswa**: Pengguna yang hanya dapat mengakses modul dengan status ACTIVE.

### 📅 Informasi Sprint & Timeline

| Fitur                           | Sprint   | Tanggal Implementasi | Update Terakhir                                       |
| ------------------------------- | -------- | -------------------- | ----------------------------------------------------- |
| Backend API CRUD Modul Akademik | Sprint 2 | 2025-03-17           | 2025-03-17 – Implementasi Backend API CRUD            |

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
    │   ├── ModuleFormModal.tsx
    │   ├── ModuleFormModal.test.tsx
    │   ├── ModuleDataTable.tsx
    │   ├── ModuleDataTable.test.tsx
    │   ├── ModuleStatusBadge.tsx
    │   └── ModuleStatusBadge.test.tsx
    ├── hooks/
    │   ├── useModules.ts
    │   └── useModules.test.ts
    ├── services/
    │   ├── moduleService.ts
    │   └── moduleService.test.ts
    ├── types/
    │   └── index.ts
    ├── utils/
    │   ├── moduleValidation.ts
    │   └── moduleValidation.test.ts
    └── __tests__/
        ├── unit/
        ├── integration/
        └── e2e/

pages/
└── api/
    └── module/
        ├── index.ts
        ├── [id].ts
        └── __tests__/
            ├── index.test.ts
            └── [id].test.ts
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

### 🛠️ Penjelasan Fungsi

- **CRUD Modul Akademik**: Admin dapat membuat, membaca, memperbarui, dan menghapus modul akademik.
- **Manajemen Status Modul**: Modul memiliki tiga status: DRAFT (pengembangan), ACTIVE (tersedia untuk mahasiswa), dan ARCHIVED (tidak tersedia).
- **Validasi Input**: Menggunakan Zod untuk memvalidasi input dengan ketat.
- **Middleware Otorisasi**: Memastikan hanya admin yang dapat melakukan operasi CRUD.
- **Audit Trail**: Mencatat setiap operasi CRUD dengan informasi user, action, dan timestamp.
- **Error Handling**: Mengembalikan pesan error yang terstruktur dan informatif.

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

| Endpoint                | Metode | Deskripsi                                                |
| ----------------------- | ------ | -------------------------------------------------------- |
| `/api/module`           | GET    | Mengambil daftar modul dengan pagination, filter, search |
| `/api/module`           | POST   | Membuat modul baru                                       |
| `/api/module/:id`       | GET    | Mengambil detail modul berdasarkan ID                    |
| `/api/module/:id`       | PUT    | Memperbarui modul berdasarkan ID                         |
| `/api/module/:id`       | DELETE | Menghapus modul berdasarkan ID                           |

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

Untuk Langkah 1, fokus pada implementasi backend API CRUD. UI/UX akan diimplementasikan pada Langkah 2.

### 🏗️ Komponen Utama

Komponen utama akan diimplementasikan pada Langkah 2.

---

## 🅶️ Kebutuhan Teknis

### 🏗️ Library & Teknologi

- **Backend**: Next.js API Routes, Prisma, Zod
- **Database**: PostgreSQL
- **Validasi**: Zod
- **Logging**: Winston atau Pino
- **Testing**: Jest, Supertest

### ⚙️ Konfigurasi Khusus

- **Environment Variables**:
  - `DATABASE_URL`: URL koneksi database PostgreSQL
  - `JWT_SECRET`: Secret untuk JWT (untuk otorisasi)

---

## 🅷️ Testing

### 🧪 Rencana Pengujian

- **Unit Testing**: Menggunakan Jest untuk menguji fungsi dan komponen secara terisolasi.
- **Integration Testing**: Menggunakan Supertest untuk menguji endpoint API.
- **End-to-End Testing**: Menggunakan Cypress untuk menguji interaksi pengguna dengan UI.

### 📊 Skema Pengujian

- **Functional Testing**: Menguji semua operasi CRUD dengan valid/invalid input.
- **Security Testing**: Memeriksa akses ilegal (non-admin), sanitasi input, dan error handling.
- **Performance Testing**: Load test GET /api/module dengan 10.000 data.
- **Audit Trail Testing**: Verifikasi log operasi CRUD di file Winston/Pino.

---

## 🅸️ Potensi Perkembangan

### 🚀 Fitur Tambahan

- **Version Control**: Menambahkan fitur version control untuk modul.
- **Real-Time Status Propagation**: Memperbarui status modul secara real-time.
- **Enhanced Metadata**: Menambahkan metadata tambahan untuk modul.
- **Queryable Audit Trail**: Meningkatkan audit trail dengan tabel queryable.

### 📈 Saran Optimasi

- **Caching**: Menambahkan caching untuk meningkatkan performa.
- **Rate Limiting**: Menambahkan rate limiting untuk mencegah abuse.
- **Pagination Optimization**: Mengoptimalkan pagination untuk dataset besar.

---

🚀 **Dokumentasi ini akan terus diperbarui sesuai dengan perkembangan proyek!**
