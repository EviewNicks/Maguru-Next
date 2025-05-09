# Planning Subtask 2: API CRUD Multi-Page

## 1. Ringkasan Tujuan

- Mengimplementasikan endpoint API CRUD untuk manajemen halaman multi-page pada modul.
- Setiap halaman dapat berisi array blok konten (text, code, image, video) dalam satu halaman.
- Validasi input menggunakan Zod.
- Middleware autentikasi & otorisasi admin.
- Menulis unit test & integration test sebelum implementasi kode (TDD).

---

## 2. Langkah-Langkah Teknis

### A. Analisis & Desain

- Review kebutuhan endpoint:
  - `POST /api/module/[id]/pages` → Create page untuk modul tertentu.
  - `GET /api/module/[id]/pages` → List semua page dalam modul.
  - `PUT /api/pages/[pageId]` → Update page by id.
  - `DELETE /api/pages/[pageId]` → Delete page by id.
- Setiap page menyimpan array blok konten di field `content` (JSON).

### B. Test-Driven Development (TDD)

1. **Unit Test (Co-location)**

   - Buat file test berdampingan dengan handler API (misal: `route.test.ts`).
   - Test validasi Zod untuk create/update page (judul, blok konten, dsb).
   - Test service logic: create, get, update, delete page (mock prisma).

2. **Integration Test**
   - Simulasi request ke endpoint API (menggunakan supertest/Jest).
   - Test skenario sukses & error (validasi gagal, unauthorized, dsb).
   - Test integrasi dengan middleware autentikasi.

### C. Implementasi API Handler

- Buat handler Next.js API route:
  - `app/api/module/[id]/pages/route.ts` (GET, POST)
  - `app/api/pages/[pageId]/route.ts` (PUT, DELETE)
- Implementasi service CRUD:
  - `createModulePage`
  - `getModulePagesByModuleId`
  - `updateModulePage`
  - `deleteModulePage`
- Gunakan validasi Zod pada setiap handler.
- Pastikan response format konsisten (success/error).

### D. Middleware & Security

- Pastikan endpoint hanya bisa diakses oleh admin (middleware Clerk).
- Validasi ownership/akses modul jika diperlukan.

### E. Dokumentasi & Contoh Payload

- Update dokumentasi endpoint (request/response, error).
- Tambahkan contoh payload untuk setiap endpoint.

---

## 3. Estimasi File/Komponen yang Perlu Diubah/Dibuat

- `app/api/module/[id]/pages/route.ts` (handler + test)
- `app/api/pages/[pageId]/route.ts` (handler + test)
- `features/manage-module/services/modulePageService.ts` (service logic + test)
- `features/manage-module/types/modulePageSchema.ts` (validasi Zod, update jika perlu)
- `features/manage-module/__tests__/integration/ModulePageAPI.integration.test.ts` (integration test)
- `features/manage-module/__tests__/models/ModulePage.test.ts` (update/extend unit test jika perlu)
- Dokumentasi API (README/module-docs.md)

---

## 4. Checklist TDD

- [ ] Buat & review test case (unit & integration) sebelum implementasi kode.
- [ ] Implementasi minimal kode agar test lulus (status green).
- [ ] Refactor kode jika perlu, pastikan test tetap lulus.
- [ ] Lint & format kode sebelum commit.
- [ ] Update dokumentasi setelah implementasi.

---

**Catatan:**

- Prioritaskan coverage test >80% untuk service & handler.
- Gunakan mocking untuk Prisma & Clerk pada test.
- Ikuti konvensi co-location test & struktur folder sesuai file-structure.md.
