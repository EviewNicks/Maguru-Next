# Folder `courses`

Folder ini mengelola modul pembelajaran dengan dynamic routing, memungkinkan pengaksesan kursus tertentu berdasarkan ID.

## Struktur Folder

- `[id]/`: Folder untuk routing dinamis ke halaman kursus tertentu.
- `layout.tsx`: Layout utama untuk modul pembelajaran.
- `page.tsx`: Halaman placeholder untuk daftar kursus atau konten awal.

## File Utama

### `layout.tsx`

- Layout yang membungkus halaman kursus.
- Menyediakan elemen UI global untuk modul pembelajaran.

### `page.tsx`

- Placeholder untuk halaman daftar kursus.
- Saat ini menampilkan teks sederhana sebagai contoh.

### Catatan

- Folder `[id]` mendukung routing dinamis untuk menampilkan halaman kursus berdasarkan ID yang diakses.
