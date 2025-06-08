# Test Plan: Mode View dan Edit (Fase 4)

## Pendahuluan

Dokumen ini menjelaskan strategi dan rencana pengujian untuk implementasi baru mode view dan edit pada aplikasi Maguru. Implementasi ini mengadopsi pendekatan Confluence dengan memisahkan komponen untuk mode view dan edit, serta menggunakan routing untuk transisi antar mode.

## Alur Kerja Mode View dan Edit

1. **URL Routing (app/(admin)/manage-module/[moduleId]/page.tsx)**:

   - URL dengan `?mode=view` menampilkan ModulePageView
   - URL dengan `?mode=edit` menampilkan ModulePageEdit
   - Default ke mode view jika parameter tidak ada

2. **Mode View (ModulePageView.tsx)**:

   - Menggunakan ViewHeader untuk navigasi
   - Menggunakan RichTextViewer untuk menampilkan konten statis
   - Menyediakan tombol floating untuk beralih ke mode edit

3. **Mode Edit (ModulePageEdit.tsx)**:

   - Menggunakan EditHeader untuk navigasi dan operasi draft
   - Menggunakan RichTextEditor untuk mengedit konten
   - Menyediakan tombol floating untuk menyimpan dan beralih ke mode view

4. **Rendering Konten (RichTextViewer.tsx)**:
   - Mengkonversi konten JSON dari Tiptap ke HTML statis
   - Menampilkan konten tanpa inisialisasi editor Tiptap

## Unit Tests (Co-location)

### 1. RichTextViewer.test.tsx

#### Test Cases:

- **Rendering komponen dengan benar**

  - Verifikasi komponen merender tanpa error
  - Verifikasi tampilan loading saat isLoading=true
  - Verifikasi tampilan placeholder saat content=null

- **Rendering konten HTML**

  - Verifikasi konten JSON dikonversi ke HTML dengan benar
  - Verifikasi tipe konten berbeda (paragraf, heading, list) dirender dengan benar
  - Verifikasi mark (bold, italic, link) dirender dengan benar

- **Handling error**

  - Verifikasi error saat rendering konten ditangani dengan benar
  - Verifikasi pesan error ditampilkan

- **Fungsi helper**
  - Verifikasi renderTiptapContent menghasilkan HTML yang benar
  - Verifikasi renderInlineContent menghasilkan HTML yang benar
  - Verifikasi renderListItems menghasilkan HTML yang benar

### 2. RichTextEditor.test.tsx

#### Test Cases:

- **Rendering komponen dengan benar**

  - Verifikasi komponen merender tanpa error
  - Verifikasi toolbar editor ditampilkan
  - Verifikasi loading state ditampilkan saat editor belum siap

- **Inisialisasi Editor**

  - Verifikasi editor diinisialisasi dengan konten yang benar
  - Verifikasi editor selalu dalam mode editable
  - Verifikasi callback onEditorReady dipanggil dengan instance editor

- **Autosave dan event handling**

  - Verifikasi handleEditorChange dipanggil saat konten berubah
  - Verifikasi editor menggunakan handleChange untuk autosave
  - Verifikasi editor memanggil onChange prop jika disediakan

- **Cleanup dan memory management**
  - Verifikasi editor.destroy() dipanggil saat komponen unmount
  - Verifikasi tidak ada memory leak setelah unmount

### 3. ModulePageView.test.tsx

#### Test Cases:

- **Rendering komponen dengan benar**

  - Verifikasi ViewHeader ditampilkan
  - Verifikasi ViewContent ditampilkan
  - Verifikasi tombol edit ditampilkan

- **Navigasi ke mode edit**

  - Verifikasi router.push dipanggil dengan URL yang benar saat tombol edit diklik
  - Verifikasi URL mengandung parameter mode=edit

- **ViewContent Component**
  - Verifikasi mengambil data dari context dengan benar
  - Verifikasi RichTextViewer dirender dengan props yang benar
  - Verifikasi loading state ditangani dengan benar

### 4. ModulePageEdit.test.tsx

#### Test Cases:

- **Rendering komponen dengan benar**

  - Verifikasi EditHeader ditampilkan
  - Verifikasi RichTextEditor ditampilkan dengan readOnly=false
  - Verifikasi tombol save ditampilkan

- **Penyimpanan konten dan navigasi**

  - Verifikasi savePage dipanggil dengan konten yang benar saat tombol save diklik
  - Verifikasi router.push dipanggil dengan URL yang benar setelah save
  - Verifikasi toast.success dipanggil setelah save berhasil

- **Error handling**
  - Verifikasi showErrorNotification dipanggil saat save gagal
  - Verifikasi navigasi tetap dilakukan meskipun tidak ada editor

## Integration Tests

### 1. Alur View-Edit.test.tsx

#### Test Cases:

- **Navigasi dari view ke edit**

  - Verifikasi pengguna dapat mengklik tombol edit di mode view
  - Verifikasi URL berubah ke mode=edit
  - Verifikasi komponen ModulePageEdit ditampilkan

- **Navigasi dari edit ke view**

  - Verifikasi pengguna dapat mengklik tombol save di mode edit
  - Verifikasi konten disimpan sebelum navigasi
  - Verifikasi URL berubah ke mode=view
  - Verifikasi komponen ModulePageView ditampilkan

- **Konsistensi data**
  - Verifikasi konten yang diedit di mode edit ditampilkan dengan benar di mode view
  - Verifikasi tidak ada kehilangan data saat beralih antar mode

### 2. URL Routing.test.tsx

#### Test Cases:

- **Parameter URL**

  - Verifikasi URL dengan mode=view menampilkan ModulePageView
  - Verifikasi URL dengan mode=edit menampilkan ModulePageEdit
  - Verifikasi URL tanpa parameter mode defaultnya ke view

- **Parameter pageId**
  - Verifikasi URL tanpa pageId menampilkan pesan untuk memilih halaman
  - Verifikasi URL dengan pageId yang valid menampilkan halaman yang sesuai

## BDD Tests (Behavior-Driven Development)

### Feature: Mode View dan Edit

```gherkin
Feature: Mode View dan Edit
  Sebagai pengguna admin
  Saya ingin dapat melihat dan mengedit halaman modul
  Agar saya dapat mengelola konten modul dengan mudah

  Scenario: Melihat halaman modul
    Given saya berada di halaman modul dengan ID "module-123"
    And halaman memiliki pageId "page-456"
    When halaman dimuat dengan mode "view"
    Then saya melihat konten halaman dalam format yang mudah dibaca
    And saya melihat tombol edit di sudut kanan bawah

  Scenario: Mengedit halaman modul
    Given saya berada di halaman modul dengan ID "module-123"
    And halaman memiliki pageId "page-456"
    When saya mengklik tombol edit
    Then URL berubah ke mode "edit"
    And saya melihat editor rich text dengan toolbar
    And saya melihat tombol save di sudut kanan bawah

  Scenario: Menyimpan perubahan dan kembali ke mode view
    Given saya berada di halaman modul dalam mode edit
    When saya membuat perubahan pada konten
    And saya mengklik tombol save
    Then perubahan disimpan ke server
    And URL berubah ke mode "view"
    And saya melihat notifikasi sukses
    And saya melihat konten yang diperbarui dalam mode view
```

## Performance Tests

### 1. Perbandingan RichTextViewer vs RichTextEditor

#### Test Cases:

- **Waktu loading**

  - Ukur waktu yang dibutuhkan untuk merender RichTextViewer vs RichTextEditor
  - Bandingkan penggunaan memori antara kedua komponen
  - Ukur CPU usage saat merender konten yang sama

- **Rendering konten besar**
  - Ukur performa saat merender dokumen dengan konten yang sangat besar
  - Bandingkan waktu respons dan frame rate antara kedua komponen

## Mock Objects

### 1. ModulePageCRUDContext Mock

```typescript
// ModulePageCRUDContextMock.ts
export const mockModulePageCRUDContext = {
  activePage: {
    id: 'page-123',
    title: 'Test Page',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello World' }],
        },
      ],
    },
  },
  savePage: jest.fn(),
  handleEditorChange: jest.fn(),
  getParsedEditorContent: jest.fn((page) => page.content),
}

export const ModulePageCRUDContextMock = ({
  children,
  customValues = {},
}: {
  children: React.ReactNode
  customValues?: Partial<typeof mockModulePageCRUDContext>
}) => (
  <ModulePageCRUDContext.Provider
    value={{ ...mockModulePageCRUDContext, ...customValues }}
  >
    {children}
  </ModulePageCRUDContext.Provider>
)
```

### 2. Router Mock

```typescript
// RouterMock.ts
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  pathname: '/manage-module/module-123',
  query: { pageId: 'page-456', mode: 'view' },
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams('pageId=page-456&mode=view'),
  useParams: () => ({ moduleId: 'module-123' }),
}))
```

## Implementasi Test

1. **Setup Testing Environment**:

   - Konfigurasi Jest dengan React Testing Library
   - Setup mock untuk Next.js router dan context
   - Setup mock untuk TipTap editor

2. **Test Implementation**:

   - Implementasi unit test untuk setiap komponen
   - Implementasi integration test untuk alur kerja
   - Implementasi performance test dengan React Profiler

3. **Continuous Integration**:
   - Integrasi test ke dalam pipeline CI/CD
   - Konfigurasi GitHub Actions untuk menjalankan test secara otomatis
   - Setup reporting untuk hasil test

## Kesimpulan

Dengan pendekatan testing yang komprehensif ini, kita dapat memastikan bahwa implementasi mode view dan edit berfungsi dengan baik, memberikan pengalaman pengguna yang optimal, dan memiliki performa yang baik. Pendekatan TDD dan BDD membantu kita memastikan bahwa kode memenuhi persyaratan dan berperilaku sesuai harapan.
