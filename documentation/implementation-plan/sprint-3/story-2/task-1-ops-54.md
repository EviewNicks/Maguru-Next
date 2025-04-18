Berikut adalah deskripsi lengkap dan breakdown untuk **Task OPS-54: Kebutuhan Track History Perubahan User**:

---

### **Task OPS-54: Kebutuhan Track History Perubahan User**

**Assignee:** `@backend-dev`  
**Reviewer:** `@tech-lead`  
**Deadline:** `7 Juni 2024`  
**Story Points:** `5` (kompleksitas sedang)  
**Dependencies:**

- Skema User Prisma sudah diupdate ([OPS-147](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-147)).
- RBAC sudah diperbaiki ([OPS-148](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-148)).

---

### **Deskripsi Task**

Membangun sistem pelacakan riwayat perubahan data user (audit log) untuk memudahkan admin melacak perubahan seperti update role, email, atau status.

**Tujuan:**

1. Setiap perubahan data user dicatat otomatis (field, nilai lama/baru, admin yang mengubah).
2. Admin dapat melihat riwayat perubahan via API dengan filter (user, tanggal, field).
3. Data audit log aman dan hanya bisa diakses oleh role `admin`.

---

### **Breakdown Subtask**

#### 1. **Desain Skema Database untuk Audit Log** _(1 Hari)_

- Tambahkan model Prisma `UserHistory`:

  ```prisma
  model UserHistory {
    id          String   @id @default(cuid())
    userId      String   @map("user_id") // ID user yang diubah
    field       String   // Kolom yang diubah (contoh: "role", "email")
    oldValue    String?  @map("old_value")
    newValue    String?  @map("new_value")
    changedBy   String   @map("changed_by") // ID admin (clerkUserId)
    createdAt   DateTime @default(now()) @map("created_at")

    @@index([userId])
    @@index([createdAt])
    @@map("user_histories")
  }
  ```

- Relasikan ke model `User`:
  ```prisma
  model User {
    // ... field sebelumnya
    histories UserHistory[]
  }
  ```

#### 2. **Implementasi Logging Otomatis dengan Prisma Middleware** _(2 Hari)_

- Gunakan Prisma Client middleware untuk menangkap event `update` pada `User`:

  ```typescript
  // lib/prisma.ts
  prisma.$use(async (params, next) => {
    if (params.model === 'User' && params.action === 'update') {
      const oldUser = await prisma.user.findUnique({
        where: params.args.where,
      })

      const updatedUser = await next(params)

      // Deteksi perubahan field
      const changes = []
      for (const field of Object.keys(params.args.data)) {
        if (oldUser[field] !== updatedUser[field]) {
          changes.push({
            field: field,
            oldValue: String(oldUser[field]),
            newValue: String(updatedUser[field]),
          })
        }
      }

      // Simpan ke UserHistory
      if (changes.length > 0) {
        await prisma.userHistory.createMany({
          data: changes.map((change) => ({
            userId: oldUser.id,
            changedBy: updatedUser.updatedBy, // Diambil dari input admin
            ...change,
          })),
        })
      }

      return updatedUser
    }
    return next(params)
  })
  ```

#### 3. **Membuat API Endpoint untuk Akses Riwayat** _(1.5 Hari)_

- **Endpoint:**
  - `GET /api/admin/users/:userId/history`:
    - Ambil riwayat perubahan untuk user tertentu.
    - **Contoh Query:**
      ```ts
      const history = await prisma.userHistory.findMany({
        where: { userId: 'user_123' },
        orderBy: { createdAt: 'desc' },
      })
      ```
  - `GET /api/admin/history`:
    - Filter riwayat berdasarkan tanggal atau field:
      ```ts
      // Contoh filter: ?startDate=2024-05-01&field=role
      where: {
        createdAt: { gte: new Date(startDate) },
        field: "role"
      }
      ```
- **Proteksi RBAC:**  
  Pastikan middleware memeriksa role admin sebelum mengizinkan akses.

#### 4. **Implementasi Test-Driven Development** _(1 Hari)_

- **Unit Testing:**

  ```typescript
  // services/history.test.ts
  describe('UserHistoryService', () => {
    it('should record history when user role is changed', async () => {
      // Setup
      const oldUser = { id: 'user_1', role: 'mahasiswa', name: 'Test User' }
      const updatedData = { role: 'admin', updatedBy: 'admin_1' }

      // Mock prisma methods
      prisma.user.findUnique.mockResolvedValue(oldUser)
      prisma.user.update.mockResolvedValue({ ...oldUser, ...updatedData })

      // Execute update with middleware
      await userService.updateUser('user_1', updatedData)

      // Verify history creation
      expect(prisma.userHistory.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            userId: 'user_1',
            field: 'role',
            oldValue: 'mahasiswa',
            newValue: 'admin',
            changedBy: 'admin_1',
          }),
        ]),
      })
    })

    it('should not create history when no fields changed', async () => {
      // Setup & mocking
      // ...

      // Assert no history created
      expect(prisma.userHistory.createMany).not.toHaveBeenCalled()
    })
  })
  ```

- **Integration Testing:**

  ```typescript
  // api/admin/history.test.ts
  describe('History API Endpoints', () => {
    it('should return 403 for non-admin users', async () => {
      // Setup non-admin user session
      // ...

      const response = await request(app)
        .get('/api/admin/history')
        .set('Authorization', `Bearer ${nonAdminToken}`)

      expect(response.status).toBe(403)
    })

    it('should return filtered history by date range', async () => {
      // Setup admin session
      // ...

      const response = await request(app)
        .get('/api/admin/history?startDate=2024-05-01&endDate=2024-05-30')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body[0]).toHaveProperty('createdAt')
      // Verify date is within range
      expect(new Date(response.body[0].createdAt)).toBeAfter(
        new Date('2024-05-01')
      )
    })
  })
  ```

#### 5. **Implementasi Data Retention & Cleaning** _(0.5 Hari)_

- **Strategi Retention:**

  - Implementasi cron job untuk archiving data history yang sudah lama:

  ```typescript
  // cron/history-cleanup.ts
  import cron from 'node-cron'

  // Run once a month at midnight on the 1st
  cron.schedule('0 0 1 * *', async () => {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    // Option 1: Delete old history
    await prisma.userHistory.deleteMany({
      where: { createdAt: { lt: oneYearAgo } },
    })

    // Option 2: Archive to cold storage
    const oldRecords = await prisma.userHistory.findMany({
      where: { createdAt: { lt: oneYearAgo } },
    })

    // Archive to S3 or other storage
    await archiveService.storeRecords('user_history', oldRecords)

    console.log(`Archived ${oldRecords.length} history records`)
  })
  ```

#### 6. **Dokumentasi** _(0.5 Hari)_

- Update `README.md` dengan:
  - Struktur tabel `UserHistory`.
  - Contoh request/response API.
  - Cara mengatur retention policy (opsional).

---

### **Acceptance Criteria**

- [x] Setiap perubahan data user (via admin UI atau Clerk webhook) mencatat riwayat di `UserHistory`.
- [x] Admin bisa filter riwayat berdasarkan user, tanggal, atau field.
- [x] Latency penambahan history <300ms (diukur via logging).
- [x] 100% akses ilegal ke endpoint history ditolak (test dengan Postman).
- [x] Unit dan integration tests mencakup minimal 80% kode yang terkait history.
- [x] Data retention strategy diimplementasikan dan terdokumentasi.

---

### **Contoh Response API**

```json
[
  {
    "id": "hist_123",
    "userId": "user_456",
    "field": "role",
    "oldValue": "mahasiswa",
    "newValue": "admin",
    "changedBy": "admin_789",
    "createdAt": "2024-05-30T10:00:00Z"
  }
]
```

---

### **Catatan Penting**

1. **Idempotensi:**
   - Pastikan event duplikat (misal: webhook Clerk terkirim 2x) tidak membuat entri duplikat.
2. **Backup & Retention:**
   - Data history > 1 tahun akan diarsipkan ke cold storage secara otomatis.
   - Pastikan proses archiving tidak mempengaruhi performa API.
3. **Testing Strategy:**
   - Implementasikan TDD dengan menulis test terlebih dahulu sebelum implementasi.
   - Prioritaskan test untuk handler API dan middleware history.
4. **Referensi:**
   - [Prisma Middleware](https://www.prisma.io/docs/orm/prisma-client/client-extensions/middleware)
   - [Clerk User Metadata](https://docs.clerk.dev/popular-guides/metadata)
   - [Jest Testing Best Practices](https://jestjs.io/docs/testing-frameworks)

---

Task ini siap diassign ke `@backend-dev`! 🚀
