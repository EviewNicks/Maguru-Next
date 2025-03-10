# Manajemen Modul Akademik

## Overview

**Nama Fitur:** Manajemen Modul Akademik  
**Sprint:** Sprint 2  
**Tanggal Mulai:** 2025-03-10  
**Tanggal Target Selesai:** 2025-03-14

### Deskripsi

Fitur ini memungkinkan admin untuk mengelola materi pembelajaran secara dinamis melalui operasi CRUD dan pengaturan status modul. Dengan validasi input yang ketat, otorisasi berbasis token, audit trail komprehensif, dan notifikasi real-time, admin dapat memperbarui konten modul kapan saja. Mahasiswa hanya dapat mengakses modul dengan status yang valid (misalnya, hanya modul dengan status **ACTIVE**).

---

## Pre-Requisites

### Backend:

- **Next.js API Routes**
- **Prisma** dengan model yang menggunakan `enum` untuk status modul
- **Zod** untuk validasi input
- Middleware otorisasi yang memeriksa token  
  _Contoh:_ `req.user.role === "ADMIN"`
- Logging framework (_contoh_: Winston atau Pino) untuk audit trail
- Database transactions untuk operasi update/delete

### Frontend:

- **Next.js** dengan **React**
- **Tailwind CSS** dan **shadcn/ui** untuk tampilan antarmuka
- **React Query** _(dengan `react-hook-form` dan `@hookform/resolvers/zod` untuk validasi real-time)_
- Notifikasi real-time (_toast/snackbar_) untuk feedback UI

### Testing Tools:

- **Jest** untuk unit testing
- **Cypress** untuk E2E testing

---

### Dokumentasi Module docs Manajemen Modul akademik

_Lokasi:_ `documentation/task/module/t2-manajemen-modul-akademik.md`

# Step-By-Step Plan

## Langkah/task 1: Backend API CRUD untuk Modul Akademik

🔗 [JIRA Ticket: OPS-28](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-28)

Membangun endpoint CRUD dasar untuk mengelola modul akademik. Implementasi ini mencakup:

- **Validasi input yang ketat**
- **Middleware otorisasi**
- **Penanganan error terstandarisasi**
- **Pencatatan audit trail dasar** (untuk keperluan debugging)

✅ **Optimasi tambahan:**

- Shared validation middleware untuk efisiensi
- Penambahan indeks di database guna meningkatkan performa dan konsistensi

# Module CRUD API Implementation

## 1.1 Model Database & Index

### Definisi Model

Definisikan model `Module` di Prisma dengan enum untuk status dan audit trail:

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

**Catatan:** Indeks pada kolom `status` dan `title` ditambahkan untuk mendukung query filtering dan pagination yang efisien, terutama jika data mencapai >10.000 modul.

---

## 1.2 Endpoint API CRUD

### Endpoint yang Dibuat

Buat endpoint di `pages/api/module` untuk operasi berikut:

- `POST /api/module`: Membuat modul baru.
- `GET /api/module`: Mengambil daftar modul (dengan dukungan query untuk pagination, filter, dan search).
- `PUT /api/module/:id`: Mengupdate modul.
- `DELETE /api/module/:id`: Menghapus modul.

### Shared Validation Middleware

Gunakan middleware bersama untuk validasi input agar tidak perlu menduplikasi kode di setiap endpoint:

```typescript
// utils/validateRequest.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

export const validateRequest =
  (schema: z.ZodSchema) =>
  (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error: any) {
      res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
  }
```

---

## 1.3 Validasi Input dengan Zod

### Schema Validasi

Terapkan schema validasi yang ketat menggunakan Zod, mencakup panjang minimal dan maksimal untuk `title` serta validasi enum untuk `status`:

```typescript
// schema.zod.ts
import { z } from 'zod'

export const ModuleSchema = z.object({
  title: z
    .string()
    .min(5, 'Judul minimal 5 karakter')
    .max(100, 'Judul maksimal 100 karakter'),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
})
```

**Catatan:** Middleware validasi yang telah dibuat (pada sub-langkah 1.2) akan menggunakan schema ini untuk memeriksa setiap request.

---

## 1.4 Middleware Otorisasi

### Implementasi Middleware

Pastikan endpoint `POST`, `PUT`, dan `DELETE` hanya diakses oleh admin:

```typescript
// middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next'

export const isAdmin = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  if (req.user && req.user.role === 'ADMIN') {
    next()
  } else {
    res
      .status(403)
      .json({ error: 'Forbidden: Hanya admin yang diperbolehkan.' })
  }
}
```

**Catatan:** Token otorisasi harus terintegrasi sehingga `req.user` sudah terisi berdasarkan verifikasi JWT.

---

## 1.5 Error Handling Terstruktur

### Standarisasi Error Response

Terapkan pola error response yang konsisten:

```typescript
interface ErrorResponse {
  error: {
    code: string // Contoh: "MODULE_404", "AUTH_403"
    message: string
    details?: string
  }
}
```

Setiap endpoint harus mengembalikan pesan error spesifik dari Zod jika validasi gagal atau detail error database jika terjadi kegagalan operasi, dengan fallback "Terjadi kesalahan, coba lagi" jika detail tidak tersedia.

---

## 1.6 Audit Trail Dasar (Logging ke File)

### Middleware Audit

Gunakan logging framework (misalnya, Winston atau Pino) untuk mencatat setiap operasi CRUD:

```typescript
// middleware/audit.ts
import logger from './logger' // Misalnya, konfigurasi Winston

export const auditMiddleware = (req: any, res: any, next: () => void) => {
  // Misal, isi createdBy atau updatedBy sudah di-set oleh otorisasi
  logger.info(
    JSON.stringify({
      user: req.user?.id,
      action: req.method,
      path: req.url,
      timestamp: new Date().toISOString(),
    })
  )
  next()
}
```

**Catatan:** Pencatatan ini untuk keperluan debugging dan akan diperluas menjadi tabel `ModuleAudit` di Langkah 9.

# Dependencies & Prasyarat

## Frontend

- **Framework & UI**:
  - Next.js, React, Tailwind CSS, shadcn/ui
- **Manajemen Data & HTTP Client**:
  - React Query untuk manajemen data API
  - Axios untuk HTTP client (dengan interceptor untuk error handling)
- **Validasi Form**:
  - react-hook-form dan @hookform/resolvers/zod untuk validasi form
- **Optimasi Rendering**:
  - Virtual scrolling library (misalnya, `@tanstack/react-virtual`)
- **Notifikasi & Error Handling**:
  - ShadcnUI toast atau Sonner untuk notifikasi
  - Axios (atau fetch) dengan interceptor error handling
- **Keamanan & Sanitasi**:
  - DOMPurify untuk sanitasi output
- **Opsional**:
  - lodash.debounce (jika tidak menggunakan implementasi debounce kustom)

## Backend

- **Endpoint yang responsif** untuk pagination, filter, dan sorting

---

# Dependencies & Prasyarat (Versi Singkat)

## Backend

- **Framework**: Next.js API Routes (Node.js)
- **Database & ORM**: PostgreSQL dengan Prisma
  - Konfigurasi `DATABASE_URL`
  - Indeks pada `status` & `title`
- **Validasi**:
  - **Zod** (schema validasi shared)
  - **Shared validation middleware**
- **Otentikasi & Otorisasi**:
  - JWT / Next-Auth untuk mengisi `req.user`
  - Middleware custom (`isAdmin`)
- **Logging & Audit**:
  - Winston atau Pino untuk audit trail dasar
- **Error Handling**:
  - Standarisasi error response `{ error: { code, message, details } }`
- **Pengujian**:
  - Jest (unit testing)
  - ESLint & Prettier untuk kualitas kode

---

# Acceptance Criteria

## Sub-Langkah & Kriteria Keberhasilan

### **1.1. Model Database**

✅ Model `Module` terdefinisi dengan:

- **Enum `ModuleStatus`**
- **Field `createdBy` / `updatedBy`**
- **Indeks pada `status` dan `title`**

### **1.2. Endpoint API**

✅ Endpoint CRUD berfungsi dengan fitur:

- Query untuk **pagination, filter, dan search**
- Menggunakan **shared validation middleware**

### **1.3. Validasi Input**

✅ Input divalidasi dengan **Zod**:

- **Judul**: 5-100 karakter
- **Status** sesuai enum

### **1.4. Middleware**

✅ **Hanya admin** yang dapat mengakses **POST/PUT/DELETE** berdasarkan token otorisasi.

### **1.5. Error Handling**

✅ Error response terstandarisasi:

- **Kode & pesan jelas**
- **Fallback message** jika detail tidak tersedia

### **1.6. Audit Trail**

✅ Setiap operasi CRUD tercatat melalui middleware audit dengan:

- **Logging ke file**
- **Informasi user, action, dan timestamp**

---

# Catatan Tambahan

### **Indeks Database**

⚡ **Indeks pada `status` dan `title` sangat krusial** untuk performa query pada dataset besar.

### **Shared Validation Middleware**

✅ **Mengurangi duplikasi kode validasi** dan memastikan **konsistensi pemeriksaan input**.

### **Audit Trail**

📝 Untuk **MVP**, audit trail masih berupa **logging ke file**.  
🔜 **Langkah 9** akan meningkatkan audit trail dengan **tabel queryable**.

### **Concurrency Control**

🔄 **Pengendalian race condition** akan ditambahkan di langkah selanjutnya (misalnya, dengan **optimistic locking**).

---

## **Langkah 2: Implementasi Halaman Manajemen Modul di Frontend**

🔗 [OPS-29](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-29)

Membangun halaman admin untuk manajemen modul dengan **datatable** yang mendukung:

- **Pagination, sorting, pencarian, dan filter**
- **Validasi real-time** (menggunakan `react-hook-form` + `Zod`)
- **Form modal CRUD** untuk tambah/edit modul
- **Integrasi API via React Query**
- **Notifikasi & error handling yang konsisten**

📌 **Optimasi tambahan:**  
✅ Virtual scrolling & debounce untuk skala data besar  
✅ Sanitasi output deskripsi untuk mencegah XSS

---

## **Langkah 3: Pengelolaan Status Modul**

🔗 [OPS-133](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-133)

Memungkinkan **admin** untuk mengubah status modul melalui UI, serta memastikan **mahasiswa hanya dapat mengakses modul dengan status ACTIVE**.

📌 **Fitur utama:**  
✅ **Validasi input** melalui `Zod`  
✅ **Enum status yang konsisten** antara frontend & backend  
✅ **Optimistic update** di UI agar perubahan terasa instan  
✅ **Middleware backend** untuk memastikan hanya modul ACTIVE yang bisa diakses  
✅ **Audit trail** mencatat setiap perubahan status  
✅ **Notifikasi real-time** ke admin setelah perubahan status

---

## **Langkah 4: Implementasi Version Control untuk Modul**

🔗 [OPS-134](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-134)

Menerapkan mekanisme **versioning** untuk mendukung **rollback** dan **audit trail** pada modul akademik.

📌 **Fitur utama:**  
✅ **Tabel ModuleVersion** untuk menyimpan perubahan secara atomik  
✅ **Deteksi perubahan** menggunakan hash  
✅ **Concurrency handling** dengan optimistic locking  
✅ **Strategi pruning** untuk mengontrol pertumbuhan tabel versi

---

## **Langkah 5: Real-Time Status Propagation**

🔗 [OPS-135](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-135)

📌 **Tujuan:**  
✅ Mengirimkan **update status modul secara real-time** ke frontend  
✅ Mahasiswa selalu mendapatkan **data terkini tanpa refresh manual**

---

## **Langkah 6: Enhanced Security**

🔗 [OPS-136](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-136)

📌 **Keamanan tambahan:**  
✅ **Sanitasi input** untuk mencegah serangan XSS  
✅ **Client-side guard** untuk mencegah akses ilegal

---

## **Langkah 7: Optimasi Performa**

🔗 [OPS-137](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-137)

📌 **Tujuan:**  
✅ **Mengurangi beban database** melalui caching  
✅ **Meningkatkan responsivitas** dengan pengujian beban

---

## **Langkah 8: Testing & Debugging**

🔗 [OPS-139](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-139)

📌 **Metode pengujian:**  
✅ **Unit testing** untuk fungsi kecil  
✅ **Integration testing** untuk memastikan API bekerja dengan baik  
✅ **End-to-End (E2E) testing** untuk memverifikasi alur aplikasi  
✅ Memastikan validasi, otorisasi, dan error handling berjalan dengan baik

---

## **Langkah 9: Audit Trail Queryable**

🔗 [OPS-134](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-134)

📌 **Tujuan:**  
✅ Menyimpan **log audit** secara terstruktur di tabel terpisah  
✅ Mendukung **analitik dan pelacakan perubahan** modul

---|---

# ✅ Acceptance Criteria

- Admin dapat **membuat, membaca, mengupdate, dan menghapus** modul melalui UI.
- **Validasi input** bekerja dengan ketat:
  - **Judul** minimal **5 karakter**.
  - **Status** hanya bisa berupa nilai valid (`DRAFT`, `ACTIVE`, dll.).
- **Modul baru** secara default memiliki status `DRAFT`, dan hanya modul dengan status `ACTIVE` yang dapat diakses oleh mahasiswa.
- **Audit trail** mencatat semua operasi CRUD dengan lengkap, termasuk:
  - `createdBy`, `updatedBy`, dan `timestamp`.
- **Pagination, sorting, pencarian, dan filter** di datatable berjalan optimal.
- **Notifikasi** error dan sukses (`toast/snackbar`) muncul sesuai operasi yang dilakukan.
- Semua **endpoint dilindungi oleh middleware otorisasi**, memastikan hanya **admin** yang dapat mengakses operasi kritikal.

---

# 🛠 Task Ownership & Collaboration

- **Task Owner**: _[Nama Developer/TIM Backend & Frontend]_
- **Reviewer**: _[Nama QA/TIM Reviewer]_
- **Komunikasi**: Slack/Discord – Channel `#manajemen_modul`

---

# 🚀 Catatan Tambahan

### 🔥 Optimasi Performa

✅ Gunakan **server-side pagination** atau **infinite scroll** jika jumlah modul sangat besar.  
✅ Atur `staleTime` dan `cacheTime` di **React Query** untuk menghindari request berulang yang tidak perlu.

### 🔒 Keamanan

✅ Terapkan **rate limiting** _(misalnya, 10 request/menit)_ pada endpoint admin.  
✅ **Sanitize input** menggunakan `DOMPurify` untuk mencegah **XSS**.

### ♻️ Reduksi Redundansi

✅ Gunakan **React Query** sebagai state management untuk menghindari ketergantungan berlebih pada Redux.  
✅ **Standardisasi error response** dengan format JSON berikut:

```json
{
  "error": {
    "code": "MODULE_404",
    "message": "Modul tidak ditemukan",
    "details": "ID modul: 123 tidak valid"
  }
}
```
