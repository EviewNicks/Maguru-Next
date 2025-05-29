# Arsitektur Manage Module

## Ringkasan Perubahan

Beberapa perbaikan telah dilakukan untuk meningkatkan konsistensi dan maintainability dari modul manage-module:

### 1. Implementasi Arsitektur Berlapis

- Menerapkan arsitektur berlapis yang jelas dengan pemisahan tanggung jawab
- Mengikuti pola yang sama dengan ModulePage untuk konsistensi
- Memindahkan logika dari hooks langsung ke adapter dan context

### 2. Konsolidasi Hooks

- Menggabungkan `useModuleQuery.ts` dan `useModuleMutation.ts` menjadi satu hook `useModuleData.ts`
- Menyediakan satu entry point untuk semua operasi data modul
- Menstandarisasi error handling dan notifikasi

### 3. Penambahan Adapter Layer

- Membuat `moduleAdapter.ts` sebagai penghubung antara service dan hooks
- Menerapkan interface `IModuleAdapter` untuk memastikan implementasi yang konsisten
- Menangani transformasi data dan error handling di level adapter

### 4. Penambahan Context Layer

- Membuat `ModuleCRUDContext.tsx` untuk menyediakan state global dan fungsi-fungsi untuk komponen
- Memisahkan UI logic dari data fetching logic
- Menyediakan fungsi-fungsi untuk filter, pagination, dan sorting

### 5. Pembaruan Komponen UI

- Memperbarui `ModuleTable.tsx` dan `ModuleActionCell.tsx` untuk menggunakan context
- Menghapus state lokal yang tidak perlu
- Meningkatkan UX dengan fitur sorting dan filtering yang lebih baik

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
│  │    ModuleTable      │    │     ModuleOverview          │     │
│  └─────────────────────┘    └─────────────────────────────┘     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                           Context                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               ModuleCRUDContext                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                            Hooks                                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                useModuleData                            │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                           Adapter                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               moduleAdapter                             │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                           Service                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               moduleService                             │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                          Database                               │
└─────────────────────────────────────────────────────────────────┘
```

### 1. React Components Layer

**Lokasi File:**
- `features/manage-module/components/ModuleTable.tsx`
- `features/manage-module/components/ModuleOverview.tsx`
- `features/manage-module/components/ModuleTable/ModuleActionCell.tsx`
- `features/manage-module/components/ModuleTable/ModuleFormModal.tsx`

**Tanggung Jawab:**
- Menampilkan UI untuk interaksi pengguna
- Menangani input pengguna
- Menampilkan data dari context
- Memanggil handler dari context

**Komponen Utama:**
- `ModuleTable`: Menampilkan daftar modul dalam bentuk tabel atau card
- `ModuleOverview`: Menampilkan statistik dan overview modul
- `ModuleActionCell`: Menangani aksi untuk setiap modul (edit, delete, manage pages)
- `ModuleFormModal`: Form untuk membuat atau mengedit modul

**Karakteristik:**
- Menggunakan React Hooks dan Context
- Memisahkan UI dari logic
- Mendukung fitur sorting, filtering, dan pagination
- Menggunakan shadcn/ui untuk komponen UI

### 2. Context Layer

**Lokasi File:**
- `features/manage-module/context/ModuleCRUDContext.tsx`

**Tanggung Jawab:**
- Menyediakan state global untuk komponen
- Mengelola state filter, pagination, dan sorting
- Menyediakan fungsi-fungsi handler untuk komponen
- Mengelola state loading dan error

**Komponen Utama:**
- `ModuleCRUDContext`: Context untuk operasi CRUD modul
  - `modules`: Daftar modul
  - `isLoading`: Status loading
  - `error`: Error jika ada
  - `createModule`: Membuat modul baru
  - `updateModule`: Memperbarui modul
  - `deleteModule`: Menghapus modul
  - `updateModuleStatus`: Mengubah status modul
  - `setPage`, `setPageSize`, `setSearchQuery`, dll: Fungsi untuk filter dan pagination

**Karakteristik:**
- Menggunakan React Context API
- Menyediakan state dan handler yang dibutuhkan komponen
- Menggunakan hooks untuk mengakses data
- Mendukung optimistic updates dan error handling

### 3. Hooks Layer

**Lokasi File:**
- `features/manage-module/hooks/useModuleData.ts`

**Tanggung Jawab:**
- Menyediakan interface React untuk mengakses data
- Mengelola state query dan mutation dengan React Query
- Menyediakan fungsi-fungsi untuk operasi CRUD
- Menangani loading, error, dan success states

**Fungsi Utama:**
- `useModuleData`: Hook untuk mengelola data modul
  - `modules`: Data modul
  - `module`: Detail modul
  - `isLoading`: Status loading
  - `error`: Error jika ada
  - `createModule`: Membuat modul baru
  - `updateModule`: Memperbarui modul
  - `deleteModule`: Menghapus modul
  - `updateModuleStatus`: Mengubah status modul

**Karakteristik:**
- Menggunakan React Query untuk state management
- Menyediakan state loading, error, dan data
- Mendukung optimistic updates
- Memiliki caching dan invalidation yang tepat
- Menyediakan fungsi-fungsi mutation yang mudah digunakan
- Menampilkan notifikasi toast untuk feedback pengguna

### 4. Adapter Layer

**Lokasi File:**
- `features/manage-module/adapters/moduleAdapter.ts`

**Tanggung Jawab:**
- Menjembatani antara service dan hooks
- Transformasi format data untuk UI
- Validasi input sebelum diteruskan ke service
- Error handling

**Fungsi Utama:**
- `getModules`: Mendapatkan daftar modul
- `getModuleById`: Mendapatkan detail modul
- `createModule`: Membuat modul baru
- `updateModule`: Memperbarui modul
- `deleteModule`: Menghapus modul
- `updateModuleStatus`: Mengubah status modul

**Karakteristik:**
- Mengimplementasi interface `IModuleAdapter`
- Melakukan validasi input sebelum diteruskan ke service
- Menangani error dengan try-catch
- Mentransformasi data dari service ke format yang dibutuhkan oleh UI

### 5. Service Layer

**Lokasi File:**
- `features/manage-module/services/moduleService.ts`

**Tanggung Jawab:**
- Operasi CRUD pada data modul
- Komunikasi dengan database melalui Prisma
- Transformasi data untuk API response
- Validasi data input

**Fungsi Utama:**
- `createModule`: Membuat modul baru
- `getModules`: Mendapatkan daftar modul dengan filter dan pagination
- `getModuleById`: Mendapatkan detail modul berdasarkan ID
- `updateModule`: Memperbarui modul berdasarkan ID
- `updateModuleStatus`: Memperbarui status modul berdasarkan ID
- `deleteModule`: Menghapus modul berdasarkan ID

**Karakteristik:**
- Menggunakan Prisma untuk operasi database
- Menangani error dengan try-catch
- Menerapkan filter, sorting, dan pagination
- Melakukan transformasi data untuk API response

## Alur Data

Alur data dalam arsitektur ini mengikuti pola one-way data flow:

1. **User Interaction → React Components**
   - Pengguna berinteraksi dengan komponen React (misalnya klik tombol filter)
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

## Manfaat Perubahan

1. **Konsistensi Arsitektur**: Mengikuti pola yang sama dengan ModulePage untuk konsistensi
2. **Separation of Concerns**: Setiap layer memiliki tanggung jawab yang jelas dan terpisah
3. **Testability**: Lebih mudah untuk menulis test dengan interface yang terdefinisi dengan baik
4. **Maintainability**: Kode lebih mudah dipelihara dan dikembangkan
5. **Reusability**: Komponen dan fungsi dapat digunakan kembali di berbagai bagian aplikasi
6. **Performance**: Optimasi caching dan debouncing mengurangi jumlah API calls
7. **User Experience**: Notifikasi toast memberikan feedback yang lebih baik kepada pengguna

## Rekomendasi Selanjutnya

1. **Tambahkan Unit Test**: Tambahkan unit test untuk fungsi-fungsi di adapter dan hooks
2. **Tambahkan Integration Test**: Tambahkan integration test untuk alur data dari UI ke database
3. **Implementasi Caching**: Tambahkan caching untuk mengurangi jumlah API calls
4. **Tambahkan Fitur Pencarian Lanjutan**: Tambahkan fitur pencarian lanjutan dengan filter yang lebih kompleks
5. **Tambahkan Fitur Export/Import**: Tambahkan fitur untuk mengekspor dan mengimpor modul
6. **Tambahkan Fitur Bulk Actions**: Tambahkan fitur untuk melakukan aksi pada beberapa modul sekaligus
7. **Tambahkan Fitur Drag and Drop**: Tambahkan fitur untuk mengubah urutan modul dengan drag and drop