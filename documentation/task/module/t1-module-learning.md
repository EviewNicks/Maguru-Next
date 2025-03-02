# Implementasi Modul Pembelajaran

## Overview

**Fitur:** Akses Materi Bertahap  
**Sprint:** Sprint 2  
**Tanggal Implementasi:** 2025-03-02

## Deskripsi

Fitur ini memungkinkan mahasiswa untuk mengakses modul pembelajaran secara bertahap dengan navigasi antar halaman yang jelas dan progres yang tercatat secara lokal menggunakan Redux.

## Langkah-langkah Implementasi

### 1. Struktur File dan Folder

Berikut adalah struktur file dan folder yang telah dibuat:
features/  
└── module/  
    ├── components/  
    │   ├── ModuleContent.tsx  
    │   ├── ModuleContent.test.tsx  
    │   ├── ModuleNavigation.tsx  
    │   ├── ModuleNavigation.test.tsx  
    │   ├── ModuleProgress.tsx  
    │   └── ModuleProgress.test.tsx  
    ├── data/  
    │   ├── moduleData.ts  
    │   └── moduleData.test.ts  
    ├── hooks/  
    │   ├── useModuleProgress.ts  
    │   └── useModuleProgress.test.tsx  
    ├── services/  
    ├── types/  
    │   ├── index.ts  
    │   └── index.test.ts  
    └── utils/  


### 2. Komponen Utama

#### ModuleContent
- Menampilkan konten modul dengan dukungan Markdown
- Mendukung syntax highlighting untuk blok kode
- Menampilkan media (gambar) jika tersedia

#### ModuleNavigation
- Tombol navigasi antar halaman (Sebelumnya/Selanjutnya)
- Tombol "Selesai" pada halaman terakhir
- Disabling tombol sesuai dengan posisi halaman

#### ModuleProgress
- Menampilkan indikator progres menggunakan komponen Progress dari shadcn/ui
- Menampilkan informasi halaman saat ini dan total halaman
- Menampilkan persentase penyelesaian

### 3. State Management

#### progressSlice
- Menyimpan status progres modul dalam Redux store
- Menyediakan actions untuk:
  - SET_CURRENT_PAGE: Mengatur halaman saat ini
  - SET_MODULE_COMPLETED: Menandai modul sebagai selesai
  - SET_MODULE_ID: Mengatur ID modul yang sedang aktif
  - SET_USER_ID: Mengatur ID pengguna
  - SET_PROGRESS_PERCENTAGE: Mengatur persentase progres
  - RESET_PROGRESS: Mengatur ulang progres

#### useModuleProgress Hook
- Custom hook untuk mengelola progres modul
- Menyediakan fungsi navigasi: goToNextPage, goToPrevPage, goToPage
- Menghitung persentase progres secara otomatis
- Menandai modul sebagai selesai saat mencapai halaman terakhir

### 4. Data Struktur

#### ModuleData
- Interface untuk data modul dengan properti:
  - id: string
  - title: string
  - description: string
  - pages: ModulePage[]
  - totalPages: number
  - progressPercentage: number
  - isCompleted: boolean

#### ModulePage
- Interface untuk halaman modul dengan properti:
  - id: string
  - title: string
  - content: string
  - media?: string
  - isLastPage: boolean
  - pageNumber: number

#### ModuleProgress
- Interface untuk menyimpan progres modul dengan properti:
  - userId: string
  - moduleId: string
  - currentPage: number
  - isCompleted: boolean
  - progressPercentage: number
  - lastUpdated: string

### 5. Testing

Semua komponen dan fungsi telah dilengkapi dengan unit test menggunakan Jest dan React Testing Library.

## Langkah Selanjutnya

1. Implementasi ModulePage.tsx sebagai komponen utama yang menggabungkan semua komponen
2. Integrasi dengan autentikasi untuk menyimpan progres pengguna
3. Implementasi fitur mode eksplorasi cepat (Quick View Mode)
4. Penambahan fitur pencarian dan filter dalam modul

## Referensi

- [Dokumentasi Redux](https://redux.js.org/)
- [Dokumentasi shadcn/ui](https://ui.shadcn.com/)
- [React Markdown](https://github.com/remarkjs/react-markdown)
