# Test Plan: UserTable + Filtering

## Tanggal: 2023-11-20 [update+2023-11-20]

## 1. Overview

Dokumen ini menjelaskan rencana pengujian untuk komponen UserTable beserta fitur filtering, searching, dan pagination. Komponen ini adalah bagian dari dashboard admin yang digunakan untuk mengelola pengguna dalam aplikasi Maguru.

## 2. Fitur yang Diuji

1. **Rendering UserTable**

   - Menampilkan daftar pengguna dengan kolom yang benar
   - Menampilkan loading state saat data sedang dimuat
   - Menampilkan pesan error jika ada masalah dalam mengambil data

2. **Filtering**

   - Filter berdasarkan role (admin, mahasiswa, dosen)
   - Filter berdasarkan status (active, inactive)
   - Searching berdasarkan nama atau email pengguna
   - Reset semua filter ke nilai default

3. **Pagination**
   - Navigasi antar halaman
   - Menampilkan jumlah total item dan halaman
   - Mempertahankan state pagination saat filter berubah

## 3. Jenis Pengujian

### 3.1 Unit Testing

Fokus pada pengujian komponen individual seperti:

- FilterDropdown
- UserBadge
- SearchInput
- PaginationControls

### 3.2 Integration Testing

Menguji interaksi antara komponen UserTable dengan:

- Filter controls
- API service
- Error handling
- Pagination

### 3.3 End-to-End Testing

Fokus pada alur pengguna secara keseluruhan:

- Menavigasi ke halaman manajemen pengguna
- Menggunakan filter untuk menemukan pengguna spesifik
- Melihat detail pengguna
- Mengubah role atau status pengguna

## 4. Test Cases untuk Integration Testing

| Test ID | Deskripsi                                           | Expected Result                                                     |
| ------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| TC-001  | Render UserTable dan memverifikasi data ditampilkan | Tabel ditampilkan dengan benar, data dimuat setelah loading state   |
| TC-002  | Filter berdasarkan role                             | Hanya menampilkan pengguna dengan role yang dipilih                 |
| TC-003  | Filter berdasarkan status                           | Hanya menampilkan pengguna dengan status yang dipilih               |
| TC-004  | Search berdasarkan nama/email                       | Hanya menampilkan pengguna yang cocok dengan teks pencarian         |
| TC-005  | Reset semua filter                                  | Semua filter kembali ke nilai default, data kembali ke kondisi awal |
| TC-006  | Handling error API                                  | Menampilkan pesan error jika API gagal                              |
| TC-007  | Navigasi pagination                                 | Berpindah antar halaman dan menampilkan data yang sesuai            |
| TC-008  | Mempertahankan state pagination saat filtering      | Reset ke halaman 1 saat filter berubah                              |

## 5. Mockup Data dan Dependencies

### 5.1 Mock Data

Membuat mock data untuk berbagai skenario pengujian:

- Dataset besar untuk testing pagination
- Data dengan berbagai role dan status
- Data untuk skenario pencarian

### 5.2 Dependencies

- MSW (Mock Service Worker) untuk mocking API calls
- React Testing Library untuk rendering dan interaksi komponen
- Jest untuk assertions
- Faker.js untuk generate mock data

## 6. Prosedur Pengujian

1. Setup test environment dengan mock data dan MSW
2. Render komponen UserTable dengan TestWrapper
3. Verifikasi rendering awal komponen
4. Uji interaksi dengan filter dan verifikasi output yang diharapkan
5. Uji skenario error dan recovery
6. Dokumentasikan hasil dan update test case jika diperlukan

## 7. Catatan Tambahan

- Pastikan test dapat berjalan di CI/CD pipeline
- Refresh mock data secara berkala untuk menghindari bias dalam test
- Perhatikan test flakiness, khususnya terkait timing dan async operations

## 8. Implementasi Test

File test yang telah diimplementasi:

- `features/manage-users/__tests__/integration/UserTableFiltering.test.tsx`
- `features/manage-users/__tests__/test-utils.tsx`
- `features/manage-users/__tests__/integration/mocks/userData.ts`
