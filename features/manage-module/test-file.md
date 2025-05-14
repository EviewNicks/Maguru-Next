# Daftar Test Cases untuk Unit Testing Komponen Utama

## 1. ErrorNotifier.tsx

1. **Rendering dan Fungsionalitas Dasar**

   - Test apakah fungsi handleError() mengubah berbagai jenis error menjadi format error yang konsisten
   - Test apakah showErrorNotification() memanggil toast.error dengan parameter yang benar

2. **Penanganan Jenis Error yang Berbeda**

   - Test penanganan error JavaScript standar (instance of Error)
   - Test penanganan HTTP errors dengan response object
   - Test penanganan error string
   - Test penanganan error dalam format object

3. **Helpers**
   - Test fungsi getHttpErrorMessage() untuk berbagai kode HTTP

## 2. ModuleLayout.tsx

1. **Rendering Dasar**
   - Test apakah komponen merender AdminSidebar
   - Test apakah komponen merender children dengan benar
   - Test struktur layout (flex, colors, spacing)

## 3. ModuleOverview.tsx

1. **Rendering Dasar**

   - Test apakah komponen merender semua Card dan MetricCard
   - Test apakah MetricCards menampilkan nilai yang benar
   - Test jika badges dan status indicator dirender dengan benar

2. **Interaksi Pengguna**
   - Test apakah tombol refresh berfungsi (jika memiliki handler)

## 4. ModulePageEditor.tsx

1. **Rendering Dasar**

   - Test apakah komponen merender dengan props minimal yang diperlukan
   - Test apakah semua subkomponen (DocumentHeader, RichTextEditor, dll) dirender

2. **Pengambilan Data**

   - Mock useQuery dan useModulePageQuery
   - Test apakah komponen menangani loading state dengan benar
   - Test apakah komponen menampilkan data halaman yang diterima dengan benar

3. **Status dan Interaksi Editor**

   - Test apakah handleContentChange memperbarui state dengan benar
   - Test apakah handleTitleChange memperbarui state dengan benar

4. **Navigasi Halaman**

   - Test apakah handleNavigation('prev') dan handleNavigation('next') bekerja dengan benar
   - Test apakah ModulePageFooterNav menerima props yang benar

5. **Integrasi Context**
   - Test apakah komponen mengupdate context (setPages, setActivePage) ketika data berubah

## 5. ModulePageFooterNav.tsx

1. **Rendering Dasar**

   - Test apakah komponen merender dengan props yang diperlukan
   - Test apakah tampilan halaman saat ini dan total halaman benar

2. **Interaksi Tombol**
   - Test apakah tombol Previous memanggil onPrevious
   - Test apakah tombol Next memanggil onNext
   - Test apakah tombol Previous dinonaktifkan ketika currentPage <= 1
   - Test apakah tombol Next dinonaktifkan ketika currentPage >= totalPages

## 6. ModulePageSidebar.tsx

1. **Rendering Dasar**

   - Test apakah komponen merender dengan props minimal
   - Test apakah tombol toggle sidebar dirender

2. **Toggling Sidebar**

   - Test apakah klik pada tombol toggle mengubah state isOpen
   - Test apakah sidebar menampilkan/menyembunyikan konten berdasarkan state isOpen

3. **LocalStorage**

   - Test apakah preferensi sidebar disimpan ke localStorage
   - Test apakah komponen membaca preferensi dari localStorage saat mount

4. **Rendering Sub-komponen**
   - Test apakah SidebarHeader, SidebarContent, dll dirender dengan props yang benar
   - Test apakah onSelectPage dipanggil ketika halaman dipilih

## 7. RichTextEditor.tsx

1. **Rendering Dasar**

   - Test apakah komponen merender dengan props minimal
   - Test apakah EditorContent dan EditorToolbar dirender

2. **Inisialisasi Editor**

   - Test apakah editor diinisialisasi dengan konten awal yang benar
   - Test apakah extensions yang diperlukan dikonfigurasi dengan benar

3. **Callback pada Perubahan**

   - Test apakah onChange dipanggil ketika konten editor berubah
   - Test apakah konten yang dikirim ke onChange sesuai format yang diharapkan

4. **Styling**
   - Test apakah className dari props diterapkan dengan benar
   - Test apakah editor memiliki class responsive dan overflow yang benar

## 8. Page.tsx (ModuleManagementPage)

1. **Rendering Dasar**
   - Test apakah komponen merender ModuleLayout
   - Test apakah komponen merender ModuleOverview
   - Test apakah komponen merender ModuleTable

## 9. Index.ts (exports)

1. **Export Fungsi**
   - Validasi bahwa semua exports yang diharapkan tersedia
   - Pastikan tidak ada ekspor yang rusak atau tidak digunakan

## Strategi Testing

1. **Mocking**

   - Mock untuk React Query (useQuery, useMutation)
   - Mock untuk Context API (useModulePagesContext)
   - Mock untuk service API (modulePageService)
   - Mock untuk third-party libraries (sonner toast, editor tiptap)

2. **Test Utilities**

   - Setup untuk render components dengan providers yang diperlukan
   - Helper untuk menghasilkan mock data (halaman, modul)
   - Helper untuk simulasi interaksi pengguna

3. **Prioritisasi**
   - Prioritaskan komponen dengan logika kompleks (ModulePageEditor, RichTextEditor)
   - Prioritaskan fungsi yang menangani data (ErrorNotifier, pengambilan data)
   - Buat test yang fokus pada edge cases dan penanganan error
