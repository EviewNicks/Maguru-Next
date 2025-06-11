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
- react-markdown, @tiptap

---

## Deskripsi Task (Update)

Mengimplementasikan fitur manajemen konten multi-page pada modul pembelajaran. Admin dapat membuat, mengedit, menghapus, dan mengelola halaman konten (teks, kode, gambar, video) secara dinamis dalam satu modul. Setiap halaman dapat diisi dengan berbagai tipe konten menggunakan slash command (misal: `/image`, `/code`) seperti di Confluence/Notion. Editor mendukung markdown dan toolbar sederhana untuk formatting dasar. Navigasi antar halaman tersedia di RightSidebar/bagian bawah. Batasan upload gambar maksimal 2MB/file dan video maksimal 20MB/file. Semua perubahan halaman langsung terlihat di UI.

### Breakdown Subtask

1. **Desain & Implementasi Model Database** _(1 Hari)_ ✓

   - Tambahkan relasi antara modul dan halaman (one-to-many).
   - Field: `id`, `moduleId`, `title`, `type`, `order`, `content`, `createdAt`, `updatedAt`.

2. **API CRUD Multi-Page** _(2 Hari)_ ✓

   - Endpoint: `POST /api/modules/:id/pages` (create), `PUT /api/pages/:id` (update), `DELETE /api/pages/:id` (delete), `GET /api/modules/:id/pages` (list).
   - Validasi input dengan Zod.
   - Middleware autentikasi & otorisasi admin.
   - Audit trail untuk setiap operasi CRUD (future task).

3. **Integrasi UI Multi-Page** _(2 Hari)_ ✓

   - Komponen form CRUD halaman (inline form/editor).
   - Editor mendukung markdown dan toolbar sederhana.
   - Penambahan konten dengan slash command (`/image`, `/code`, dsb).
   - Daftar halaman dengan navigasi di RightSidebar/bawah.
   - Indikator status simpan & notifikasi sukses/error.
   - Integrasi dengan React Query untuk data fetching & mutasi.
   - Batasan upload gambar maksimal 2MB/file, video maksimal 20MB/file.

4. **Perbaikan Error Tipe Data** ✓

   - Semua tipe data sudah konsisten
   - Tidak ada error TypeScript

5. **Unit Testing** ✓

   - Semua komponen utama telah memiliki unit test (7 file test)
   - Mock untuk TipTap editor dan context telah dibuat
   - Coverage mencapai lebih dari 80%
   - Semua test berjalan dengan sukses

6. **Implementasi Shortcut Keyboard (Prioritas Medium):** _(2 Hari)_ ✓

   - Custom hook useKeyboardShortcuts telah diimplementasikan dengan event handler
   - Shortcut navigasi antar halaman (Alt+Left/Right Arrow) telah berfungsi
   - Shortcut formatting (Ctrl+B, Ctrl+I, Ctrl+U) terintegrasi dengan TipTap
   - Shortcut save (Ctrl+S) telah terimplementasi
   - Komponen ShortcutHelp dialog dengan pencarian dan filter telah dibuat
   - Integrasi dengan ModulePagesContext untuk toggle sidebar
   - Unit testing untuk ShortcutHelp dan useKeyboardShortcuts

7. **Penyempurnaan Aksesibilitas (A11y) (Prioritas Medium)** ✓

   - Jalankan audit aksesibilitas menggunakan axe
   - Tambahkan ARIA label pada semua elemen interaktif
   - Implementasikan fokus manajemen yang tepat untuk modal dan navigasi
   - Buat test aksesibilitas

8. **Perbaikan Arsitektur dan Kualitas Kode (Prioritas High)** ✓

   - Konsolidasi format data dengan memindahkan fungsi parsing dari `content-parser.ts` ke `dataFormats.ts`
   - Standardisasi tipe data dengan mendefinisikan enum dan interface di `index.ts`
   - Membuat interface untuk layanan (`IModulePageService`) dan adapter (`IModulePageAdapter`)
   - Memastikan konsistensi tipe data di seluruh aplikasi
   - Membuat dokumentasi arsitektur yang jelas

9. **Integration Testing**

   - Buat integration test untuk alur CRUD halaman
   - Buat integration test untuk navigasi antar halaman
   - Buat integration test untuk interaksi editor

10. **Testing & Validasi** _(1 Hari)_

    - Unit test untuk fungsi CRUD halaman.
    - Integration test untuk API & UI.
    - E2E test untuk alur admin mengelola halaman modul.

11. **Dokumentasi & User Guide** _(0.5 Hari)_
    - Update README/module docs untuk instruksi penggunaan fitur multi-page.
    - Contoh payload API & skenario penggunaan.

---

## Acceptance Criteria

- [x] Admin dapat membuat, mengedit, menghapus halaman konten pada modul.
- [x] Setiap halaman dapat berisi campuran teks, kode, gambar, dan video.
- [x] Penambahan konten menggunakan slash command.
- [x] Editor mendukung markdown dan toolbar sederhana.
- [x] Navigasi antar halaman mudah diakses.
- [x] Perubahan halaman langsung terlihat di UI (real-time update).
- [x] Validasi input & error handling berjalan baik.
- [x] Mahasiswa hanya bisa melihat halaman dari modul berstatus ACTIVE.
- [ ] Unit, integration, dan E2E test coverage minimal 80%. (80% unit test tercapai, integration & E2E dalam proses)
- [x] Batasan upload gambar maksimal 2MB/file, video maksimal 20MB/file.
- [x] Shortcut keyboard untuk navigasi dan editing telah terimplementasi.
- [x] Arsitektur kode yang jelas dan terstruktur.
- [x] Konsistensi tipe data di seluruh aplikasi.

---

## Status Pengembangan [update+2025-07-01]

- **Completed:**

  - ✅ Implementasi database dan model data
  - ✅ API CRUD multi-page
  - ✅ Integrasi UI editor dengan TipTap
  - ✅ Navigasi antar halaman
  - ✅ Unit testing komponen utama
  - ✅ Perbaikan tipe data
  - ✅ Implementasi keyboard shortcut
  - ✅ Komponen ShortcutHelp dialog
  - ✅ Penyempurnaan aksesibilitas (A11y)
  - ✅ Perbaikan arsitektur dan kualitas kode

- **In Progress:**

  - 🔄 Integration testing
  - 🔄 E2E testing

- **Next Steps:**
  - 📋 Dokumentasi & user guide

---

## Future Task (Sprint Berikutnya)

- **Drag & Drop Urutan Halaman**: Fitur untuk mengubah urutan halaman secara visual.
- **Quiz Page**: Halaman khusus untuk quiz/interaktif.
- **Preview Halaman**: Fitur untuk melihat tampilan halaman sebelum publish.
- **Audit Trail**: Pencatatan detail perubahan setiap halaman.
- **Import/Export & Duplikasi**: Mendukung ekspor, impor, dan duplikasi halaman.
- **Versioning**: Menyimpan riwayat perubahan konten halaman.

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
5. **Arsitektur:**
   - Pastikan konsistensi tipe data di seluruh aplikasi.
   - Gunakan interface untuk layanan dan adapter untuk meningkatkan maintainability.
   - Dokumentasikan arsitektur dengan jelas untuk memudahkan onboarding developer baru.

---

## Referensi

- [OPS-140 (Jira)](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-140)
- [React Query](https://tanstack.com/query/latest)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Zod Validation](https://zod.dev/)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-relations)
- [TipTap Editor](https://tiptap.dev/)
- [Architecture Documentation](../../features/manage-module/docs/architecture-improvements.md)
