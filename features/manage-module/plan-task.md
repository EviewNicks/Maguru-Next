# Integration Testing Plan untuk Modul Pembelajaran

## 1. Pendahuluan

Dokumen ini menggambarkan rencana pengujian integrasi (integration testing) untuk fitur modul pembelajaran dalam aplikasi Maguru. Pengujian integrasi bertujuan untuk memastikan bahwa berbagai komponen aplikasi berinteraksi dengan benar dan menghasilkan alur kerja yang diharapkan sesuai dengan persyaratan.

## 2. Tujuan Pengujian Integrasi

- Memverifikasi interaksi antar komponen aplikasi berfungsi dengan benar
- Mendeteksi bug pada alur kerja pengelolaan modul pembelajaran
- Memastikan penanganan state pada konteks aplikasi berjalan dengan baik
- Memvalidasi optimasi API calls telah berjalan sesuai harapan
- Menyediakan kepercayaan pada alur kerja editor modul

## 3. Lingkup Pengujian

### 3.1 Komponen Utama yang Diuji

1. **Page & Layout**

   - `app/(admin)/manage-module/pages/[moduleId]/page.tsx`
   - `app/(admin)/manage-module/pages/[moduleId]/layout.tsx`

2. **Komponen UI**

   - `ModulePageEditor.tsx`
   - `ModulePageSidebar.tsx`
   - `RichTextEditor.tsx`
   - `RichTextEditorWithAutosave.tsx`
   - `DocumentHeader.tsx`

3. **Konteks & Hooks**
   - `ModulePageCRUDContext.tsx`
   - `useModulePageCRUD.ts`
   - `useModulePageQuery.ts`
   - `useRichTextAutosave.ts`

### 3.2 Alur Kerja yang Diuji

1. Navigasi antar halaman modul
2. Pembuatan, pengeditan, dan penghapusan halaman
3. Interaksi dengan editor teks kaya (RichText)
4. Autosave konten editor
5. Optimasi API calls untuk mengurangi beban server

## 4. Strategi Pengujian

### 4.1 Testing Framework & Tools

- **Framework**: Jest
- **Testing Library**: React Testing Library
- **Mock Service Worker (MSW)**: Untuk mocking API calls
- **Test-Utils**: Utilitas testing custom untuk memudahkan setup

### 4.2 Lingkungan Pengujian

- **Development**: Lokal, dengan msw untuk mocking API
- **CI/CD**: GitHub Actions, dengan setup serupa

### 4.3 Pendekatan Mocking

- Mock seluruh API calls menggunakan MSW
- Mock hooks utama yang mengakses API secara langsung
- Simulasi interaksi pengguna dan state aplikasi

## 5. Test Cases

### 5.1 Navigation Test Suite

#### 5.1.1 Test Case: Navigasi antar halaman modul

**Tujuan**: Memastikan navigasi antar halaman modul berfungsi dengan benar

**Skenario**:

1. Load halaman editor modul
2. Klik halaman di sidebar
3. Verifikasi halaman yang aktif berubah
4. Verifikasi content editor berubah
5. Verifikasi state global diperbarui dengan benar

**File yang terlibat**:

- `ModulePageEditor.tsx`
- `ModulePageSidebar.tsx`
- `ModulePageCRUDContext.tsx`
- `ModulePageFooterNav.tsx`

**Test Code Outline**:

```typescript
test('navigates between pages correctly when clicking in sidebar', async () => {
  // Setup MSW handlers untuk API responses
  // Render komponen dengan context providers
  // Tunggu halaman pertama dimuat
  // Klik halaman kedua di sidebar
  // Verifikasi state diperbarui dan content berubah
  // Verifikasi UI menampilkan halaman yang benar
})
```

#### 5.1.2 Test Case: Navigasi menggunakan footer navigation

**Tujuan**: Memastikan tombol navigasi next/prev berfungsi dengan benar

**Skenario**:

1. Load halaman editor modul
2. Klik tombol "Next Page"
3. Verifikasi navigasi ke halaman berikutnya
4. Klik tombol "Previous Page"
5. Verifikasi navigasi kembali ke halaman sebelumnya

**File yang terlibat**:

- `ModulePageFooterNav.tsx`
- `ModulePageCRUDContext.tsx`

### 5.2 Content Editing Test Suite

#### 5.2.1 Test Case: Editor content loading & saving

**Tujuan**: Memastikan konten editor dimuat dan disimpan dengan benar

**Skenario**:

1. Load halaman editor dengan mock data
2. Verifikasi konten editor dimuat dengan benar
3. Edit konten editor
4. Verifikasi autosave berjalan
5. Verifikasi API call untuk save dilakukan dengan benar

**File yang terlibat**:

- `RichTextEditor.tsx`
- `RichTextEditorWithAutosave.tsx`
- `useRichTextAutosave.ts`
- `ModulePageCRUDContext.tsx`

**Test Code Outline**:

```typescript
test('loads and saves editor content correctly', async () => {
  // Setup mock API responses
  // Render komponen dengan context
  // Verifikasi konten awal dimuat
  // Simulasi perubahan konten editor
  // Verifikasi autosave dipanggil (debounced)
  // Verifikasi API call untuk save dengan parameter yang benar
})
```

#### 5.2.2 Test Case: Document title editing

**Tujuan**: Memastikan pengeditan judul dokumen berfungsi dengan benar

**Skenario**:

1. Load halaman editor
2. Edit judul dokumen
3. Verifikasi judul berubah secara lokal
4. Verifikasi API call untuk update judul dilakukan
5. Verifikasi UI status berubah (saving -> saved)

**File yang terlibat**:

- `DocumentHeader.tsx`
- `ModulePageCRUDContext.tsx`

### 5.3 CRUD Operations Test Suite

#### 5.3.1 Test Case: Create new page

**Tujuan**: Memastikan pembuatan halaman baru berfungsi dengan benar

**Skenario**:

1. Load halaman editor
2. Klik tombol "Create" di header
3. Verifikasi API call untuk create page
4. Verifikasi navigasi ke halaman baru
5. Verifikasi UI diperbarui dengan halaman baru

**File yang terlibat**:

- `DocumentHeader.tsx`
- `ModulePageCRUDContext.tsx`
- `useModulePageCRUD.ts`

#### 5.3.2 Test Case: Delete page

**Tujuan**: Memastikan penghapusan halaman berfungsi dengan benar

**Skenario**:

1. Load halaman editor
2. Klik tombol "Close draft" di header
3. Konfirmasi dialog penghapusan
4. Verifikasi API call untuk delete page
5. Verifikasi navigasi ke halaman lain
6. Verifikasi halaman dihapus dari sidebar

**File yang terlibat**:

- `DocumentHeader.tsx`
- `ModulePageCRUDContext.tsx`
- `useModulePageCRUD.ts`

### 5.4 API Optimization Test Suite

#### 5.4.1 Test Case: Debounced content saving

**Tujuan**: Memastikan optimasi debounce untuk content saving berfungsi

**Skenario**:

1. Load halaman editor
2. Buat multiple perubahan konten berturut-turut
3. Verifikasi hanya satu API call dibuat setelah debounce time
4. Verifikasi content dari perubahan terakhir dikirim ke API

**File yang terlibat**:

- `useRichTextAutosave.ts`
- `ModulePageCRUDContext.tsx`
- `handleEditorChange`

**Test Code Outline**:

```typescript
test('debounces multiple editor changes into one API call', async () => {
  // Setup mock timer dan API response
  // Render komponen dengan context
  // Simulasi perubahan konten berulang
  // Fast-forward timer melewati debounce time
  // Verifikasi hanya satu API call dibuat
  // Verifikasi content yang dikirim adalah perubahan terakhir
})
```

#### 5.4.2 Test Case: Caching data dari context

**Tujuan**: Memastikan data dari context digunakan sebelum API call

**Skenario**:

1. Load halaman editor dengan data di context
2. Navigasi ke halaman lain yang sudah ada di context
3. Verifikasi tidak ada API call baru untuk data halaman
4. Verifikasi data diambil dari context

**File yang terlibat**:

- `RichTextEditorWithAutosave.tsx`
- `ModulePageCRUDContext.tsx`
- `useModulePageQuery.ts`

### 5.5 Error Handling Test Suite

#### 5.5.1 Test Case: API error handling

**Tujuan**: Memastikan error dari API ditangani dengan benar

**Skenario**:

1. Setup API untuk mengembalikan error
2. Load halaman editor
3. Coba edit konten
4. Verifikasi UI menampilkan error state
5. Verifikasi user feedback (notifikasi) ditampilkan

**File yang terlibat**:

- `RichTextEditorWithAutosave.tsx`
- `ModulePageCRUDContext.tsx`
- `useModulePageCRUD.ts`

#### 5.5.2 Test Case: Recovery dari error

**Tujuan**: Memastikan aplikasi dapat pulih dari error

**Skenario**:

1. Setup API untuk error pada permintaan pertama, sukses pada kedua
2. Load halaman editor
3. Coba edit konten (akan error)
4. Coba lagi (seharusnya sukses)
5. Verifikasi UI kembali normal
6. Verifikasi data berhasil disimpan

**File yang terlibat**:

- `useRichTextAutosave.ts`
- `ModulePageCRUDContext.tsx`

## 6. Mock Data

### 6.1 Mock Page Data

```typescript
const mockPages = [
  {
    id: 'page-1',
    title: 'Introduction',
    moduleId: 'module-1',
    order: 1,
    blocks: [
      {
        type: 'text',
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Hello World' }],
            },
          ],
        }),
      },
    ],
    status: 'DRAFT',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'page-2',
    title: 'Getting Started',
    moduleId: 'module-1',
    order: 2,
    blocks: [
      {
        type: 'text',
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Getting Started Content' }],
            },
          ],
        }),
      },
    ],
    status: 'DRAFT',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
```

### 6.2 Mock Context Provider

```typescript
const renderWithMockContext = (ui, { providerProps, ...renderOptions } = {}) => {
  return render(
    <ModulePagesProvider>
      <ModulePageCRUDProvider moduleId="module-1" {...providerProps}>
        {ui}
      </ModulePageCRUDProvider>
    </ModulePagesProvider>,
    renderOptions
  );
};
```

### 6.3 Mock API Handlers

```typescript
const handlers = [
  rest.get('/api/module/:moduleId/pages', (req, res, ctx) => {
    return res(ctx.json({ success: true, data: mockPages }))
  }),

  rest.get('/api/module/:moduleId/pages/:pageId', (req, res, ctx) => {
    const { pageId } = req.params
    const page = mockPages.find((p) => p.id === pageId)
    return res(ctx.json({ success: true, data: page }))
  }),

  rest.put('/api/module/:moduleId/pages/:pageId', (req, res, ctx) => {
    const { pageId } = req.params
    const updatedPage = {
      ...mockPages.find((p) => p.id === pageId),
      ...req.body,
    }
    return res(ctx.json({ success: true, data: updatedPage }))
  }),
]
```

## 7. File Setup

### 7.1 Test Directory Structure

```
features/
└── manage-module/
    └── __tests__/
        ├── __mocks__/
        │   ├── modulePageContext.tsx
        │   ├── mockPages.ts
        │   └── mockHandlers.ts
        ├── integration/
        │   ├── navigation.test.tsx
        │   ├── contentEditing.test.tsx
        │   ├── crudOperations.test.tsx
        │   └── apiOptimization.test.tsx
        └── utils/
            └── testUtils.tsx
```

### 7.2 Setup File

```typescript
// __tests__/utils/testUtils.tsx
import { render } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from '../__mocks__/mockHandlers';
import { ModulePagesProvider } from '../../context/ModulePagesContext';
import { ModulePageCRUDProvider } from '../../context/ModulePageCRUDContext';

export const server = setupServer(...handlers);

// Setup
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

export const renderWithProviders = (
  ui,
  {
    moduleId = 'module-1',
    preloadedState = {},
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <ModulePagesProvider>
      <ModulePageCRUDProvider moduleId={moduleId}>
        {children}
      </ModulePageCRUDProvider>
    </ModulePagesProvider>
  );

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};
```

## 8. Implementasi dan Timeline

### 8.1 Phase 1: Setup dan Mock (1-2 hari)

- Membuat direktori dan file struktur
- Menyiapkan mock data dan handlers
- Membuat utility functions untuk testing

### 8.2 Phase 2: Navigation & Content Tests (2-3 hari)

- Implementasi test cases untuk navigasi
- Implementasi test cases untuk content editing

### 8.3 Phase 3: CRUD & API Optimization Tests (2-3 hari)

- Implementasi test cases untuk CRUD operations
- Implementasi test cases untuk API optimization

### 8.4 Phase 4: Error Handling Tests & Refinement (1-2 hari)

- Implementasi test cases untuk error handling
- Perbaikan dan refinement test cases yang ada

## 9. Referensi Kode

### File-file Kunci untuk Testing

1. **page.tsx** - `/app/(admin)/manage-module/pages/[moduleId]/page.tsx`

   - Entry point aplikasi
   - Query parameter handling
   - Render ModulePageEditor

2. **ModulePageCRUDContext.tsx** - `features/manage-module/context/ModulePageCRUDContext.tsx`

   - State management pusat
   - Handler function untuk berbagai operasi
   - Debounce untuk optimasi

3. **RichTextEditorWithAutosave.tsx** - `features/manage-module/components/RichTextEditorWithAutosave.tsx`

   - Logic auto-save
   - Integrasi dengan context
   - Error handling

4. **useModulePageCRUD.ts** - `features/manage-module/hooks/useModulePageCRUD.ts`

   - API operations
   - State global
   - Optimistic updates

5. **ModulePageSidebar.tsx** - `features/manage-module/components/ModulePageSidebar.tsx`
   - Navigasi antar halaman
   - UI untuk daftar halaman

## 10. Ekspektasi Hasil

Dengan menerapkan test cases di atas, kita dapat:

1. Memastikan alur kerja utama aplikasi berfungsi dengan benar
2. Mendeteksi regresi pada fitur-fitur penting
3. Memverifikasi optimasi API call telah berjalan dengan benar
4. Meningkatkan kepercayaan pada codebase secara keseluruhan

Hasil akhirnya akan berupa suite pengujian yang komprehensif yang dapat dijalankan secara otomatis dalam CI/CD pipeline, yang memberikan jaminan bahwa fitur modul pembelajaran berfungsi dengan benar sebelum direlease ke production.
