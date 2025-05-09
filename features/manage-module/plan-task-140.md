# Planning Task OPS-140: Manajemen Konten Multi-Page

## 1. Ringkasan Tujuan

- Mengimplementasikan fitur manajemen konten multi-page pada modul pembelajaran.
- Admin dapat membuat, mengedit, menghapus, dan mengelola halaman konten secara dinamis dalam satu modul.
- **Setiap halaman dapat berisi berbagai tipe konten (teks, kode, gambar, video) secara fleksibel dalam satu halaman yang sama.**
- Editor mendukung penambahan blok konten menggunakan slash command (misal: `/image`, `/code`) seperti di Confluence/Notion.
- Blok teks mendukung format markdown dan toolbar sederhana untuk formatting dasar.
- Navigasi antar halaman tersedia di RightSidebar/bagian bawah.
- Batasan upload gambar maksimal 2MB/file dan video maksimal 20MB/file.
- Semua perubahan halaman langsung terlihat di UI.

## 2. Langkah-Langkah Teknis

### A. Database & Model [update+2024-06-14]

- Update skema Prisma:
  - Tambahkan tabel `ModulePage` (relasi one-to-many ke `Module`)
  - Field: `id`, `moduleId`, `title`, `order`, `content` (sebagai JSON), `createdAt`, `updatedAt`
  - Field `content` menyimpan array dari blok konten dengan struktur:
    ```json
    [
      {
        "type": "text",
        "content": "<p>Konten HTML/markdown</p>"
      },
      {
        "type": "code",
        "content": "function example() { return 'hello'; }",
        "language": "javascript"
      },
      {
        "type": "image",
        "content": "https://url-to-image.jpg",
        "caption": "Deskripsi gambar"
      }
    ]
    ```
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
  - `BlockEditor` (editor untuk setiap blok konten dengan toolbar yang sesuai)
  - `PageEditor` (container untuk semua blok dalam halaman)
  - `SlashCommandMenu` (menu untuk menambahkan blok konten baru)
  - `PageForm` (form judul halaman, validasi)
  - `ImageUpload` (batasan 2MB/file)
  - `VideoUpload` (batasan 20MB/file)
- **Integrasi**
  - React Query untuk fetch/mutasi data
  - Notifikasi sukses/error (toast/snackbar)
  - Loading state & error handling

### D. Validasi & Batasan

- Validasi judul halaman (minimal 5 karakter)
- Validasi blok konten (minimal 1 blok)
- Validasi ukuran file gambar/video
- Validasi format konten untuk setiap tipe blok

### E. Testing

- Unit test untuk fungsi utama (form, editor, API handler)
- Integration test untuk alur CRUD halaman
- E2E test untuk user flow admin mengelola halaman

### F. Dokumentasi

- Update dokumentasi modul & user guide
- Contoh payload API & skenario penggunaan

## 3. Estimasi File/Komponen yang Perlu Diubah/Dibuat

### Backend

- `prisma/schema.prisma` [update+2024-06-14]
- `app/api/modules/[id]/pages/route.ts`
- `app/api/pages/[id]/route.ts`
- `lib/validation/modulePageSchema.ts` [update+2024-06-14]
- `middleware.ts` (jika perlu update otorisasi)

### Frontend

- `features/manage-module/pages/ModulePagesManager.tsx`
- `features/manage-module/pages/PageList.tsx`
- `features/manage-module/pages/PageEditor.tsx`
- `features/manage-module/pages/BlockEditor.tsx`
- `features/manage-module/pages/SlashCommandMenu.tsx`
- `features/manage-module/pages/PageForm.tsx`
- `features/manage-module/pages/ImageUpload.tsx`
- `features/manage-module/pages/VideoUpload.tsx`
- `features/manage-module/services/modulePageService.ts`
- `features/manage-module/types/modulePageSchema.ts` [update+2024-06-14]
- `features/manage-module/types/index.ts` [update+2024-06-14]
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
