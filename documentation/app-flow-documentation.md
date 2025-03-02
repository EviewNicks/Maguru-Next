# Pendahuluan

## 1.1 Tujuan Dokumen

Dokumen ini menggambarkan secara mendalam alur pengguna dalam aplikasi, mencakup autentikasi, navigasi antar fitur, dan interaksi dengan elemen UI. Ini bertujuan membantu tim desain dan frontend memastikan pengalaman pengguna yang mulus dan intuitif.

## 1.2 Ruang Lingkup

Mencakup fitur yang telah dikembangkan hingga Sprint 2:

- **Autentikasi pengguna** (login/register melalui Clerk).
- **Dashboard admin** untuk mengelola pengguna dan modul akademik.
- **Modul pembelajaran** dengan navigasi halaman dan quiz otomatis.

---

# Diagram Alur Aplikasi

## Autentikasi Pengguna:

1. User melakukan login/registrasi melalui Clerk.
2. Jika sukses, Clerk mengembalikan `userId` → Disimpan di Redux untuk state management.
3. Data pengguna (role, status) diambil dari Supabase.
4. Middleware mengecek role untuk menentukan akses halaman.

## Dashboard Admin:

1. Admin masuk ke dashboard → Melihat daftar user dengan tabel interaktif.
2. Admin bisa:
   - Mengubah role (dosen, mahasiswa, admin) dengan dialog konfirmasi.
   - Menghapus user (dengan validasi keamanan).
   - Mengelola modul akademik (CRUD modul + status aktif/tidak aktif).

## Alur Pembelajaran:

1. User memilih path belajar (statis untuk saat ini).
2. Materi dibagi dalam beberapa halaman → Navigasi antar halaman dengan state Redux.
3. Setelah menyelesaikan materi, user mengakses quiz.
4. Quiz otomatis mengoreksi jawaban & menyimpan skor ke database.

---

# Testing & Feedback

- **Unit Test**: Menguji fungsi-fungsi utama (UI, API handler, validasi input).
- **Integration Test**: Menguji integrasi antar fitur (misal: login → akses modul → submit quiz).
- **E2E Test**: Menguji keseluruhan user flow (Cypress digunakan untuk simulasi interaksi pengguna).

---

# Deskripsi Modul

## **Modul Autentikasi**

- Mengatur login/register via Clerk, validasi sesi, dan pengaturan role.

## **Dashboard Admin**

- CRUD pengguna dan modul akademik, dengan tabel interaktif dan konfirmasi aksi.

## **Modul Pembelajaran**

- Materi terbagi jadi beberapa halaman.
- Navigasi halaman dengan breadcrumb + tombol next/prev.

## **Quiz**

- Mendukung quiz multiple choice.
- Koreksi otomatis, skor langsung muncul setelah submit.

---

# Antarmuka Pengguna

## **Login/Register**

- Form sederhana yang langsung terhubung ke Clerk.

## **Dashboard Admin**

- Tabel interaktif dengan sorting & searching.
- Modal konfirmasi untuk aksi penting (ubah role, hapus user).

## **Halaman Modul**

- Layout multi-halaman dengan navigasi jelas.
- Progress bar untuk menunjukkan tingkat penyelesaian modul.

## **Quiz UI**

- Form multiple choice.
- Tombol submit quiz → Menampilkan skor dan pembahasan jawaban.

---

# Catatan Teknis

- **Framework**: Next.js (React) + TypeScript.
- **UI Library**: shadcn/ui + Tailwind CSS.
- **State Management**: Redux (untuk navigasi & tracking progres).
- **Backend**: Next.js API Routes.
- **Database**: Supabase (PostgreSQL).
- **Autentikasi**: Clerk.

## **Testing:**

- **Unit Test**: Jest.
- **Integration Test**: Supertest.
- **E2E Test**: Cypress.
