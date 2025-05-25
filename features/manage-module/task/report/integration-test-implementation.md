# Laporan Implementasi Integration Testing Modul Pembelajaran

## Ringkasan

Dokumen ini melaporkan progress implementasi integration testing untuk fitur modul pembelajaran di aplikasi Maguru. Implementasi mengikuti rencana yang telah dibuat di `plan-task.md` dan fokus pada fase 1 (setup dan mock) dan fase 2 (navigation dan content test).

## Detail Implementasi

### 1. Setup dan Mock Data

#### 1.1 Mock Data dan API Handlers

Telah dibuat file-file berikut:

- `features/manage-module/__tests__/__mocks__/mockPages.ts`: Data halaman modul untuk testing
- `features/manage-module/__tests__/__mocks__/mockHandlers.ts`: Mock API handlers untuk MSW

Dalam implementasi ini, kami menggunakan Mock Service Worker (MSW) untuk mocking API. Kami juga menyediakan alternatif mocking yang dapat digunakan jika terjadi masalah dengan MSW:

1. Manual mock dengan `jest.mock` untuk axios atau fetch
2. `nock` untuk mocking HTTP request di Node.js
3. `axios-mock-adapter` untuk mocking axios requests

#### 1.2 Testing Utilities

Dibuat utility functions di `features/manage-module/__tests__/utils/testUtils.tsx` untuk:

- Setup mock server dengan MSW
- Mocking Next.js router
- Utility untuk testing timer dan debounce (`advanceTimersByTime`, `advanceTimersAndFlushPromises`)
- Custom render function yang menyediakan semua providers yang diperlukan (ModulePageCRUDProvider, ModulePagesProvider, QueryClientProvider)

### 2. Integration Tests

#### 2.1 Navigation Tests

File: `features/manage-module/__tests__/integration/navigation.integration.test.tsx`

**Deskripsi**: Test ini memastikan fungsionalitas navigasi antar halaman modul berjalan dengan benar, baik melalui sidebar maupun tombol navigasi footer.

**Flow Test**:

1. Render komponen dengan mock data halaman
2. Trigger klik pada sidebar item
3. Verifikasi bahwa router dipanggil dengan parameter yang benar
4. Verifikasi state aktif pada sidebar item
5. Trigger klik pada tombol navigasi footer
6. Verifikasi bahwa handleNavigate dipanggil dengan parameter yang benar

**File Referensi Spesifik**:

- `features/manage-module/components/ModulePageSidebar.tsx` - Komponen sidebar
- `features/manage-module/components/ModulePageEditor/sidebar/SidebarContent.tsx` - Tampilan list halaman
- `features/manage-module/components/ModulePageFooterNav.tsx` - Navigasi footer
- `features/manage-module/context/ModulePageCRUDContext.tsx` - Context untuk navigasi
- `features/manage-module/hooks/useModulePageCRUD.ts` - Hook untuk operasi halaman

**Potensi Masalah & Tips Debugging**:

- Sidebar mungkin tidak terbuka secara default dalam test, gunakan `forceExpandSidebar()`
- Test mungkin gagal jika simulasi klik tidak trigger event dengan benar
- Tombol navigasi disabled jika tidak ada halaman, pastikan ada mock pages
- Jika router tidak terintegrasi dengan benar, gunakan `jest.mock('next/navigation')` secara manual

**Test Cases**:

- **ModulePageSidebar**:

  - Menampilkan daftar halaman modul dengan benar
  - Navigasi ke halaman yang dipilih saat diklik
  - Menampilkan halaman aktif dengan highlight yang berbeda

- **ModulePageFooterNav**:
  - Menampilkan tombol navigasi halaman sebelumnya dan berikutnya
  - Menavigasi ke halaman sebelumnya saat tombol diklik
  - Menavigasi ke halaman berikutnya saat tombol diklik
  - Menampilkan loading indicator saat navigasi berlangsung

#### 2.2 Content Editing Tests

File: `features/manage-module/__tests__/integration/contentEditing.integration.test.tsx`

**Deskripsi**: Test ini memastikan fungsionalitas pengeditan konten dan judul halaman berjalan dengan benar, termasuk autosave.

**Flow Test**:

1. Render RichTextEditor/DocumentHeader dengan mock data
2. Simulasikan input perubahan pada editor atau judul
3. Maju-mundurkan timer untuk memicu debounce
4. Verifikasi bahwa API save dipanggil dengan data yang benar
5. Verifikasi state UI selama proses penyimpanan (loading indicator, success/error notification)

**File Referensi Spesifik**:

- `features/manage-module/components/RichTextEditor.tsx` - Editor utama
- `features/manage-module/components/RichTextEditorWithAutosave.tsx` - Wrapper editor dengan autosave
- `features/manage-module/components/ModulePageEditor/document/DocumentHeader.tsx` - Header dengan judul
- `features/manage-module/hooks/useRichTextAutosave.ts` - Hook untuk autosave
- `features/manage-module/hooks/useModulePageEditor.ts` - Hook untuk editing state
- `features/manage-module/services/modulePageService.ts` - Service untuk menyimpan perubahan

**Potensi Masalah & Tips Debugging**:

- TipTap editor sulit di-mock, gunakan teknik shallow mounting
- Debounce memerlukan timer mocking yang tepat (`jest.useFakeTimers()`)
- Autosave memerlukan mock `useState` dan `useEffect` yang tepat
- Toast notification mungkin perlu di-mock

**Test Cases**:

- Memperbarui judul halaman dengan DocumentHeader
- Menampilkan loading state saat menyimpan perubahan
- Auto-save konten editor setelah perubahan
- Menampilkan pesan error jika update gagal
- Integrasi autosave dengan editor teks

#### 2.3 CRUD Operations Tests

File: `features/manage-module/__tests__/integration/crudOperations.integration.test.tsx`

**Deskripsi**: Test ini memastikan operasi CRUD (Create, Read, Update, Delete) pada halaman modul berjalan dengan benar.

**Flow Test**:

1. Setup MSW handlers untuk mock API responses
2. Render komponen dengan context providers
3. Trigger aksi CRUD melalui UI (tombol tambah, hapus, update)
4. Verifikasi API dipanggil dengan parameter yang benar
5. Verifikasi UI diupdate sesuai response API
6. Simulasikan error case dan periksa error handling

**File Referensi Spesifik**:

- `features/manage-module/components/ModulePageEditor/sidebar/SidebarContent.tsx` - UI untuk CRUD
- `features/manage-module/hooks/useModulePageCRUD.ts` - Hook utama untuk CRUD
- `features/manage-module/context/ModulePageCRUDContext.tsx` - Context provider untuk CRUD
- `features/manage-module/services/modulePageService.ts` - Service layer
- `app/api/module/[id]/pages/route.ts` - API endpoint untuk pages
- `app/api/module/[id]/pages/[pageid]/route.ts` - API endpoint untuk page spesifik

**Potensi Masalah & Tips Debugging**:

- Konfirmasi dialog sering menyebabkan masalah dalam test, mock dengan `jest.spyOn(window, 'confirm')`
- Optimistic update mungkin menyebabkan race condition dalam test
- Cache invalidation perlu diverifikasi setelah mutasi
- MSW harus dikonfigurasi untuk respons yang sesuai dengan state testing

**Test Cases**:

- **Create Page**:

  - Membuat halaman baru ketika tombol tambah diklik
  - Menampilkan loading state saat membuat halaman

- **Delete Page**:

  - Menghapus halaman saat tombol hapus diklik dan konfirmasi
  - Menampilkan konfirmasi sebelum menghapus halaman

- **Read & Update Operations**:
  - Memuat daftar halaman dari API dengan benar
  - Memuat detail halaman saat halaman dipilih
  - Menangani error saat gagal memuat halaman

#### 2.4 API Optimization Tests

File: `features/manage-module/__tests__/integration/apiOptimization.integration.test.tsx`

**Deskripsi**: Test ini memastikan optimasi API seperti debounce, caching, dan pencegahan request berlebihan berfungsi dengan baik.

**Flow Test**:

1. Setup timer dan API mock dengan tracking jumlah panggilan
2. Render komponen test sederhana yang menggunakan context
3. Trigger perubahan konten berulang kali dalam waktu singkat
4. Maju-mundurkan timer untuk simulasi debounce
5. Verifikasi bahwa API hanya dipanggil sesuai dengan debounce setting
6. Test cache dengan unmount dan mount ulang komponen

**File Referensi Spesifik**:

- `features/manage-module/hooks/useModulePageCRUD.ts` - Implementasi debounce
- `features/manage-module/hooks/useRichTextAutosave.ts` - Implementasi autosave
- `features/manage-module/context/ModulePageCRUDContext.tsx` - Context dengan handleEditorChange
- `features/manage-module/__tests__/utils/testUtils.tsx` - Utility untuk timer mocking
- `features/manage-module/services/modulePageClientService.ts` - Service dengan optimasi

**Potensi Masalah & Tips Debugging**:

- Timer mocking memerlukan perhatian khusus, gunakan `advanceTimersAndFlushPromises`
- React Query perlu dikonfigurasi khusus untuk test (staleTime, gcTime)
- MSW request counting perlu setup yang tepat
- Flush promises mungkin perlu diimplementasikan manual

**Test Cases**:

- **Debounce Editor Updates**:

  - Menerapkan debounce untuk perubahan editor, hanya mengirim request setelah jeda tertentu
  - Tidak mengirim request berulang jika konten tidak berubah

- **Navigation State Management**:

  - Tidak mengirim permintaan save saat navigasi antar halaman

- **Query Cache Management**:
  - Menggunakan cache untuk mengurangi request GET berulang

#### 2.5 Error Handling Tests

File: `features/manage-module/__tests__/integration/module-page/errorHandling.integration.test.tsx`

**Deskripsi**: Test ini memastikan bahwa aplikasi menangani error dengan benar, termasuk error dari API, timeout, dan kondisi error lainnya.

**Flow Test**:

1. Setup MSW handlers untuk mengembalikan error (500, 404, timeout)
2. Render komponen test dengan provider
3. Trigger aksi yang akan menyebabkan error
4. Verifikasi UI menampilkan error state dengan benar
5. Verifikasi notifikasi error ditampilkan
6. Test recovery dari error dengan retry

**File Referensi Spesifik**:

- `features/manage-module/components/ErrorBoundary.tsx` - Komponen untuk menangkap error React
- `features/manage-module/components/ErrorNotifier.ts` - Utility untuk notifikasi error
- `features/manage-module/hooks/useModulePageCRUD.ts` - Error handling dalam hooks
- `features/manage-module/context/ModulePageCRUDContext.tsx` - Error handling dalam context
- `app/api/module/[id]/pages/[pageid]/route.ts` - Error handling di API endpoint

**Potensi Masalah & Tips Debugging**:

- Error boundary React sulit diuji, gunakan pendekatan simulasi error
- Toast notification perlu di-mock untuk verifikasi
- Timeout testing memerlukan perhatian khusus dengan timer mocking
- Recovery dari error memerlukan state reset yang tepat

**Test Cases**:

- **API Error Handling**:

  - Menampilkan notifikasi error saat API gagal (500 error)
  - Menangani error 404 dengan benar (halaman tidak ditemukan)

- **Recovery dari Error**:

  - Pulih dari error setelah retry
  - Menangani timeout dan retry dengan benar

#### 2.6 Refinement & Edge Cases Tests

File: `features/manage-module/__tests__/integration/module-page/refinement.integration.test.tsx`

**Deskripsi**: Test ini fokus pada optimasi dan edge cases yang mungkin terjadi dalam penggunaan aplikasi, seperti kondisi jaringan lambat dan interaksi pengguna yang kompleks.

**Flow Test**:

1. Setup test environment dengan simulasi kondisi khusus (network delay, concurrent requests)
2. Render komponen test dengan provider
3. Simulasikan interaksi pengguna yang kompleks atau edge cases
4. Verifikasi aplikasi menangani kasus tersebut dengan benar
5. Verifikasi optimasi berfungsi dalam berbagai kondisi

**File Referensi Spesifik**:

- `features/manage-module/hooks/useDebounce.ts` - Implementasi debounce
- `features/manage-module/hooks/useRichTextAutosave.ts` - Optimasi autosave
- `features/manage-module/services/modulePageClientService.ts` - Optimasi API calls
- `features/manage-module/context/ModulePageCRUDContext.tsx` - State management

**Potensi Masalah & Tips Debugging**:

- Simulasi kondisi jaringan memerlukan mock timing yang tepat
- Concurrent requests perlu penanganan Promise yang hati-hati
- Edge cases sering memerlukan setup yang kompleks
- Verifikasi state mungkin perlu dilakukan di beberapa titik waktu

**Test Cases**:

- **Content Optimization**:

  - Tidak mengirim permintaan jika konten tidak berubah
  - Menggabungkan perubahan cepat ke dalam satu permintaan (debounce)

- **Edge Cases**:

  - Menangani kondisi jaringan lambat
  - Menangani perubahan halaman saat sedang menyimpan

## Daftar File Referensi Umum

### Files Utama yang Diuji

1. `app/(admin)/manage-module/pages/[moduleId]/page.tsx`
2. `app/(admin)/manage-module/pages/[moduleId]/layout.tsx`
3. `features/manage-module/components/ModulePageSidebar.tsx`
4. `features/manage-module/components/ModulePageEditor.tsx`
5. `features/manage-module/components/ModulePageFooterNav.tsx`
6. `features/manage-module/components/RichTextEditor.tsx`
7. `features/manage-module/components/RichTextEditorWithAutosave.tsx`
8. `features/manage-module/components/ModulePageEditor/document/DocumentHeader.tsx`
9. `features/manage-module/components/ModulePageEditor/sidebar/SidebarContent.tsx`

### Context dan Hooks

10. `features/manage-module/context/ModulePageCRUDContext.tsx`
11. `features/manage-module/context/ModulePagesContext.tsx`
12. `features/manage-module/hooks/useModulePageCRUD.ts`
13. `features/manage-module/hooks/useModulePageQuery.ts`
14. `features/manage-module/hooks/useRichTextAutosave.ts`
15. `features/manage-module/hooks/useModulePageEditor.ts`

### Services dan API

16. `features/manage-module/services/modulePageClientService.ts`
17. `features/manage-module/services/modulePageService.ts`
18. `app/api/module/[id]/pages/route.ts`
19. `app/api/module/[id]/pages/reorder/route.ts`
20. `app/api/module/[id]/pages/[pageid]/route.ts`

## Diagram Alur Test

### Navigation Tests

```
[ModulePageSidebar Test] --> (Render) --> [Mock Pages] --> (Verify List) --> [Click Item] --> (Verify Navigation)
                                                                                        |
[ModulePageFooterNav Test] --> (Render) --> [Mock ActivePage] --> [Click Nav Button] ---|
```

### Content Editing Tests

```
[DocumentHeader Test] --> (Render) --> [Change Title] --> (Trigger Save) --> [Verify API Call]
                                                                        |
[RichTextEditor Test] --> (Render) --> [Edit Content] --> (Wait Timer) --|
```

### CRUD Operations Tests

```
[Create Page Test] --> (Render) --> [Click Add] --> (Verify API Call) --> [Verify UI Update]
                                                 |
[Delete Page Test] --> (Render) --> [Click Delete] --> (Confirm Dialog) --|
                                                                        |
[Read/Update Test] --> (Render) --> [Select Page] --> [Edit Content] -----|
```

### API Optimization Tests

```
[Debounce Test] --> (Render) --> [Multiple Changes] --> (Wait Timer) --> [Count API Calls]
                                                    |
[Cache Test] --> (Render) --> [Load Data] --> (Unmount/Remount) --> [Verify No Extra Calls]
```

### Error Handling Tests

```
[API Error Test] --> (Render) --> [Mock API Error] --> (Trigger Action) --> [Verify Error UI]
                                                                        |
[Recovery Test] --> (Render) --> [Simulate Error] --> (Trigger Retry) --|
```

### Refinement & Edge Cases Tests

```
[Optimization Test] --> (Render) --> [Same Content Update] --> (Verify No API Call)
                                  |
[Network Test] --> (Render) --> [Simulate Slow Network] --> [Verify Concurrent Handling]
```

## Tips Debugging Umum

1. **Masalah Timer dan Asynchronous**

   - Gunakan `jest.useFakeTimers()` untuk kontrol timer
   - Gunakan `advanceTimersAndFlushPromises` untuk sinkronisasi
   - Perhatikan Promise chain, gunakan `await act(async () => {...})`

2. **Masalah MSW dan API Mocking**

   - Pastikan handler MSW terdaftar dengan benar
   - Verifikasi path URL dan metode HTTP cocok persis
   - Gunakan `console.log` di handler untuk melihat jumlah pemanggilan
   - Atur `{ onUnhandledRequest: 'error' }` untuk melihat request yang tidak ter-mock

3. **Masalah Provider dan Context**

   - Periksa apakah semua provider required terbungkus di testing
   - Pastikan urutan provider benar (misal: QueryClient harus lebih luar dari context lain)
   - Gunakan `renderWithProviders` dari testUtils

4. **Masalah UI dan Event**
   - Gunakan `screen.debug()` untuk melihat DOM saat ini
   - Cek CSS selector apakah element benar-benar visible/enabled
   - Gunakan `fireEvent` atau `userEvent` dengan benar (userEvent lebih realistis)

## Kesimpulan dan Langkah Selanjutnya

### Pencapaian

- Berhasil menyelesaikan fase 1 (setup dan mock), fase 2 (navigation dan content test), fase 3 (CRUD dan API optimization), dan fase 4 (error handling dan refinement)
- Memvalidasi fungsionalitas navigasi dan operasi CRUD halaman modul
- Memverifikasi optimasi API seperti debounce, throttling, dan caching
- Menguji penanganan error dan edge cases seperti kondisi jaringan lambat dan concurrent requests
- Memastikan aplikasi memiliki recovery mechanism yang baik dari berbagai jenis error

### Tantangan yang Dihadapi

- Mocking Tiptap editor untuk content editing tests
- Pengujian dialog dan interaksi popup yang memerlukan manipulasi DOM lebih kompleks
- Mensimulasikan interaksi navigasi yang melibatkan beberapa context bersamaan
- Debugging optimasi performa seperti debounce dan caching yang memerlukan timing yang tepat
- Mensimulasikan kondisi jaringan yang berbeda untuk pengujian edge cases
- Membuat test yang konsisten untuk penanganan error dan recovery
- Mengatasi masalah "Reflect.has called on non-object" pada error handling tests yang disebabkan oleh incompatibilitas MSW dengan setup testing

### Perbaikan Error Handling Tests

Dalam implementasi awal, kami mengalami masalah dengan test error handling yang menampilkan error "Reflect.has called on non-object". Setelah investigasi, kami menemukan bahwa masalah ini terkait dengan cara MSW berinteraksi dengan fetch API dalam konteks testing.

**Masalah:**

- Test errorHandling.integration.test.tsx gagal dengan error "Reflect.has called on non-object"
- Error ini muncul ketika mencoba mengakses property dari response yang tidak valid
- MSW tidak mengembalikan response dalam format yang diharapkan oleh kode

**Solusi:**

- Beralih dari MSW ke pendekatan mock langsung menggunakan `jest.mock` untuk global fetch API
- Implementasi mock fetch yang lebih sederhana dan terkontrol
- Memisahkan test menjadi komponen yang lebih sederhana untuk isolasi masalah
- Menggunakan Promise.resolve untuk mengembalikan response yang valid dan konsisten

**Hasil:**

- Test error handling berhasil dijalankan tanpa error
- Validasi notifikasi error dan recovery dari error berfungsi dengan baik
- Pendekatan ini lebih sederhana dan lebih stabil untuk pengujian error handling

**Pelajaran:**

- Untuk kasus pengujian error handling yang sederhana, pendekatan mock langsung lebih efektif daripada MSW
- MSW lebih cocok untuk pengujian integrasi yang kompleks dengan banyak endpoint
- Penting untuk memisahkan komponen test menjadi lebih sederhana untuk debugging yang lebih mudah

### Langkah Selanjutnya

Dengan selesainya semua fase testing sesuai rencana di `plan-task.md`, langkah selanjutnya adalah:

1. Menambahkan end-to-end tests untuk flow lengkap dari pembuatan modul hingga publishing
2. Mengintegrasikan test suite ke dalam CI/CD pipeline
3. Membuat dokumentasi lebih detail tentang cara menjalankan dan memelihara test
4. Mengembangkan test coverage monitoring untuk memastikan kualitas kode tetap terjaga
5. Melakukan refactoring test untuk meningkatkan reusability dan maintainability

## Contoh Penggunaan

Untuk menjalankan semua integration test:

```bash
yarn test:integration
```

Untuk menjalankan test tertentu:

```bash
# Jalankan test navigation saja
yarn test:integration -- -t "navigation"

# Jalankan test dengan pattern tertentu (regex)
yarn test:integration -- -t "menampilkan daftar"

# Jalankan test dengan file tertentu
yarn test features/manage-module/__tests__/integration/apiOptimization.integration.test.tsx

# Jalankan test dengan verbose output
yarn test:integration -- --verbose
```

## Referensi Tambahan

- [Jest Timer Mocks](https://jestjs.io/docs/timer-mocks)
- [Testing Library Act](https://testing-library.com/docs/react-testing-library/api/#act)
- [MSW Documentation](https://mswjs.io/docs/)
- [React Query Testing](https://tanstack.com/query/latest/docs/react/guides/testing)
