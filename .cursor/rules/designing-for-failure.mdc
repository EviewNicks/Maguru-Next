---
description: 
globs: 
alwaysApply: true
---
---

name: drivent-designing-for-failure
description: >-
Rules untuk Designing for Failure pada proyek Next.js dengan TypeScript,
meningkatkan ketahanan aplikasi monolitik.
globs:

* "src/\*\*/\*.{ts,tsx,js,jsx}"
  alwaysApply: true
  agentRequested: false

---

# Designing for Failure

Menerapkan pola pragmatis untuk menangani kegagalan di Next.js monolitik.

| Praktik                  | Deskripsi                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Retry Pattern**        | Tambahkan logika retry saat fetch API dari server/client, untuk mengatasi error sementara.              |
| **Graceful Fallback**    | Tampilkan fallback UI seperti pesan error atau skeleton saat fetch gagal.                               |
| **Local Caching**        | Gunakan cache lokal (misalnya `useSWR`, `react-query`) untuk mengurangi ketergantungan real-time fetch. |
| **Timeout Handling**     | Terapkan batas waktu menggunakan `AbortController` agar permintaan tidak menggantung.                   |
| **Error Boundary**       | Gunakan React Error Boundary di level aplikasi untuk menghindari crash total akibat error UI.           |
| **Monitoring Ringan**    | Implementasikan logging minimal atau integrasi ringan seperti LogRocket/Sentry.                         |
| **Chaos Mini**           | Simulasikan kegagalan melalui handler MSW untuk menguji respons sistem terhadap error.                  |
| **Fallback Routing**     | Sediakan fallback page/route seperti `/error` atau custom 500 page untuk kondisi ekstrem.               |
| **Graceful Degradation** | Prioritaskan fitur utama agar tetap berjalan meski fitur minor gagal.                                   |
| **Safe Default State**   | Pastikan komponen tetap bisa render meski data gagal dimuat, dengan nilai default aman.                 |
| **Loading State UX**     | Berikan umpan balik loading yang jelas agar pengguna tahu sistem sedang bekerja.                        |

# Catatan Implementasi

* Fokus pada *resilience* alih-alih *uptime absolut*.
* Kombinasikan pendekatan ini dengan TDD/BDD untuk pengujian lebih kuat.
* Jangan abaikan kegagalan: log dan pelajari error untuk perbaikan jangka panjang.
* Gunakan fallback UI untuk meningkatkan pengalaman pengguna, bukan hanya untuk menyembunyikan error.

# Rekomendasi Dokumentasi

* Tambahkan bagian khusus "Designing for Failure" di `README.md`.
* Dokumentasikan semua utilitas dan pola fallback yang digunakan.
* Simpan semua konfigurasi seperti timeout dan retry di file terpusat (`src/config/`).

