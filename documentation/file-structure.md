# 1. Pendahuluan

## Tujuan:

Dokumen ini menjelaskan struktur folder pada proyek Maguru, lengkap dengan fungsi, kapan harus menggunakan folder tertentu, dan best practices untuk menjaga keteraturan dan skalabilitas proyek.

---

# 2. Struktur Folder Utama

```
src/
├── app/              # Routing & halaman utama (Next.js App Router)
├── components/       # Komponen UI reusable
├── config/           # Konfigurasi global proyek
├── hooks/            # Custom hooks untuk logika bisnis
├── lib/              # Library/helper khusus
├── prisma/           # Konfigurasi Prisma dan migrasi database
├── public/           # Aset publik (gambar, font, dll.)
├── services/         # API services & komunikasi backend
├── store/            # State management global
├── styles/           # Styling global & konfigurasi Tailwind
├── types/            # Deklarasi tipe global TypeScript
├── utils/            # Fungsi utilitas umum
├── __test__/         # Folder untuk semua pengujian
│   ├── __mocks__/    # Mock data untuk testing
│   ├── e2e/          # End-to-End tests
│   └── integrations/ # Integration tests
├── coverage/         # Laporan coverage testing
├── documentation/    # Dokumentasi proyek
└── feature/          # Folder khusus untuk fitur terisolasi
```

---

# 3. Penjelasan Folder dan Best Practices

## app/

- **Fungsi:** Mengatur routing dan halaman utama aplikasi dengan Next.js App Router.
- **Kapan digunakan:** Untuk membuat halaman, layout, dan API routes.
- **Best Practice:**
  - Pisahkan halaman berdasarkan fitur utama.
  - Gunakan layout untuk komponen yang digunakan di banyak halaman (header, footer, sidebar).

## components/

- **Fungsi:** Berisi komponen UI yang dapat digunakan kembali.
- **Kapan digunakan:** Saat membuat komponen yang bersifat presentational.
- **Best Practice:**
  - Gunakan Atomic Design untuk pengelompokan komponen (atoms, molecules, organisms).
  - Pastikan komponen bersifat stateless jika memungkinkan.

## config/

- **Fungsi:** Menyimpan konfigurasi global aplikasi.
- **Kapan digunakan:** Untuk mengatur environment variables, constant values, atau konfigurasi library.
- **Best Practice:**
  - Jangan simpan data sensitif secara langsung — gunakan environment variables.
  - Buat file terpisah untuk tiap jenis konfigurasi agar mudah dikelola.

## hooks/

- **Fungsi:** Custom hooks untuk mengelola logika bisnis.
- **Kapan digunakan:** Ketika ada logika yang perlu digunakan berulang kali.
- **Best Practice:**
  - Gunakan prefix `use` untuk nama hook (misalnya: `useAuth`).
  - Pastikan setiap hook hanya memiliki satu tanggung jawab.

## lib/

- **Fungsi:** Library atau helper khusus yang mendukung fitur aplikasi.
- **Kapan digunakan:** Untuk menyimpan fungsi reusable yang tidak terkait langsung dengan komponen UI.
- **Best Practice:**
  - Hindari menyimpan logika fitur spesifik di sini.
  - Pisahkan helper berdasarkan kategori (misal: API, autentikasi, validasi).

## prisma/

- **Fungsi:** Mengatur konfigurasi Prisma dan migrasi database.
- **Kapan digunakan:** Saat membuat atau memperbarui skema database.
- **Best Practice:**
  - Selalu jalankan `prisma validate` setelah mengubah skema.
  - Simpan skema dalam version control untuk tracking perubahan.

## public/

- **Fungsi:** Menyimpan aset publik seperti gambar, font, dan ikon.
- **Kapan digunakan:** Untuk file yang perlu diakses langsung dari browser.
- **Best Practice:**
  - Gunakan struktur folder untuk mengorganisir aset (misal: `images`, `icons`, `fonts`).
  - Kompres file gambar untuk mengurangi ukuran file.

## services/

- **Fungsi:** API services untuk komunikasi dengan backend atau external API.
- **Kapan digunakan:** Saat menghubungkan frontend dengan API eksternal.
- **Best Practice:**
  - Buat service terpisah untuk setiap fitur utama (misal: `authService`, `courseService`).
  - Gunakan Axios atau Fetch dengan konfigurasi bawaan untuk error handling.

## store/

- **Fungsi:** Mengatur state management global.
- **Kapan digunakan:** Ketika ada state yang perlu diakses lintas komponen atau halaman.
- **Best Practice:**
  - Gunakan Redux Toolkit untuk state kompleks.
  - Hindari menyimpan state yang hanya digunakan oleh satu komponen.

## styles/

- **Fungsi:** Mengatur styling global dan utilitas CSS.
- **Kapan digunakan:** Untuk mengatur styling global atau konfigurasi tambahan Tailwind.
- **Best Practice:**
  - Pisahkan styling per komponen jika memungkinkan.
  - Gunakan utility classes dari Tailwind untuk styling sederhana.

## **test**/

- **Fungsi:** Menyimpan semua file pengujian aplikasi.
- **Subfolder:**
  - `__mocks__/`: Mock data untuk testing.
  - `e2e/`: End-to-End tests.
  - `integrations/`: Integration tests.
- **Best Practice:**
  - Gunakan Jest untuk unit dan integration tests.
  - Gunakan Cypress atau Playwright untuk e2e testing.

## coverage/

- **Fungsi:** Menyimpan laporan coverage testing.
- **Best Practice:**
  - Jalankan tes secara berkala untuk menjaga coverage minimal.

## documentation/

- **Fungsi:** Menyimpan dokumentasi proyek.
- **Best Practice:**
  - Gunakan format markdown (.md) agar mudah dibaca di GitHub.

## feature/

- **Fungsi:** Mengelompokkan fitur secara terisolasi.
- **Best Practice:**
  - Strukturkan fitur berdasarkan domain-driven design (DDD).

---

## File Konfigurasi Utama

- `tsconfig.json` → Mengatur konfigurasi TypeScript, termasuk path alias, tipe strict, dan modul yang digunakan.
- `jest.config.js` → Konfigurasi untuk framework testing Jest, termasuk pengaturan environment dan coverage.
- `jest.setup.js` → File setup untuk Jest, digunakan untuk konfigurasi awal atau mock library tertentu.
- `tailwind.config.ts` → Mengatur tema, warna, dan kustomisasi lain untuk Tailwind CSS.
- `eslint.config.mjs` → Konfigurasi linting untuk memastikan standar penulisan kode JavaScript dan TypeScript.
- `prettier.config.cjs` → Mengatur format kode otomatis dengan Prettier, termasuk style guide dan aturan format.
- `next.config.mjs` → Konfigurasi Next.js, termasuk pengaturan build, optimasi, dan environment.
- `middleware.ts` → Middleware untuk menangani otorisasi pengguna dan pengelolaan akses halaman.

## Konfigurasi Build & Deployment

- `Dockerfile` → Instruksi untuk membangun image Docker produksi aplikasi.
- `Dockerfile.test` → Dockerfile khusus untuk environment testing.
- `docker-compose.yml` → Mengelola layanan Docker, termasuk server aplikasi, database, dan jaringan.

## Environment & Keamanan

- `.env / .env.local` → Menyimpan variabel lingkungan sensitif, seperti API keys dan database URL.
- `next-env.d.ts` → File deklarasi otomatis untuk environment Next.js (biasanya tidak perlu diedit secara manual).

## Package Management

- `package.json` → Daftar dependencies, script, dan metadata proyek.
- `package-lock.json` → Mengunci versi dependensi untuk konsistensi antar environment.

# 4. Penutup

Dengan struktur ini, tim dapat lebih mudah mengembangkan, menguji, dan mengelola fitur baru tanpa mengganggu bagian lain dari aplikasi. Kalau ada yang mau disesuaikan atau ditambahkan, beri tahu aja ya! 🚀
