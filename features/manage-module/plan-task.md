# Rencana Implementasi Integrasi API GET Module Page dengan RichTextEditor

## Latar Belakang

Saat ini, RichTextEditor menggunakan `defaultContentJSON` sebagai konten default ketika tidak ada konten yang diberikan. Kita perlu mengubahnya agar mengambil konten langsung dari API database menggunakan endpoint `GET /api/module/{moduleId}/pages/{pageId}`.

## Alur Kerja

1. Pengguna mengklik item halaman di `SidebarContent.tsx`
2. Sistem memanggil API untuk mendapatkan detail halaman
3. Data dari API digunakan sebagai konten editor, bukan lagi menggunakan konten default

## Langkah-langkah Implementasi

### 1. Memahami Format Data API

- Response API berisi `blocks` yang perlu dikonversi ke format JSON Tiptap
- Format data dari API:

```json
{
  "success": true,
  "data": {
    "id": "6373eabd-fe25-4537-a040-42830f99fa5b",
    "moduleId": "e82e800c-93f5-48ef-b17b-2dfe5624f4fb",
    "title": "Halaman Baru 6",
    "order": 6,
    "blocks": [
      {
        "type": "text",
        "content": "<p>Halaman baru Anda telah dibuat. Mulai edit konten disini.</p>"
      }
    ],
    "status": "DRAFT",
    "createdAt": "2025-05-22T07:14:17.588Z",
    "updatedAt": "2025-05-22T07:14:17.588Z"
  }
}
```

### 2. Modifikasi RichTextEditor.tsx

- Perbaiki fungsi `parseContent()` untuk menangani format data dari API dengan lebih baik
- Pastikan fungsi tersebut dapat mengekstrak konten dari `blocks[0].content` jika formatnya adalah text
- Tambahkan penanganan error yang lebih baik

### 3. Integrasi dengan SidebarContent.tsx

- Pastikan ketika item halaman diklik, ID halaman diteruskan dengan benar
- Pastikan API dipanggil dengan parameter yang benar

### 4. Penanganan Loading State

- Tambahkan state loading saat mengambil konten dari API
- Tampilkan skeleton atau spinner saat loading

### 5. Penanganan Error

- Gunakan `ErrorBoundary` untuk menangani error saat memuat konten
- Tambahkan pesan error yang informatif

### 6. Testing

- Uji dengan berbagai format konten dari API
- Pastikan konversi dari format blocks ke JSON Tiptap berjalan dengan benar
- Uji penanganan error dan loading state

## Timeline

- Analisis dan pemahaman kode: 1 jam
- Implementasi perubahan pada RichTextEditor.tsx: 2 jam
- Integrasi dengan SidebarContent.tsx: 1 jam
- Testing dan debugging: 2 jam
- Total: 6 jam

## Catatan Tambahan

- Pastikan untuk mempertahankan fungsionalitas autosave yang sudah ada
- Perhatikan backward compatibility untuk format data lama
- Gunakan ErrorBoundary untuk menangani error dengan baik

## Ringkasan Implementasi

### Perubahan yang Dilakukan:

1. **Perbaikan Fungsi `parseContent()`**

   - Menggunakan enum `ContentBlockType` untuk tipe blok konten
   - Menambahkan penanganan error yang lebih baik untuk parsing JSON
   - Memastikan kompatibilitas dengan berbagai format data API

2. **Peningkatan Komponen `RichTextEditorWithAutosave`**

   - Menambahkan ekstraksi moduleId yang lebih fleksibel dari pageId
   - Menambahkan header untuk cache control dan identifikasi client
   - Memperbaiki penanganan error dengan pesan yang lebih informatif
   - Meningkatkan loading state dengan indikator visual

3. **Perbaikan Komponen `SidebarContent`**

   - Memperbaiki fungsi `handleSelectPage` untuk sinkronisasi yang lebih baik
   - Menambahkan delay untuk pengalaman pengguna yang lebih baik
   - Memperbaiki notifikasi toast

4. **Perbaikan Komponen `ModulePageEditor`**
   - Memperbaiki error dengan `editorFocusRef` menggunakan cast tipe yang benar
   - Menambahkan `ErrorBoundary` untuk menangani kegagalan loading editor
   - Memperbaiki impor dan path yang salah

### Hasil Akhir:

- RichTextEditor sekarang dapat mengambil konten langsung dari API
- Penanganan error yang lebih baik untuk kasus seperti timeout, 404, dan masalah format
- Loading state yang memberikan feedback lebih baik kepada pengguna
- Performa yang lebih baik dengan penggunaan cache control dan timeout
- Pengalaman pengguna yang lebih mulus saat navigasi antar halaman
