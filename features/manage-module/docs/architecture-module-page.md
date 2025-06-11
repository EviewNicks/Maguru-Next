# Arsitektur Manage Module

## Ringkasan Perubahan

Beberapa perbaikan telah dilakukan untuk meningkatkan konsistensi dan maintainability dari modul manage-module:

### 1. Konsolidasi Format Data

- Memindahkan fungsi-fungsi parsing konten dari `content-parser.ts` ke `dataFormats.ts`
- Menambahkan anotasi `@deprecated` pada fungsi-fungsi di `content-parser.ts` sebagai langkah transisi
- Memperbarui `modulePageService.ts` untuk menggunakan fungsi dari `dataFormats.ts`
- Menghapus `content-parser.ts` setelah semua referensi diperbarui

### 2. Standardisasi Tipe Data

- Mendefinisikan `ModulePageStatus` sebagai enum di `index.ts`
- Memperbarui `modulePageSchema.ts` untuk menggunakan enum tersebut
- Memperbarui `modulePageService.ts` untuk menggunakan enum tersebut sebagai pengganti string literal

### 3. Interface untuk Layanan dan Adapter

- Membuat interface `IModulePageService` untuk `modulePageService.ts`
- Membuat interface `IModulePageAdapter` untuk `modulePageAdapter.ts`
- Memastikan implementasi sesuai dengan interface

### 4. Konsolidasi Tipe Data Editor

- Memindahkan definisi `TiptapNode` dan `StandardEditorContent` ke `index.ts`
- Memperbarui `dataFormats.ts` untuk menggunakan tipe dari `index.ts`
- Memperbarui `useModulePageData.ts` untuk menggunakan tipe dari `index.ts`

### 5. Konsolidasi Hooks

- Menggabungkan fungsionalitas dari `useModulePageMutation.ts` ke dalam `useModulePageData.ts`
- Menambahkan notifikasi toast untuk memberikan feedback yang lebih baik kepada pengguna
- Menstandarisasi error handling di semua mutasi
- Memastikan `useModulePageData.ts` menjadi satu-satunya entry point untuk operasi CRUD halaman

### 6. Strategi Rendering dan Pemisahan Server/Client Component

- Mengimplementasikan pemisahan antara Server Component dan Client Component untuk optimalisasi performa
- Menerapkan pola di mana Server Component melakukan data fetching awal dan Client Component menangani interaktivitas
- Menggunakan ISR (Incremental Static Regeneration) untuk halaman yang jarang berubah
- Menerapkan lazy loading untuk komponen berat seperti editor dengan `next/dynamic`

## Strategi Rendering Next.js

Arsitektur ini memanfaatkan fitur modern Next.js (App Router) dengan beberapa strategi rendering:

### 1. Server Components

- **Halaman Utama** (`app/manage-module/[moduleId]/page.tsx`): Server Component yang melakukan data fetching di server menggunakan `getModulePages`
- **Manfaat**: Konten halaman sudah berisi data saat dikirim ke browser, meningkatkan SEO dan First Contentful Paint
- **Implementasi**: Tidak menggunakan directive `'use client'`, melakukan fetch dengan `await getModulePages(moduleId)`, dan melempar props ke Client Component

### 2. Client Components

- **Shell Komponen** (`ModulePageShell.tsx`): Client Component yang menerima data awal dari Server Component
- **Komponen UI Interaktif**: `ModulePageEditor`, `ModulePageSidebar`, dll. (semua dengan directive `'use client'`)
- **Manfaat**: Mendukung interaktivitas penuh dengan React hooks, state, dan event handling
- **Implementasi**: Menggunakan React Query untuk state management dengan `initialData` dari Server Component

### 3. Incremental Static Regeneration (ISR)

- **Konfigurasi**: Menambahkan `export const revalidate = 60` di `page.tsx` untuk menyegarkan cache setiap 60 detik
- **Manfaat**: Performa tinggi dari static generation, tetapi masih mendapatkan data segar secara periodik
- **Implementasi**: Kombinasi dengan `generateStaticParams` untuk membuat halaman statis pada saat build

### 4. Lazy Loading

- **Komponen Berat**: Menggunakan `next/dynamic` untuk memuat `ModulePageEditor` secara lazy
- **Manfaat**: Mengurangi ukuran bundle awal, mempercepat First Contentful Paint
- **Implementasi**: `const ModulePageEditor = dynamic(() => import('./components/ModulePageEditor'), { ssr: false })`

## Arsitektur Detail

Arsitektur Manage Module mengikuti pola layering yang jelas dengan tanggung jawab yang terdefinisi dengan baik untuk setiap komponen. Berikut adalah detail untuk setiap layer:

Client Side Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Interaction                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                        React Components                         │
│                                                                 │
│                         ┌────────────────────┐  ┌────────────┐  │
│                         │ Client Components  │  │Lazy-loaded │  │
│                         │('use client')      │  │Components  │  │
│                         └────────────────────┘  └────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                           Context                               │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────┐     │
│  │ModulePageCRUDContext│    │    ModulePagesContext       │     │
│  └─────────────────────┘    └─────────────────────────────┘     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                            Hooks                                │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────┐     │
│  │  useModulePageData  │    │      React Query Hooks      │     │
│  └─────────────────────┘    └─────────────────────────────┘     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                           Adapter                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               modulePageAdapter                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                           API Route                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               app/api/modules/[...]/route.ts            │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                           Service                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               modulePageService                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                          Database                               │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                         Data Formats                            │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                           Schema                                │
└─────────────────────────────────────────────────────────────────┘
```

Server Side Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Interaction                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                        React Components                         │
│                                                                 │
│  ┌───────────────────┐                          ┌────────────┐  │
│  │Server Components  │                          │Lazy-loaded │  │
│  │(page.tsx)         │                          │Components  │  │
│  └───────────────────┘                          └────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                           Service                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               modulePageService                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                          Database                               │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                         Data Formats                            │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                           Schema                                │
└─────────────────────────────────────────────────────────────────┘
```

### 1. Schema Layer

**Lokasi File:**

- `features/manage-module/types/modulePageSchema.ts`

**Tanggung Jawab:**

- Mendefinisikan struktur data dengan Zod schemas
- Validasi data input dan output
- Mendefinisikan tipe TypeScript dari schema

**Komponen Utama:**

- `ContentBlockSchema`: Schema untuk blok konten (text, code, image, video)
- `CreateModulePageSchema`: Schema untuk input pembuatan halaman
- `UpdateModulePageSchema`: Schema untuk input pembaruan halaman
- `ModulePageSchema`: Schema untuk model halaman lengkap

**Karakteristik:**

- Menggunakan Zod untuk validasi runtime dan inferensi tipe
- Mendukung berbagai format konten (text, code, image, video)
- Memiliki validasi untuk batasan ukuran file (2MB untuk gambar, 20MB untuk video)
- Terintegrasi dengan TypeScript untuk type safety
- **Digunakan di Server dan Client**: Schema dapat digunakan di Server Component maupun Client Component

### 2. Data Formats Layer

**Lokasi File:**

- `features/manage-module/lib/dataFormats.ts`

**Tanggung Jawab:**

- Transformasi data antar format (JSON, ContentBlock, Tiptap)
- Validasi format data
- Konversi data untuk kompatibilitas dengan berbagai komponen

**Fungsi Utama:**

- `validateEditorContent`: Validasi konten editor menggunakan Zod schema
- `isValidTiptapJSON`: Memeriksa apakah string JSON valid dan memiliki format Tiptap
- `parseFirstBlock`: Parse blok pertama dari data halaman untuk mendapatkan konten Tiptap
- `convertBlocksToTiptap`: Konversi blocks ke format Tiptap
- `blocksToStandardContent`: Konversi blocks dari ModulePage ke format standar untuk editor
- `standardContentToBlocks`: Konversi format standar editor ke blocks untuk database
- `parseContent`: Fungsi utama untuk parsing konten dari berbagai format

**Karakteristik:**

- Menangani berbagai format data (string JSON, objek Tiptap, array ContentBlock)
- Menyediakan fallback untuk format yang tidak valid
- Menggunakan Zod untuk validasi format
- Memiliki error handling yang komprehensif
- **Digunakan di Server dan Client**: Utility dapat digunakan di kedua lingkungan

### 3. Service Layer

**Lokasi File:**

- `features/manage-module/services/modulePageService.ts`

**Tanggung Jawab:**

- Operasi CRUD pada data halaman modul
- Komunikasi dengan database melalui Prisma
- Transformasi data untuk API response
- Validasi data input

**Fungsi Utama:**

- `getModuleIdFromStorage`: Mendapatkan moduleId dari storage
- `createModulePage`: Membuat halaman baru dalam modul
- `getModulePages`: Mendapatkan daftar halaman dalam modul
- `getModulePage`: Mendapatkan detail halaman berdasarkan ID
- `updateModulePage`: Memperbarui halaman berdasarkan ID
- `deleteModulePage`: Menghapus halaman berdasarkan ID
- `reorderModulePages`: Mengubah urutan halaman
- `parseContent`: Parse konten dari string JSON atau data halaman

**Karakteristik:**

- Mengimplementasi interface `IModulePageService`
- Menggunakan Prisma untuk operasi database
- Menangani error dengan try-catch
- Menerapkan optimistic locking untuk update
- Mendukung pagination dan filtering
- **Digunakan di Server**: Hanya digunakan langsung di Server Component atau API Route, tidak di Client Component

### 4. Adapter Layer

**Lokasi File:**

- `features/manage-module/adapters/modulePageAdapter.ts`

**Tanggung Jawab:**

- Menjembatani antara service dan hooks/context
- Caching data untuk mengurangi API calls
- Transformasi format data untuk UI
- Validasi input sebelum diteruskan ke service

**Fungsi Utama:**

- `getPages`: Mendapatkan daftar halaman dengan caching
- `getPage`: Mendapatkan detail halaman dengan caching
- `createPage`: Membuat halaman baru
- `updatePage`: Memperbarui halaman
- `deletePage`: Menghapus halaman
- `reorderPages`: Mengubah urutan halaman
- `saveEditorContent`: Menyimpan konten editor
- `getParsedEditorContent`: Mendapatkan konten yang telah diparse untuk editor

**Karakteristik:**

- Mengimplementasi interface `IModulePageAdapter`
- Memiliki mekanisme caching dengan expiration
- Melakukan validasi input sebelum diteruskan ke service
- Menangani error dengan try-catch
- Mendukung optimistic updates
- **Penggunaan di Server dan Client**:
  - Di Server Component: Dipanggil langsung dengan `await getModulePages()`
  - Di Client Component: Diakses melalui hooks React Query

### 5. Hooks Layer

**Lokasi File:**

- `features/manage-module/hooks/useModulePageData.ts`
- `features/manage-module/hooks/useModulePageQuery.ts`

**Tanggung Jawab:**

- Menyediakan interface React untuk mengakses data
- Mengelola state query dan mutation dengan React Query
- Menyediakan fungsi-fungsi untuk operasi CRUD
- Menangani loading, error, dan success states

**Fungsi Utama:**

- `useModulePageData`: Hook untuk mengelola data halaman modul
  - `pages`: Data halaman
  - `getPage`: Mendapatkan halaman berdasarkan ID
  - `createPage`: Membuat halaman baru
  - `updatePage`: Memperbarui halaman
  - `savePage`: Menyimpan perubahan halaman
  - `saveEditorContent`: Menyimpan konten editor
  - `deletePage`: Menghapus halaman
  - `reorderPages`: Mengubah urutan halaman
- `useModulePageQuery`: Hook untuk query data halaman
  - `getAllPages`: Mendapatkan semua halaman
  - `getPageById`: Mendapatkan halaman berdasarkan ID

**Karakteristik:**

- Menggunakan React Query untuk state management
- Menyediakan state loading, error, dan data
- Mendukung optimistic updates
- Memiliki caching dan invalidation yang tepat
- Menyediakan fungsi-fungsi mutation yang mudah digunakan
- Menampilkan notifikasi toast untuk feedback pengguna
- **Hanya digunakan di Client Component**: Hook React hanya dapat digunakan di file dengan `'use client'`
- **Mendukung initialData**: Menerima data awal dari Server Component untuk menghindari refetch

### 6. Context Layer

**Lokasi File:**

- `features/manage-module/context/ModulePageCRUDContext.tsx`
- `features/manage-module/context/ModulePagesContext.tsx`

**Tanggung Jawab:**

- Menyediakan state global untuk komponen
- Mengelola state UI (sidebar, active page)
- Menyediakan fungsi-fungsi handler untuk komponen
- Mengelola state navigasi dan editing

**Komponen Utama:**

- `ModulePageCRUDContext`: Context untuk operasi CRUD halaman
  - `moduleId`: ID modul yang sedang aktif
  - `pages`: Daftar halaman dalam modul
  - `activePage`: Halaman yang sedang aktif
  - `createPage`: Membuat halaman baru
  - `updatePage`: Memperbarui halaman
  - `deletePage`: Menghapus halaman
  - `reorderPages`: Mengubah urutan halaman
  - `updatePageStatus`: Mengubah status halaman
  - `savePage`: Menyimpan perubahan halaman
  - `handleEditorChange`: Handler untuk perubahan editor
  - `handlePageChange`: Handler untuk navigasi halaman
  - `handleSelectPage`: Handler untuk memilih halaman
  - `handleNavigateToPrevPage`: Handler untuk navigasi ke halaman sebelumnya
  - `handleNavigateToNextPage`: Handler untuk navigasi ke halaman berikutnya
- `ModulePagesContext`: Context untuk UI sidebar
  - `isOpen`: Status sidebar (terbuka/tertutup)
  - `toggleSidebar`: Toggle sidebar
  - `expandedItems`: Item yang sedang expanded di sidebar
  - `toggleExpandItem`: Toggle expanded item

**Karakteristik:**

- Menggunakan React Context API
- Menyediakan state dan handler yang dibutuhkan komponen
- Memisahkan tanggung jawab antara data (CRUD) dan UI (sidebar)
- Menggunakan hooks untuk mengakses data
- Mendukung optimistic updates dan error handling
- **Hanya digunakan di Client Component**: Context hanya dapat digunakan di file dengan `'use client'`
- **Mengelola UI State**: Fokus pada state UI dan flow, bukan data fetching yang kompleks

### 7. React Components Layer

**Lokasi File (Server Component):**

- `app/manage-module/[moduleId]/page.tsx`
- `app/manage-module/page.tsx`

**Lokasi File (Client Component):**

- `app/manage-module/[moduleId]/ModulePageShell.tsx`
- `features/manage-module/components/ModulePageEditor.tsx`
- `features/manage-module/components/ModulePageSidebar.tsx`
- `features/manage-module/components/ModulePageFooterNav.tsx`
- `features/manage-module/components/RichTextEditor.tsx`
- `features/manage-module/components/DocumentHeader.tsx`

**Tanggung Jawab Server Component:**

- Melakukan data fetching awal di server
- Menerapkan strategi caching/revalidation (ISR)
- Mengatur metadata halaman (title, description) untuk SEO
- Menangani error level halaman
- Melakukan redirect atau menampilkan halaman 404 jika diperlukan

**Tanggung Jawab Client Component:**

- Menampilkan UI untuk interaksi pengguna
- Menangani input pengguna
- Menampilkan data dari context/hooks
- Memanggil handler dari context/hooks
- Menangani state lokal dan rendering kondisional

**Komponen Utama:**

- `page.tsx` (Server Component):

  - Melakukan fetch data awal dengan `await getModulePages()`
  - Mengatur ISR dengan `export const revalidate = 60`
  - Mengirim data awal ke `ModulePageShell`

- `ModulePageShell` (Client Component):

  - Menerima `initialPages` dari Server Component
  - Menyediakan React Query Provider
  - Menyusun layout dasar (sidebar + editor)

- `ModulePageEditor`: Editor utama untuk halaman

  - Menampilkan editor rich text dengan TipTap
  - Menampilkan toolbar formatting
  - Menangani autosave konten

- `ModulePageSidebar`: Sidebar untuk navigasi halaman

  - Menampilkan daftar halaman dalam modul
  - Menangani navigasi antar halaman
  - Mendukung toggle sidebar (buka/tutup)

- `ModulePageFooterNav`: Navigasi footer untuk halaman

  - Menampilkan tombol prev/next
  - Menampilkan indikator halaman saat ini

- `RichTextEditor`: Editor rich text dengan TipTap

  - Mendukung berbagai format (bold, italic, heading, list, dll.)
  - Mendukung slash command dan floating menu
  - Mendukung keyboard shortcuts

- `DocumentHeader`: Header dokumen
  - Menampilkan judul halaman
  - Menampilkan status penyimpanan (saved, saving, unsaved)
  - Menampilkan tombol aksi (create, delete, dll.)

**Karakteristik:**

- **Server Component**:

  - Tidak menggunakan React hooks
  - Melakukan data fetching dengan `await`
  - Fokus pada SEO dan performa awal

- **Client Component**:
  - Diawali dengan directive `'use client'`
  - Menggunakan React Hooks dan Context
  - Menggunakan TipTap untuk editor rich text
  - Mendukung keyboard shortcuts
  - Memiliki error handling yang baik
  - Mendukung aksesibilitas (A11y)
  - Menggunakan shadcn/ui untuk komponen UI
  - Lazy-loaded jika berat (menggunakan `next/dynamic`)

## Alur Data

Alur data dalam arsitektur ini mengikuti pola modern Next.js dengan pemisahan Server/Client Components:

### 1. Alur Server-Side (SSR/ISR)

1. **Server Component (page.tsx)**
   - Dieksekusi di server saat request atau regenerasi ISR
   - Memanggil adapter `await getModulePages(moduleId)`
   - Adapter memanggil service yang mengakses database
   - Data dikembalikan dan dikirim sebagai props ke Client Component

### 2. Alur Client-Side (Hydration)

1. **User Interaction → React Components**

   - Pengguna berinteraksi dengan komponen React (misalnya mengetik di editor)
   - Komponen memanggil handler dari context

2. **React Components → Context**

   - Context menerima event dari komponen
   - Context memanggil fungsi dari hooks

3. **Context → Hooks (React Query)**

   - Hooks menerima parameter dari context
   - React Query mengelola state dan caching
   - React Query memanggil fungsi dari adapter

4. **Hooks → Adapter → API Route**

   - Adapter memanggil API Route melalui fetch/axios
   - API Route memanggil service
   - Service melakukan operasi database

5. **Data Formats & Schema**
   - Digunakan di berbagai layer untuk validasi dan transformasi data
   - Memastikan konsistensi format data di seluruh aplikasi

## Manfaat Perubahan

1. **Konsistensi Tipe Data**: Semua komponen menggunakan tipe data yang sama, mengurangi potensi error
2. **Maintainability**: Interface yang jelas memudahkan pemeliharaan dan pengembangan fitur baru
3. **Readability**: Kode lebih mudah dipahami dengan struktur yang jelas
4. **Testability**: Lebih mudah untuk menulis test dengan interface yang terdefinisi dengan baik
5. **Separation of Concerns**: Setiap layer memiliki tanggung jawab yang jelas dan terpisah
6. **Reusability**: Komponen dan fungsi dapat digunakan kembali di berbagai bagian aplikasi
7. **Performance**:
   - Server Components meningkatkan SEO dan First Contentful Paint
   - ISR menyediakan caching dengan revalidasi periodik
   - Lazy loading mengurangi ukuran bundle awal
   - React Query menyediakan caching dan optimistic updates di client
8. **User Experience**: Notifikasi toast memberikan feedback yang lebih baik kepada pengguna

## Rekomendasi Selanjutnya

1. **Migrasi ke App Router**: Jika belum, migrasi dari folder `pages/` ke folder `app/` untuk memanfaatkan fitur Server Component dan peningkatan performa
2. **Implementasi ISR**: Menerapkan Incremental Static Regeneration untuk halaman yang jarang berubah
3. **Lazy Loading**: Menggunakan `next/dynamic` untuk lazy load komponen berat seperti editor
4. **Optimasi React Query**: Menyesuaikan konfigurasi React Query (staleTime, cacheTime) untuk mengurangi fetch yang tidak perlu
5. **Caching HTTP**: Menambahkan header caching yang tepat di API Route
6. **Error Handling yang Konsisten**: Implementasi penanganan error yang konsisten antara Server dan Client Component
7. **Server Error Component**: Membuat komponen error handling khusus untuk menampilkan pesan yang user-friendly
8. **Type Safety**: Tingkatkan type safety dengan menghilangkan penggunaan `any` di beberapa fungsi
9. **Unit Test untuk Server Component**: Menambahkan unit test untuk Server Component dan data fetching
10. **End-to-End Test**: Membuat test E2E dengan Playwright untuk alur pengguna lengkap

## Struktur Folder yang Direkomendasikan

Untuk mengoptimalkan penggunaan Server Component dan Client Component, berikut struktur folder yang direkomendasikan:

```
src/
├── app/                                # Next.js App Router
│   ├── manage-module/
│   │   ├── page.tsx                    # Server Component: Daftar modul
│   │   ├── [moduleId]/
│   │   │   ├── page.tsx                # Server Component: Fetch data awal
│   │   │   ├── layout.tsx              # Server Component: Layout halaman
│   │   │   ├── error.tsx               # 'use client': Error boundary
│   │   │   ├── loading.tsx             # Loading UI
│   │   │   └── not-found.tsx           # Halaman 404 kustom
│   │   └── api/                        # API Routes
│   │       └── modules/
│   │           └── [...]/route.ts      # API Handler
│   └── globals.css                     # Styles global
│
├── features/
│   └── manage-module/
│       ├── components/                 # Client Components (use client)
│       │   ├── ModulePageEditor.tsx    # Editor komponen
│       │   ├── ModulePageSidebar.tsx   # Sidebar komponen
│       │   ├── RichTextEditor.tsx      # Editor teks
│       │   └── ui/                     # Komponen UI kecil
│       │       ├── Button.tsx
│       │       └── ...
│       │
│       ├── context/                    # Client-side contexts
│       │   ├── ModulePageCRUDContext.tsx
│       │   └── ModulePagesContext.tsx
│       │
│       ├── hooks/                      # Custom hooks
│       │   ├── useModulePageData.ts
│       │   └── useModulePageQuery.ts
│       │
│       ├── adapters/                   # Data adapters
│       │   └── modulePageAdapter.ts
│       │
│       ├── services/                   # Backend services
│       │   └── modulePageService.ts
│       │
│       ├── lib/                        # Utility functions
│       │   └── dataFormats.ts
│       │
│       └── types/                      # TypeScript types & schemas
│           ├── index.ts
│           └── modulePageSchema.ts
│
├── lib/                                # Shared utilities
│   ├── utils.ts
│   └── constants.ts
│
└── middleware.ts                       # Next.js middleware
```

### Penjelasan Struktur

1. **App Router (`app/`)**

   - **Server Components**: `page.tsx` dan `layout.tsx` yang melakukan data fetching di server
   - **API Routes**: Endpoint API untuk operasi CRUD
   - **Error & Loading**: Komponen khusus untuk error handling dan loading state

2. **Feature Module (`features/manage-module/`)**
   - **Components**: Semua Client Component (`'use client'`) yang membutuhkan interaktivitas
   - **Context & Hooks**: State management dan business logic client-side
   - **Adapters & Services**: Kode untuk data fetching dan komunikasi dengan API/database
   - **Types & Lib**: Definisi tipe dan utilitas untuk feature

### Best Practices untuk Struktur Folder

1. **Co-location**: Tempatkan komponen, hooks, dan utilitas yang berhubungan dekat satu sama lain
2. **Feature-based**: Kelompokkan kode berdasarkan feature, bukan berdasarkan tipe file
3. **Isolation**: Pastikan setiap feature modul dapat diisolasi dan tidak bergantung pada feature lain
4. **Clear Boundaries**: Buat batas yang jelas antara server-side dan client-side code
5. **Shared Code**: Tempatkan kode yang digunakan di banyak feature di folder `lib/` global
   s

## Kesimpulan

Arsitektur yang diperbarui ini memanfaatkan kekuatan Next.js modern dengan:

1. **Server Components**: Meningkatkan performa awal dan SEO dengan pre-rendering di server
2. **Client Components**: Memberikan interaktivitas yang kaya dengan React hooks
3. **Incremental Static Regeneration**: Mengoptimalkan performa dengan caching yang tepat
4. **Lazy Loading**: Mengurangi ukuran bundle awal dengan memuat komponen berat hanya saat dibutuhkan
5. **React Query**: Menyediakan state management yang efisien dengan caching dan optimistic updates
6. **Context API**: Mengelola state UI global dengan tepat, tanpa re-render yang tidak perlu
7. **Modular Architecture**: Memisahkan tanggung jawab dengan jelas antar layer

Dengan pendekatan ini, aplikasi Maguru akan memiliki performa yang baik, maintainability yang tinggi, dan pengalaman pengguna yang optimal.
