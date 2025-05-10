Tentu! Berikut adalah **planning terstruktur** untuk menyelesaikan masalah pada Subtask 2 (API CRUD Multi-Page) yang masih menyisakan 4 integration test gagal, beserta referensi yang dibutuhkan.

---

# 📋 Planning Penyelesaian Subtask 2: Fix 4 Integration Test Gagal (API CRUD Multi-Page)

## 1. Ringkasan Masalah

- Terdapat **4 integration test gagal** pada endpoint API CRUD multi-page.
- Masalah utama:
  - Assertion pada response handler tidak konsisten (format response, error handling, validasi input).
  - Mock pada NextResponse/NextRequest belum sepenuhnya kompatibel dengan kebutuhan test.
  - Beberapa test gagal pada skenario validasi dan error (POST/PUT).

---

## 2. Langkah-Langkah Teknis Penyelesaian

### A. Analisis Test yang Gagal

- [ ] **Identifikasi test case yang gagal** secara detail (lihat file: `ModulePageAPI.integration.test.ts` dan report test).
- [ ] Catat error message, assertion yang gagal, dan skenario (POST, PUT, validasi, error handler).

### B. Review & Sinkronisasi Handler API

- [ ] **Review handler API** di:
  - `app/api/module/[id]/pages/route.ts`
  - `app/api/pages/[id]/route.ts`
- [ ] Pastikan format response **konsisten**:
  - Sukses: `{ success: true, data: {...}, meta?: {...} }`
  - Error: `{ error: "Pesan error", details?: {...} }`
- [ ] Sinkronkan validasi Zod dan error handling agar response error selalu sama di semua handler.

### C. Perbaiki Mock & Helper Test

- [ ] **Perbaiki mock NextRequest/NextResponse** di:
  - `__tests__/__mocks__/next-server.ts`
- [ ] Pastikan mock request.json() mengembalikan data sesuai skenario test (khusus POST/PUT).
- [ ] Tambahkan helper untuk membuat mock request/response yang lebih fleksibel.

### D. Update & Refactor Integration Test

- [ ] **Update assertion** pada integration test agar sesuai dengan format response terbaru.
- [ ] Tambahkan test untuk skenario edge case (data kosong, validasi gagal, error handler).
- [ ] Pastikan semua test menggunakan mock yang konsisten.

### E. Linting & Dokumentasi

- [ ] Jalankan linting dan pastikan tidak ada error/unused import.
- [ ] Update dokumentasi di `module-docs.md` dan `plan-subtask.md` jika ada perubahan pada format response atau skenario test.

---

## 3. Checklist TDD Fix

- [ ] Semua test (unit & integration) lulus (status green).
- [ ] Format response API konsisten di semua endpoint.
- [ ] Mock Next.js (NextRequest/NextResponse) kompatibel dengan kebutuhan test.
- [ ] Dokumentasi endpoint dan contoh payload diperbarui.

---

## 4. Referensi yang Dibutuhkan

### 📁 **File Project yang Perlu Direview/Diedit**
- `features/manage-module/__tests__/integration/ModulePageAPI.integration.test.ts`
- `app/api/module/[id]/pages/route.ts`
- `app/api/pages/[id]/route.ts`
- `__tests__/__mocks__/next-server.ts`
- `features/manage-module/types/modulePageSchema.ts`
- `features/manage-module/services/modulePageService.ts`
- `features/manage-module/plan-subtask.md`
- `features/manage-module/module-docs.md`

### 📚 **Dokumentasi Luar**
- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)
- [Jest Manual Mocks](https://jestjs.io/docs/manual-mocks)
- [Testing Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/testing)
- [Next.js API Route Request Helpers](https://nextjs.org/docs/app/building-your-application/routing/api-routes)
- [Zod Validation Docs](https://zod.dev/)
- [Supertest (jika digunakan untuk API test)](https://github.com/ladjs/supertest)
- [Mocking NextRequest/NextResponse](https://github.com/vercel/next.js/discussions/32238) (diskusi best practice)

---

## 5. Catatan

- Jika ada error pada mock Next.js, pertimbangkan untuk menggunakan library seperti [msw](https://mswjs.io/) untuk mocking network request secara lebih realistis.
- Pastikan semua perubahan diikuti dengan update dokumentasi dan test report.

---

**Jika kamu setuju dengan planning ini, saya siap lanjut ke eksekusi langkah demi langkah sesuai urutan di atas.**  
Apakah ada file atau skenario test tertentu yang ingin kamu prioritaskan lebih dulu?
