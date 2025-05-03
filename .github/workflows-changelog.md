# Workflow Changelog

Dokumen ini mencatat perubahan penting pada CI/CD workflow di proyek Maguru.

## 2025-04-30

### Perubahan Major

- ✅ Menghapus workflow redundan `ci.yml` dan menjadikan `maguru-ci-cd.yml` sebagai workflow utama
- ✅ Migrasi seluruh command dari npm ke yarn untuk konsistensi
- ✅ Optimasi caching untuk yarn dan Next.js build

### Perbaikan

- ✅ Memperbaiki konfigurasi security audit menggunakan yarn
- ✅ Menggunakan frozen-lockfile untuk memastikan konsistensi dependency
- ✅ Menambahkan key yang lebih spesifik untuk caching

### Dokumentasi

- ✅ Menambahkan README.md sebagai dokumentasi workflow
- ✅ Menambahkan workflows-changelog.md untuk mencatat perubahan
- ✅ Menambahkan file CODEOWNERS untuk reviewer otomatis

## Rencana Pengembangan Berikutnya

- [ ] Menambahkan notifikasi ke Slack untuk status pipeline
- [ ] Menambahkan workflow khusus untuk release versioning
- [ ] Mengoptimalkan waktu eksekusi E2E test dengan sharding
- [ ] Menambahkan workflow untuk security scanning dengan CodeQL
