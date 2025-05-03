# Planning Optimasi GitHub Actions Workflow

## Ringkasan Tujuan

- Menyusun dan mengoptimalkan workflow CI/CD di GitHub Actions agar efisien, aman, mudah dipelihara, dan sesuai best practice industri.
- Menghindari duplikasi proses, mempercepat feedback loop, serta menjaga keamanan dan transparansi pipeline.

## Langkah-Langkah Teknis

1. **Audit & Review Workflow yang Ada**

   - Identifikasi workflow yang duplikat atau overlap (misal: `ci.yml` dan `maguru-ci-cd.yml`).
   - Pilih satu workflow utama yang paling lengkap dan relevan (rekomendasi: `maguru-ci-cd.yml`).
   - Dokumentasikan alasan penghapusan/penyederhanaan workflow lain jika perlu.

2. **Strukturisasi Job & Step**

   - Pisahkan job berdasarkan tahapan utama: validasi/lint, test (unit, integration, e2e), build, deploy.
   - Gunakan matrix untuk test di beberapa versi Node.js jika diperlukan.
   - Pastikan setiap job fail-fast (gagal di lint/type-check langsung stop).

3. **Optimasi Dependency & Caching**

   - Implementasikan cache untuk dependency (`node_modules`, `.next/cache`) agar pipeline lebih cepat.
   - Hindari install dependency berulang di setiap job jika tidak perlu.

4. **Keamanan & Secrets**

   - Pastikan semua secrets (token, API key, dsb) diakses via GitHub Secrets, **jangan pernah hardcode**.
   - Batasi scope environment variable hanya pada job/step yang membutuhkan.
   - Jangan gunakan self-hosted runner untuk public repo (security risk).

5. **Upload Artifact & Coverage**

   - Simpan hasil build dan test (coverage, hasil e2e) sebagai artifact untuk analisis dan traceability.

6. **Jadwal Otomatis & Trigger**

   - Gunakan `schedule` (cron) untuk nightly/weekly build, security audit, dsb.
   - Pastikan workflow hanya berjalan pada branch yang relevan (main, develop, feature/\*).

7. **Label, Filter, & Dokumentasi**

   - Gunakan label dan filter path untuk memisahkan workflow PR, release, dsb jika perlu.
   - Tambahkan komentar dan dokumentasi di setiap file workflow untuk memudahkan tim memahami alur.

8. **Monitoring & Notifikasi**

   - Aktifkan notifikasi untuk workflow run (success/fail) ke email atau channel tim.
   - Pantau waktu eksekusi dan optimasi jika ada bottleneck.

9. **Review & Iterasi Berkala**
   - Lakukan review workflow secara berkala, update sesuai kebutuhan tim dan perubahan teknologi.
   - Simpan perubahan dan alasan update di changelog internal.

## File/Komponen yang Perlu Diubah

- `.github/workflows/maguru-ci-cd.yml` (jadikan workflow utama, refactor jika perlu)
- Hapus/arsipkan `.github/workflows/ci.yml` jika sudah tidak diperlukan
- Update/optimasi caching, secrets, dan artifact di workflow utama
- Tambahkan dokumentasi dan komentar di setiap job/step
- Pastikan semua secrets sudah diatur di GitHub repo settings
- Dokumentasikan alur dan perubahan di `docs/plan.md` ini

---

**Referensi:**

- [Datree: GitHub Actions Best Practices](https://www.datree.io/resources/github-actions-best-practices)
- [GitHub Docs: Actions Guides](https://docs.github.com/en/actions/guides)
