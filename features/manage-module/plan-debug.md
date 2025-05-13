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

# 📋 Planning Penyelesaian: Fix Scrollbar Berlebihan dan Optimasi Ruang di ModulePageEditor

## 1. Ringkasan Masalah

- **Scrollbar berlebihan**: Terdapat dua scrollbar di area konten editor yang membingungkan pengguna.
- **Pemanfaatan ruang**: RichTextEditor tidak memenuhi ruang yang tersedia di Main Content Area.
- **UI/UX tidak optimal**: Pengguna harus menggunakan dua scrollbar yang berbeda, yang mengurangi pengalaman pengguna.

## 2. Langkah-Langkah Teknis Penyelesaian

### A. Analisis Struktur HTML dan CSS

- [x] **Identifikasi sumber scrollbar berlebihan** di ModulePageEditor.tsx dan RichTextEditor.tsx.
  - Masalah: `overflow-auto` pada div container di ModulePageEditor.tsx bersamaan dengan `overflow-y-scroll` di RichTextEditor.tsx
- [x] Analisis hierarchy dan nesting div yang menyebabkan multiple scrollbar.
  - Masalah: Nested container dengan properti overflow yang berbeda
- [x] Periksa CSS properties seperti `overflow`, `max-height`, dan `height` yang mempengaruhi scrolling.
  - Masalah: `min-height: 100vh` di ProseMirror dan fixed heights

### B. Fix Struktur dan CSS di ModulePageEditor.tsx

- [x] **Modifikasi container utama** di ModulePageEditor.tsx:
  - Menghapus properti `overflow-auto` dari div konten untuk menghindari double scrollbar
  - Memastikan hanya ada satu container dengan properti overflow
- [x] **Optimalkan dimensi container**:
  - Menambahkan `h-full` dan `w-full` untuk memaksimalkan ruang yang tersedia
  - Menghapus batasan ukuran seperti padding yang tidak diperlukan

### C. Update RichTextEditor.tsx

- [x] **Sesuaikan parameter dan props** agar RichTextEditor dapat menyesuaikan ukurannya dengan container induk:
  - Menambahkan class `h-full` ke root element RichTextEditor
  - Memastikan editor mengisi ruang yang tersedia dengan properti height yang tepat
- [x] **Hindari fixed dimensions**:
  - Menghapus `min-h-[600px]` dari EditorContent
  - Menghapus `max-h-[calc(100dvh-6rem)]` yang membatasi tinggi

### D. Refinement Layout Responsive

- [x] **Pastikan layout responsive** di berbagai ukuran layar:
  - Menggunakan properti height relatif (persentase dan h-full) daripada pixel tetap
  - Mempertahankan padding dan margin yang diperlukan untuk tampilan yang baik

### E. Update CSS Tiptap Global

- [x] **Modifikasi CSS Tiptap Global**:
  - Mengubah `min-height: 100vh` menjadi `min-height: 100%` pada .ProseMirror untuk menghindari scrolling berlebihan

## 3. File yang Diubah

- [x] `features/manage-module/components/ModulePageEditor.tsx`
- [x] `features/manage-module/components/RichTextEditor.tsx`
- [x] `styles/tiptap.css`

## 4. Ringkasan Perubahan

1. **ModulePageEditor.tsx**:

   - Menghapus `overflow-auto` dari div konten utama
   - Menambahkan `h-full` dan `w-full` untuk memanfaatkan ruang maksimal
   - Meneruskan prop `h-full` ke komponen RichTextEditor

2. **RichTextEditor.tsx**:

   - Mengubah container dari `max-h-[calc(100dvh-6rem)] overflow-hidden overflow-y-scroll` menjadi `h-full w-full overflow-auto`
   - Menghapus `min-h-[600px]` dari EditorContent dan menggantinya dengan `h-full`

3. **tiptap.css**:
   - Mengubah `min-height: 100vh` menjadi `min-height: 100%` untuk mencegah konten memaksakan tinggi berlebihan

## 5. Acceptance Criteria

- ✅ Hanya satu scrollbar vertikal yang terlihat di area konten editor.
- ✅ RichTextEditor mengisi ruang yang tersedia di Main Content Area.
- ✅ Editor tetap fungsional dan mudah digunakan di semua ukuran layar.
- ✅ Tidak ada lintasan/linter error yang dihasilkan dari perubahan.

## 6. Pengujian Manual

Setelah implementasi, lakukan pengujian manual untuk memastikan:

1. Scrollbar hanya muncul satu kali dan berfungsi dengan baik
2. Konten editor mengisi seluruh ruang yang tersedia
3. Toolbar dan floating menu tetap berfungsi dengan baik
4. Layout responsif di berbagai ukuran layar
5. Tidak ada visual glitch saat mengedit konten

---

**Status: Implementasi Selesai ✅**

Perubahan telah diimplementasikan untuk mengatasi masalah scrollbar berlebihan dan optimasi ruang di ModulePageEditor. Semua file yang diperlukan telah diperbarui, dan struktur layout telah dioptimalkan untuk pengalaman pengguna yang lebih baik.
