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

## 11. Test Tambahan untuk Debugging dan Masalah Integrasi

### 11.1 Data Flow Test Suite

#### 11.1.1 Test Case: API ke UI data flow

**Tujuan**: Memastikan data dari API benar-benar sampai ke komponen UI

**Skenario**:

1. Mock API response dengan data lengkap (seperti contoh response API)
2. Render `ModulePageEditor` dengan context providers
3. Verifikasi data di context sudah sesuai dengan API response
4. Verifikasi `SidebarContent` menerima pages dari context
5. Verifikasi rendering daftar halaman di sidebar dengan data yang benar

**File yang terlibat**:

- `ModulePageEditor.tsx`
- `SidebarContent.tsx`
- `ModulePageCRUDContext.tsx`
- `useModulePageQuery.ts`

**Test Code Outline**:

```typescript
test('loads module page data from API and displays in sidebar', async () => {
  // Setup mock API response dengan data dari contoh
  server.use(
    rest.get('/api/module/:moduleId/pages', (req, res, ctx) => {
      return res(ctx.json({
        success: true,
        data: [
          {
            id: "ff006ad1-939f-43dd-82a7-20623f4494b2",
            moduleId: "e82e800c-93f5-48ef-b17b-2dfe5624f4fb",
            title: "Halaman Baru 1",
            order: 1,
            status: "DRAFT",
            createdAt: "2025-05-23T08:57:01.575Z",
            updatedAt: "2025-05-23T12:07:13.365Z",
            blocks: []
          },
          // ... data lainnya
        ],
        meta: {
          currentPage: 1,
          pageSize: 10,
          totalItems: 3,
          totalPages: 1
        }
      }))
    })
  )

  // Render komponen dengan context
  const { findAllByText } = renderWithProviders(<ModulePageEditor />)

  // Tunggu data dimuat dan sidebar dirender
  const pageItems = await findAllByText("Halaman Baru 1")

  // Verifikasi jumlah item sesuai dengan data API (3 item)
  expect(pageItems.length).toBe(3)
})
```

### 11.2 Component Interaction Test Suite

#### 11.2.1 Test Case: Context Provider Data Propagation

**Tujuan**: Memastikan data dari context provider benar-benar sampai ke komponen child

**Skenario**:

1. Setup mock data di ModulePageCRUDProvider
2. Render SidebarContent dengan provider
3. Verifikasi SidebarContent menerima dan menggunakan data dengan benar

**File yang terlibat**:

- `ModulePageCRUDContext.tsx`
- `SidebarContent.tsx`

**Test Code Outline**:

```typescript
test('passes data from context provider to SidebarContent correctly', async () => {
  // Setup mock pages data
  const mockPages = [
    {
      id: "test-page-1",
      title: "Test Page 1",
      moduleId: "test-module",
      order: 1,
      status: "DRAFT",
      createdAt: new Date(),
      updatedAt: new Date(),
      blocks: []
    }
  ]

  // Render dengan mock provider
  const { getByText } = render(
    <ModulePageCRUDProvider moduleId="test-module" mockValues={{ pages: mockPages }}>
      <SidebarContent
        expandedItems={{ ModuleContent: true }}
        toggleExpand={() => {}}
      />
    </ModulePageCRUDProvider>
  )

  // Verifikasi item muncul di SidebarContent
  expect(getByText("Test Page 1")).toBeInTheDocument()
})
```

### 11.3 Create Page Test Suite

#### 11.3.1 Test Case: handleCreatePage function end-to-end

**Tujuan**: Memastikan fungsi handleCreatePage bekerja dengan benar dari UI hingga API call

**Skenario**:

1. Mock API untuk create page (POST)
2. Render SidebarContent dengan providers
3. Klik tombol "Tambah Halaman"
4. Verifikasi loading state muncul
5. Verifikasi API call dilakukan dengan parameter yang benar
6. Verifikasi halaman baru ditambahkan ke sidebar
7. Verifikasi navigasi ke halaman baru

**File yang terlibat**:

- `SidebarContent.tsx`
- `ModulePageCRUDContext.tsx`
- `useModulePageCRUD.ts`

**Test Code Outline**:

```typescript
test('creates new page and navigates to it when Add Page button is clicked', async () => {
  // Setup mock untuk createPage API
  const createPageMock = jest.fn().mockResolvedValue({
    success: true,
    data: {
      id: "new-page-id",
      title: "Halaman Baru 1",
      moduleId: "test-module",
      order: 1,
      status: "DRAFT",
      createdAt: new Date(),
      updatedAt: new Date(),
      blocks: []
    }
  })

  // Mock router
  const mockRouter = { push: jest.fn() }

  // Render dengan mocks
  const { getByText, findByText } = renderWithMockProviders(
    <SidebarContent
      expandedItems={{ ModuleContent: true }}
      toggleExpand={() => {}}
    />,
    {
      createPage: createPageMock,
      router: mockRouter
    }
  )

  // Klik tombol tambah halaman
  fireEvent.click(getByText("Tambah Halaman"))

  // Verifikasi loading state
  expect(await findByText("Membuat halaman...")).toBeInTheDocument()

  // Verifikasi API call
  expect(createPageMock).toHaveBeenCalledWith(expect.objectContaining({
    title: "Halaman Baru 1",
    moduleId: "test-module"
  }))

  // Verifikasi navigasi
  expect(mockRouter.push).toHaveBeenCalledWith(
    expect.stringContaining("new-page-id")
  )
})
```

### 11.4 Error State and Loading Test Suite

#### 11.4.1 Test Case: API Error State in SidebarContent

**Tujuan**: Memastikan SidebarContent menampilkan UI yang tepat saat API error

**Skenario**:

1. Mock API untuk mengembalikan error
2. Render SidebarContent dengan providers
3. Verifikasi pesan error ditampilkan
4. Verifikasi UI menangani error dengan benar

**File yang terlibat**:

- `SidebarContent.tsx`
- `ModulePageCRUDContext.tsx`
- `useModulePageQuery.ts`

**Test Code Outline**:

```typescript
test('displays appropriate error state when API fails', async () => {
  // Setup mock API error
  server.use(
    rest.get('/api/module/:moduleId/pages', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: "Server error" }))
    })
  )

  // Render komponen
  const { findByText } = renderWithProviders(<SidebarContent
    expandedItems={{ ModuleContent: true }}
    toggleExpand={() => {}}
  />)

  // Verifikasi pesan error
  expect(await findByText("Tidak ada halaman ditemukan")).toBeInTheDocument()
})
```

#### 11.4.2 Test Case: Initial Loading State

**Tujuan**: Memastikan loading state ditampilkan dengan benar saat data dimuat

**Skenario**:

1. Mock API untuk menunda response
2. Render ModulePageEditor dengan providers
3. Verifikasi loading state ditampilkan
4. Setelah data dimuat, verifikasi content ditampilkan

**File yang terlibat**:

- `ModulePageEditor.tsx`
- `SidebarContent.tsx`
- `ModulePageCRUDContext.tsx`

**Test Code Outline**:

```typescript
test('displays loading state while fetching data', async () => {
  // Setup delayed API response
  server.use(
    rest.get('/api/module/:moduleId/pages', async (req, res, ctx) => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return res(ctx.json({ success: true, data: [] }))
    })
  )

  // Render komponen
  const { getByTestId, findByText } = renderWithProviders(
    <ModulePageEditor isLoading={true} />
  )

  // Verifikasi loading skeleton ditampilkan
  expect(getByTestId("module-page-skeleton")).toBeInTheDocument()

  // Verifikasi content muncul setelah loading
  expect(await findByText("Belum ada halaman")).toBeInTheDocument()
})
```

### 11.5 Page Data Transformation Test Suite

#### 11.5.1 Test Case: Data transformasi dari API ke UI model

**Tujuan**: Memastikan data dari API ditransformasi dengan benar ke model yang digunakan UI

**Skenario**:

1. Mock data API dengan format yang kompleks
2. Render komponen dengan providers
3. Verifikasi data ditransformasi dengan benar
4. Verifikasi UI menampilkan data dengan format yang benar

**File yang terlibat**:

- `useModulePageQuery.ts`
- `useModulePageCRUD.ts`
- `ModulePageCRUDContext.tsx`

**Test Code Outline**:

```typescript
test('transforms API data correctly for UI components', async () => {
  // Setup mock API response dengan data kompleks (termasuk blocks)
  const complexApiData = {
    success: true,
    data: [
      {
        id: "test-page",
        moduleId: "test-module",
        title: "Test Page",
        order: 1,
        status: "DRAFT",
        blocks: [
          {
            type: "TEXT",
            content: JSON.stringify({
              type: "doc",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Test content" }] }]
            })
          }
        ],
        createdAt: "2025-05-23T08:57:01.575Z",
        updatedAt: "2025-05-23T12:07:13.365Z"
      }
    ]
  }

  // Mock API call
  server.use(
    rest.get('/api/module/:moduleId/pages', (req, res, ctx) => {
      return res(ctx.json(complexApiData))
    })
  )

  // Render komponen yang menggunakan data
  const { findByText } = renderWithProviders(
    <TestComponent />
  )

  // Verifikasi data ditampilkan dengan benar
  expect(await findByText("Test Page")).toBeInTheDocument()

  // Verifikasi transformasi data (misal: date formatting, content parsing)
  // Ini membutuhkan komponen test khusus yang menampilkan data yang ditransformasi
})
```

### 11.6 Edge Cases Test Suite

#### 11.6.1 Test Case: Navigasi dengan Zero Pages

**Tujuan**: Memastikan aplikasi menangani kasus ketika tidak ada halaman modul

**Skenario**:

1. Mock API untuk mengembalikan array kosong
2. Render ModulePageEditor
3. Verifikasi UI menampilkan state "tidak ada halaman"
4. Verifikasi tombol navigasi dinonaktifkan
5. Verifikasi create page masih berfungsi

**File yang terlibat**:

- `ModulePageEditor.tsx`
- `ModulePageFooterNav.tsx`
- `SidebarContent.tsx`

**Test Code Outline**:

```typescript
test('handles zero pages state correctly', async () => {
  // Setup empty pages API response
  server.use(
    rest.get('/api/module/:moduleId/pages', (req, res, ctx) => {
      return res(ctx.json({ success: true, data: [] }))
    })
  )

  // Render komponen
  const { findByText, getByText } = renderWithProviders(<ModulePageEditor />)

  // Verifikasi pesan "tidak ada halaman"
  expect(await findByText("Belum ada halaman")).toBeInTheDocument()

  // Klik tombol create page
  fireEvent.click(getByText("Tambah Halaman"))

  // Verifikasi create page dipanggil
  // (Butuh setup tambahan untuk mock createPage)
})
```

#### 11.6.2 Test Case: Race Condition saat Multiple API Calls

**Tujuan**: Memastikan aplikasi menangani kasus ketika multiple API calls terjadi bersamaan

**Skenario**:

1. Mock API dengan response time yang berbeda
2. Trigger multiple API calls bersamaan
3. Verifikasi aplikasi menangani race condition dengan benar

**File yang terlibat**:

- `useModulePageCRUD.ts`
- `ModulePageCRUDContext.tsx`
- `SidebarContent.tsx`

**Test Code Outline**:

```typescript
test('handles race conditions with multiple API calls', async () => {
  // Setup mocks dengan response time yang berbeda
  const slowCreateMock = jest.fn().mockImplementation(() =>
    new Promise(resolve => setTimeout(() => resolve({
      success: true,
      data: { id: "slow-page", title: "Slow Page" }
    }), 200))
  )

  const fastCreateMock = jest.fn().mockImplementation(() =>
    new Promise(resolve => setTimeout(() => resolve({
      success: true,
      data: { id: "fast-page", title: "Fast Page" }
    }), 50))
  )

  // Render komponen dengan context yang menggunakan mocks
  const { getAllByText } = renderWithTestContext(<TestComponent />, {
    createPageMocks: [slowCreateMock, fastCreateMock]
  })

  // Trigger multiple API calls
  fireEvent.click(getAllByText("Create Page")[0])
  fireEvent.click(getAllByText("Create Page")[1])

  // Fast-forward timers dan verifikasi state akhir
  jest.advanceTimersByTime(250)

  // Verifikasi state handling yang benar
  // (Implementasi spesifik tergantung bagaimana kode menangani race condition)
})
```
