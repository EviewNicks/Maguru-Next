# Sprint 3

**Periode:** 17/4 hingga 30/4  
**Fokus:** Integrasi Webhook Clerk dan Peningkatan Sistem Manajemen Pengguna
**Tambahan:** Penerapan **Test-Driven Development (TDD)**, dengan unit, integration, dan E2E testing.

---

## 🎯 Sprint Goals

- **Integrasi Webhook Clerk:** Mengintegrasikan webhook Clerk dengan proyek yang telah dideploy di Vercel untuk memastikan sinkronisasi data pengguna secara real-time.
- **Peningkatan UI/UX:** Memperbarui desain halaman manajemen pengguna untuk memudahkan navigasi dan pengelolaan pengguna oleh admin.
- **Implementasi Role-Based Permission:** Menerapkan sistem izin berbasis peran untuk operasi pembaruan dan penghapusan pengguna.
- **Tracking Perubahan Data Pengguna:** Membangun fitur untuk melacak riwayat perubahan data pengguna.

---

## 📅 Timeline

| Minggu      | Fokus Utama                                                    |
| ----------- | -------------------------------------------------------------- |
| 17/4 - 23/4 | Setup Integrasi Webhook dan Desain UI Baru                     |
| 24/4 - 30/4 | Implementasi Role-Based Permission dan Tracking Perubahan Data |

---

## 🧩 EPIC-61 – User Management

### 🔹 User Story OPS-58

📎 [Lihat di Jira](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-58)

#### Task:

- **OPS-54:** Mengembangkan fitur untuk melacak riwayat perubahan data pengguna  
  🔗 [Link Task](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-54)

  - **Assignee:** [Developer 1]
  - **Estimasi:** 5 Story Points
  - **Status:** 🟡 On Progress
  - **Acceptance Criteria:**
    - Data perubahan role, status, dan informasi profil pengguna tercatat dalam database
    - Admin dapat melihat log perubahan dengan filter berdasarkan tanggal
    - UI menampilkan riwayat perubahan dengan jelas menunjukkan nilai sebelum dan sesudah

- **OPS-55:** Menerapkan sistem izin berbasis peran untuk operasi pembaruan dan penghapusan pengguna  
  🔗 [Link Task](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-55)

  - **Assignee:** [Developer 2]
  - **Estimasi:** 8 Story Points
  - **Status:** 🟡 On Progress
  - **Acceptance Criteria:**
    - Admin memiliki akses penuh ke semua operasi CRUD pengguna
    - Dosen hanya dapat melihat dan memperbarui informasi terkait mahasiswa mereka
    - Mahasiswa hanya dapat melihat dan mengedit profil mereka sendiri
    - Upaya akses tidak sah memunculkan pesan error yang sesuai

- **OPS-146:** Memperbarui desain UI halaman manajemen pengguna sesuai dengan kebutuhan navigasi yang lebih baik  
  🔗 [Link Task](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-146)
  - **Assignee:** [Frontend Developer]
  - **Estimasi:** 5 Story Points
  - **Status:** 🟢 Completed
  - **Acceptance Criteria:**
    - UI mengikuti desain pada mockup Figma dengan akurasi minimal 95%
    - Pengguna dapat memfilter daftar berdasarkan role dan status
    - Pagination menampilkan 10 pengguna per halaman dengan opsi mengubah jumlah
    - UI responsif dan bekerja dengan baik pada tablet dan desktop

---

### 🔹 User Story OPS-59

📎 [Lihat di Jira](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-59)

#### Task:

- **OPS-56:** Mengintegrasikan webhook Clerk dengan proyek yang telah dideploy di Vercel untuk sinkronisasi data pengguna  
  🔗 [Link Task](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-56)

  - **Assignee:** [Backend Developer]
  - **Estimasi:** 8 Story Points
  - **Status:** 🟡 On Progress
  - **Acceptance Criteria:**
    - Webhook berhasil menerima notifikasi saat pengguna mendaftar di Clerk
    - Data pengguna baru otomatis tersimpan di database lokal
    - Perubahan profil di Clerk tercermin di database lokal dalam waktu < 5 detik
    - Sistem menangani error dengan retry mechanism dan logging

- **OPS-147:** Memperbarui konfigurasi Prisma Client dan pengaturan deployment di Vercel untuk mendukung integrasi webhook  
  🔗 [Link Task](https://eviewnicks-1738239611759.atlassian.net/browse/OPS-147)
  - **Assignee:** [DevOps Engineer]
  - **Estimasi:** 3 Story Points
  - **Status:** 🟡 On Progress
  - **Acceptance Criteria:**
    - Prisma Client diregenerasi pada setiap deployment Vercel
    - Endpoint webhook dapat diakses tanpa autentikasi dari Clerk
    - Environment variables Clerk sudah terkonfigurasi dengan benar di Vercel
    - Deployment berhasil tanpa error terkait Prisma atau konfigurasi

---

## 🧪 Test Plan

### Unit Testing

- Pengujian fungsi-fungsi izin berbasis peran
- Pengujian fungsi tracking perubahan data
- Pengujian komponen UI manajemen pengguna

### Integration Testing

- Integrasi webhook Clerk dengan database
- Integrasi sistem izin dengan UI manajemen pengguna

### E2E Testing

- Alur lengkap perubahan data pengguna dan tracking history
- Alur lengkap manajemen pengguna dengan berbagai role

---

## 🔗 Dependencies & Risks

### ✅ Dependencies:

- **Integrasi Webhook Clerk:**

  - Bergantung pada konfigurasi yang tepat di Vercel, termasuk penonaktifan proteksi autentikasi deployment.
  - Penambahan API Keys Clerk ke dalam environment variables.

- **Prisma Client:**
  - Memastikan Prisma Client diperbarui pada setiap deployment untuk mencegah penggunaan versi lama.

### ⚠️ Risks & Challenges:

- **Kegagalan Webhook:** Jika proteksi autentikasi deployment di Vercel tidak dinonaktifkan, webhook dari Clerk dapat gagal.
- **Caching Prisma Client:** Vercel dapat menggunakan versi Prisma Client yang sudah di-cache jika tidak dikonfigurasi untuk regenerasi otomatis.
- **Mitigation Plan:**
  - Implement logging yang komprehensif untuk mendeteksi kegagalan webhook secara real-time
  - Persiapkan rollback plan jika deployment menyebabkan masalah

---

## ✅ Definition of Done (DoD)

Sebuah task dianggap selesai jika:

- Semua fitur telah diuji dan berfungsi tanpa error.
- Desain UI/UX sesuai dengan spesifikasi yang telah ditentukan.
- Webhook Clerk berhasil mengirimkan data ke endpoint yang sesuai dan data pengguna diperbarui secara real-time.
- Prisma Client diperbarui dan tidak menggunakan versi yang di-cache.
- Kode telah direview dan di-merge ke branch utama.
- Dokumentasi teknis telah diperbarui untuk mencerminkan perubahan yang dilakukan.
- Semua acceptance criteria terpenuhi dan diverifikasi oleh QA.

---

## 🔍 Sprint Retrospective & 📌 Next Steps

### 🔄 Evaluasi Sprint:

- ✅ **Keberhasilan:**
  - Integrasi webhook Clerk berhasil.
  - Pembaruan UI halaman manajemen pengguna berjalan lancar.
- ⚠️ **Tantangan:**
  - Menghadapi masalah dengan proteksi autentikasi deployment di Vercel yang menghambat pengiriman webhook.
  - Keterlambatan dalam implementasi role-based permission karena kompleksitas yang lebih tinggi dari perkiraan awal.

### 🧭 Rencana Sprint Berikutnya:

- **Peningkatan Modul Akademik:**
  - Melanjutkan pengembangan modul akademik dengan menambahkan fitur-fitur baru.
- **Pengujian Lanjutan:**
  - Melakukan pengujian lebih lanjut untuk memastikan stabilitas sistem setelah integrasi webhook.
- **Optimasi Performa:**
  - Meningkatkan kecepatan loading halaman manajemen pengguna dengan implementasi caching.
