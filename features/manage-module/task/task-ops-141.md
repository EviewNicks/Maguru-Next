# [OPS-141] Implementasi Fitur Auto-save Draft

## Deskripsi Task

Mengimplementasikan fitur auto-save draft untuk editor konten halaman modul, mirip dengan fitur yang ada di Confluence. Fitur ini memungkinkan pengguna untuk memiliki draft yang disimpan otomatis saat mengedit halaman, tanpa mempengaruhi versi yang dipublikasikan.

## Status Implementasi

- [x] Database Schema Update
- [x] Server-side API Implementation
- [x] Client-side Auto-save Implementation
- [x] UI Status Indicators
- [x] Testing dan Validasi
- [x] Dokumentasi

## Detail Implementasi

### 1. Database Schema Update

Menambahkan field-field berikut pada model `ModulePage` di Prisma:

```prisma
model ModulePage {
  // Existing fields...

  // New fields for draft functionality
  authorId    String?      // User yang membuat halaman
  lastEditBy  String?      // User terakhir yang mengedit
  draftData   Json?        // Data draft terpisah dari konten published
  draftSavedAt DateTime?   // Timestamp terakhir draft disimpan
  isDraft     Boolean      @default(false) // Flag jika ini versi draft
  hasUnpublishedChanges Boolean @default(false) // Flag jika ada perubahan yang belum dipublish
}
```

### 2. Server-side API Implementation

Menambahkan endpoint API baru untuk mengelola draft:

- **POST `/api/module/[id]/pages/[pageid]/draft`**: Menyimpan draft
- **GET `/api/module/[id]/pages/[pageid]/draft`**: Mendapatkan draft
- **PATCH `/api/module/[id]/pages/[pageid]/draft`**: Mempublikasikan draft
- **DELETE `/api/module/[id]/pages/[pageid]/draft`**: Membuang draft

Implementasi service layer di `modulePageService.ts` dengan fungsi-fungsi:

- `saveDraft(pageId, draftData, authorId)`: Menyimpan draft
- `getDraft(pageId)`: Mendapatkan draft
- `publishDraft(pageId)`: Mempublikasikan draft
- `discardDraft(pageId)`: Membuang draft

### 3. Client-side Auto-save Implementation

Mengembangkan hook `useRichTextAutosave` dengan fitur:

- Debounced save (menyimpan setelah pengguna berhenti mengetik selama 5 detik)
- Throttled save (maksimal satu penyimpanan setiap 30 detik)
- Save berbasis event (blur, tab/window fokus hilang, sebelum navigasi)
- Status penyimpanan (saved, saving, unsaved, error, offline)

### 4. UI Status Indicators

Implementasi UI status untuk memberikan feedback ke pengguna:

- **Saved**: Ikon checkmark hijau dengan label "Tersimpan" + timestamp
- **Saving**: Animasi loading dengan label "Menyimpan..."
- **Unsaved**: Indikator warna amber dengan label "Belum tersimpan"
- **Error**: Indikator merah dengan label "Gagal menyimpan" dan tombol "Coba lagi"
- **Offline**: Indikator dengan label "Anda offline"

### 5. Testing dan Validasi

Implementasi pengujian untuk fitur auto-save:

- Unit test untuk hooks dan utilities
- Integration test untuk API dan interaksi komponen
- Manual testing untuk user flow

Hasil pengujian API:

1. **POST `/api/module/[id]/pages/[pageid]/draft`**: Status 200 OK
2. **GET `/api/module/[id]/pages/[pageid]/draft`**: Status 200 OK
3. **PATCH `/api/module/[id]/pages/[pageid]/draft`**: Status 200 OK
4. **DELETE `/api/module/[id]/pages/[pageid]/draft`**: Status 200 OK

### 6. File yang Dimodifikasi/Dibuat

#### Database & Schema:

- `prisma/schema.prisma`: Update model ModulePage

#### API & Service Layer:

- `app/api/module/[id]/pages/[pageid]/draft/route.ts`: Implementasi API endpoints
- `features/manage-module/services/modulePageService.ts`: Implementasi service layer

#### Client-side:

- `features/manage-module/hooks/useRichTextAutosave.ts`: Hook untuk auto-save
- `features/manage-module/components/RichTextEditorWithAutosave.tsx`: Komponen editor dengan indikator status
- `features/manage-module/adapters/modulePageAdapter.ts`: Adapter untuk komunikasi dengan API

#### Testing:

- `features/manage-module/__tests__/__mocks__/mockDraftPages.ts`: Mock data untuk draft
- `features/manage-module/__tests__/__mocks__/mockDraftHandlers.ts`: Mock handlers untuk API draft
- `features/manage-module/__tests__/integration/module-page/draft-operations.integration.test.tsx`: Testing operasi draft
- `features/manage-module/__tests__/integration/module-page/auto-save.integration.test.tsx`: Testing fungsi auto-save
- `features/manage-module/__tests__/integration/module-page/rich-text-autosave.integration.test.tsx`: Testing komponen UI

### 7. Diagram Workflow

flowchart TD
subgraph "Client Side"
A[Editor Tiptap] -->|Perubahan Konten| B{Auto-save Trigger}
B -->|Debounce 5s| C[useRichTextAutosave Hook]
B -->|Throttle 30s| C
B -->|Event: Blur| C
B -->|Event: Visibility Change| C
B -->|Event: Before Unload| C
C -->|Menyimpan Draft| D[modulePageAdapter.saveDraft]
C -->|Status: Saving| J[UI Feedback]
D -->|Request| E[API Route]
E -->|Response| F[Handle Response]
F -->|Success| G[Update State]
F -->|Error| H[Handle Error]
G -->|Status: Saved| J
H -->|Status: Error| J
H -->|Status: Offline| J
end

    subgraph "Server Side"
        E -->|POST| K[Draft API Handler]
        K -->|Process| L[modulePageService.saveDraft]
        L -->|Save| M[(Database)]
        M -->|Result| N[Format Response]
        N -->|JSON| E
    end

    subgraph "Draft Management"
        O[User Action] -->|Get Draft| P[modulePageAdapter.getDraft]
        O -->|Publish Draft| Q[modulePageAdapter.publishDraft]
        O -->|Discard Draft| R[modulePageAdapter.discardDraft]

        P -->|Request| S[API GET /draft]
        Q -->|Request| T[API PATCH /draft]
        R -->|Request| U[API DELETE /draft]

        S -->|Process| V[modulePageService.getDraft]
        T -->|Process| W[modulePageService.publishDraft]
        U -->|Process| X[modulePageService.discardDraft]

        V -->|Database Query| M
        W -->|Database Update| M
        X -->|Database Update| M
    end

### 7. Pengalaman Pengguna

Pengguna akan mengalami:

1. Penyimpanan draft otomatis saat mengedit, tanpa perlu klik tombol "Simpan"
2. Indikator status yang jelas tentang status penyimpanan
3. Kemampuan untuk mempublikasikan draft atau membuangnya
4. Draft yang aman dari crash browser atau kehilangan koneksi

### 8. Challenges dan Solutions

#### Challenge 1: Concurrent Editing

- **Solusi**: Implementasi tracking `lastEditBy` dan `draftSavedAt` untuk mendeteksi konflik

#### Challenge 2: Network Interruptions

- **Solusi**: Deteksi status offline dan UI feedback yang jelas, dengan opsi retry

#### Challenge 3: Handling Large Documents

- **Solusi**: Format data JSON terstruktur dengan PostgreSQL JSONB untuk efisiensi

## Referensi

- [Confluence Auto-save Documentation](https://confluence.atlassian.com/alldoc/confluence-documentation-directory-12877996.html)
- [Tiptap Documentation](https://tiptap.dev/docs/editor/getting-started/overview)

## Kontributor

- Team: Backend & Frontend
- Reviewer: Tech Lead
