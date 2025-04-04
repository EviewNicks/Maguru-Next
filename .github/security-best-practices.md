# Panduan Keamanan GitHub Actions untuk Maguru

## 1. Pengelolaan Secrets

### Apa yang Perlu Dilindungi

- API Keys dan tokens (Vercel, Railway, Supabase)
- Database credentials
- Environment variables sensitif

### Cara Mengelola Secrets

1. **Gunakan GitHub Secrets:** Jangan pernah menulis credentials langsung di file workflow

   ```yaml
   # SALAH ❌
   vercel-token: "abcd1234"

   # BENAR ✅
   vercel-token: ${{ secrets.VERCEL_TOKEN }}
   ```

2. **Batasi akses secrets:** Gunakan environment untuk membatasi akses secrets hanya pada branch tertentu

   ```yaml
   deploy-production:
     environment: production
     # Secrets dari environment production hanya bisa diakses di job ini
   ```

3. **Minimalisasi scope tokens:** Gunakan token dengan hak akses minimal yang diperlukan

## 2. Keamanan Dependencies

1. **Aktifkan Dependabot:** Untuk mendapatkan alert dan update otomatis saat ada vulnerability

   - Buat file `.github/dependabot.yml` untuk konfigurasi

2. **Audit dependencies secara reguler:**

   ```yaml
   - name: Security Audit
     run: npm audit --audit-level=high
   ```

3. **Lock file dependencies:** Pastikan `package-lock.json` selalu di-commit

## 3. Keamanan Workflow

1. **Pin actions ke versi commit spesifik:** Gunakan SHA commit untuk mencegah supply chain attack

   ```yaml
   # SALAH ❌
   - uses: actions/checkout@v3

   # LEBIH AMAN ✅
   - uses: actions/checkout@a12a3c4d5e6f
   ```

2. **Verifikasi actions pihak ketiga:** Hanya gunakan actions yang terpercaya dan populer

3. **Batasi permissions:** Gunakan `permissions` untuk membatasi akses token GITHUB_TOKEN

   ```yaml
   permissions:
     contents: read
     pull-requests: write
   ```

4. **Validasi input pengguna:** Waspadai injeksi pada input dinamis

## 4. Proteksi Branch dan Deployment

1. **Aktifkan branch protection rules:**

   - Wajibkan pull request untuk push ke main/develop
   - Wajibkan reviews sebelum merge
   - Wajibkan status checks lulus (CI tests)

2. **Deployment environments:**
   - Buat minimal 2 environment: staging dan production
   - Tambahkan approval requirement untuk deployment ke production
   - Pisahkan secrets per environment

## 5. Monitoring dan Audit

1. **Aktifkan security alerts** untuk repository

2. **Review workflow run logs** secara berkala

3. **Aktifkan CodeQL analysis** untuk static code analysis

## 6. Backup & Disaster Recovery

1. **Backup secrets:** Simpan backup encrypted dari secrets di tempat yang aman

2. **Dokumentasikan proses recovery:** Dalam kasus akses hilang atau compromise

## Checklist Keamanan

- [ ] Semua credentials disimpan di GitHub Secrets
- [ ] Branch protection diaktifkan
- [ ] Dependabot diaktifkan
- [ ] Actions pihak ketiga yang digunakan telah direview
- [ ] Workflow permission dibatasi
- [ ] Proses deployment memerlukan approval
- [ ] Audit log rutin dilakukan

## Referensi

- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [OWASP CI/CD Security](https://owasp.org/www-project-top-10-ci-cd-security-risks/)
