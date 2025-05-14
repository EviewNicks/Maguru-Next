# Penyempurnaan Aksesibilitas (A11y) - Rencana Implementasi

## 1. Pendahuluan

Penyempurnaan aksesibilitas (A11y) pada editor modul multi-page bertujuan untuk membuat aplikasi dapat digunakan oleh semua pengguna, termasuk mereka yang memiliki keterbatasan fisik dan kognitif. Implementasi ini meliputi penambahan ARIA labels, pengelolaan fokus yang tepat, dan penyesuaian lainnya untuk memastikan bahwa aplikasi dapat diakses menggunakan berbagai perangkat input.

## 2. Analisis Kebutuhan

### 2.1 Komponen-komponen yang Membutuhkan Penyempurnaan A11y

1. **ModulePageEditor**

   - Pengelolaan fokus saat navigasi antar halaman
   - ARIA label untuk elemen dinamis
   - Pesan pembacaan screen reader untuk status penyimpanan

2. **RichTextEditor (TipTap)**

   - ARIA label untuk toolbar dan ikon
   - Dukungan keyboard untuk semua operasi formatting
   - Pesan status yang dapat dibaca screen reader

3. **ModulePageSidebar**

   - ARIA label untuk toggle sidebar
   - Penanganan fokus saat membuka/menutup sidebar
   - Navigasi keyboard dalam struktur halaman

4. **Dialog dan Modal**
   - ARIA label untuk semua dialog
   - Trap focus dalam dialog terbuka
   - ESC key untuk menutup dialog

### 2.2 Standar dan Guidelines

- WCAG 2.1 Level AA compliance
- WAI-ARIA 1.1 best practices
- Keyboard accessibility
- Screen reader compatibility (NVDA, JAWS, VoiceOver)

## 3. Rencana Implementasi

### 3.1 Penambahan ARIA Labels

#### ModulePageEditor

```tsx
// Contoh implementasi
<div
  role="region"
  aria-label="Editor konten modul"
  aria-describedby="editor-description"
>
  <div id="editor-description" className="sr-only">
    Editor untuk mengedit konten halaman modul. Gunakan Ctrl+B untuk menebalkan teks, Ctrl+I untuk memiringkan teks.
  </div>
  <RichTextEditor />
</div>

// Status penyimpanan dengan ARIA live region
<div aria-live="polite" className="sr-only">
  {saveStatus === 'saving' && 'Sedang menyimpan...'}
  {saveStatus === 'saved' && 'Perubahan telah disimpan'}
  {saveStatus === 'unsaved' && 'Perubahan belum disimpan'}
</div>
```

#### Toolbar Icons

```tsx
<button
  onClick={handleBold}
  aria-label="Tebalkan teks"
  aria-pressed={editor.isActive('bold')}
>
  <BoldIcon />
</button>
```

### 3.2 Pengelolaan Fokus

#### Focus Management saat Navigasi

```tsx
// Implementasi useEffect untuk mengelola fokus saat navigasi
useEffect(() => {
  if (activePage) {
    // Set fokus pada editor saat halaman berubah
    editorRef.current?.focus()
  }
}, [activePage?.id])
```

#### Trap Focus dalam Dialog

```tsx
// Menggunakan FocusTrap untuk memastikan fokus tetap dalam dialog
import { FocusTrap } from '@/components/ui/focus-trap'
;<FocusTrap active={isShortcutHelpOpen}>
  <ShortcutHelp isOpen={isShortcutHelpOpen} onClose={handleClose} />
</FocusTrap>
```

### 3.3 Keyboard Navigation

#### Tab Index dan Navigasi

```tsx
// Memastikan urutan tab yang logis
<div tabIndex={0} onKeyDown={handleKeyDown}>
  <SidebarItem />
</div>
```

#### Skip Links

```tsx
// Menambahkan skip link untuk navigasi cepat
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:p-4 z-50"
>
  Skip to main content
</a>
```

### 3.4 Testing Aksesibilitas

#### Unit Test dengan jest-axe

```ts
import { axe } from 'jest-axe';

test('ModulePageEditor passes accessibility tests', async () => {
  const { container } = render(<ModulePageEditor moduleId="1" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

#### Manual Testing dengan Screen Reader

- Pengujian dengan NVDA dan VoiceOver untuk memastikan semua elemen dapat dibaca dengan benar
- Validasi navigasi keyboard untuk semua fitur utama

## 4. Komponen yang akan Dibuat/Diubah

### 4.1 Components

- `FocusTrap.tsx`: Komponen untuk trap focus dalam dialog modal
- `SkipLink.tsx`: Komponen untuk skip link
- `A11yAnnouncer.tsx`: Komponen untuk mengumumkan perubahan status ke screen reader

### 4.2 Custom Hooks

- `useFocusManagement.ts`: Hook untuk mengelola fokus berdasarkan perubahan state
- `useA11yKeyboard.ts`: Hook untuk menambahkan navigasi keyboard khusus aksesibilitas

### 4.3 Utils

- `a11yUtils.ts`: Fungsi utilitas untuk ARIA labels dan pengelolaan aksesibilitas

## 5. Langkah Implementasi

1. **Audit Aksesibilitas**

   - Jalankan lighthouse dan axe untuk mengidentifikasi masalah
   - Dokumentasikan masalah yang ditemukan

2. **Perbaikan ModulePageEditor**

   - Tambahkan ARIA labels
   - Implementasi pengelolaan fokus
   - Tambahkan live regions untuk status

3. **Perbaikan RichTextEditor**

   - Tambahkan ARIA untuk semua tombol toolbar
   - Pastikan semua fungsi dapat diakses via keyboard

4. **Perbaikan ModulePageSidebar**

   - Tambahkan ARIA untuk toggle sidebar
   - Tambahkan keyboard shortcuts untuk navigasi sidebar

5. **Implementasi Dialog A11y**

   - Buat FocusTrap component
   - Terapkan pada semua dialog

6. **Testing**
   - Unit test dengan jest-axe
   - Manual testing dengan screen reader
   - Keyboard navigation testing

## 6. Metrik Keberhasilan

- **WCAG Compliance**: Minimal WCAG 2.1 level AA
- **Lighthouse Score**: Minimal 90 untuk aksesibilitas
- **Code Coverage**: 85%+ untuk unit test komponen aksesibilitas
- **Screen Reader Compatibility**: Berhasil diuji dengan NVDA, JAWS, dan VoiceOver

## 7. Timeline

1. **Audit dan Identifikasi Masalah**: 1 hari
2. **Implementasi ARIA Labels**: 1 hari
3. **Implementasi Focus Management**: 1 hari
4. **Keyboard Navigation**: 1 hari
5. **Testing dan Perbaikan**: 1 hari

Total: 5 hari kerja

## 8. Resource dan Referensi

- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Authoring Practices 1.1](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [Axe Core React](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/react)
- [Jest Axe](https://github.com/nickcolley/jest-axe)
