Berikut adalah deskripsi lengkap dan breakdown untuk **Task OPS-54: Kebutuhan Track History Perubahan User**:

---

### **Task OPS-54: Kebutuhan Track History Perubahan User**

**Assignee:** `@backend-dev`  
**Reviewer:** `@tech-lead`  
**Deadline:** `7 Juni 2024`  
**Story Points:** `5` (kompleksitas sedang)  
**Dependencies:**

- Skema User Prisma sudah diupdate ([OPS-147](link-ke-ops147)).
- RBAC sudah diperbaiki ([OPS-148](link-ke-ops148)).

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

#### 4. **Pengujian & Security** _(1 Hari)_

- **Test Case:**
  1.  Admin mengubah role user → history tercatat.
  2.  User non-admin mencoba akses endpoint → error 403.
  3.  Bulk update → pastikan semua perubahan tercatat.
- **Security:**
  - Validasi input untuk mencegah SQL injection.
  - Enkripsi data sensitif (jika diperlukan).

#### 5. **Dokumentasi** _(0.5 Hari)_

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
   - Diskusikan retention policy (misal: hapus data >1 tahun) untuk task berikutnya.
3. **Referensi:**
   - [Prisma Middleware](https://www.prisma.io/docs/orm/prisma-client/client-extensions/middleware)
   - [Clerk User Metadata](https://docs.clerk.dev/popular-guides/metadata)

---

Task ini siap diassign ke `@backend-dev`! 🚀
