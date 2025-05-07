# Task OPS-140: Manajemen Konten Multi-Page

**Assignee:** `@backend-frontend-dev`  
**Reviewer:** `@modul-reviewer`  
**Deadline:** `5 April 2025`  
**Story Points:** `8` (kompleksitas tinggi)  
**Dependencies:**

- Endpoint CRUD modul & metadata (API Next.js)
- Database schema modul (Prisma)
- UI/UX multi-page (Figma/Design System)
- Middleware autentikasi admin (Clerk)

---

## Deskripsi Task

Mengimplementasikan fitur manajemen konten multi-page pada modul pembelajaran. Admin dapat membuat, mengedit, menghapus, dan mengelola halaman konten (teori & kode) sebagai bagian dari satu modul. Setiap halaman memiliki metadata (judul, tipe, urutan, dsb) dan dapat diatur secara dinamis.

**Tujuan:**

1. Memungkinkan admin mengelola struktur dan isi modul secara fleksibel.
2. Mendukung tipe konten berbeda (teori, kode, quiz, dsb).
3. Menjamin validasi, audit trail, dan feedback real-time di UI.

---

## Breakdown Subtask

### 1. **Desain & Implementasi Model Database** _(1 Hari)_

- Tambahkan relasi antara modul dan halaman (one-to-many).
- Field: `id`, `moduleId`, `title`, `type`, `order`, `content`, `createdAt`, `updatedAt`.
- Enum untuk tipe halaman (`THEORY`, `CODE`, `QUIZ`).

### 2. **API CRUD Multi-Page** _(2 Hari)_

- Endpoint: `POST /api/modules/:id/pages` (create), `PUT /api/pages/:id` (update), `DELETE /api/pages/:id` (delete), `GET /api/modules/:id/pages` (list).
- Validasi input dengan Zod.
- Middleware autentikasi & otorisasi admin.
- Audit trail untuk setiap operasi CRUD.

### 3. **Integrasi UI Multi-Page** _(2 Hari)_

- Komponen form CRUD halaman (modal atau inline form).
- Daftar halaman dengan drag & drop untuk urutan.
- Indikator status simpan & notifikasi sukses/error.
- Integrasi dengan React Query untuk data fetching & mutasi.

#### Contoh Struktur Komponen:

```tsx
<ModulePagesManager moduleId={id} />
// di dalamnya:
<PageList pages={pages} onReorder={handleReorder} />
<PageForm onSubmit={handleCreateOrUpdate} />
```

### 4. **Testing & Validasi** _(1 Hari)_

- Unit test untuk fungsi CRUD halaman.
- Integration test untuk API & UI.
- E2E test untuk alur admin mengelola halaman modul.

### 5. **Dokumentasi & User Guide** _(0.5 Hari)_

- Update README/module docs untuk instruksi penggunaan fitur multi-page.
- Contoh payload API & skenario penggunaan.

---

## Acceptance Criteria

- [x] Admin dapat membuat, mengedit, menghapus halaman konten pada modul.
- [x] Setiap halaman memiliki metadata (judul, tipe, urutan, dsb).
- [x] Perubahan halaman langsung terlihat di UI (real-time update).
- [x] Validasi input & error handling berjalan baik.
- [x] Audit trail mencatat setiap perubahan.
- [x] UI mendukung drag & drop urutan halaman.
- [x] Unit, integration, dan E2E test coverage minimal 80%.

---

## Catatan Penting

1. **Error Handling:**
   - Tampilkan notifikasi error/sukses di UI (toast/snackbar).
   - Validasi input wajib (judul min 5 karakter, tipe valid, dsb).
2. **Performance:**
   - Optimalkan query database untuk list halaman.
   - Gunakan virtualisasi jika jumlah halaman banyak.
3. **Accessibility (A11y):**
   - Pastikan form dan drag & drop dapat diakses keyboard.
   - Tambahkan ARIA label pada elemen interaktif.
4. **Testing:**
   - Terapkan TDD, prioritaskan test untuk validasi, urutan, dan event handler.
   - Gunakan mock API untuk integration test.

---

## Referensi

- [OPS-140 (Jira)](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-140)
- [React Query](https://tanstack.com/query/latest)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Zod Validation](https://zod.dev/)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-relations)
