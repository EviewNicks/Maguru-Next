# Overview

Sprint 1 berlangsung dari 31/1 hingga 13/2. Fokus utama sprint ini adalah mengimplementasikan fitur autentikasi pengguna, setup database, dan pembuatan dashboard admin untuk pengelolaan user.

## Sprint Goals

- Pengguna dapat membuat akun dan mengakses platform.
- Admin dapat mengelola data pengguna melalui dashboard.
- Backend mendukung autentikasi dan pengelolaan user menggunakan Clerk dan Supabase.

## User Stories & Task

### Story 1 : Autentikasi Pengguna

**Sebagai Pengguna, Saya ingin bisa membuat akun agar bisa mengakses Platform**

#### Task 1: Setup Backend Authentication dengan Clerk

- Implementasi autentikasi menggunakan Clerk.
- Konfiguasi Next.js untuk sesi login & registrasi.
- Integrasi dengan database Supabase.

#### Task 2: Implementasi UI/UX Halaman login & register

- Connect halaman login & register dari Clerk ke project.
- Konfiguasi Next.js untuk sesi login & registrasi.

#### Task 3: Setup Database Schema untuk User

- Struktur database untuk menyimpan informasi user.
- Menggunakan Prisma sebagai ORM untuk pengelolaan data user.

### Story 2 : Pengelolaan User oleh Admin

**Sebagai Admin, saya ingin mengelola data pengguna agar bisa memastikan keamanan sistem.**

#### Task 4: Buat Dashboard Admin untuk Mengelola User

- Menampilkan daftar user dalam tabel interaktif.
- Fitur edit role & hapus user dengan dialog konfirmasi.

#### Task 5: Implementasi API endpoint untuk CRUD User

- API untuk mengambil, menambah, mengedit, dan menghapus user.
- Menggunakan REST API dengan Next.js API Routes.

## Sprint Deliverables

- Repository GitHub dengan Struktur proyek Next.js + TypeScript.
- Sistem autentikasi user menggunakan Clerk.
- UI/UX awal untuk halaman login, register, dan dashboard.
- API dasar untuk CRUD pengguna.
- Database schema yang siap digunakan untuk pengelolaan data user.

## Dependencies & Risks

### Dependencies:

- Integrasi autentikasi tergantung pada penyelesaian setup database.
- Desain UI harus diselesaikan sebelum implementasi halaman login & dashboard.

### Risks & Challenges:

- Mungkin ada perubahan requirement terkait sistem autentikasi.
- Potensi kendala dalam desain UI yang memerlukan revisi.

## Definition of Done (DoD)

Sebuah task dianggap selesai jika:

- Code sudah diimplementasikan, diuji, dan berjalan tanpa error.
- UI/UX sesuai dengan desain yang telah dibuat.
- API bekerja sesuai dengan spesifikasi dan dapat diuji dengan Postman.
- Code sudah di-review dan di-merge ke branch utama.

## Sprint Retrospective & Next Steps

### Evaluasi Sprint:

- Semua task telah selesai tepat waktu.
- Beberapa tantangan ditemukan dalam desain UI yang memerlukan iterasi lebih lanjut.
- API untuk CRUD user berjalan sesuai spesifikasi.

### Next Steps:

- Sprint Review & Demo hasil Sprint 1.
- Penerapan WebHook Clerk untuk versi release awal.
- Persiapan untuk Sprint 2: Implementasi Modul Pembelajaran.
