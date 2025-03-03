# Implementasi Modul Pembelajaran

## Overview

**Fitur:** Akses Materi Bertahap  
**Sprint:** Sprint 2  
**Tanggal Implementasi:** 2025-03-03

## Deskripsi

Fitur ini memungkinkan mahasiswa untuk mengakses modul pembelajaran secara bertahap dengan navigasi antar halaman yang jelas dan progres yang tercatat secara lokal menggunakan Redux.

## Langkah-langkah Implementasi

### 1. Struktur File dan Folder

Berikut adalah struktur file dan folder yang telah dibuat:

```
features/
└── module/
    ├── components/
    │   ├── ModuleContent.tsx
    │   ├── ModuleContent.test.tsx
    │   ├── ModuleNavigation.tsx
    │   ├── ModuleNavigation.test.tsx
    │   ├── ModuleProgress.tsx
    │   ├── ModuleProgress.test.tsx
    │   ├── ProgressIndicator.tsx
    │   ├── ProgressIndicator.test.tsx
    │   ├── ModulePage.tsx
    │   └── ModulePage.test.tsx
    ├── data/
    │   ├── moduleData.ts
    │   └── moduleData.test.ts
    ├── hooks/
    │   ├── useModuleProgress.ts
    │   └── useModuleProgress.test.tsx
    ├── types/
    │   ├── index.ts
    │   └── index.test.ts
    ├── utils/
    └── services/
```

### 2. Komponen Utama

#### ModuleContent

- Menampilkan konten modul dengan dukungan Markdown
- Mendukung syntax highlighting untuk blok kode
- Menampilkan media (gambar) jika tersedia
- **Update (2025-03-03):** Menambahkan dukungan untuk interaksi pengguna:
  - Deteksi scroll ke bagian bawah konten
  - Daftar periksa interaktif (interactive checklist)
  - Tombol interaktif yang dapat dikonfigurasi melalui Markdown
  - Tombol "Tandai Telah Dibaca" untuk menandai halaman sebagai selesai
  - Deteksi tampilan media (gambar/video)
  - Interaksi dengan heading dan elemen konten lainnya

#### ModuleNavigation

- Tombol navigasi antar halaman (Sebelumnya/Selanjutnya)
- Tombol "Selesai" pada halaman terakhir
- Disabling tombol sesuai dengan posisi halaman
- **Update (2025-03-03):** Menambahkan fitur baru:
  - Tooltip dinamis yang menampilkan status halaman
  - Validasi navigasi berdasarkan penyelesaian halaman
  - Dukungan untuk mode eksplorasi cepat (Quick View Mode)
  - Indikator visual untuk bagian yang belum selesai
  - **Update (2025-03-03):** Integrasi dengan ProgressIndicator untuk menampilkan progres visual

#### **Update (2025-03-03):** ProgressIndicator

- Komponen baru untuk menampilkan indikator progres visual
- Menggunakan komponen Progress dari shadcn/ui
- Fitur-fitur utama:
  - Menampilkan progress bar dengan persentase penyelesaian
  - Menampilkan indikator halaman (dots) untuk setiap halaman
  - Warna dinamis berdasarkan tingkat progres (rendah, sedang, tinggi)
  - Tooltip yang menampilkan persentase penyelesaian
  - Animasi pulsasi saat progres berubah
  - Sinkronisasi dengan localStorage untuk persistensi data
  - Indikator visual untuk halaman yang sudah dikunjungi
  - Status khusus saat modul telah selesai

#### ModuleProgress

- Menampilkan indikator progres menggunakan komponen Progress dari shadcn/ui
- Menampilkan informasi halaman saat ini dan total halaman
- Menampilkan persentase penyelesaian

#### ModulePage

- Komponen utama yang menggabungkan semua komponen di atas
- Menampilkan judul dan deskripsi modul
- Menampilkan navigasi halaman berupa tombol angka untuk modul dengan lebih dari 3 halaman
- **Update (2025-03-03):** Menambahkan fitur baru:
  - Integrasi dengan useModuleProgress yang telah ditingkatkan
  - Pelacakan interaksi pengguna untuk menentukan penyelesaian halaman
  - Mekanisme peringatan saat mencoba navigasi ke halaman yang belum selesai

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
- **Update (2025-03-03):** Menambahkan fitur baru:
  - State management untuk `quickViewMode`
  - State management untuk `isPageCompleted`
  - State management untuk `incompleteSections`
  - State management untuk `visitedPages` untuk melacak halaman yang telah dikunjungi
  - Fungsi untuk toggle mode eksplorasi cepat
  - Fungsi untuk menyorot bagian yang belum selesai
  - Validasi navigasi berdasarkan penyelesaian halaman
  - Logging interaksi pengguna untuk analitik
  - Sinkronisasi dengan localStorage untuk persistensi data

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
  - **Update (2025-03-03):** Menambahkan properti baru:
    - quickViewModeAvailable?: boolean

#### ModulePage

- Interface untuk halaman modul dengan properti:
  - id: string
  - title: string
  - content: string
  - media?: string
  - isLastPage: boolean
  - pageNumber: number
  - **Update (2025-03-03):** Menambahkan properti baru:
    - requiredInteractions?: string[]
    - interactiveElements?: InteractiveElement[]

#### ModuleProgress

- Interface untuk menyimpan progres modul dengan properti:
  - userId: string
  - moduleId: string
  - currentPage: number
  - isCompleted: boolean
  - progressPercentage: number
  - lastUpdated: string
  - **Update (2025-03-03):** Menambahkan properti baru:
    - completedInteractions?: Record<number, string[]>
    - visitedPages?: number[]
    - quickViewModeEnabled?: boolean

#### **Update (2025-03-03):** Menambahkan interface baru:

#### InteractiveElement

- Interface untuk elemen interaktif dengan properti:
  - id: string
  - type: 'checklist' | 'button' | 'quiz' | 'code-input'
  - content: string
  - required: boolean

#### PageInteractionState

- Interface untuk menyimpan status interaksi halaman dengan properti:
  - pageId: string
  - completedInteractions: string[]
  - isPageCompleted: boolean
  - timeSpent: number
  - lastInteractionAt: string

#### NavigationHistoryEntry

- Interface untuk menyimpan riwayat navigasi dengan properti:
  - fromPage: number
  - toPage: number
  - timestamp: string
  - interactionId?: string

### 5. Testing

Semua komponen dan fungsi telah dilengkapi dengan unit test menggunakan Jest dan React Testing Library. Pendekatan TDD (Test-Driven Development) digunakan dengan membuat test file terlebih dahulu sebelum implementasi.

**Update (2025-03-03):** Menambahkan test baru:
- Test untuk interaksi pengguna di ModuleContent
- Test untuk validasi navigasi di ModuleNavigation
- Test untuk mode eksplorasi cepat di useModuleProgress
- Test untuk komponen ProgressIndicator, termasuk:
  - Pengujian perhitungan persentase progres
  - Pengujian warna dinamis berdasarkan progres
  - Pengujian sinkronisasi dengan localStorage
  - Pengujian tooltip dan status penyelesaian

## Teknologi yang Digunakan

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Komponen UI**: shadcn/ui (Progress, Card, Button, Tooltip)
- **State Management**: Redux dengan Redux Toolkit
- **Markdown Rendering**: react-markdown
- **Syntax Highlighting**: react-syntax-highlighter
- **Testing**: Jest dan React Testing Library
- **Icons**: Lucide React

## Fitur yang Diimplementasikan

1. **Navigasi Multi-Page**:
   - Tombol Sebelumnya/Selanjutnya
   - Validasi halaman yang belum selesai
   - Mode eksplorasi cepat

2. **Pelacakan Progres**:
   - Perhitungan persentase otomatis
   - Penyimpanan status di Redux dan localStorage
   - Indikator visual dengan warna dinamis

3. **Interaksi Pengguna**:
   - Daftar periksa interaktif
   - Tombol interaktif dalam konten Markdown
   - Deteksi scroll dan tampilan media

4. **Feedback Visual**:
   - Tooltip status halaman
   - Indikator halaman yang sudah dikunjungi
   - Animasi pulsasi saat progres berubah

## Langkah Selanjutnya

1. **Implementasi Halaman Terakhir**:
   - Ringkasan materi
   - Evaluasi kesiapan quiz
   - Rekomendasi halaman yang perlu diulang

2. **Optimasi Performa**:
   - Lazy loading untuk media
   - Prefetching halaman berikutnya
   - Optimasi animasi untuk perangkat low-end

3. **Analitik Pengguna**:
   - Pelacakan waktu yang dihabiskan per halaman
   - Analisis pola navigasi
   - Identifikasi bagian yang sering dilewati