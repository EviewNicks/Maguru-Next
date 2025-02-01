### Folder Structure

src/
├── app/ # Folder utama untuk routing (Next.js App Router)
│ ├── api/ # API Routes (Backend logic)
│ │ ├── auth/ # Autentikasi API (login, register, dll.)
│ │ │ └── route.ts
│ │ ├── courses/ # API untuk fitur courses
│ │ │ └── route.ts
│ │ └── students/ # API untuk fitur mahasiswa
│ │ └── route.ts
│ ├── courses/ # Halaman utama untuk kursus
│ │ └── page.tsx # Halaman list courses
│ ├── dashboard/ # Halaman dashboard admin
│ │ ├── layout.tsx # Layout dashboard
│ │ └── page.tsx # Halaman utama dashboard
│ ├── about/ # Halaman About Us
│ │ └── page.tsx
│ └── layout.tsx # Layout global aplikasi
│ └── page.tsx # Halaman utama aplikasi (Home)
├── components/ # Semua komponen UI yang dapat digunakan kembali
│ ├── ui/ # Komponen kecil (misalnya Button, Input)
│ │ ├── Button.tsx
│ │ ├── Input.tsx
│ │ └── Modal.tsx
│ ├── layouts/ # Layout reusable (header, footer, sidebar)
│ │ ├── Header.tsx
│ │ ├── Footer.tsx
│ │ └── Sidebar.tsx
│ ├── cards/ # Komponen spesifik untuk Card
│ │ └── CourseCard.tsx
│ └── forms/ # Komponen form khusus
│ └── RegisterForm.tsx
├── config/ # Konfigurasi global
│ ├── constants.ts # Constants global (misalnya roles)
│ ├── env.ts # Validasi ENV menggunakan `zod`
│ └── tailwind.ts # Konfigurasi custom Tailwind jika diperlukan
├── hooks/ # Custom hooks
│ ├── useAuth.ts # Hook untuk autentikasi
│ └── useFetch.ts # Hook untuk data fetching
├── lib/ # Utilities/library khusus
│ ├── api.ts # Helper API (fetcher GraphQL/REST)
│ ├── prisma.ts # Prisma client instance
│ ├── auth.ts # Helper autentikasi (Clerk, NextAuth, dll.)
│ └── utils.ts # Helper umum (misalnya formatDate)
├── styles/ # Styling global dan utilitas Tailwind
│ ├── globals.css # Import Tailwind dan CSS global
│ └── tailwind.css # File konfigurasi tambahan Tailwind
├── types/ # Deklarasi tipe global TypeScript
│ ├── next-auth.d.ts # Type untuk autentikasi NextAuth
│ ├── course.ts # Type untuk model kursus
│ └── user.ts # Type untuk user
├── middleware.ts # Middleware (misalnya autentikasi global)
├── prisma/ # Folder untuk Prisma
│ ├── schema.prisma # Skema database Prisma
│ └── migrations/ # File migrasi database Prisma
├── public/ # Aset publik (gambar, font, dll.)
│ ├── images/ # Folder untuk gambar
│ └── favicon.ico # Favicon website
├── tests/ # Folder untuk testing
│ ├── unit/ # Unit tests
│ └── integration/ # Integration tests
└── utils/ # Fungsi utilitas tambahan
└── debounce.ts # Debounce util untuk performance

### Penjelasan Setiap Folder

## next

Fungsi: Folder build otomatis yang dihasilkan oleh Next.js setelah menjalankan aplikasi.

Detail:

- Berisi file hasil kompilasi (output build), caching, dan optimasi yang digunakan oleh Next.js.
- Tidak perlu diubah secara manual.

Best Practice: Jangan pernah menyentuh atau mengedit file di dalam folder ini.

## .vscode/

Fungsi: Berisi pengaturan khusus untuk editor Visual Studio Code.

Detail:

- Kamu dapat menyimpan konfigurasi seperti pengaturan formatter (Prettier/ESLint), debug, atau shortcut.
- Contoh isi: settings.json, launch.json.

Best Practice: Sesuaikan pengaturan dengan kebutuhan tim untuk menjaga konsistensi format kode.

## app/

Fungsi: Folder utama untuk semua routing dan halaman di Next.js App Router.
Detail:

- Berisi file dan folder seperti layout.tsx, page.tsx, dan dynamic routes.
  Mendukung SSR, ISR, dan CSR.

Best Practice: Gunakan struktur modular untuk mengelompokkan halaman berdasarkan fitur.

## components/

Fungsi: Berisi semua komponen UI yang reusable.

Detail:

- Komponen kecil seperti Button, Modal, Card, dll., disimpan di sini.
  Bisa dibagi menjadi subfolder seperti ui/ untuk komponen kecil dan layouts/ untuk layout.

Best Practice: Pastikan komponen bersifat atomic dan modular.

## config/

Fungsi: Tempat menyimpan konfigurasi global proyek.

Detail:

- File konfigurasi seperti env.ts untuk validasi environment variables, constants.ts untuk constant values, dan konfigurasi Tailwind CSS.

Best Practice: Hindari menyimpan logika bisnis dalam folder ini.

## features/

Fungsi: Folder untuk fitur utama aplikasi.

Detail:

- Digunakan untuk memisahkan logika bisnis berdasarkan fitur (modular approach). Misalnya: auth/, courses/, dashboard/.
- Setiap fitur biasanya memiliki folder berisi komponen, API calls, dan logic terkait fitur tersebut.

Best Practice: Strukturkan folder berdasarkan domain-driven design (DDD).

## hooks/

Fungsi: Berisi custom hooks React.

Detail:

- Digunakan untuk menyederhanakan logika bisnis dan mengurangi kompleksitas di komponen.
- Contoh: useAuth.ts untuk autentikasi, useFetch.ts untuk data fetching.

Best Practice: Pastikan setiap hook fokus pada satu tanggung jawab.

## lib/

Fungsi: Library helper dan konfigurasi yang sering digunakan.

Detail:

- Contoh: prisma.ts untuk Prisma client, auth.ts untuk helper autentikasi, api.ts untuk API handler.

Best Practice: Hindari menyimpan logika fitur spesifik di sini. Lib hanya untuk
helper umum.

## node_modules/

Fungsi: Folder yang dihasilkan oleh npm/yarn untuk menyimpan semua dependensi proyek.

Detail:

- Folder ini dibuat otomatis setelah menjalankan npm install atau yarn install.

Best Practice: Jangan edit file dalam folder ini.

## prisma/

Fungsi: Folder untuk konfigurasi dan migrasi database menggunakan Prisma.

Detail:

- schema.prisma: File utama untuk mendefinisikan model database.
- migrations/: Folder yang dihasilkan untuk mencatat perubahan pada database.

Best Practice: Selalu lakukan validasi setelah mengedit skema.

## public/

Fungsi: Tempat menyimpan file publik seperti gambar, favicon, font, dll.

Detail:

- File di sini dapat diakses langsung melalui URL tanpa perlu proses build.

Best Practice: Gunakan struktur folder untuk mengorganisir aset.

## services/

Fungsi: Tempat menyimpan logika API dan komunikasi dengan backend/external services.

Detail:

- Contoh: authService.ts untuk API autentikasi, courseService.ts untuk API kursus.

Best Practice: Pisahkan logika berdasarkan fitur atau domain.

## store/

Fungsi: Tempat menyimpan state management global.

Detail:

- Jika menggunakan Redux, file seperti store.ts atau slices/ disimpan di sini.
- Alternatif: Untuk state lokal, gunakan Context API atau Zustand.

Best Practice: Hindari memasukkan terlalu banyak state global.

## styles/

Fungsi: Folder untuk semua file styling (CSS atau Tailwind).

Detail:

- File utama seperti globals.css untuk styling global.
- Jika menggunakan Tailwind, ini adalah tempat untuk konfigurasi tambahan.

Best Practice: Pisahkan styling per komponen jika memungkinkan.

## test/

Fungsi: Folder untuk semua pengujian (unit, integration, e2e).

Detail:

- Dibagi menjadi subfolder seperti unit/, integration/, atau file test per komponen.

Best Practice: Gunakan testing library seperti Jest atau Playwright.

## types/

Fungsi: Tempat menyimpan definisi tipe TypeScript.

Detail:

- Misalnya: user.ts untuk tipe user, course.ts untuk tipe kursus.

Best Practice: Gunakan tipe ini di seluruh aplikasi untuk konsistensi.

## utils/

Fungsi: Tempat menyimpan fungsi utilitas umum.

Detail:

- Contoh: formatDate.ts, debounce.ts, atau fungsi untuk logging.

Best Practice: Pastikan fungsi utilitas bersifat independen.

======================================================================

### Tools dan Dependency

Untuk mendukung struktur ini, kamu bisa menggunakan beberapa tools dan library berikut:

- Database: Supabase (atau Prisma + PostgreSQL).
- Auth: Clerk atau NextAuth.js.
- State Management: React Query (untuk data fetching) atau Redux Toolkit.
- CSS Framework: Tailwind CSS.
- Testing: Jest, React Testing Library, atau Playwright.
- GraphQL: Apollo Client jika menggunakan GraphQL.
