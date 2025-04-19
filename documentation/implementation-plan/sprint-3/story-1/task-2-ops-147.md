
Berikut adalah breakdown detail untuk **Task OPS-147: Prisma Client Update, Deploy to Vercel Docs Settings** beserta deskripsi, subtask, dan rekomendasi teknis:

---

### **Task OPS-147: Prisma Client Update, Deploy to Vercel Docs Settings**

**Assignee:** `@backend-dev`  
**Reviewer:** `@tech-lead`  
**Deadline:** `3 Juni 2024` (sesuai sprint planning)  
**Story Points:** `3` (low-moderate complexity)  
**Dependencies:**

- Terkait dengan [OPS-56: Webhook Clerk](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-56) untuk sinkronisasi data real-time.
- Memerlukan akses ke **Vercel Dashboard** dan **database production**.

---

### **Deskripsi Task**

Memastikan pembaruan Prisma Client dan konfigurasi deployment ke Vercel berjalan optimal, serta dokumentasi yang jelas untuk tim dan maintainability.

**Tujuan:**

1. Optimasi performa Prisma Client untuk operasi database yang lebih cepat.
2. Konfigurasi deployment Vercel yang kompatibel dengan Prisma (migrasi, generate client).
3. Dokumentasi proses deploy dan struktur database untuk kolaborasi tim.

---

### **Breakdown Subtask & Estimasi**

#### 1. **Prisma Client Optimization** _(1.5 hari)_

- Update Prisma ke versi terbaru (jika diperlukan):
  ```bash
  npm update prisma @prisma/client
  ```
- Optimasi query dengan:
  - **Batch updates** untuk operasi bulk.
  - **Transaction** untuk operasi atomic.
- Contoh kode optimasi transaction:
  ```typescript
  await prisma.$transaction([
    prisma.user.update({ where: { id: '1' }, data: { role: 'admin' } }),
    prisma.user.update({ where: { id: '2' }, data: { status: 'inactive' } }),
  ])
  ```
- Pastikan skema Prisma sudah sinkron dengan database:
  ```bash
  npx prisma migrate status  # Cek status migrasi
  ```

#### 2. **Vercel Deployment Configuration** _(1 hari)_

- Tambahkan environment variables di Vercel:
  - `DATABASE_URL`: URL koneksi database production.
- Konfigurasi `next.config.js` atau `vercel.json` untuk:
  - Build command yang menjalankan `prisma generate` dan `prisma migrate deploy`.
  ```json
  // vercel.json
  {
    "build": {
      "env": {
        "DATABASE_URL": "@database_url",
        "PRISMA_GENERATE": "npx prisma generate && npx prisma migrate deploy"
      }
    }
  }
  ```
- Pastikan **CORS** diaktifkan jika diperlukan untuk akses API.

#### 3. **Integrasi dengan Testing Framework** _(0.5 hari)_

- Konfigurasi test database dan environment:
  ```typescript
  // jest.config.js
  process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/test_db'
  ```
- Setup test helpers untuk Prisma:

  ```typescript
  // helpers/prisma-test.ts
  import { PrismaClient } from '@prisma/client'
  import { mockDeep, mockReset } from 'jest-mock-extended'

  jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    prisma: mockDeep<PrismaClient>(),
  }))

  import { prisma } from '@/lib/prisma'

  beforeEach(() => {
    mockReset(prisma)
  })

  export { prisma }
  ```

#### 4. **Documentation Update** _(0.5 hari)_

- Update `README.md` dengan:
  - Langkah deploy ke Vercel (termasuk setup env vars).
  - Diagram struktur database (gunakan `npx prisma migrate diff` atau Prisma ERD).
  - Penjelasan real-time sync dengan Prisma + Webhook Clerk.
- Contoh section:

  ```markdown
  ## Deployment

  1. Set `DATABASE_URL` di Vercel.
  2. Jalankan `prisma migrate deploy` saat build.
  3. Pastikan webhook Clerk terdaftar di [domain].vercel.app/api/clerk-webhook.
  ```

---

### **Acceptance Criteria**

- [x] Prisma Client berhasil diupdate tanpa breaking changes (test dengan `npm run test:prisma`).
- [x] Deploy ke Vercel berhasil dengan status "Ready" dan migrasi otomatis.
- [x] Query latency <1 detik untuk operasi GET/POST user data.
- [x] Dokumentasi tersedia di repo dengan langkah jelas untuk tim.
- [x] Test environment berhasil dikonfigurasi dan berjalan di CI/CD pipeline.

---

### **Catatan Teknis**

1. **Cold Start Mitigation:**

   - Jika menggunakan Vercel Serverless Functions, optimasi cold start dengan:
     - Mengurangi dependency berat di handler API.
     - Gunakan Prisma Client secara efisien (reuse instance).

2. **Rollback Plan:**

   - Jika migrasi gagal, gunakan Vercel Deployment Rollback dan jalankan:
     ```bash
     npx prisma migrate resolve --rolled-back "<migration_name>"
     ```

3. **Test Database Isolation:**

   - Gunakan database terpisah untuk testing.
   - Reset database state sebelum setiap test run.
   - Gunakan transaction untuk rollback perubahan setelah test.

4. **Referensi:**
   - [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/vercel)
   - [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
   - [Prisma Testing Best Practices](https://www.prisma.io/docs/guides/testing/unit-testing)

---

### **Contoh Snippet Migrasi**

```bash
# Buat migrasi baru
npx prisma migrate dev --name "add_user_status_column"

# Deploy migrasi ke production
npx prisma migrate deploy
```

---

Task ini siap diassign ke `@backend-dev`! 🚀
