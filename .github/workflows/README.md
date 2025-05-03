# GitHub Actions Workflows

Dokumentasi ini berisi penjelasan tentang workflow CI/CD yang digunakan dalam project Maguru.

## Workflow Utama: maguru-ci-cd.yml

File ini mengatur seluruh proses CI/CD untuk project, dengan rangkaian job berikut:

### 1. Validate & Lint

Memastikan kode memenuhi standar kualitas, termasuk:

- Security audit untuk dependencies
- Linting dengan ESLint
- Format checking
- Type checking dengan TypeScript

### 2. Test

Menjalankan unit dan integration test:

- Menggunakan Jest
- Menghasilkan laporan coverage
- Menggunakan caching untuk mempercepat proses

### 3. End-to-End Tests

Menjalankan E2E testing:

- Menggunakan Playwright
- Mengupload hasil test untuk analisis jika ada kegagalan

### 4. Build

Membangun aplikasi untuk deployment:

- Menggunakan cache untuk mempercepat build
- Mengupload hasil build sebagai artifact

### 5. Deploy to Staging

Deploy ke environment staging:

- Hanya berjalan untuk branch `develop`
- Menggunakan Railway untuk deployment
- Mengambil credentials dari GitHub Secrets

### 6. Deploy to Production

Deploy ke environment production:

- Hanya berjalan untuk branch `main`
- Menggunakan Vercel untuk deployment
- Mengambil credentials dari GitHub Secrets

## Trigger Workflow

Workflow ini akan berjalan saat:

- Push ke branch `main`, `develop`, atau `feature/*`
- Pull request ke branch `main` atau `develop`
- Terjadwal setiap hari Senin pukul 00:00 UTC (weekly audit)

## Secrets yang Dibutuhkan

Pastikan secret berikut telah dikonfigurasi dalam repository settings:

- `RAILWAY_TOKEN`: Token untuk deployment ke Railway
- `RAILWAY_PROJECT_ID`: ID project di Railway
- `VERCEL_TOKEN`: Token untuk deployment ke Vercel
- `ORG_ID`: ID organisasi di Vercel
- `PROJECT_ID`: ID project di Vercel

## Catatan Penting

- Workflow ini menggunakan yarn untuk manajemen dependencies
- Semua caching sudah dioptimalkan untuk yarn
- Perubahan pada workflow harus didokumentasikan di changelog
