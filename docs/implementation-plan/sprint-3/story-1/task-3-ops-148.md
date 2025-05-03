Berikut breakdown **Task OPS-148: Perbaikan RBAC Access** yang mencakup deskripsi, subtask teknis, dan rekomendasi implementasi:

---

### **Task OPS-148: Perbaikan RBAC Access**

**Assignee:** `@backend-dev`  
**Reviewer:** `@tech-lead`  
**Deadline:** `5 Juni 2024`  
**Story Points:** `5` (moderate complexity)  
**Dependencies:**

- Membutuhkan data role dari Clerk dan database lokal (terkait [OPS-56](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-56)).
- Integrasi dengan caching system (misal: Redis atau in-memory cache).

---

### **Deskripsi Task**

Memperbaiki sistem Role-Based Access Control (RBAC) untuk memastikan sinkronisasi role antara Clerk dan database lokal, serta meningkatkan performa pemeriksaan akses dengan caching.

**Tujuan:**

1. Memastikan middleware RBAC bekerja dengan real-time data updates.
2. Menghilangkan error pada validasi role (misal: admin tidak terdeteksi).
3. Meningkatkan kecepatan akses kontrol dengan caching role.

---

### **Breakdown Subtask & Estimasi**

#### 1. **Evaluasi Middleware RBAC** _(1 hari)_

- Audit kode middleware yang ada untuk mencari pola error (misal: `pages/api/_middleware.ts`).
- Identifikasi titik gagal:
  - Pengecekan role yang tidak konsisten (Clerk vs database).
  - Race condition saat update role.
- Contoh error yang perlu diperbaiki:
  ```typescript
  // Contoh middleware yang bermasalah
  if (user.role !== 'admin') {
    return new Response('Unauthorized', { status: 401 }) // Role tidak sinkron
  }
  ```

#### 2. **Perbaikan Sinkronisasi Role** _(2 hari)_

- **Clerk ↔ Database Sync:**
  - Pastikan webhook Clerk (`user.updated`) mengupdate field `role` di database.
  - Contoh handler webhook:
    ```typescript
    // Di /api/clerk-webhook.js
    await prisma.user.update({
      where: { clerkUserId: payload.data.id },
      data: { role: payload.data.public_metadata?.role || 'mahasiswa' },
    })
    ```
- **Endpoint Manual Sync** (fallback):
  ```typescript
  // GET /api/users/sync-roles
  const users = await clerk.users.getUserList();
  await prisma.$transaction(users.map(user => ...)); // Sync semua role
  ```

#### 3. **Implementasi Caching untuk Role** _(1.5 hari)_

- Gunakan **Redis** atau **LRU Cache** untuk menyimpan data role.
- Contoh implementasi:

  ```typescript
  // utils/cache.ts
  import { LRUCache } from 'lru-cache';
  const roleCache = new LRUCache<string, string>({ max: 1000, ttl: 60_000 });

  // Middleware
  const cachedRole = roleCache.get(userId) || await prisma.user.findUnique(...);
  roleCache.set(userId, cachedRole);
  ```

- Cache invalidation saat terjadi perubahan role:
  ```typescript
  // Di webhook handler
  roleCache.delete(updatedUser.clerkUserId)
  ```

#### 4. **Backward Compatibility** _(0.5 hari)_

- Pastikan fitur tetap bekerja dengan API endpoints yang sudah ada:
  ```typescript
  // Wrapper untuk backward compatibility
  export function getRoleWithCompat(user) {
    // Support format lama:
    if (user.metaData?.role) return user.metaData.role
    // Format baru:
    return user.role || 'mahasiswa'
  }
  ```
- Implementasi phase-out plan:
  - Tetap support format lama selama 30 hari
  - Tambahkan deprecation warning di response
  - Dokumentasikan API versi baru

#### 5. **Pengujian RBAC** _(1 hari)_

- **Skenario Testing:**
  1.  User dengan role `mahasiswa` tidak bisa akses `/api/admin`.
  2.  Admin mengupdate role user di Clerk → akses langsung terupdate.
  3.  Stress test dengan 50+ concurrent request untuk cek caching.
  4.  Request dari API lama masih berfungsi dengan benar.
- **Tools:**
  - Postman/Thunder Client untuk manual test.
  - Artillery/Jest untuk load testing.

---

### **Acceptance Criteria**

- [x] Middleware RBAC mengizinkan akses sesuai role yang **terkini** (sinkron Clerk-database).
- [x] Waktu pemeriksaan role <500ms berkat caching.
- [x] Error "Invalid role" berkurang 100% di Sentry.
- [x] Dokumentasi RBAC flow tersedia di `README.md`.
- [x] API endpoints lama tetap berfungsi dengan format baru.

---

### **Contoh Perbaikan Middleware**

```typescript
// pages/api/_middleware.ts
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleCache } from "@/utils/cache";

export async function middleware(req) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.redirect("/login");

  // Cek cache
  let role = roleCache.get(userId);
  if (!role) {
    const user = await prisma.user.findUnique({ where: { clerkUserId: userId });
    role = user?.role || 'mahasiswa';
    roleCache.set(userId, role);
  }

  // Block non-admin dari route /admin
  if (req.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}
```

---

### **Catatan Penting**

1. **Fallback Mechanism:**
   - Jika cache gagal, middleware harus tetap mengambil role dari database.
2. **Monitoring:**
   - Track cache hit/miss ratio di Prometheus/Grafana.
3. **Backward Compatibility:**
   - Komunikasikan perubahan format API ke tim frontend
   - Berikan masa transisi minimal 4 minggu sebelum menghapus support format lama
4. **Referensi:**
   - [Clerk Role Metadata](https://docs.clerk.dev/popular-guides/metadata)
   - [Prisma + Redis Caching](https://www.prisma.io/docs/orm/prisma-client/performance/connection-pooling#use-cache)
   - [API Versioning Best Practices](https://www.moesif.com/blog/technical/api-design/API-Versioning-Methods-a-Brief-Overview/)

---

Task ini siap diassign ke `@backend-dev`! 🚀
