# Rencana Testing untuk Modul Page

## 1. Pendahuluan

Dokumen ini menjelaskan strategi dan rencana implementasi testing untuk sistem page pada modul manage-module. Testing akan fokus pada alur pengguna dan interaksi antar komponen, dengan simulasi berbagai skenario penggunaan sesuai arsitektur yang didefinisikan dalam `architecture-module-page.md`. Strategi testing ini mencakup unit test, integration test, dan performance test untuk memastikan kualitas dan keandalan fitur.

## 2. Tujuan Testing

- Memastikan komponen-komponen berinteraksi dengan benar sesuai alur yang diharapkan
- Memvalidasi fungsi CRUD halaman modul berjalan dengan baik
- Memverifikasi fitur draft auto-save berfungsi sesuai spesifikasi
- Menguji penanganan concurrent editing dan resolusi konflik
- Memastikan toggle mode view/edit berjalan dengan benar
- Validasi navigasi antar halaman dan penanganan perubahan yang belum disimpan
- Mengidentifikasi dan mendiagnosis masalah pada fitur handleToggleMode
- Mendeteksi potensial race condition dan timing issues

## 3. Strategi Mocking

### 3.1 Layer Adapter (modulePageAdapter.ts)

#### Komponen yang Perlu Di-mock:

- **Fungsi CRUD**: `getPages`, `getPage`, `createPage`, `updatePage`, `deletePage`, `reorderPages`
- **Fungsi Draft**: `saveDraft`, `getDraft`, `publishDraft`, `discardDraft`, `hasDraft`
- **Fungsi Cache**: `invalidateModuleCache`, `invalidatePageCache`, `invalidateDraftCache`

#### Pendekatan Mocking:

- Menggunakan Jest mock functions untuk semua metode adapter
- Menyediakan implementasi mock yang mengembalikan data statis untuk operasi read
- Mensimulasikan operasi write dengan memperbarui data dalam memory
- Menambahkan kemampuan untuk memicu error dan edge cases
- Melacak pemanggilan fungsi untuk verifikasi dalam test

#### Manfaat Pendekatan:

- Isolasi dari API dan database sebenarnya
- Kontrol penuh atas kondisi test dan respons
- Kemampuan untuk mensimulasikan berbagai skenario termasuk error handling
- Konsistensi hasil test antar eksekusi

### 3.2 Layer Hooks

#### useModulePageData.ts

- **State yang Perlu Di-mock**: `pages`, `isLoading`, `error`
- **Fungsi yang Perlu Di-mock**: `getPage`, `createPage`, `updatePage`, `deletePage`, `getParsedEditorContent`

#### useRichTextAutosave.ts

- **State yang Perlu Di-mock**: `saveStatus`, `lastSavedAt`, `hasUnsavedChanges`
- **Event Handlers**: `handleUpdate`, `handleOnline`, `handleOffline`, `handleBeforeUnload`, `handleVisibilityChange`
- **Fungsi Utama**: `forceSave`

#### useDraftRecovery.ts

- **State yang Perlu Di-mock**: `hasDraft`, `draftData`, `isLoading`, `showRecoveryDialog`
- **Fungsi yang Perlu Di-mock**: `checkDraft`, `fetchDraft`, `handleRecover`, `handleDiscard`

#### useUnsavedChangesPrompt.ts

- **State yang Perlu Di-mock**: `showDialog`
- **Event Handlers**: `handleConfirm`, `handleCancel`, `handleLinkClick`
- **Router Wrapper**: `routerWithConfirm`

#### Pendekatan Mocking Hooks:

- Membuat mock module untuk setiap hook dengan Jest
- Mengembalikan objek dengan semua properties dan functions yang digunakan oleh komponen
- Menggunakan Jest spies untuk melacak pemanggilan dan parameter
- Menyediakan implementasi custom untuk fungsi-fungsi yang memerlukan logika khusus
- Mengontrol state hooks melalui setup test

#### Pertimbangan Khusus:

- Hooks dengan efek samping (seperti event listeners) memerlukan cleanup yang tepat
- Hooks yang menggunakan browser APIs perlu mock khusus (localStorage, sessionStorage)
- Hooks dengan timers (debounce, throttle) memerlukan mock timer Jest

### 3.3 Layer Context

#### ModulePageCRUDContext.tsx

- **State yang Perlu Di-mock**: `moduleId`, `pages`, `activePage`, `saveStatus`, `isNavigating`
- **Fungsi Navigasi**: `getNextPage`, `getPreviousPage`, `getFirstPage`, `getLastPage`
- **Fungsi CRUD**: `createPage`, `updatePage`, `deletePage`, `savePage`
- **Handler**: `handlePageChange`, `handleSelectPage`, `handleEditorChange`

#### ModuleDraftPageContext.tsx

- **State Draft**: `draftSaveStatus`, `lastSavedAt`, `hasUnsavedChanges`, `hasDraft`
- **State Editor**: `editorMode`, `activeEditors`, `hasEditingConflict`
- **Fungsi Draft**: `forceSave`, `publishDraft`, `discardDraft`, `getDraftOrPublishedContent`
- **Fungsi Mode**: `toggleEditorMode`, `setEditorMode`

#### Pendekatan Mocking Context:

- Membuat custom wrapper components yang menyediakan mock context values
- Menggunakan React Testing Library untuk render komponen dengan context providers
- Mempersiapkan nilai awal context yang sesuai dengan skenario test
- Menyediakan fungsi untuk memperbarui nilai context selama test
- Mengimplementasikan mock handlers yang dapat dilacak dengan Jest spies

#### Strategi Pengujian Context:

- Menguji provider dan consumer secara terpisah
- Memverifikasi bahwa nilai context diperbarui dengan benar setelah aksi
- Menguji interaksi antar context (seperti ModulePageCRUDContext dan ModuleDraftPageContext)
- Memastikan komponen yang menggunakan context menerima nilai yang benar

## 4. Mock Server Worker (MSW) untuk API Routes

### 4.1 Endpoint yang Perlu Di-mock

- **Halaman Modul**:

  - `GET /api/module/[id]/pages`: Mendapatkan daftar halaman
  - `POST /api/module/[id]/pages`: Membuat halaman baru
  - `GET /api/module/[id]/pages/[pageid]`: Mendapatkan detail halaman
  - `PUT /api/module/[id]/pages/[pageid]`: Memperbarui halaman
  - `DELETE /api/module/[id]/pages/[pageid]`: Menghapus halaman

- **Draft Halaman**:

  - `POST /api/module/[id]/pages/[pageid]/draft`: Menyimpan draft
  - `GET /api/module/[id]/pages/[pageid]/draft`: Mendapatkan draft
  - `PATCH /api/module/[id]/pages/[pageid]/draft`: Mempublikasikan draft
  - `DELETE /api/module/[id]/pages/[pageid]/draft`: Membuang draft

- **Status Halaman**:
  - `PATCH /api/module/[id]/pages/[pageid]/status`: Mengubah status halaman

### 4.2 Strategi MSW

#### Pendekatan Umum:

- Menggunakan MSW untuk intercept HTTP requests di level network
- Membuat handlers terpisah untuk setiap endpoint API
- Mengimplementasikan logika respons yang mirip dengan backend asli
- Menyediakan mekanisme untuk override respons default untuk skenario test spesifik

#### Fitur MSW yang Akan Dimanfaatkan:

- Response transformers untuk manipulasi data respons
- Request matching berdasarkan path, method, dan query parameters
- Delay response untuk mensimulasikan latency jaringan
- Response composition untuk membangun respons yang kompleks
- Runtime request handlers untuk mengubah perilaku selama test

#### Integrasi dengan Mock Data:

- Menggunakan data dari mock store sebagai sumber untuk respons API
- Memperbarui mock store saat operasi write dilakukan
- Menjaga konsistensi data antar requests
- Mensimulasikan relasi antar data (misalnya halaman dalam modul)

## 5. Mock Data

### 5.1 Mock Modules dan Pages

#### Struktur Data Modules:

- ID modul
- Judul dan deskripsi
- Status dan metadata
- Relasi dengan halaman

#### Struktur Data Pages:

- ID halaman dan ID modul parent
- Judul dan konten (dalam format blocks)
- Status halaman (draft, published)
- Metadata seperti order, createdAt, updatedAt
- Informasi versi dan author

#### Strategi Pengelolaan Data:

- Menyediakan dataset default untuk semua test
- Memungkinkan override data untuk test spesifik
- Memastikan data mencakup berbagai kasus (halaman dengan/tanpa draft, dll)
- Menjaga konsistensi relasi antar data

### 5.2 Mock Draft Data

#### Struktur Data Draft:

- Konten dalam format Tiptap JSON
- Timestamp penyimpanan (draftSavedAt)
- Informasi author (authorId)
- Flag untuk status (hasUnpublishedChanges)

#### Skenario Draft yang Perlu Dicakup:

- Draft yang lebih baru dari versi published
- Draft yang sama dengan versi published
- Tidak ada draft (hanya versi published)
- Draft dengan konflik (multiple authors)

### 5.3 Mock User Data

#### Struktur Data User:

- ID pengguna
- Nama dan informasi profil
- URL gambar avatar
- Role dan permissions

#### Penggunaan Data User:

- Simulasi concurrent editing dengan multiple users
- Pengujian fitur yang bergantung pada user identity
- Verifikasi tampilan UI yang berkaitan dengan user (avatar, nama)

## 6. Test Utilities

### 6.1 Custom Renderer

#### Fungsi dan Fitur:

- Menyediakan wrapper yang mencakup semua provider yang diperlukan
- Mengonfigurasi React Query dengan opsi yang sesuai untuk testing
- Menyediakan parameter untuk kustomisasi setup test
- Menangani cleanup setelah test selesai

#### Parameter Konfigurasi:

- moduleId: ID modul untuk testing
- initialPages: Data halaman awal
- initialActivePage: Halaman aktif awal
- queryClient: Konfigurasi React Query client
- Opsi tambahan untuk render dari React Testing Library

### 6.2 Wait Helpers

#### Fungsi-fungsi Utility:

- waitForDraftSave: Menunggu hingga status draft berubah menjadi "Tersimpan"
- waitForApiCall: Menunggu hingga fungsi API dipanggil
- waitForElementToBeVisible: Menunggu elemen UI muncul
- waitForElementToDisappear: Menunggu elemen UI menghilang
- waitForAsyncOperation: Menunggu operasi asinkron selesai

#### Konfigurasi Timeout:

- Timeout default: 2000ms
- Timeout extended: 5000ms untuk operasi yang lebih lambat
- Opsi retry: Mengulangi pengecekan dengan interval tertentu

## 7. Skenario Test

### 7.1 CRUD Halaman

#### 7.1.1 Membuat Halaman Baru

- Klik tombol "Tambah Halaman"
- Verifikasi halaman baru muncul di sidebar
- Verifikasi navigasi otomatis ke halaman baru
- Verifikasi API call untuk createPage dipanggil dengan parameter yang benar

#### 7.1.2 Memperbarui Halaman

- Edit judul halaman
- Verifikasi judul berubah setelah blur atau enter
- Verifikasi API call untuk updatePage dipanggil dengan parameter yang benar

#### 7.1.3 Menghapus Halaman

- Klik tombol hapus halaman
- Verifikasi dialog konfirmasi muncul
- Konfirmasi penghapusan
- Verifikasi halaman dihapus dari sidebar
- Verifikasi navigasi ke halaman lain
- Verifikasi API call untuk deletePage dipanggil dengan parameter yang benar

### 7.2 Operasi Draft

#### 7.2.1 Auto-save Draft

- Edit konten editor
- Verifikasi status berubah menjadi "Menyimpan..."
- Verifikasi status berubah menjadi "Tersimpan" setelah debounce
- Verifikasi API call untuk saveDraft dipanggil dengan parameter yang benar

#### 7.2.2 Pemulihan Draft

- Muat halaman dengan draft yang tersedia
- Verifikasi dialog pemulihan muncul
- Pilih opsi pemulihan
- Verifikasi konten editor berubah menjadi konten draft
- Verifikasi API call untuk getDraft dipanggil dengan parameter yang benar

#### 7.2.3 Publikasi Draft

- Dengan draft yang tersedia, klik tombol "Publikasikan"
- Verifikasi dialog konfirmasi muncul
- Konfirmasi publikasi
- Verifikasi status publikasi
- Verifikasi API call untuk publishDraft dipanggil dengan parameter yang benar

#### 7.2.4 Pembuangan Draft

- Dengan draft yang tersedia, klik tombol "Buang Draft"
- Verifikasi dialog konfirmasi muncul
- Konfirmasi pembuangan
- Verifikasi konten kembali ke versi published
- Verifikasi API call untuk discardDraft dipanggil dengan parameter yang benar

### 7.3 Toggle Mode View/Edit

#### 7.3.1 Perubahan Mode

- Klik tombol "Edit" di mode view
- Verifikasi mode berubah ke edit
- Verifikasi toolbar editor muncul
- Klik tombol "Selesai" di mode edit
- Verifikasi mode berubah ke view
- Verifikasi toolbar editor hilang

#### 7.3.2 Konten Sesuai Mode

- Dalam mode view, verifikasi konten published ditampilkan
- Ubah ke mode edit
- Verifikasi konten draft ditampilkan jika tersedia
- Verifikasi konten published ditampilkan jika tidak ada draft

#### 7.3.3 Konfirmasi Perubahan Belum Tersimpan

- Dalam mode edit dengan perubahan belum tersimpan
- Coba ubah ke mode view
- Verifikasi dialog konfirmasi muncul
- Konfirmasi perubahan mode
- Verifikasi mode berubah dan perubahan disimpan sebagai draft

### 7.4 Concurrent Editing

#### 7.4.1 Deteksi Editor Aktif

- Simulasikan editor lain aktif dengan mock ConcurrentEditingService
- Muat halaman
- Verifikasi indikator editor aktif muncul dengan nama dan avatar yang benar

#### 7.4.2 Konflik Edit

- Simulasikan konflik edit dengan timestamp draft yang lebih baru dari editor lain
- Muat halaman
- Verifikasi dialog konflik muncul
- Pilih opsi menggunakan versi lokal
- Verifikasi konten lokal dipertahankan dan disimpan

### 7.5 Pengujian Khusus handleToggleMode

#### 7.5.1 Unit Test untuk handleToggleMode

- Menguji fungsi handleToggleMode secara terisolasi
- Memverifikasi urutan panggilan fungsi (toggleEditorMode → refetch → refreshActivePage)
- Menguji penanganan error pada setiap tahap
- Memverifikasi state loading dan flag sessionStorage

#### 7.5.2 Integration Test untuk Toggle Mode

- Menguji interaksi antara handleToggleMode dan komponen lain
- Memverifikasi perubahan UI setelah toggle mode
- Menguji skenario dengan network delay
- Menguji skenario dengan error pada salah satu tahap

#### 7.5.3 Performance Test untuk Toggle Mode

- Mengukur waktu eksekusi handleToggleMode
- Menguji dengan kondisi jaringan yang berbeda
- Mendeteksi potensial race condition
- Mengidentifikasi bottleneck dalam proses toggle mode

## 8. Struktur File Test

```
features/manage-module/__tests__/
├── __mocks__/
│   ├── mockModules.ts
│   ├── mockPages.ts
│   ├── mockDrafts.ts
│   ├── mockUsers.ts
│   └── mockHandlers.ts
├── unit/
│   ├── hooks/
│   │   ├── useRichTextAutosave.test.ts
│   │   └── useDraftRecovery.test.ts
│   ├── context/
│   │   ├── ModulePageCRUDContext.test.tsx
│   │   └── ModuleDraftPageContext.test.tsx
│   └── components/
│       ├── DocumentHeader.test.tsx
│       └── RichTextEditor.test.tsx
├── integration/
│   ├── module-page/
│   │   ├── page-crud.integration.test.tsx
│   │   ├── draft-operations.integration.test.tsx
│   │   ├── editor-mode-toggle.integration.test.tsx
│   │   └── concurrent-editing.integration.test.tsx
│   └── utils/
│       ├── test-renderer.tsx
│       └── wait-helpers.ts
├── performance/
│   └── toggle-mode.perf.test.ts
└── setup-tests.ts
```

## 9. Implementasi Test

### 9.1 Setup Test Environment

#### Konfigurasi Jest:

- Setup DOM environment dengan jest-dom
- Konfigurasi MSW server
- Mock untuk dependencies eksternal (Next.js router, Clerk, dll)
- Setup dan teardown untuk setiap test

#### Mock Dependencies:

- Next.js router dan navigation
- Clerk authentication
- Browser APIs (localStorage, sessionStorage)
- External libraries (TipTap, dll)

#### Konfigurasi React Testing Library:

- Custom queries jika diperlukan
- Timeout settings untuk operasi asinkron
- Error handling untuk debugging

### 9.2 Pendekatan Testing

#### Unit Testing:

- Fokus pada fungsi dan komponen individual
- Isolasi dari dependencies dengan mocking
- Pengujian berbagai kondisi input dan output
- Verifikasi state internal dan side effects

#### Integration Testing:

- Pengujian interaksi antar komponen
- Simulasi alur pengguna end-to-end
- Verifikasi state aplikasi setelah serangkaian aksi
- Pengujian dengan mock API responses

#### Performance Testing:

- Pengukuran waktu eksekusi fungsi kritis
- Simulasi kondisi jaringan yang berbeda
- Deteksi memory leaks dan bottlenecks
- Pengujian dengan berbagai ukuran data

## 10. Integrasi dengan CI/CD

### 10.1 GitHub Actions Workflow

#### Konfigurasi Workflow:

- Trigger pada push ke branch utama dan pull requests
- Setup Node.js environment
- Instalasi dependencies
- Eksekusi test dengan coverage
- Upload hasil test sebagai artifacts

#### Optimasi CI/CD:

- Caching node_modules untuk mempercepat build
- Paralelisasi test untuk mengurangi waktu eksekusi
- Konfigurasi timeouts yang sesuai untuk test asinkron
- Reporting hasil test dalam format yang mudah dibaca

## 11. Debugging dan Troubleshooting

### 11.1 Teknik Debugging

#### Tools dan Approaches:

- Menggunakan screen.debug() untuk inspeksi DOM
- Logging strategis dengan prefix yang jelas
- Menggunakan breakpoints dalam test
- Visualisasi state dengan React DevTools

#### Debugging Asynchronous Tests:

- Menggunakan waitFor dengan timeout yang sesuai
- Menambahkan debug logs untuk operasi asinkron
- Menggunakan fake timers untuk kontrol waktu
- Memahami event loop dan timing dalam Jest

### 11.2 Penanganan Kasus Sulit

#### Strategies:

- Menggunakan act() untuk membungkus operasi React
- Menangani warning dengan waitFor yang tepat
- Menggunakan mock timers untuk komponen dengan timing kompleks
- Implementasi retry logic untuk test yang flaky

#### Debugging Race Conditions:

- Menambahkan delays yang konsisten
- Memastikan urutan operasi yang benar
- Menggunakan semaphores atau locks jika perlu
- Memahami bagaimana React dan Jest menangani operasi asinkron

## 12. Timeline Implementasi

1. **Minggu 1**: Setup test environment dan mock data

   - Setup Jest, React Testing Library, dan MSW
   - Implementasi mock data dan handlers
   - Persiapan test utilities dan helpers

2. **Minggu 2**: Unit testing untuk komponen kritis

   - Test untuk hooks (useRichTextAutosave, useDraftRecovery)
   - Test untuk context providers
   - Test untuk komponen UI utama (DocumentHeader, RichTextEditor)

3. **Minggu 3**: Integration testing untuk fitur utama

   - Test CRUD halaman dan operasi draft
   - Test toggle mode view/edit
   - Test concurrent editing dan resolusi konflik

4. **Minggu 4**: Performance testing dan debugging
   - Performance test untuk handleToggleMode
   - Debugging masalah yang ditemukan
   - Optimasi test suite
   - Integrasi dengan CI/CD

## 13. Evaluasi dan Perbaikan Test Plan

### 13.1 Kekuatan Plan Saat Ini:

- Coverage komprehensif untuk semua layer aplikasi
- Fokus pada pengujian interaksi antar komponen
- Strategi mocking yang terstruktur untuk setiap layer
- Pendekatan multi-level (unit, integration, performance)

### 13.2 Area yang Perlu Ditingkatkan:

- Menambahkan lebih banyak detail tentang implementasi mock untuk browser APIs
- Memperjelas strategi untuk menangani race conditions
- Menambahkan metrik untuk mengukur coverage test
- Menambahkan strategi untuk menguji edge cases

### 13.3 Rekomendasi Tambahan:

- Implementasikan snapshot testing untuk UI components
- Tambahkan visual regression testing untuk UI
- Pertimbangkan penggunaan test doubles yang lebih spesifik (spy, stub, fake)
- Implementasikan contract testing antara frontend dan backend

## 14. Kesimpulan

Rencana testing ini memberikan pendekatan komprehensif untuk menguji sistem page di modul manage-module, dengan fokus khusus pada identifikasi dan penyelesaian masalah pada fitur handleToggleMode. Dengan mengimplementasikan strategi mocking yang terstruktur dan pendekatan testing multi-level, kita dapat memastikan bahwa semua komponen berinteraksi dengan benar dan fitur-fitur utama berfungsi sesuai spesifikasi. Pendekatan ini juga akan membantu mengidentifikasi masalah timing dan race conditions yang mungkin menjadi penyebab bug pada fitur toggle mode.
