# E2E Testing untuk Fitur Manajemen Modul

E2E (End-to-End) testing bertujuan untuk menguji alur pengguna secara menyeluruh dari perspektif pengguna akhir. Testing ini memastikan bahwa seluruh komponen dan integrasi berfungsi dengan baik seperti yang diharapkan dalam skenario nyata.

## Persiapan

Sebelum menjalankan E2E test, pastikan:

1. Playwright telah diinstal:

   ```
   npm install -D @playwright/test
   npx playwright install --with-deps
   ```

2. Aplikasi dapat dijalankan dengan `npm run dev`

## Test yang Tersedia

1. **ModuleManagement.e2e.spec.ts**

   - Menguji alur CRUD (Create, Read, Update, Delete) modul
   - Memverifikasi pembuatan, pengeditan, dan penghapusan modul berfungsi dengan benar

2. **ModuleTable.e2e.spec.ts**

   - Menguji fungsionalitas tabel modul
   - Memverifikasi pagination, sorting, filtering, dan pencarian berfungsi dengan benar

3. **ModuleForm.e2e.spec.ts**
   - Menguji validasi form modul
   - Memverifikasi bahwa form menampilkan pesan error yang tepat untuk input yang tidak valid
   - Memastikan sanitasi XSS berfungsi dengan baik

## Cara Menjalankan

1. **Menjalankan semua test:**

   ```
   npm run test:e2e
   ```

2. **Menjalankan test tertentu:**

   ```
   npx playwright test features/manage-module/__tests__/e2e/ModuleManagement.e2e.spec.ts
   ```

3. **Menjalankan test dengan UI:**
   ```
   npm run test:e2e:ui
   ```

## Strategi Testing

Seluruh E2E test mengikuti pola:

1. Setup - Login sebagai admin dan navigasi ke halaman yang akan diuji
2. Action - Melakukan tindakan yang akan diuji (mengklik tombol, mengisi form, dll.)
3. Assertion - Memverifikasi bahwa hasil tindakan sesuai dengan ekspektasi

## Report Testing

Setelah test selesai dijalankan, hasil test akan otomatis tersedia dalam beberapa format:

1. **HTML Report** - Tersedia di folder `playwright-report/index.html` dengan visualisasi yang mudah dibaca
2. **JSON Report** - Tersedia di folder `playwright-report/test-results.json` dengan data mentah lengkap
3. **Custom JSON Report** - Tersedia di folder `services/e2e-reports/e2e-report-[timestamp].json` dengan format yang konsisten dengan unit/integration test

Untuk melihat custom report:

```
npx playwright test && ls services/e2e-reports
```

Format custom report ini dirancang agar konsisten dengan SimpleJsonReporter yang digunakan untuk unit dan integration test, sehingga memudahkan integrasi dengan dashboard atau sistem monitoring.

## Catatan Penting

1. Semua E2E test membutuhkan akses ke server backend (baik test mock atau nyata)
2. User default untuk login: `admin@example.com` / `password123`
3. Browser headless digunakan secara default, tetapi mode UI tersedia untuk debugging

## Troubleshooting

Jika test gagal:

1. Periksa apakah aplikasi berjalan dengan baik di port 3000
2. Pastikan test user tersedia di database testing
3. Jalankan test dengan UI untuk melihat secara visual apa yang terjadi
4. Periksa error message di reports (HTML, JSON, atau custom report)
