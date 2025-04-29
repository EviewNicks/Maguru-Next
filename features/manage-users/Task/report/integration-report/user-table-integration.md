# Laporan Pengujian Integrasi: UserTable

## Detail Pengujian

- **Modul:** Manage Users
- **Komponen:** UserTable
- **Tanggal:** 2025-04-29
- **Developer:** Tim Maguru

## Ringkasan

Pengujian integrasi dilakukan pada komponen `UserTable` untuk memverifikasi integrasi antara UI dan logika bisnis, termasuk filter, pagination, dan penanganan error. Total 8 test case telah dijalankan dengan fokus pada fungsionalitas utama dan edge cases.

## Test Cases

| No  | ID     | Deskripsi                                                               | Status    |
| --- | ------ | ----------------------------------------------------------------------- | --------- |
| 1   | TC-001 | Menampilkan data pengguna setelah loading                               | ✅ PASSED |
| 2   | TC-002 | Filter berdasarkan role menampilkan hanya user dengan role tersebut     | ✅ PASSED |
| 3   | TC-003 | Filter berdasarkan status menampilkan hanya user dengan status tersebut | ✅ PASSED |
| 4   | TC-004 | Search filter menampilkan hasil yang sesuai dengan keyword              | ✅ PASSED |
| 5   | TC-005 | Reset filter mengembalikan ke kondisi awal                              | ✅ PASSED |
| 6   | TC-006 | Menampilkan error message jika API gagal                                | ✅ PASSED |
| 7   | TC-007 | Navigasi pagination berfungsi dengan benar                              | ✅ PASSED |
| 8   | TC-008 | Pagination reset ke halaman 1 saat filter berubah                       | ✅ PASSED |

## Detail Test Cases

### TC-001: Menampilkan data pengguna setelah loading

- **Deskripsi:** Memverifikasi bahwa tabel user menampilkan data pengguna setelah loading selesai
- **Langkah-langkah:**
  1. Render komponen UserTable
  2. Tunggu sampai loading selesai
- **Ekspektasi:** Semua data user ditampilkan dengan benar, termasuk nama, email, role, status, dan last login
- **Hasil:** ✅ PASSED

### TC-002: Filter berdasarkan role

- **Deskripsi:** Memverifikasi bahwa filter role berfungsi dengan benar
- **Langkah-langkah:**
  1. Render komponen UserTable
  2. Klik filter role
  3. Pilih role "mahasiswa"
- **Ekspektasi:** Hanya user dengan role "mahasiswa" yang ditampilkan
- **Hasil:** ✅ PASSED

### TC-003: Filter berdasarkan status

- **Deskripsi:** Memverifikasi bahwa filter status berfungsi dengan benar
- **Langkah-langkah:**
  1. Render komponen UserTable
  2. Klik filter status
  3. Pilih status "inactive"
- **Ekspektasi:** Hanya user dengan status "inactive" yang ditampilkan
- **Hasil:** ✅ PASSED

### TC-004: Search filter

- **Deskripsi:** Memverifikasi bahwa pencarian berfungsi dengan benar
- **Langkah-langkah:**
  1. Render komponen UserTable
  2. Masukkan keyword "john" pada input pencarian
- **Ekspektasi:** Hanya user yang namanya atau emailnya mengandung "john" yang ditampilkan
- **Hasil:** ✅ PASSED

### TC-005: Reset filter

- **Deskripsi:** Memverifikasi bahwa tombol reset mengembalikan filter ke kondisi awal
- **Langkah-langkah:**
  1. Render komponen UserTable
  2. Aplikasikan filter (role "mahasiswa")
  3. Klik tombol reset
- **Ekspektasi:** Semua filter direset dan menampilkan semua user kembali
- **Hasil:** ✅ PASSED

### TC-006: Error handling

- **Deskripsi:** Memverifikasi penanganan error saat API gagal
- **Langkah-langkah:**
  1. Mock error response dari API
  2. Render komponen UserTable
- **Ekspektasi:** Pesan error ditampilkan dan tombol retry tersedia
- **Hasil:** ✅ PASSED

### TC-007: Navigasi pagination

- **Deskripsi:** Memverifikasi bahwa navigasi pagination berfungsi dengan benar
- **Langkah-langkah:**
  1. Render komponen UserTable dengan data untuk 2 halaman
  2. Klik tombol "Next" untuk ke halaman 2
  3. Verifikasi data halaman 2
  4. Klik tombol "Previous" untuk kembali ke halaman 1
- **Ekspektasi:** Navigasi antar halaman berfungsi dengan benar dan menampilkan data yang sesuai
- **Hasil:** ✅ PASSED

### TC-008: Reset pagination saat filter berubah

- **Deskripsi:** Memverifikasi bahwa pagination direset ke halaman 1 saat filter berubah
- **Langkah-langkah:**
  1. Render komponen UserTable
  2. Navigasi ke halaman 2
  3. Aplikasikan filter baru
- **Ekspektasi:** Setelah aplikasi filter, halaman direset ke halaman 1
- **Hasil:** ✅ PASSED

## Mocking dan Teknik

Pengujian menggunakan teknik-teknik berikut:

- **Mock Hooks:** useUsers dan useUserRoles untuk mensimulasikan data dan perilaku API
- **Mock Filter Response:** Mensimulasikan respons API ketika filter digunakan
- **Mock Error State:** Mensimulasikan kondisi error untuk pengujian penanganan kesalahan
- **Mock Pagination:** Mensimulasikan data paginasi untuk pengujian navigasi halaman

## Tantangan dan Solusi

1. **Kompleksitas Filter**  
   **Tantangan:** Filter dapat dikombinasikan (role + status + search), yang memerlukan mocking yang tepat.  
   **Solusi:** Membuat fungsi helper untuk mengelola kombinasi filter dengan logika yang konsisten.

2. **Urutan Event dalam Pengujian**  
   **Tantangan:** Memastikan urutan yang tepat antara perubahan state dan verifikasi UI.  
   **Solusi:** Menggunakan `waitFor` dengan timeout yang sesuai untuk memastikan UI telah diperbarui sebelum melakukan asersi.

## Kesimpulan

Komponen UserTable telah menjalani pengujian integrasi yang komprehensif dan lulus semua test case. Ini menunjukkan bahwa komponen berhasil mengintegrasikan UI dengan logika bisnis dan dapat menangani berbagai kasus penggunaan dengan benar, termasuk filtering, pagination, dan penanganan error.

## Rekomendasi

1. Pertimbangkan untuk menambahkan test case tambahan untuk kombinasi filter yang lebih kompleks
2. Lakukan pengujian performa dengan dataset yang lebih besar untuk memastikan UI tetap responsif
