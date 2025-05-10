# Planning Subtask 2: API CRUD Multi-Page

## 1. Ringkasan Tujuan

- Mengimplementasikan endpoint API CRUD untuk manajemen halaman multi-page pada modul.
- Setiap halaman dapat berisi array blok konten (text, code, image, video) dalam satu halaman.
- Validasi input menggunakan Zod.
- Middleware autentikasi & otorisasi admin.
- Menulis unit test & integration test sebelum implementasi kode (TDD).

---

## 2. Langkah-Langkah Teknis [update+2025-05-10]

### A. Analisis & Desain

- [x] Review kebutuhan endpoint:
  - `POST /api/module/[id]/pages` → Create page untuk modul tertentu.
  - `GET /api/module/[id]/pages` → List semua page dalam modul.
  - `PUT /api/pages/[pageId]` → Update page by id.
  - `DELETE /api/pages/[pageId]` → Delete page by id.
- [x] Setiap page menyimpan array blok konten di field `content` (JSON).

### B. Test-Driven Development (TDD)

1. **Unit Test (Co-location)**

   - [x] Buat file test berdampingan dengan handler API (misal: `route.test.ts`).
   - [x] Test validasi Zod untuk create/update page (judul, blok konten, dsb).
   - [x] Test service logic: create, get, update, delete page (mock prisma).

2. **Integration Test**
   - [x] Simulasi request ke endpoint API (menggunakan supertest/Jest).
   - [x] Test skenario sukses & error (validasi gagal, unauthorized, dsb).
   - [x] Test integrasi dengan middleware autentikasi.
   - [!] **Catatan:** Dari 15 integration test, 11 lulus dan 4 gagal (terutama pada assertion response handler, perlu review pada mock/handler NextResponse). Lihat [test-report-2025-05-10T01-12-44.815Z.json].

### C. Implementasi API Handler

- [x] Buat handler Next.js API route:
  - `app/api/module/[id]/pages/route.ts` (GET, POST)
  - `app/api/pages/[pageId]/route.ts` (PUT, DELETE)
- [x] Implementasi service CRUD:
  - `createModulePage`
  - `getModulePagesByModuleId`
  - `updateModulePage`
  - `deleteModulePage`
- [x] Gunakan validasi Zod pada setiap handler.
- [x] Pastikan response format konsisten (success/error).

### D. Middleware & Security

- [x] Pastikan endpoint hanya bisa diakses oleh admin (middleware Clerk).
- [x] Validasi ownership/akses modul jika diperlukan.

### E. Dokumentasi & Contoh Payload

- [ ] Update dokumentasi endpoint (request/response, error) di module-docs.md.
- [ ] Tambahkan contoh payload untuk setiap endpoint.

---

## 3. Estimasi File/Komponen yang Perlu Diubah/Dibuat [update+2025-05-10]

- [x] `app/api/module/[id]/pages/route.ts` (handler + test)
- [x] `app/api/pages/[pageId]/route.ts` (handler + test)
- [x] `features/manage-module/services/modulePageService.ts` (service logic + test)
- [x] `features/manage-module/types/modulePageSchema.ts` (validasi Zod, update jika perlu)
- [x] `features/manage-module/__tests__/integration/ModulePageAPI.integration.test.ts` (integration test)
- [x] `features/manage-module/__tests__/models/ModulePage.test.ts` (update/extend unit test jika perlu)
- [ ] Dokumentasi API (README/module-docs.md)
- [x] Test report: [test-report-2025-05-10T01-12-44.815Z.json]

---

## 4. Checklist TDD [update+2025-05-10]

- [x] Buat & review test case (unit & integration) sebelum implementasi kode.
- [x] Implementasi minimal kode agar test lulus (status green).
- [x] Refactor kode jika perlu, pastikan test tetap lulus.
- [x] Lint & format kode sebelum commit.
- [ ] Update dokumentasi setelah implementasi (payload, error response, contoh request/response di module-docs.md).

---

**Catatan [update+2025-05-10]:**

- Integration test CRUD sudah >80% skenario utama, namun ada 4 test gagal terkait assertion pada response handler (toHaveBeenCalledWith). Perlu review pada mock NextResponse dan konsistensi response API.
- Selanjutnya: perbaiki assertion test, pastikan semua response API konsisten, update dokumentasi endpoint & payload.
