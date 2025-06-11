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
