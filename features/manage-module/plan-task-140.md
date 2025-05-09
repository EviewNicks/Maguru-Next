# Planning Task OPS-140: Manajemen Konten Multi-Page

## 1. Ringkasan Tujuan

- Mengimplementasikan fitur manajemen konten multi-page pada modul pembelajaran.
- Admin dapat membuat, mengedit, menghapus, dan mengelola halaman konten (teks, kode, gambar, video) secara dinamis dalam satu modul.
- Setiap halaman dapat diisi dengan berbagai tipe konten menggunakan slash command (misal: `/image`, `/code`) seperti di Confluence/Notion.
- Editor mendukung markdown dan toolbar sederhana untuk formatting dasar.
- Navigasi antar halaman tersedia di RightSidebar/bagian bawah.
- Batasan upload gambar maksimal 2MB/file dan video maksimal 20MB/file.
- Semua perubahan halaman langsung terlihat di UI.

## 2. Langkah-Langkah Teknis

### A. Database & Model

- Update skema Prisma:
  - Tambahkan tabel `ModulePage` (relasi one-to-many ke `Module`)
  - Field: `id`, `moduleId`, `title`, `order`, `content`, `createdAt`, `updatedAt`
- Jalankan migrasi database

### B. API Backend

- Buat/Update API route:
  - `POST /api/modules/:id/pages` (create page)
  - `GET /api/modules/:id/pages` (list pages)
  - `PUT /api/pages/:id` (update page)
  - `DELETE /api/pages/:id` (delete page)
- Validasi input dengan Zod
- Middleware autentikasi admin
- Integrasi dengan audit trail (future task, log sederhana dulu)

### C. Frontend UI/UX

- **Halaman Khusus Multi-Page Editor**
  - Route: `/manage-module/[moduleId]/pages`
  - Komponen utama: `ModulePagesManager`
- **Komponen Utama**
  - `PageList` (daftar & navigasi halaman di RightSidebar/bawah)
  - `PageEditor` (editor konten markdown, toolbar, slash command)
  - `PageForm` (form judul halaman, validasi)
  - `ImageUpload` (batasan 2MB/file)
  - `VideoUpload` (batasan 20MB/file)
- **Integrasi**
  - React Query untuk fetch/mutasi data
  - Notifikasi sukses/error (toast/snackbar)
  - Loading state & error handling

### D. Validasi & Batasan

- Validasi judul halaman (minimal 5 karakter)
- Validasi ukuran file gambar/video
- Validasi konten markdown

### E. Testing

- Unit test untuk fungsi utama (form, editor, API handler)
- Integration test untuk alur CRUD halaman
- E2E test untuk user flow admin mengelola halaman

### F. Dokumentasi

- Update dokumentasi modul & user guide
- Contoh payload API & skenario penggunaan

## 3. Estimasi File/Komponen yang Perlu Diubah/Dibuat

### Backend

- `prisma/schema.prisma`
- `app/api/modules/[id]/pages/route.ts`
- `app/api/pages/[id]/route.ts`
- `lib/validation/modulePageSchema.ts`
- `middleware.ts` (jika perlu update otorisasi)

### Frontend

- `features/manage-module/pages/ModulePagesManager.tsx`
- `features/manage-module/pages/PageList.tsx`
- `features/manage-module/pages/PageEditor.tsx`
- `features/manage-module/pages/PageForm.tsx`
- `features/manage-module/pages/ImageUpload.tsx`
- `features/manage-module/pages/VideoUpload.tsx`
- `features/manage-module/services/modulePageService.ts`
- `features/manage-module/types/modulePageTypes.ts`
- `features/manage-module/hooks/useModulePages.ts`
- `features/manage-module/__tests__/` (unit, integration, e2e)

### Dokumentasi

- `features/manage-module/module-docs.md`
- `docs/implementation-plan/sprint-4/story-143/task-ops-140.md`

---

**Catatan:**

- Fitur drag & drop urutan halaman, quiz page, preview, audit trail detail, import/export, duplikasi, dan versioning akan dikerjakan di future task (sudah dicatat di backlog).
- Prioritaskan TDD: tulis test sebelum implementasi kode.
- Gunakan komponen shadcn/ui dan ikuti guideline frontend & backend project.
