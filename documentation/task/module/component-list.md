# Daftar Komponen Manajemen Modul

## Struktur Hierarki Komponen dari Unit Terkecil hingga Terbesar

Dokumen ini menjelaskan hierarki komponen dalam fitur manajemen modul, diurutkan dari unit terkecil (paling independen) hingga unit terbesar (paling dependen). Pendekatan ini membantu dalam proses perbaikan test dengan prinsip "Perbaikan Test Dimulai dari Unit Terkecil".

### Level 1: Komponen Dasar (Paling Independen)

Komponen-komponen ini memiliki sedikit atau tidak ada ketergantungan pada komponen lain dalam fitur manajemen modul:

1. **ModuleTable/columns.tsx**

   - Deskripsi: Definisi kolom untuk tabel modul
   - Dependensi: Tidak bergantung pada komponen lain dalam fitur
   - Test: `columns.test.tsx`

2. **ModuleTable/ModuleActionCell.tsx**

   - Deskripsi: Sel aksi untuk setiap baris modul
   - Dependensi: Tidak bergantung pada komponen lain dalam fitur
   - Test: `ModuleActionCell.test.tsx`

3. **editors/CodeEditor.tsx**

   - Deskripsi: Editor untuk konten kode
   - Dependensi: Tidak bergantung pada komponen lain dalam fitur
   - Test: `CodeEditor.test.tsx`

4. **editors/TheoryEditor.tsx**

   - Deskripsi: Editor untuk konten teori
   - Dependensi: Tidak bergantung pada komponen lain dalam fitur
   - Test: `TheoryEditor.test.tsx`

5. **ModuleFilter.tsx**
   - Deskripsi: Filter untuk modul
   - Dependensi: Tidak bergantung pada komponen lain dalam fitur
   - Test: `ModuleFilter.test.tsx`

### Level 2: Komponen Tingkat Menengah

Komponen-komponen ini bergantung pada komponen Level 1:

1. **ModuleTable/DataTable.tsx**

   - Deskripsi: Tabel data untuk menampilkan modul
   - Dependensi: `columns.tsx`, `ModuleActionCell.tsx`
   - Test: `DataTable.test.tsx`

2. **ModuleFormModal.tsx**

   - Deskripsi: Modal untuk membuat atau mengedit modul
   - Dependensi: Tidak bergantung langsung pada komponen lain, tetapi lebih kompleks dari komponen Level 1
   - Test: `ModuleFormModal.test.tsx`

3. **DeleteModuleDialog.tsx**

   - Deskripsi: Dialog konfirmasi untuk menghapus modul
   - Dependensi: Tidak bergantung langsung pada komponen lain, tetapi lebih kompleks dari komponen Level 1
   - Test: `DeleteModuleDialog.test.tsx`

4. **ModulePageListItem.tsx**

   - Deskripsi: Item untuk daftar halaman modul
   - Dependensi: Tidak bergantung langsung pada komponen lain, tetapi lebih kompleks dari komponen Level 1
   - Test: `ModulePageListItem.test.tsx`

5. **ModulePageFormModal.tsx**
   - Deskripsi: Modal untuk membuat atau mengedit halaman modul
   - Dependensi: `CodeEditor.tsx`, `TheoryEditor.tsx`
   - Test: `ModulePageFormModal.test.tsx`

### Level 3: Komponen Tingkat Tinggi

Komponen-komponen ini bergantung pada komponen Level 2:

1. **ModuleTable.tsx**

   - Deskripsi: Komponen utama untuk menampilkan tabel modul
   - Dependensi: `DataTable.tsx`, `ModuleFilter.tsx`, `ModuleFormModal.tsx`
   - Test: `ModuleTable.test.tsx`

2. **ModulePageList.tsx**
   - Deskripsi: Daftar halaman modul
   - Dependensi: `ModulePageListItem.tsx`
   - Test: `ModulePageList.test.tsx`

### Level 4: Komponen Halaman (Paling Dependen)

Komponen-komponen ini bergantung pada komponen Level 3 dan merupakan komponen tingkat tertinggi:

1. **ModuleManagement.tsx**

   - Deskripsi: Halaman manajemen modul
   - Dependensi: `ModuleTable.tsx`, `DeleteModuleDialog.tsx`
   - Test: `ModuleManagement.test.tsx`

2. **ModulePageManagement.tsx**
   - Deskripsi: Halaman manajemen halaman modul
   - Dependensi: `ModulePageList.tsx`, `ModulePageFormModal.tsx`
   - Test: `ModulePageManagement.test.tsx`

## Strategi Perbaikan Test

Berdasarkan hierarki di atas, strategi perbaikan test yang direkomendasikan adalah:

1. Mulai dengan memperbaiki test untuk komponen Level 1 (unit terkecil)
2. Setelah semua test Level 1 berhasil, lanjutkan ke Level 2
3. Setelah semua test Level 2 berhasil, lanjutkan ke Level 3
4. Terakhir, perbaiki test untuk komponen Level 4

Dengan mengikuti pendekatan ini, kita dapat memastikan bahwa komponen dasar berfungsi dengan baik sebelum memperbaiki komponen yang bergantung padanya, sehingga mengurangi kompleksitas debugging.

## Teknik Mocking

Untuk komponen yang lebih tinggi (Level 3 dan 4), gunakan teknik mocking untuk mengisolasi komponen yang sedang diuji dari dependensinya:

1. Mock komponen Level 1 saat menguji komponen Level 2
2. Mock komponen Level 2 saat menguji komponen Level 3
3. Mock komponen Level 3 saat menguji komponen Level 4

Contoh mocking untuk ModuleTable.test.tsx:

```typescript
// Mock ModuleFilter component
jest.mock('./ModuleFilter', () => ({
  ModuleFilter: jest.fn(() => (
    <div data-testid="module-filter">
      <input type="text" placeholder="Cari modul..." />
    </div>
  )),
}))

// Mock ModuleFormModal component
jest.mock('./ModuleFormModal', () => ({
  ModuleFormModal: jest.fn(() => null),
}))
```

Dengan pendekatan ini, kita dapat fokus pada pengujian fungsionalitas komponen tertentu tanpa khawatir tentang masalah dalam komponen dependensinya.
