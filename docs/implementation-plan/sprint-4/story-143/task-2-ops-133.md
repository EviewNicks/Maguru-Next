# Task OPS-133: Pengelolaan Status Modul

**Assignee:** `@backend-frontend-dev`  
**Reviewer:** `@modul-reviewer`  
**Deadline:** `7 April 2025`  
**Story Points:** `5` (kompleksitas sedang)  
**Dependencies:**

- Endpoint update status modul (API Next.js)
- Enum status di database (Prisma)
- UI/UX status modul (Figma/Design System)
- Middleware autentikasi admin (Clerk)

---

## Deskripsi Task

Mengimplementasikan fitur pengelolaan status modul (published, draft, archived/active) agar admin dapat mengatur ketersediaan modul secara dinamis. Status modul akan mempengaruhi visibilitas modul di sisi user dan proses pembelajaran.

**Tujuan:**

1. Memungkinkan admin mengubah status modul dengan mudah dan aman.
2. Menjamin hanya modul dengan status valid yang dapat diakses user.
3. Menyediakan feedback real-time dan audit trail setiap perubahan status.

---

## Breakdown Subtask

### 1. **Desain & Implementasi Enum Status di Database** _(0.5 Hari)_

- Tambahkan enum status (`DRAFT`, `ACTIVE`, `ARCHIVED`) pada model modul di Prisma.
- Sinkronisasi enum antara backend & frontend.

### 2. **API Update Status Modul** _(1 Hari)_

- Endpoint: `PATCH /api/modules/:id/status`.
- Validasi input status (hanya nilai enum yang valid).
- Middleware autentikasi & otorisasi admin.
- Audit trail untuk setiap perubahan status.

### 3. **Integrasi UI Status Modul** _(1 Hari)_

- Komponen dropdown/status switch di halaman admin modul.
- Indikator status di tabel/list modul.
- Notifikasi sukses/error saat update status.

#### Contoh Struktur Komponen:

```tsx
<ModuleStatusDropdown
  value={status}
  onChange={handleStatusChange}
  options={['DRAFT', 'ACTIVE', 'ARCHIVED']}
/>
```

### 4. **Testing & Validasi** _(1 Hari)_

- Unit test untuk fungsi update status.
- Integration test untuk API & UI.
- E2E test untuk alur admin mengubah status modul.

### 5. **Dokumentasi & User Guide** _(0.5 Hari)_

- Update README/module docs untuk instruksi pengelolaan status modul.
- Contoh payload API & skenario penggunaan.

---

## Acceptance Criteria

- [x] Admin dapat mengubah status modul melalui UI.
- [x] Status modul hanya bisa diubah ke nilai enum yang valid.
- [x] Status modul terlihat jelas di UI (badge/label/indikator).
- [x] Hanya modul berstatus ACTIVE yang dapat diakses user.
- [x] Audit trail mencatat setiap perubahan status.
- [x] Notifikasi sukses/error muncul sesuai aksi.
- [x] Unit, integration, dan E2E test coverage minimal 80%.

---

## Catatan Penting

1. **Error Handling:**
   - Validasi input status wajib (enum valid).
   - Tampilkan notifikasi error/sukses di UI (toast/snackbar).
2. **Performance:**
   - Optimalkan query untuk filter modul berdasarkan status.
   - Gunakan cache/optimistic update di frontend untuk responsif.
3. **Accessibility (A11y):**
   - Pastikan dropdown/status switch dapat diakses keyboard.
   - Tambahkan ARIA label pada elemen status.
4. **Testing:**
   - Terapkan TDD, prioritaskan test untuk validasi status dan event handler.
   - Gunakan mock API untuk integration test.

---

## Referensi

- [OPS-133 (Jira)](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-133)
- [Prisma Enum](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query/latest)
