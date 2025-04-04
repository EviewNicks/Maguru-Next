# Langkah 2: Implementasi Halaman Manajemen Modul di Frontend

🔗 [OPS-29](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-29)


## Deskripsi
Membangun halaman admin untuk mengelola modul secara visual dan efisien. Halaman ini harus menampilkan data modul melalui datatable yang mendukung server-side pagination, sorting, pencarian (dengan debounce), dan filter. Selain itu, halaman ini menyediakan form modal CRUD dengan validasi real-time (menggunakan react-hook-form + Zod), optimistik update untuk meningkatkan UX, serta sanitasi output untuk mencegah XSS.

## Sub-Langkah

### 2.1. Pembuatan Halaman Admin Modul
**Tugas:**
- Buat halaman di `pages/admin/module.tsx` menggunakan Next.js.
- Desain layout dengan header, sidebar (components\layouts\Sidebar.tsx), dan area utama untuk datatable.

**Kriteria Keberhasilan:**
- Halaman dapat diakses dan menampilkan layout yang rapi, meskipun datatable masih kosong.

### 2.2. Implementasi Komponen Datatable
**Tugas:**
- Buat komponen `ModuleTable.tsx` dengan kolom:
  - **Judul** (pastikan disanitasi jika menampilkan HTML)
  - **Deskripsi** – Tampilkan teks yang di-truncate maksimal 100 karakter, dengan opsi "Lihat Selengkapnya".
  - **Status**
  - **Tanggal Dibuat**
  - **Aksi** (Edit, Hapus)
- Terapkan virtual scrolling menggunakan `@tanstack/react-virtual` atau `react-virtualized` untuk optimasi jika data lebih dari 500 baris.


**Kriteria Keberhasilan:**
- Datatable dapat menampilkan data dengan cepat dan efisien (>1.000 baris).

### 2.3. Fitur Pagination, Sorting, Pencarian, dan Filter
**Tugas:**
- Integrasikan server-side pagination dengan endpoint API (misal: `/api/module?page=2&limit=10`).
- Pastikan sorting dilakukan di backend.
- Tambahkan input pencarian dengan debounce (300ms).
- Tambahkan dropdown filter untuk status modul (DRAFT, ACTIVE, ARCHIVED).

**Kriteria Keberhasilan:**
- Data diperbarui secara real-time berdasarkan parameter pagination, sorting, pencarian, dan filter.

### 2.4. Form Modal CRUD
**Tugas:**
- Buat komponen `ModuleFormModal.tsx` untuk Tambah/Edit modul.
- Gunakan `react-hook-form` dan `@hookform/resolvers/zod` untuk validasi real-time menggunakan schema Zod.
- Form mencakup field:
  - **Judul** (validasi 5-100 karakter)
  - **Deskripsi**
  - **Status**
- Tampilkan pesan error jika input tidak valid.

**Kriteria Keberhasilan:**
- Modal CRUD muncul saat tombol "Tambah" atau "Edit" diklik, dengan validasi input yang benar.

### 2.5. API Integration dengan React Query
**Tugas:**
- Gunakan React Query untuk mengambil data modul.
- Implementasikan mutation CRUD dengan optimistik update.

**Kriteria Keberhasilan:**
- Data ter-update otomatis setelah operasi CRUD dengan optimistik update.

### 2.6. Notifikasi Real-Time & Error Handling
**Tugas:**
- Integrasikan notifikasi menggunakan `Sonner` atau `React Hot Toast`.
- Buat komponen `ErrorNotifier.tsx` untuk menampilkan error secara konsisten.

**Kriteria Keberhasilan:**
- Notifikasi muncul untuk setiap operasi sukses/gagal.

### 2.7. Sanitasi Output untuk Mencegah XSS
**Tugas:**
- Gunakan `DOMPurify` untuk men-sanitasi deskripsi modul.

**Kriteria Keberhasilan:**
- Semua output HTML aman dari XSS.

---

## Dependencies & Prasyarat (Frontend)
**Wajib:**
- Next.js, React, Tailwind CSS, shadcn/ui
- React Query
- Axios
- react-hook-form & @hookform/resolvers/zod
- Virtual scrolling library (`@tanstack/react-virtual`)
- DOMPurify
- Notifikasi library (Sonner/React Hot Toast)

**Opsional:**
- `lodash.debounce` jika tidak menggunakan debounce kustom

---

## Acceptance Criteria untuk Langkah 2
| Sub-Langkah | Kriteria Keberhasilan |
|------------|----------------------|
| 2.1. Halaman Admin Modul | Halaman `/admin/module` dapat diakses dan menampilkan layout datatable yang rapi. |
| 2.2. Komponen Datatable | Datatable menampilkan kolom yang sesuai, dengan virtual scrolling. |
| 2.3. Pagination & Filter | Data modul diperbarui secara server-side dengan pagination, sorting, pencarian, dan filter. |
| 2.4. Form Modal CRUD | Modal CRUD muncul dengan validasi real-time berdasarkan schema Zod. |
| 2.5. API Integration | Data modul terintegrasi dengan React Query dan optimistik update. |
| 2.6. Notifikasi & Error | Notifikasi muncul untuk operasi sukses/gagal, error ditampilkan secara konsisten. |
| 2.7. Sanitasi Output | Output HTML aman dari XSS dengan DOMPurify. |

---

## Catatan Tambahan
- **Real-Time Propagation:**
  - Perubahan status modul akan diupdate real-time dengan React Query dan nantinya WebSocket/SSE di Langkah 5.
- **Optimistic Updates:**
  - Pastikan setiap operasi CRUD menggunakan optimistik update.
- **Batch Operations:**
  - Fitur batch delete/update bisa dipertimbangkan di iterasi berikutnya.
- **Virtual Scrolling & Debounce:**
  - Uji dengan data >1.000 baris untuk memastikan skalabilitas.