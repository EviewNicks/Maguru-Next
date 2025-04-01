# E2E Testing Report

Direktori ini menyimpan hasil report E2E testing yang dibuat oleh kustom reporter Playwright.

## Format Report

Report disimpan dalam format JSON dengan pola penamaan `e2e-report-[timestamp].json`. Format timestamp mengikuti ISO 8601 dengan tanda `:` diganti menjadi `-` agar kompatibel dengan Windows.

ex: npx playwright test features/manage-module/__tests__/e2e/ModuleForm.e2e.spec.ts

## Struktur JSON

```json
{
  "timestamp": "2025-04-01T11-30-45.123Z",
  "environment": "development",
  "passed": 5,
  "failed": 2,
  "skipped": 0,
  "total": 7,
  "executionTime": 15000,
  "errors": [
    {
      "test": "validasi judul yang terlalu pendek",
      "message": "Test timeout of 30000ms exceeded while running \"beforeEach\" hook.",
      "location": "D:\\path\\to\\file.ts:11:16"
    }
  ],
  "testResults": [
    {
      "title": "membuat modul baru dan memverifikasi keberhasilan",
      "file": "features/manage-module/__tests__/e2e/ModuleManagement.e2e.spec.ts",
      "status": "passed",
      "duration": 5000
    },
    {
      "title": "validasi judul yang terlalu pendek",
      "file": "features/manage-module/__tests__/e2e/ModuleForm.e2e.spec.ts",
      "status": "failed",
      "duration": 30000,
      "failureMessages": [
        "Test timeout of 30000ms exceeded while running \"beforeEach\" hook."
      ]
    }
  ]
}
```

## Cara Mengakses Report

Setelah menjalankan E2E test dengan perintah `npm run test:e2e`, report akan otomatis dihasilkan pada direktori ini dengan nama file yang berisi timestamp eksekusi test.

## Perbedaan dengan Unit/Integration Test Report

Report ini mirip dengan format SimpleJsonReporter yang digunakan untuk unit dan integration testing, tetapi memiliki beberapa perbedaan:

1. Format nama file: `e2e-report-[timestamp].json` vs `test-report-[timestamp].json`
2. Struktur lebih disederhanakan dan dioptimalkan untuk E2E testing
3. Berisi error details yang lebih lengkap

## Bagaimana Report Ini Dibuat

Report ini dihasilkan oleh custom reporter `playwrightReporter.js` yang mengimplementasikan interface reporter dari Playwright. Reporter ini membaca hasil test dari Playwright dan mengonversinya ke format yang konsisten dengan SimpleJsonReporter untuk memudahkan integrasi dengan sistem monitoring atau dashboard.
