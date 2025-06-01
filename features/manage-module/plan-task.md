# Rencana Implementasi Fitur Draft Otomatis (Auto-save)

## Ringkasan Tujuan

Mengembangkan fitur auto-save pada RichTextEditor untuk menyimpan konten pengguna secara otomatis, mirip dengan pengalaman menulis di Confluence. Sistem akan menyimpan draft secara periodik dan berdasarkan event tertentu, memungkinkan recovery draft dan memberikan feedback yang jelas kepada pengguna.

## Analisis Sistem yang Ada

Berdasarkan kode yang ada, sistem sudah memiliki beberapa komponen dasar untuk auto-save:

1. **`useRichTextAutosave`**: Hook khusus untuk menangani auto-save
2. **`RichTextEditorWithAutosave`**: Wrapper component dengan UI status penyimpanan
3. **`ModulePageCRUDContext`**: Menyediakan fungsi `savePage` dan `handleEditorChange`

Struktur arsitektur kita mengikuti pattern:

```
Client-side Flow:
Route -> modulePageAdapter -> Hooks Layer -> Context -> Components

Server-side Flow:
schema.prisma -> modulePageService -> route handlers
```

## Update Model Data (Schema Prisma)

Saat ini, kita perlu mengupdate model `ModulePage` untuk mendukung fitur draft otomatis dengan lebih baik:

```prisma
model ModulePage {
  id          String       @id @default(uuid())
  moduleId    String       @map("module_id")
  order       Int
  type        String
  content     Json         // Format Tiptap untuk konten yang sudah dipublish
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  version     Int          @default(1)
  title       String
  status      ModuleStatus @default(DRAFT)

  // Fields baru untuk fitur draft
  authorId    String       // Pengguna yang membuat halaman (penting untuk tracking)
  lastEditBy  String?      // User terakhir yang mengedit (untuk collaborative editing)
  draftData   Json?        // Menyimpan data draft terpisah dari konten yang sudah dipublish
  draftSavedAt DateTime?   // Timestamp terakhir draft disimpan (untuk menampilkan info ke user)
  isDraft     Boolean      @default(false) // Flag untuk menandai apakah ini versi draft
  hasUnpublishedChanges Boolean @default(false) // Flag untuk menandai ada perubahan yang belum dipublish

  module      Module       @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  @@unique([moduleId, order])
  @@index([moduleId, order])
  @@index([moduleId, type])
  @@index([authorId]) // Index baru untuk query berdasarkan author
  @@map("module_pages")
}
```

### Penjelasan Field Baru:

- **`authorId`**: Menyimpan ID pengguna yang membuat halaman awal, untuk audit trail dan permission control.
- **`lastEditBy`**: Mencatat pengguna terakhir yang mengedit halaman, penting untuk collaborative editing.
- **`draftData`**: Menyimpan data draft dalam format JSON, terpisah dari `content` yang sudah dipublish.
- **`draftSavedAt`**: Timestamp kapan draft terakhir disimpan, untuk menampilkan informasi "Tersimpan 2 menit yang lalu".
- **`isDraft`**: Flag untuk membedakan versi draft dari versi published.
- **`hasUnpublishedChanges`**: Flag untuk menandai bahwa halaman memiliki perubahan yang belum dipublish.

## Terminologi dan Konsep Kunci

- **Draft**: Versi konten yang belum dipublikasikan
- **Auto-save**: Penyimpanan otomatis tanpa interaksi pengguna
- **Recovery Draft**: Mekanisme untuk memulihkan draft yang belum disimpan
- **Debounce**: Teknik untuk mengurangi frekuensi eksekusi fungsi (menunggu pengguna berhenti mengetik)
- **Throttle**: Teknik untuk membatasi frekuensi eksekusi fungsi (maksimal sekali dalam interval waktu tertentu)

## Strategi Implementasi

Berdasarkan analisis fitur Confluence dan kebutuhan proyek, kita akan mengimplementasikan strategi berikut:

### 1. Penyimpanan Draft

**Server-side (Utama):**

- **Fungsi Utama**: Penyimpanan permanen dan terpusat untuk semua draft.
- **Implementasi Teknis**:
  - Menggunakan PostgreSQL dengan tipe data JSONB untuk menyimpan konten Tiptap dalam field `draftData`.
  - Pemisahan data draft (`draftData`) dari konten yang sudah dipublish (`content`).
  - Versioning sederhana dengan field `version` yang diincrement saat publikasi.
  - Optimistic locking untuk mencegah overwrite data saat concurrent editing.
  - API khusus untuk operasi draft: save, get, discard, publish.

**Client-side (Fokus pada UX):**

- **Fungsi Utama**: Memberikan feedback yang baik dan menjaga pengalaman pengguna.
- **Implementasi Teknis**:
  - Menggunakan debounce dan throttle untuk mengurangi jumlah request ke server.
  - Memberikan indikator status yang jelas (saving, saved, error).
  - Memperingatkan pengguna sebelum meninggalkan halaman dengan perubahan yang belum tersimpan.
  - Mendeteksi kondisi offline dan menampilkan pesan yang sesuai.

### 2. Trigger Auto-save

Berdasarkan perilaku Confluence, kita akan mengimplementasikan:

- **Debounced Save**: Menyimpan setelah pengguna berhenti mengetik (5 detik)
- **Throttled Save**: Maksimal satu penyimpanan setiap 30 detik
- **Event-based Save**:
  - Saat blur (pengguna klik di luar editor)
  - Saat tab/window kehilangan fokus (visibilitychange)
  - Sebelum navigasi keluar (beforeunload)

### 3. Format Data Draft

```typescript
// Struktur data draft di server
interface DraftData {
  pageId: string
  moduleId: string
  content: StandardEditorContent
  title?: string
  lastModified: number // timestamp
  version?: number // untuk conflict detection
  authorId: string // User yang membuat draft
}
```

## UX dan Feedback Pengguna

### 1. Status Penyimpanan

Berdasarkan pendekatan Confluence, kita akan mengimplementasikan indikator status yang jelas:

- **Saved**: Ikon checkmark hijau dengan label "Tersimpan" + timestamp
- **Saving**: Animasi loading dengan label "Menyimpan..."
- **Unsaved**: Indikator warna amber dengan opsi "Simpan sekarang"
- **Error**: Indikator merah dengan opsi "Coba lagi"
- **Offline**: Indikator dengan label "Anda offline, perubahan tidak akan disimpan"

### 2. Lokasi Indikator Status

Indikator status akan ditampilkan di dua lokasi:

1. **Header Dokumen**: Di bagian atas halaman, dekat judul (terintegrasi dengan `DocumentHeader.tsx`)
2. **Floating Indicator**: Indikator kecil di sudut editor saat sedang mengedit

### 3. Konfirmasi Navigasi

Ketika pengguna mencoba meninggalkan halaman dengan perubahan yang belum tersimpan:

- Dialog konfirmasi browser native akan muncul
- Sebelum dialog muncul, sistem akan mencoba menyimpan draft ke server
- Teks konfirmasi: "Perubahan belum tersimpan. Anda yakin ingin meninggalkan halaman?"

### 4. Aksesibilitas

- Semua indikator status akan memiliki atribut `aria-live` untuk screen reader
- Warna tidak akan menjadi satu-satunya cara untuk membedakan status (selalu disertai teks)
- Notifikasi status dapat dibaca oleh screen reader

## Arsitektur Teknis

### 1. Struktur Data Draft

Pada level API/server-side:

```typescript
// Representasi server-side
interface DraftResponseFormat {
  pageId: string
  moduleId: string
  content: JSON // JSONB di PostgreSQL untuk versi published
  draftData: JSON // JSONB untuk versi draft yang belum dipublish
  version: number
  lastEditBy: string
  draftSavedAt: Date // Waktu terakhir draft disimpan
  updatedAt: Date // Waktu terakhir versi published diupdate
  isDraft: boolean
  hasUnpublishedChanges: boolean
}
```

## Alur Implementasi Teknis

### 1. Server-side Implementation

#### 1.1 ModulePageService Updates

Perlu menambahkan fungsi-fungsi baru di `modulePageService.ts`:

- **`saveDraft(pageId, draftData)`**: Menyimpan draft ke database tanpa mengganti versi published
- **`getDraft(pageId)`**: Mendapatkan draft terbaru dari database
- **`publishDraft(pageId)`**: Mengkonversi draft menjadi versi published, mengupdate version
- **`discardDraft(pageId)`**: Membuang draft dan kembali ke versi published terakhir
- **`getPageHistory(pageId)`**: Mendapatkan riwayat versi halaman (future enhancement)

#### 1.2 API Routes Updates

Mengembangkan API routes baru:

- **`app/api/module/[id]/pages/[pageId]/draft/route.ts`**:

  - **POST**: Menyimpan draft baru (save)
  - **GET**: Mendapatkan draft terbaru
  - **DELETE**: Menghapus/discard draft
  - **PATCH**: Mempublikasikan draft (publish)

- **Update Format Response API Existing**:
  - Menambahkan field draft-related ke dalam response
  - Menambahkan informasi metadata seperti `draftSavedAt` dan `lastEditBy`
  - Format yang konsisten antara operasi GET, POST, PUT

### 2. Client-side Implementation

#### 2.1 Update modulePageAdapter.ts

Menambahkan metode di `modulePageAdapter.ts`:

- **`saveDraft(pageId, content)`**: Menyimpan draft ke server
- **`getDraft(pageId)`**: Mendapatkan draft dari server
- **`publishDraft(pageId)`**: Mempublikasikan draft
- **`discardDraft(pageId)`**: Membuang draft

#### 2.2 Perbarui Hooks

Mengembangkan `useRichTextAutosave.ts` dan fungsi terkait:

- Enhance useRichTextAutosave dengan debounce dan throttle
- Tambahkan monitoring online/offline status
- Tambahkan event listeners untuk saving triggers
- Implementasi debounce save: triggered 5 detik setelah pengetikan berhenti
- Implementasi throttle save: maksimal 1 request setiap 30 detik
- Monitoring online/offline status menggunakan `window.navigator.onLine`
- Event listeners untuk editor changes, blur, visibility change, dan before unload
- Notifikasi status penyimpanan (saving, saved, error)

#### 2.3 Feedback Service

- Buat service untuk mengelola status draft dan feedback ke pengguna
- Implementasi notifikasi status (saving, saved, error)
- Implementasi deteksi offline dan pesan yang sesuai

#### 2.4 Update Context

- Tambahkan state dan handler untuk draft management
- Integrasi dengan hooks untuk autosave
- Provide UI feedback melalui context

#### 2.5 Update Components

- Tambahkan UI components untuk draft status
- Implementasi indicators dan notifications
- Tambahkan dialog konfirmasi untuk navigasi dengan perubahan yang belum tersimpan

### 3. Concurrent Editing

- **Deteksi Concurrent Editing**:

  - Implementasi mekanisme optimistic locking menggunakan field `version`
  - Mendeteksi jika ada user lain yang mengedit halaman yang sama

- **Penanganan Konflik**:

  - Menampilkan notifikasi ke pengguna jika ada pengguna lain sedang mengedit
  - Memberikan pilihan untuk melihat perubahan terbaru atau tetap dengan versi yang sedang diedit
  - Implementasi mekanisme "force save" jika diperlukan

- **Indikator User Aktif**:
  - Menampilkan indikator "User X sedang mengedit" di header dokumen
  - Menyediakan avatar atau indikator visual untuk user yang aktif
  - Update status editing secara real-time

## Penanganan Edge Cases

### 1. Session Timeout

- Implementasi refresh token otomatis saat session hampir berakhir
- Notifikasi ke pengguna ketika session timeout terjadi

### 2. Browser Crash / Unexpected Refresh

- Menggunakan `beforeunload` event untuk menyimpan state terakhir ke server sebelum halaman ditutup
- Recovery otomatis saat pengguna kembali ke halaman
- Dialog recovery yang menampilkan timestamp draft tersimpan

### 3. Storage Limit

- Memantau ukuran data JSON yang disimpan
- Optimasi format data untuk mengurangi ukuran
- Notifikasi ke pengguna jika konten terlalu besar

### 4. Network Interruption

- Deteksi status offline menggunakan `window.navigator.onLine`
- Notifikasi yang jelas ke pengguna saat offline
- Menyarankan untuk tidak melanjutkan edit hingga koneksi kembali
- Menampilkan status "Anda offline, perubahan tidak akan disimpan" dengan jelas
- Mencegah aksi-aksi yang memerlukan koneksi server saat offline

## Rencana Teknis Detail

### Server-side Implementation

#### 1. Perbarui Schema Database

- Update model Prisma dengan field-field draft baru
- Jalankan migrasi database
- Tambahkan index untuk optimasi query

#### 2. Perbarui modulePageService.ts

- Tambahkan fungsi draft operations (save, get, publish, discard)
- Implementasi validasi dan transformasi data
- Tambahkan error handling dan logging

#### 3. Buat API Routes untuk Draft

- Buat file route.ts untuk draft operations
- Implementasi handler untuk GET, POST, DELETE, PATCH
- Tambahkan middleware authentication dan validation

#### 4. Update Existing API Routes

- Perbarui format response untuk menyertakan draft info
- Konsistenkan format response antar endpoint
- Tambahkan validasi untuk draft fields

### Client-side Implementation

#### 1. Update modulePageAdapter.ts

- Tambahkan metode untuk draft operations
- Implementasi debounce dan throttle untuk request
- Tambahkan error handling dan retry mechanism

#### 2. Perbarui Hooks

- Enhance useRichTextAutosave dengan debounce dan throttle
- Tambahkan monitoring online/offline status
- Tambahkan event listeners untuk saving triggers

#### 3. Feedback Service

- Buat DraftFeedbackService untuk mengelola status draft dan feedback ke pengguna
- Implementasi notifikasi status (saving, saved, error)
- Implementasi deteksi offline dan pesan yang sesuai

#### 4. Update Context

- Tambahkan state dan handler untuk draft management
- Integrasi dengan hooks untuk autosave
- Provide UI feedback melalui context

#### 5. Update Components

- Tambahkan UI components untuk draft status
- Implementasi indicators dan notifications
- Tambahkan dialog untuk conflict resolution

## Langkah-langkah Implementasi

### Phase 1: Persiapan Infrastruktur (2-3 hari)

1. **Update Schema Database**

   - Tambahkan fields baru ke model `ModulePage`
   - Migrasi database

2. **Implementasi Service Layer**
   - Update `modulePageService.ts` dengan fungsi draft
   - Buat API routes untuk operasi draft

### Phase 2: Implementasi Client-side Core (3-4 hari)

1. **Develop Feedback Service**

   - Implementasi `DraftFeedbackService` untuk UI feedback
   - Unit test untuk feedback service

2. **Upgrade Hooks & Adapter**
   - Perbarui `useRichTextAutosave` dengan strategi baru
   - Perbarui `modulePageAdapter` dengan operasi draft

### Phase 3: UI Integration (2-3 hari)

1. **Update Context**

   - Perbarui `ModulePageCRUDContext` dengan state dan handler draft

2. **Develop UI Components**
   - Tingkatkan `RichTextEditorWithAutosave`
   - Perbarui `DocumentHeader` dengan UI draft management
   - Buat `DraftRecoveryDialog`

### Phase 4: Testing & Optimization (2-3 hari)

1. **Unit Testing**

   - Test services, hooks, dan utilities

2. **Integration Testing**

   - Test interaksi antar komponen
   - Test alur pengguna end-to-end

3. **Performance Optimization**
   - Profiling dan optimization
   - Penanganan edge cases

## Pertimbangan Tambahan

### PostgreSQL vs MongoDB

Kita akan tetap menggunakan PostgreSQL dengan tipe data JSONB untuk menyimpan konten editor, karena:

1. Sudah terintegrasi dengan baik dalam arsitektur yang ada
2. PostgreSQL JSONB mendukung query dan indexing pada struktur JSON
3. Tiptap mendukung format JSON yang kompatibel dengan PostgreSQL
4. Meminimalisir perubahan infrastruktur

### WebSocket Consideration

Untuk fitur collaborative editing di masa depan (bukan bagian dari implementasi ini), WebSocket dapat digunakan untuk:

1. Real-time updates untuk collaborative editing
2. Notifikasi perubahan real-time

Implementasi WebSocket akan memerlukan:

- Setup server Socket.io atau pusher
- Client-side listeners dan event handlers
- Handling reconnect dan error scenarios

### Integrasi dengan Fitur Lain

#### Note = saat ini tidak akan dikerjakan

1. **Versioning**:

   - Draft tidak menambah versi baru sampai dipublikasikan
   - Setelah publikasi, versi baru dibuat dengan `version` increment

2. **Notifications**:

   - Notifikasi user lain saat halaman sedang diedit (future enhancement)
   - Notifikasi saat draft dipulihkan setelah error

3. **User Activity Tracking**:

   - Track siapa yang membuat draft dan kapan (`authorId` dan `draftSavedAt`)
   - Track siapa yang terakhir mengedit (`lastEditBy`)

4. **User Team Collaboration**:
   - Pakai [ @tiptap/extension-collaboration ] + Yjs jika butuh real-time kolaborasi.
   - Untuk auto-save, panggil Y.encodeStateAsUpdate (delta) atau editor.getJSON() (full) secara periodik (debounce), lalu kirim ke server.

## File Referensi

### Komponen dan File yang Diperbarui

1. **Schema dan Database**

   - `prisma/schema.prisma` - Update model ModulePage dengan field-field draft

2. **Service Layer**

   - `features/manage-module/services/modulePageService.ts` - Tambah fungsi draft operations

3. **API Routes**

   - `app/api/module/[id]/pages/[pageId]/route.ts` - Update untuk support draft
   - `app/api/module/[id]/pages/[pageId]/draft/route.ts` - Baru, untuk operasi draft

4. **Adapter Layer**

   - `features/manage-module/adapters/modulePageAdapter.ts` - Tambah metode draft operations

5. **Hooks Layer**

   - `features/manage-module/hooks/useRichTextAutosave.ts` - Enhance autosave
   - `features/manage-module/hooks/useModulePageData.ts` - Tambah operations draft

6. **Context Layer**

   - `features/manage-module/context/ModulePageCRUDContext.tsx` - Update state dan handler

7. **Components Layer**

   - `features/manage-module/components/RichTextEditorWithAutosave.tsx` - Update UI
   - `features/manage-module/components/DocumentHeader.tsx` - Tambah indikator
   - `features/manage-module/components/UnsavedChangesDialog.tsx` - Baru, untuk konfirmasi saat navigasi

8. **Utilities**

   - `features/manage-module/lib/DraftFeedbackService.ts` - Baru, untuk status feedback
   - `features/manage-module/lib/ConcurrentEditingService.ts` - Baru, untuk concurrent editing

9. **Concurrent Editing**
   - `features/manage-module/components/ActiveEditorIndicator.tsx` - Baru, indikator user aktif
   - `features/manage-module/components/ConflictResolutionDialog.tsx` - Baru, dialog konflik

### Dokumentasi Referensi

1. **Tiptap Documentation**

   - https://tiptap.dev/docs/editor/getting-started/
   - https://tiptap.dev/docs/collaboration/getting-started/overview

2. **Confluence Documentation**

   - Confluence User Guide - Editor dan Drafts section
   - Atlassian Design System guidelines

3. **Web APIs**

   - Navigator.onLine API documentation
   - Page Visibility API documentation
   - beforeunload event documentation

4. **UI/UX Patterns**
   - Status indicators best practices
   - Collaborative editing UX patterns
   - Error handling dan recovery patterns

## Dokumentasi & Training

1. **Dokumentasi Teknis**:

   - Flowchart autosave process
   - Diagram interaksi antar komponen
   - API documentation

2. **Dokumentasi Pengguna**:

   - Panduan penggunaan fitur draft
   - FAQ untuk troubleshooting

3. **Developer Training**:
   - Workshop tentang penggunaan hooks dan context
   - Panduan kontribusi untuk fitur-fitur terkait
