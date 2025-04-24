Berikut breakdown untuk **Story-58** dan **Task OPS-54: Kebutuhan Track History Perubahan User**:

---

### **Story-58**

**Judul:** Sebagai admin, saya ingin memberikan beberapa fitur untuk memudahkan memanage user.  
**Fokus Task OPS-54:** Membuat sistem pelacakan riwayat perubahan data user (audit log) yang dapat diakses oleh admin.

---

### **Task OPS-54: Kebutuhan Track History Perubahan User**

**Assignee:** `@backend-dev`  
**Reviewer:** `@tech-lead`  
**Deadline:** `7 Juni 2024`  
**Story Points:** `5`  
**Dependencies:**

- Terkait dengan skema User di Prisma ([OPS-147](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-147)).
- Membutuhkan RBAC yang sudah diperbaiki ([OPS-148](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-148)).

---

### **Deskripsi Task**

Membangun fitur pelacakan riwayat perubahan data user (email, role, status, dll.) untuk memudahkan admin memantau aktivitas dan mengaudit perubahan.

**Tujuan:**

1. Setiap perubahan data user dicatat secara otomatis (siapa, kapan, dan perubahan apa).
2. Admin dapat melihat riwayat perubahan via dashboard atau API.
3. Data history disimpan secara aman dan hanya bisa diakses oleh role `admin`.

---

### **Breakdown Subtask**

#### 1. **Mendesain Skema Database untuk History** _(1 hari)_

- Tambahkan model Prisma `UserHistory`:

  ```prisma
  model UserHistory {
    id          String   @id @default(cuid())
    userId      String   @map("user_id")
    field       String   // Kolom yang diubah (contoh: "role", "status")
    oldValue    String?  @map("old_value")
    newValue    String?  @map("new_value")
    changedBy   String   @map("changed_by") // clerkUserId admin
    createdAt   DateTime @default(now()) @map("created_at")

    @@index([userId])
    @@index([createdAt])
    @@map("user_histories")
  }
  ```

- Relasikan dengan model `User`:
  ```prisma
  model User {
    // ...
    histories UserHistory[]
  }
  ```

#### 2. **Implementasi Test-Driven Development (TDD)** _(1 hari)_

- **Unit Testing:**

  ```typescript
  // services/__tests__/history-service.test.ts
  describe('HistoryService', () => {
    beforeEach(() => {
      // Setup mocks
      prisma.user.findUnique.mockReset()
      prisma.userHistory.create.mockReset()
    })

    it('should create history entry when field changes', async () => {
      // Setup
      const oldUser = {
        id: 'user-1',
        role: 'mahasiswa',
        email: 'old@example.com',
      }
      const updatedFields = { role: 'admin', updatedBy: 'admin-1' }

      // Mock resolves
      prisma.user.findUnique.mockResolvedValue(oldUser)

      // Execute function under test
      await historyService.trackChanges('user-1', updatedFields)

      // Assertions
      expect(prisma.userHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          field: 'role',
          oldValue: 'mahasiswa',
          newValue: 'admin',
          changedBy: 'admin-1',
        }),
      })
    })

    it('should not create history when no changes detected', async () => {
      // Setup with same values
      const oldUser = { id: 'user-1', role: 'admin', email: 'test@example.com' }
      const updatedFields = { role: 'admin', updatedBy: 'admin-1' }

      // Mock resolves
      prisma.user.findUnique.mockResolvedValue(oldUser)

      // Execute function under test
      await historyService.trackChanges('user-1', updatedFields)

      // Assertions
      expect(prisma.userHistory.create).not.toHaveBeenCalled()
    })
  })
  ```

- **API Integration Testing:**

  ```typescript
  // api/__tests__/history-api.test.ts
  describe('History API Endpoints', () => {
    it('should return 403 for non-admin users', async () => {
      // Setup with non-admin token
      const res = await request(app)
        .get('/api/admin/history')
        .set('Authorization', `Bearer ${nonAdminToken}`)

      expect(res.status).toBe(403)
    })

    it('should return filtered history by date range', async () => {
      // Setup with admin token
      const res = await request(app)
        .get('/api/admin/history?startDate=2024-05-01&endDate=2024-05-30')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2) // Assuming 2 history entries in this date range
      expect(res.body[0]).toHaveProperty('field')
      expect(res.body[0]).toHaveProperty('oldValue')
    })
  })
  ```

#### 3. **Implementasi Logging Otomatis dengan Prisma Middleware** _(2 hari)_

- Implementasi berdasarkan test yang sudah ditulis:
- Gunakan Prisma middleware untuk menangkap event `update` pada model `User`:

  ```typescript
  // lib/prisma.ts
  prisma.$use(async (params, next) => {
    if (params.model === 'User' && params.action === 'update') {
      const oldData = await prisma.user.findUnique({
        where: { id: params.args.where.id },
      })

      const result = await next(params)

      // Bandingkan oldData dan result untuk deteksi perubahan
      for (const field of Object.keys(params.args.data)) {
        if (oldData[field] !== result[field]) {
          await prisma.userHistory.create({
            data: {
              userId: oldData.id,
              field: field,
              oldValue: String(oldData[field]),
              newValue: String(result[field]),
              changedBy: params.args.data.updatedBy, // Diambil dari input admin
            },
          })
        }
      }
      return result
    }
    return next(params)
  })
  ```

#### 4. **Membuat API untuk Akses Riwayat** _(1.5 hari)_

- Endpoint:
  - `GET /api/admin/users/:id/history` → Ambil riwayat perubahan user.
  - `GET /api/admin/history → Filter riwayat (by date, field, dll.).
- Contoh response:
  ```json
  [
    {
      "field": "role",
      "oldValue": "mahasiswa",
      "newValue": "admin",
      "changedBy": "user_123",
      "createdAt": "2024-05-30T10:00:00Z"
    }
  ]
  ```

#### 5. **Implementasi Strategi Data Retention** _(1 hari)_

- **Automated Cleanup Job:**

  ```typescript
  // jobs/history-cleanup.ts
  import cron from 'node-cron'
  import { PrismaClient } from '@prisma/client'
  import { archiveToS3 } from '../utils/s3-archive'

  const prisma = new PrismaClient()

  // Run at midnight on first day of each month
  cron.schedule('0 0 1 * *', async () => {
    console.log('Starting history cleanup job...')

    // Define retention period (1 year)
    const retentionDate = new Date()
    retentionDate.setFullYear(retentionDate.getFullYear() - 1)

    try {
      // Find records older than retention period
      const oldRecords = await prisma.userHistory.findMany({
        where: {
          createdAt: { lt: retentionDate },
        },
      })

      if (oldRecords.length > 0) {
        // Archive to cold storage (S3)
        await archiveToS3('user-history', oldRecords)

        // Delete from primary database
        await prisma.userHistory.deleteMany({
          where: {
            createdAt: { lt: retentionDate },
          },
        })

        console.log(
          `Archived and cleaned up ${oldRecords.length} history records`
        )
      } else {
        console.log('No history records to clean up')
      }
    } catch (error) {
      console.error('Error during history cleanup:', error)
    }
  })
  ```

- **Configuration options:**
  ```typescript
  // config/retention.ts
  export const historyRetentionConfig = {
    enabled: process.env.ENABLE_HISTORY_RETENTION === 'true',
    retentionPeriodMonths: parseInt(
      process.env.HISTORY_RETENTION_MONTHS || '12'
    ),
    archiveEnabled: process.env.ENABLE_HISTORY_ARCHIVE === 'true',
  }
  ```

#### 6. **Pengujian dan Security** _(1 hari)_

- **Testing:**
  - Admin mengubah role user → pastikan history tercatat.
  - User non-admin akses endpoint history → harus ditolak (403).
  - Performa: Test volume history besar (>1000 record).
- **Security:**
  - Pastikan endpoint history dilindungi RBAC (hanya role `admin`).
  - Sanitasi input untuk menghindari SQL injection.
  - Implement rate-limiting untuk endpoint history.

#### 7. **Dokumentasi API dan Technical Specs** _(0.5 hari)_

- **API Documentation (OpenAPI/Swagger):**
  ```yaml
  # /docs/api/history.yaml
  openapi: 3.0.0
  info:
    title: User History API
    version: 1.0.0
  paths:
    /api/admin/users/{userId}/history:
      get:
        summary: Get history for specific user
        parameters:
          - name: userId
            in: path
            required: true
            schema:
              type: string
          - name: startDate
            in: query
            schema:
              type: string
              format: date
        responses:
          200:
            description: Success
            content:
              application/json:
                schema:
                  type: array
                  items:
                    $ref: '#/components/schemas/HistoryItem'
  components:
    schemas:
      HistoryItem:
        type: object
        properties:
          field:
            type: string
          oldValue:
            type: string
          newValue:
            type: string
          changedBy:
            type: string
          createdAt:
            type: string
            format: date-time
  ```
- Tambahkan di `README.md`:
  - Cara mengakses endpoint history.
  - Contoh payload dan response.
  - Dokumentasi strategi retention data.

---

### **Acceptance Criteria**

- [x] Setiap perubahan data user (via admin atau Clerk) mencatat history di database.
- [x] Admin bisa melihat riwayat perubahan via API dengan filter sederhana.
- [x] Data history tidak bisa diakses oleh user non-admin (test dengan Postman).
- [x] Latency penambahan history <300ms (tidak mengganggu operasi utama).
- [x] Unit dan integration tests mencakup minimal 80% dari kode history.
- [x] Strategi data retention diimplementasikan dan berfungsi.
- [x] API dokumentasi tersedia dalam format OpenAPI/Swagger.

---

### **Contoh Kasus Penggunaan**

1. **Admin mengubah role user dari `mahasiswa` ke `admin`:**
   - Middleware Prisma mendeteksi perubahan field `role`.
   - Catat event di `UserHistory` dengan `changedBy` = ID admin.
2. **User mengubah email via Clerk:**
   - Webhook Clerk memicu update → middleware Prisma juga mencatat history.
3. **Admin mencari history perubahan untuk investigasi:**
   - Admin mengakses `/api/admin/history?startDate=2024-05-01&field=role` untuk melihat semua perubahan role dalam sebulan terakhir.
4. **System maintenance menjalankan cleanup otomatis:**
   - Cron job berjalan setiap awal bulan, mengarsipkan data history yang lebih dari 1 tahun ke S3, lalu menghapusnya dari database utama.

---

### **Catatan Penting**

1. **Performa:**
   - Tambahkan indeks di kolom `userId` dan `createdAt` untuk query yang cepat.
   - Jika volume history tinggi, gunakan strategi batch untuk mengoptimalkan cleanup.
2. **Audit Trail:**
   - Hash atau enkripsi field sensitif (misal: email lama) jika diperlukan.
   - Pastikan log tidak dapat dimodifikasi (immutable) dan dapat diverifikasi.
3. **Test-Driven Development:**
   - Selalu mulai dengan menulis test sebelum implementasi.
   - Gunakan mocking untuk test middleware dan endpoint API.
4. **Referensi:**
   - [Prisma Middleware](https://www.prisma.io/docs/orm/prisma-client/client-extensions/middleware)
   - [RBAC dengan Clerk](https://docs.clerk.dev/popular-guides/roles-permissions)
   - [Jest Testing With Prisma](https://www.prisma.io/docs/guides/testing/unit-testing)
   - [AWS S3 Cold Storage](https://aws.amazon.com/s3/storage-classes/)

---

### **Pertanyaan Klarifikasi (Jika Memungkinkan)**

1. Apakah perlu mencatat perubahan yang dilakukan oleh **user itu sendiri** (misal: update email via profil)?
2. Apakah perlu menyimpan history untuk operasi `delete` user?
3. Apakah ada batasan retention period (misal: hapus history >1 tahun)?

Seperti diputuskan dalam diskusi dengan product owner, kita akan:

1. Mencatat **semua** perubahan termasuk yang dilakukan oleh user itu sendiri.
2. Mencatat operasi `delete` sebagai entri history khusus dengan flag `isDeleted: true`.
3. Mengimplementasikan retention period 1 tahun dengan archiving ke S3 untuk kebutuhan audit jangka panjang.
