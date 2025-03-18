# Story 1 -- Task File OPS-15

## Overview

**Nama Fitur:** Akses Materi Bertahap  
**Sprint:** Sprint 2  
**Tanggal Mulai:** 2025-02-14  
**Tanggal Target Selesai:** 2025-02-28

### Deskripsi:

Fitur ini memungkinkan mahasiswa untuk mengakses modul pembelajaran secara bertahap dengan navigasi antar halaman yang jelas dan progres yang tercatat secara lokal.

---

## Pre-Requisites

- **State Management:** Redux atau localStorage untuk melacak progres halaman pengguna.
- **Desain UI:** Figma untuk prototyping.
- **Komponen Frontend:** Tailwind CSS dan shadcn/ui untuk implementasi antarmuka.
- **Testing Tools:** Jest untuk unit test dan Cypress untuk pengujian E2E.

---

## Step-By-Step Plan

### Langkah 1: Buat Struktur Modul Berbasis Multi-Page

Membangun kerangka utama untuk modul pembelajaran dengan navigasi dan progres yang sinkron.

### Struktur dan Implementasi Modul

#### 1. Membuat File & Struktur Dasar

- **1.1** Buat folder `feature/module` untuk menyimpan semua komponen terkait modul.
- **1.2** Buat file `ModulePage.tsx` sebagai komponen utama untuk menampilkan setiap halaman modul.
- **1.3** Tambahkan folder `data` untuk menyimpan file `moduleData.ts` berisi data dummy modul.
- **1.4** Tambahkan properti standar dalam `moduleData.ts`:
  - `id`: ID unik modul.
  - `title`: Judul modul.
  - `content`: Konten utama.
  - `media`: URL gambar/video pendukung.
  - `isLastPage`: Status halaman terakhir.

#### 2. Memproses Data Modul

- **2.1** Buat fungsi utilitas `getModuleData(moduleId)` di `moduleData.ts` untuk mengambil data modul berdasarkan ID.
- **2.2** Tambahkan validasi di `getModuleData()` untuk memeriksa apakah modul dengan ID tertentu ada. Jika tidak ditemukan, kembalikan pesan error atau data kosong.
- **2.3** Implementasikan fallback logic untuk mengatasi data corrupt di `getModuleData()`:
  - Jika konten tidak valid, berikan opsi **"Coba Perbaiki"** kepada pengguna.
  - Reset data hanya jika semua metode perbaikan gagal.

#### 3. Menghubungkan Data dengan Komponen

- **3.1** Integrasikan data modul ke dalam `ModulePage.tsx` untuk menampilkan konten sesuai dengan halaman aktif.
- **3.2** Gunakan properti React `useEffect` untuk memuat data awal modul saat komponen pertama kali di-mount.
- **3.3** Tambahkan log konsol setiap kali data modul berhasil dimuat untuk tujuan debugging.

#### 4. Sinkronisasi Data Progres

- **4.1** Buat store Redux untuk menyimpan state `currentPage` dan `isModuleCompleted`.
- **4.2** Implementasikan action Redux:
  - `SET_CURRENT_PAGE` untuk memperbarui halaman aktif.
  - `RESET_PROGRESS` untuk mengatur ulang progres ke halaman pertama.
- **4.3** Tambahkan fallback logic ke **localStorage**:
  - Simpan data `currentPage` setiap kali halaman berubah.
  - Gunakan **timestamp** untuk menentukan data yang lebih baru antara **Redux dan localStorage**.
- **4.4** Tambahkan fungsi `syncProgressFromLocalStorage()` untuk memuat data progres saat aplikasi dimulai.

#### 5. Optimasi untuk Modul Besar

- **5.1** Implementasikan **lazy loading** data modul dengan memuat konten halaman hanya saat diperlukan.
- **5.2** Tambahkan validasi untuk memastikan `currentPage` berada dalam rentang valid (**1 ≤ currentPage ≤ totalPages**).
- **5.3** Uji performa **lazy loading** dengan modul dummy besar (**>100 halaman**).

#### 6. Fallback dan Validasi Data

- **6.1** Tambahkan fungsi utilitas `getInitialPage()` untuk menentukan halaman awal yang valid saat aplikasi dimulai.
- **6.2** Tambahkan opsi **"Coba Perbaiki"** saat data tidak valid.

**Status:** Pending

📌 **Checklist Validasi:**

- [ ] Apakah data modul berhasil dimuat saat pertama kali aplikasi dijalankan?
- [ ] Apakah sinkronisasi Redux dan localStorage berjalan lancar saat refresh halaman?
- [ ] Apakah fallback ke halaman pertama berfungsi jika data corrupt?
- [ ] Apakah performa tetap lancar untuk modul besar (>100 halaman)?
- [ ] Apakah ada notifikasi untuk pengguna saat data diperbaiki atau disinkronkan?

---

### Langkah 2: Implementasi Navigasi Antar Halaman

Memastikan navigasi antar halaman terstruktur dan aman.

#### Membuat Komponen Navigasi

- **2.1** Buat komponen `NavigationButtons.tsx` di folder `feature/module`.
- **2.2** Tambahkan properti `onNext` dan `onPrevious` untuk menangani logika navigasi.
- **2.3** Tambahkan props tambahan `isNextEnabled` dan `isPreviousEnabled` untuk mengontrol status tombol.

#### Menambahkan Logika Navigasi

- **2.4** Buat fungsi `navigateToPage(pageNumber)` di `ModulePage.tsx` dengan validasi ketat.
- **2.5** Tambahkan parameter opsional `forceNavigate` di `navigateToPage()`.
- **2.6** Tambahkan logging di konsol setiap kali pengguna berpindah halaman untuk analitik UX.

#### Validasi dan Feedback Real-Time

- **2.7** Tambahkan state `isPageCompleted` di `ModulePage.tsx`.
- **2.8** Update `isPageCompleted` berdasarkan interaksi pengguna.
- **2.9** Buat fungsi `highlightIncompleteSections()` untuk menyorot elemen yang belum selesai.
- **2.10** Tambahkan tooltip dinamis di tombol "Next".

#### Mode Eksplorasi Cepat (Quick View Mode)

- **2.11** Tambahkan opsi **"Quick View Mode"** di pengaturan modul.
- **2.12** Jika **Quick View Mode** aktif, nonaktifkan validasi `isPageCompleted`.
- **2.13** Tampilkan peringatan di mode eksplorasi bahwa progres tidak akan disimpan.

#### Sinkronisasi dan Penyimpanan Progres

- **2.14** Simpan progres pengguna di **Redux** dan **localStorage**.
- **2.15** Gunakan **timestamp** untuk menyinkronkan progres terbaru.

#### Fallback dan Edge Cases

- **2.16** Uji navigasi dengan **JavaScript dinonaktifkan**.
- **2.17** Tambahkan pengujian manual untuk skenario khusus.

**Status:** Pending

📌 **Checklist Validasi:**

- [ ] Apakah navigasi antar halaman berjalan lancar di semua skenario?
- [ ] Apakah validasi halaman menangani semua edge case?
- [ ] Apakah Quick View Mode benar-benar tidak menyimpan progres?
- [ ] Apakah tooltip muncul saat pengguna belum menyelesaikan interaksi halaman?
- [ ] Apakah fallback navigasi berfungsi saat JavaScript mati?
- [ ] Apakah ada mekanisme untuk menyimpan progres saat pengguna cepat pindah halaman?

## Langkah 3: Buat dan Tambahkan Progres Visual

Memberikan feedback visual untuk progres belajar pengguna.

### Membuat Komponen Progres Visual

- **3.1** Buat file `ProgressIndicator.tsx` di folder `features/modul`.
- **3.2** Tambahkan props `currentPage`, `totalPages`, dan `hasVisitedPages` untuk mendukung logika progres dinamis.
- **3.3** Implementasikan komponen **progress bar linear** menggunakan **Tailwind CSS**.

### Menghubungkan Data Progres

- **3.4** Tambahkan state `hasVisitedPages` di **Redux** atau **local state** untuk melacak halaman yang telah dikunjungi pengguna.
- **3.5** Perbarui `hasVisitedPages` setiap kali pengguna membuka halaman baru:
  - Tandai halaman sebagai dikunjungi jika pengguna membuka kontennya.
  - Jangan ubah status jika pengguna kembali ke halaman sebelumnya.
  - Prefetch untuk Halaman Berikutnya.
  - Progres Parsial untuk Halaman Panjang.
- **3.6** Gunakan state `hasVisitedPages` untuk menghitung **persentase progres aktual** `(visitedPages.length / totalPages) * 100`.

### Menampilkan Indikator Progres

- **3.7** Tambahkan indikator teks seperti **"Halaman 2 dari 5"** di atas **progress bar**.
- **3.8** Implementasikan **progress bar** dengan warna dinamis untuk menunjukkan:
  - **Halaman yang telah dikunjungi** (_warna hijau_).
  - **Halaman yang belum dikunjungi** (_warna abu-abu_).
- **3.9** Tambahkan fungsi `calculateColorByProgress()` untuk menentukan warna berdasarkan status halaman.

### Menambahkan Tooltip dan Feedback Visual

- **3.10** Buat komponen `ProgressTooltip.tsx` untuk menampilkan **persentase progres**.
- **3.11** Tambahkan **animasi pulsasi ringan** di **progress bar** saat pengguna menyelesaikan halaman.
- **3.12** Gunakan **CSS transition sederhana** untuk menghindari beban performa di perangkat **low-end**.

### Sinkronisasi dan Fallback

- **3.13** Simpan **state progres** ke **localStorage** setiap kali progres berubah.
- **3.14** Implementasikan **fallback logic** di `ProgressIndicator.tsx` untuk mengambil data dari **localStorage**.
- **3.15** Pastikan **progress bar diperbarui secara real-time** berdasarkan data dari **Redux atau localStorage**.

### Validasi dan Edge Cases

- **3.16** Tambahkan logika validasi agar **progres tidak melebihi batas (0%-100%)**.
- **3.17** Uji skenario berikut:
  - **Pengguna bolak-balik halaman**.
  - **Pengguna refresh halaman**.
  - **Progres corrupt di localStorage**.

### Testing dan Debugging

- **3.18** Tulis **unit test** untuk `ProgressIndicator.tsx`.
- **3.19** Tambahkan **E2E test** menggunakan **Cypress**.
- **3.20** Dokumentasikan hasil pengujian di **file markdown**.

---

## Langkah 4: Implementasi Halaman Terakhir

### Deskripsi

Menampilkan ringkasan materi yang dinamis, memastikan penyelesaian modul sebelum mengakses quiz.

### 1. Membuat Komponen Halaman Terakhir

- **4.1** Tambahkan properti `isLastPage` di setiap data modul.
- **4.2** Buat komponen `SummaryCard.tsx`.
- **4.3** Tambahkan layout ringkasan dengan:
  - Poin-poin utama dari materi.
  - Status penyelesaian halaman.

### 2. Mengevaluasi Kesiapan Quiz

- **4.4** Implementasikan fungsi `calculateQuizReadiness()`.
- **4.5** Tambahkan validasi di tombol **"Lanjut ke Quiz"**.

### 3. Menampilkan Feedback dan Opsi

- **4.6** Tambahkan notifikasi berupa banner.
- **4.7** Tambahkan opsi **"Ulang Materi"**.

### 4. Rekomendasi Halaman yang Harus Diulang

- **4.8** Buat fungsi `generateRecommendations()`.
- **4.9** Tampilkan daftar halaman rekomendasi di **`SummaryCard.tsx`**.

### 5. Pengelolaan Navigasi ke Quiz

- **4.10** Tambahkan tombol **"Lanjut ke Quiz"**.
- **4.11** Buat fungsi `limitQuizNavigation()`.

### 6. Sinkronisasi dan Logging

- **4.12** Tambahkan logging setiap kali pengguna membuka halaman terakhir.
- **4.13** Simpan status penyelesaian modul ke **localStorage**.

### 7. Validasi dan Edge Cases

- **4.14** Uji skenario berikut:
  - Pengguna mencoba melanjutkan ke quiz tanpa menyelesaikan modul.
  - Pengguna memilih opsi **"Ulang Materi"**.
  - Pengguna refresh halaman terakhir.

### 8. Testing dan Debugging

- **4.15** Tulis unit test untuk `calculateQuizReadiness()` dan `generateRecommendations()`.
- **4.16** Tambahkan **E2E test**.

---

📌 **Checklist Validasi:**

- Apakah tombol **Lanjut ke Quiz** hanya aktif jika semua halaman selesai?
- Apakah rekomendasi halaman yang perlu diulang muncul dengan benar?
- Apakah opsi **Ulang Materi** memiliki batas retry?
- Apakah ada loading state saat transisi ke quiz?
- Apakah progres disimpan saat pengguna refresh halaman terakhir?
- Apakah logging bekerja tanpa spam?
- Apakah unit test dan E2E test mencakup semua skenario utama dan edge case?

# **Langkah 5 : Testing & Debugging**

## **1. Unit Testing**

### **5.1 Pengujian Komponen**

Tulis unit test untuk komponen berikut:

- **ModulePage.tsx**: Validasi rendering data modul berdasarkan halaman aktif.
- **ProgressIndicator.tsx**: Verifikasi perhitungan persentase progres.
- **SummaryCard.tsx**: Pastikan data ringkasan ditampilkan dengan benar.

### **5.2 Pengujian Fungsi Utilitas**

Tambahkan unit test untuk fungsi berikut:

- **getInitialPage()**: Pastikan halaman awal ditentukan dengan benar berdasarkan data Redux/localStorage.
- **syncProgressFromLocalStorage()**: Verifikasi sinkronisasi data progres antara Redux dan localStorage.

## **2. Integration Testing**

### **5.3 Skenario Integrasi**

Buat integration test untuk skenario berikut:

- Sinkronisasi progres antar halaman (dari Redux ke localStorage dan sebaliknya).
- Validasi logika **enable/disable** tombol navigasi berdasarkan status halaman.
- Interaksi antara **ModulePage.tsx** dan **ProgressIndicator.tsx** untuk memastikan progres diperbarui secara real-time.

## **3. End-to-End Testing (E2E)**

### **5.4 Pembagian Batch E2E Test**

Bagi pengujian E2E menjadi batch kecil untuk mempercepat eksekusi:

- **Batch 1**: Akses modul dari halaman 1 hingga halaman 10.
- **Batch 2**: Navigasi dari halaman 11 hingga halaman terakhir.
- **Batch 3**: Navigasi ke halaman terakhir dan lanjut ke quiz.
- **Parallel Test Execution**: Untuk batch E2E, bisa jalankan parallel testing dengan Cypress untuk memangkas waktu eksekusi.
- **Visual Regression Testing**: Untuk pastikan UI tetap konsisten, bisa tambahkan snapshot testing dengan Cypress.

### **5.5 Pengujian Edge Case**

Tambahkan skenario edge case berikut di E2E test:

- Refresh halaman di tengah interaksi.
- Pengguna menekan tombol **"Back"** di browser.
- Quiz gagal dimuat karena **API failure**.
- **Timeout untuk API Mocking**: Saat menguji API failure, bisa tambahkan delay untuk simulasi real-world latency.
- **Retry untuk Test Flaky**: Kalau ada test yang kadang gagal karena faktor eksternal, bisa pakai fitur test retry.

## **4. Stress Testing**

### **5.6 Simulasi Data Besar**

Simulasikan data dummy besar (>100 halaman) untuk menguji performa aplikasi:

- Uji **waktu load awal** modul.
- **Memory Leak Detection**: Saat stress testing, bisa pakai Chrome DevTools Protocol untuk memonitor memory usage.

## **📌 Checklist Validasi:**

- [ ] Apakah semua komponen utama memiliki unit test dengan cakupan >80%?
- [ ] Apakah sinkronisasi progres diuji secara menyeluruh (Redux ↔ localStorage)?
- [ ] Apakah E2E test mencakup navigasi batch kecil dan halaman terakhir?
- [ ] Apakah API failure dan fallback logic diuji dengan simulasi timeout?
- [ ] Apakah aplikasi tetap stabil saat memuat modul besar (>100 halaman)?
- [ ] Apakah ada laporan otomatis yang mencakup waktu eksekusi dan coverage?
- [ ] Apakah parallel test dan visual regression sudah diterapkan untuk mempercepat & mengamankan UI?
- [ ] Apakah manual test sudah mencakup random refresh, back button, dan reset progres?

## **✅ Acceptance Criteria**

- Pengguna dapat berpindah antar halaman modul dengan tombol navigasi yang berfungsi.
- Progres halaman tersimpan di Redux atau localStorage dan dapat dilanjutkan.
- Halaman terakhir menampilkan ringkasan materi dan tombol "Lanjut ke Quiz".
- UI responsif di perangkat desktop dan mobile.
- Indikator progres halaman tampil dengan jelas (contoh: "Halaman 2 dari 5").

## **🔹 Task Ownership & Collaboration**

- **Task Owner**: [Nama Developer/TIM]
- **Reviewer**: [Nama QA/TIM Reviewer]
- **Komunikasi**: Slack/Discord - Channel #frontend_modul

## **📌 Catatan Tambahan**

### **🚨 Risiko:**

- Potensi kesalahan penyimpanan progres di localStorage atau Redux → tambahkan validasi data.
- Ketidakcocokan UI pada beberapa ukuran layar → lakukan pengujian intensif dengan developer tools.

### **📚 Referensi:**

- Dokumentasi Redux untuk state management.
- Dokumentasi shadcn/ui untuk komponen UI tambahan.
