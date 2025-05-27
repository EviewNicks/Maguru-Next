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

## Arsitektur Detail

Arsitektur Manage Module mengikuti pola layering yang jelas dengan tanggung jawab yang terdefinisi dengan baik untuk setiap komponen. Berikut adalah detail untuk setiap layer:

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Interaction                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                        React Components                         │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────┐     │
│  │  ModulePageEditor   │    │     ModulePageSidebar       │     │
│  └─────────────────────┘    └─────────────────────────────┘     │
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
│  │  useModulePageData  │    │   useModulePageQuery        │     │
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

### 7. React Components Layer

**Lokasi File:**
- `features/manage-module/components/ModulePageEditor.tsx`
- `features/manage-module/components/ModulePageSidebar.tsx`
- `features/manage-module/components/ModulePageFooterNav.tsx`
- `features/manage-module/components/RichTextEditor.tsx`
- `features/manage-module/components/DocumentHeader.tsx`

**Tanggung Jawab:**
- Menampilkan UI untuk interaksi pengguna
- Menangani input pengguna
- Menampilkan data dari context/hooks
- Memanggil handler dari context/hooks

**Komponen Utama:**
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
- Menggunakan React Hooks dan Context
- Menggunakan TipTap untuk editor rich text
- Mendukung keyboard shortcuts
- Memiliki error handling yang baik
- Mendukung aksesibilitas (A11y)
- Menggunakan shadcn/ui untuk komponen UI

## Alur Data

Alur data dalam arsitektur ini mengikuti pola one-way data flow:

1. **User Interaction → React Components**
   - Pengguna berinteraksi dengan komponen React (misalnya mengetik di editor)
   - Komponen memanggil handler dari context

2. **React Components → Context**
   - Context menerima event dari komponen
   - Context memanggil fungsi dari hooks

3. **Context → Hooks**
   - Hooks menerima parameter dari context
   - Hooks memanggil fungsi dari adapter

4. **Hooks → Adapter**
   - Adapter menerima parameter dari hooks
   - Adapter melakukan validasi dan transformasi data
   - Adapter memanggil fungsi dari service

5. **Adapter → Service**
   - Service menerima parameter dari adapter
   - Service melakukan operasi database melalui Prisma
   - Service mengembalikan hasil ke adapter

6. **Service → Database**
   - Service melakukan operasi CRUD pada database
   - Database mengembalikan hasil ke service

7. **Data Formats & Schema**
   - Digunakan di berbagai layer untuk validasi dan transformasi data
   - Memastikan konsistensi format data di seluruh aplikasi

## Manfaat Perubahan

1. **Konsistensi Tipe Data**: Semua komponen menggunakan tipe data yang sama, mengurangi potensi error
2. **Maintainability**: Interface yang jelas memudahkan pemeliharaan dan pengembangan fitur baru
3. **Readability**: Kode lebih mudah dipahami dengan struktur yang jelas
4. **Testability**: Lebih mudah untuk menulis test dengan interface yang terdefinisi dengan baik
5. **Separation of Concerns**: Setiap layer memiliki tanggung jawab yang jelas dan terpisah
6. **Reusability**: Komponen dan fungsi dapat digunakan kembali di berbagai bagian aplikasi
7. **Performance**: Optimasi caching dan debouncing mengurangi jumlah API calls

## Rekomendasi Selanjutnya

1. **Tambahkan Unit Test**: Tambahkan unit test untuk fungsi-fungsi di `dataFormats.ts`
2. **Perbarui Integration Test**: Perbarui integration test untuk memastikan alur data bekerja dengan baik
3. **Dokumentasi API**: Tambahkan dokumentasi API untuk interface yang telah dibuat
4. **Type Safety**: Tingkatkan type safety dengan menghilangkan penggunaan `any` di beberapa fungsi
5. **Performance Optimization**: Optimalkan performa dengan memoization dan lazy loading
6. **Error Handling**: Tingkatkan error handling dengan pesan yang lebih informatif
7. **Accessibility**: Tingkatkan aksesibilitas dengan ARIA attributes dan keyboard navigation
