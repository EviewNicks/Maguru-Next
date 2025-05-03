# Dashboard Admin Overview

## Sprint 2 (1/3 - 14/3)

- Implementasi modul akademik dasar, quiz sederhana (multiple choice), dan path belajar statis.
- Penerapan Test-Driven Development (TDD), dengan unit, integration, dan E2E testing.

## Sprint Goals

- User dapat mengakses modul akademik berbasis teks dan quiz sederhana.
- Admin bisa membuat & mengelola modul.
- Path belajar tersedia secara statis, bisa berkembang ke depannya.
- Coverage testing minimal 80% untuk fitur kritis.

## User Stories & Task

### Story 1: Sebagai mahasiswa, saya ingin mengakses materi pembelajaran bertahap agar saya bisa belajar lebih mudah dan fokus.

#### Task 1: Buat Struktur modul berbasis multiple page
- Membuat file & Struktur Dasar
- Memproses Data Modul
- Menghubungkan Data dengan Komponen
- Sinkronisasi Data progress
- Optimasi untuk Modul Besar
- Fallback dan validasi Data

#### Task 2: Implementasi navigasi antar halaman
- Membuat komponen Navigasi
- Menambahkan Logika Navigasi
- Validasi dan feedback Real-Time
- Modul Eksplorasi Cepat (Quick View Mode)
- Sinkronisasi & penyimpanan Progress
- Fallback dan edge cases

#### Task 3: Buat dan Tambahkan Progress visual
- Membuat komponen progres visual
- Menghubungkan Data progress
- Menampilkan indikator progress
- Menambahkan tooltip dan feedback visual
- Sinkronisasi dan Fallback
- Validasi dan Edge Cases
- Testing dan Debugging

#### Task 4: Implementasi Halaman terakhir
- Membuat komponen Halaman Terakhir
- Mengevaluasi Kesiapan Quiz
- Menampilkan Feedback dan Opsi
- Rekomendasi Halaman yang harus diulang
- Pengelolaan Navigasi ke Quiz
- Sinkronisasi dan Logging
- Validasi dan Edge Cases
- Testing & Debugging

### Story 2: Sebagai Admin, saya ingin membuat dan mengelola modul agar konten pembelajaran selalu up-to-date.

#### Task 5: CRUD modul akademik (API & UI)
#### Task 6: Status modul: aktif, dikembangkan, tidak tersedia.

### Story 3: Sebagai mahasiswa, saya ingin melihat progress belajar saya agar saya tahu sejauh mana perkembangan saya dalam menguasai materi.

#### Task 7: Progress tracker per modul
#### Task 8: Dasar learning path Dinamis

### Story 4: Sebagai mahasiswa, saya ingin mengerjakan quiz dan melihat skor saya agar saya tahu seberapa paham materi yang saya pelajari.

#### Task 9: Integrasi quiz multiple choice sederhana
#### Task 10: Kalkulasi skor otomatis & feedback jawaban

### Story 5: Sebagai developer, saya ingin fitur yang stabil & teruji agar platform bisa digunakan tanpa bug pada Sprint 2.

#### Task 11: Unit test untuk komponen utama modul.
#### Task 12: Integration test untuk alur modul & quiz.
#### Task 13: E2E test untuk user flow (akses materi, kerjakan quiz).

## Sprint Deliverables

- UI/UX dasar untuk modul akademik.
- Fitur quiz sederhana dengan skor dasar.
- API modul (Next.js API Routes).
- Testing coverage > 80% untuk fitur kritis.

## Dependencies & Risks

### Dependencies:
- Library Quiz/Testing (React Hook Form untuk handling quiz, Jest & Cypress untuk testing).
- Struktur state management (Redux) untuk tracking progress dan navigasi antar halaman modul.
- API autentikasi (Clerk) untuk mengatur akses modul.

### Risks & Challenges:
- **Ketidakseimbangan Scope & Waktu**: Risiko terlalu banyak fitur dalam waktu singkat → **Mitigasi**: Fokus ke fitur dasar dulu, fitur lanjutan disusun untuk sprint berikutnya.
- **Kesulitan Integrasi Testing**: Proses testing bisa memakan waktu lebih lama dari perkiraan → **Mitigasi**: Implementasi bertahap (unit test dulu, baru integration test).

## Definition of Done (DoD)

Sebuah task dianggap selesai jika:
- Modul akademik dapat diakses oleh user dengan sub-modul terpisah.
- Quiz multiple choice berjalan normal, jawaban dikoreksi otomatis.
- Semua fitur memiliki minimal 80% test coverage (unit, integration, E2E).
- UI/UX sesuai desain yang disepakati.
- Code sudah melalui code review & bebas dari bug kritis.

## Sprint Retrospective & Next Steps

### Evaluasi Sprint:
- Apa yang berjalan baik? (misal: kolaborasi tim, progress cepat)
- Apa yang perlu ditingkatkan? (misal: komunikasi saat integrasi fitur)

### Next Steps:
- Implementasi dynamic learning path (dengan AI atau rule-based).
- Implementasi AI untuk feedback jawaban yang lebih baik.
- Pengembangan tipe quiz lanjutan (coding challenge, drag & drop, dsb).
- Fitur rekomendasi materi berdasarkan progress & skor quiz.
