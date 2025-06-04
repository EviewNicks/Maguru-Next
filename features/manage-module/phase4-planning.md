# Phase 4: Implementasi Mode View dan Edit pada RichTextEditor

## Ringkasan

Phase 4 berfokus pada pengembangan fungsionalitas mode view dan edit pada komponen `RichTextEditor.tsx` yang terinspirasi dari Confluence. Ini akan memungkinkan pengguna untuk beralih antara mode view (hanya baca) dan mode edit (dengan auto-save) tanpa perlu komponen terpisah.

## Tujuan

1. Mengimplementasikan mode view dan edit dalam satu komponen `RichTextEditor.tsx`
2. Menyediakan transisi yang mulus antara kedua mode
3. Mengintegrasikan fitur draft auto-save yang sudah ada dengan mode edit
4. Menambahkan trigger untuk beralih antar mode (tombol, double-click, keyboard shortcut)
5. Menyesuaikan UI berdasarkan mode yang aktif

## Analisis Implementasi

### 1. Pendekatan Context API untuk State Management

Alih-alih menggunakan props drilling, kita mengimplementasikan state management untuk mode view/edit di `ModuleDraftPageContext.tsx`. Ini memungkinkan komponen-komponen yang membutuhkan informasi mode editor untuk mengaksesnya langsung dari context tanpa perlu passing props melalui komponen parent.

Keuntungan pendekatan ini:

- Mengurangi props drilling
- Memudahkan akses ke state mode dari berbagai komponen
- Konsistensi mode di seluruh aplikasi
- Memudahkan penambahan fitur terkait mode di masa depan

### 2. Komponen yang Perlu Diperbarui

#### ModuleDraftPageContext.tsx

- Menambahkan state `editorMode: 'view' | 'edit'`
- Menambahkan handler `setEditorMode` dan `toggleEditorMode`
- Mengintegrasikan mode dengan fitur draft yang ada

#### RichTextEditor.tsx

- Menggunakan `editorMode` dari context untuk menentukan apakah editor dalam mode readOnly
- Memperbarui `editor.setEditable()` saat mode berubah
- Menampilkan toolbar dan menu hanya dalam mode edit
- Styling berbeda untuk mode view dan edit

#### ModulePageEditor.tsx

- Menambahkan event handler untuk double-click pada container editor
- Menambahkan keyboard shortcut handler untuk toggle mode (e untuk edit, Escape untuk view)
- Memperbarui className pada container editor berdasarkan mode

#### DocumentHeader.tsx

- Menambahkan tombol Edit/Selesai berdasarkan mode
- Menampilkan UI yang berbeda berdasarkan mode
- Mengintegrasikan dengan fitur draft yang ada

### 3. Styling dan UX

- CSS classes berbeda untuk mode view dan edit
- Transisi mulus antar mode
- Feedback visual saat beralih mode
- Cursor styles yang sesuai (pointer untuk view mode, text untuk edit mode)

## Langkah Implementasi

### 1. Update ModuleDraftPageContext.tsx

- [x] Menambahkan state `editorMode: 'view' | 'edit'`
- [x] Menambahkan handler `setEditorMode` dan `toggleEditorMode`
- [x] Mengintegrasikan mode dengan fitur draft yang ada

### 2. Update RichTextEditor.tsx

- [x] Menggunakan `editorMode` dari context
- [x] Memperbarui `editor.setEditable()` saat mode berubah
- [x] Menampilkan toolbar dan menu hanya dalam mode edit
- [x] Styling berbeda untuk mode view dan edit

### 3. Update ModulePageEditor.tsx

- [x] Menambahkan event handler untuk double-click
- [x] Menambahkan keyboard shortcut handler (e untuk edit, Escape untuk view)
- [x] Memperbarui className pada container editor

### 4. Update DocumentHeader.tsx

- [x] Menambahkan tombol Edit/Selesai
- [x] Menampilkan UI yang berbeda berdasarkan mode
- [x] Mengintegrasikan dengan fitur draft yang ada

### 5. Update CSS Styling

- [x] Menambahkan classes untuk mode view dan edit
- [x] Styling untuk transisi antar mode
- [x] Cursor styles yang sesuai

## Pengujian

### Test Cases

1. **Toggle Mode**

   - Pengguna dapat beralih dari mode view ke edit dengan:
     - Mengklik tombol Edit
     - Double-click pada area konten
     - Menekan tombol 'e' pada keyboard
   - Pengguna dapat beralih dari mode edit ke view dengan:
     - Mengklik tombol Selesai
     - Menekan tombol Escape

2. **Behavior dalam Mode View**

   - Konten tidak dapat diedit
   - Toolbar dan floating menu tidak ditampilkan
   - Tombol Edit ditampilkan
   - Cursor menunjukkan mode dapat diklik

3. **Behavior dalam Mode Edit**

   - Konten dapat diedit
   - Toolbar dan floating menu ditampilkan
   - Tombol Selesai ditampilkan
   - Auto-save berfungsi
   - Draft status indicator ditampilkan

4. **Integrasi dengan Fitur Draft**
   - Auto-save hanya aktif dalam mode edit
   - Publikasi draft mengubah mode ke view
   - Membuang draft mengubah mode ke view

## Kesimpulan

Implementasi mode view dan edit menggunakan Context API memungkinkan pengalaman pengguna yang lebih baik dengan transisi mulus antar mode dan konsistensi UI di seluruh aplikasi. Pendekatan ini juga memudahkan pengembangan fitur terkait mode di masa depan.
