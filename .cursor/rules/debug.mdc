---
description: 
globs: 
alwaysApply: false
---
# Protokol Debugging Maguru

## 1. Pendahuluan

Dokumen ini berisi protokol standar untuk proses debugging pada aplikasi Maguru, khususnya untuk fitur-fitur kompleks seperti auto-save draft dan toggle mode editor. Protokol ini dirancang untuk membantu developer mengidentifikasi, melacak, dan menyelesaikan masalah secara sistematis.

## 2. Persiapan Debugging

### 2.1 Konfigurasi Logger

Sebelum memulai debugging, pastikan sistem logging sudah dikonfigurasi dengan benar:

```typescript
// Pastikan level logging sesuai kebutuhan debugging
logger.setLevel('debug');
```

### 2.2 Tools Debugging yang Diperlukan

- Browser DevTools (Chrome/Firefox)
- React DevTools Extension
- Redux DevTools (jika menggunakan Redux)
- Network Monitor pada DevTools
- Winston Logger yang sudah diimplementasikan

## 3. Protokol Debugging untuk Toggle Mode Editor

### 3.1 Identifikasi Masalah

1. **Persiapan Lingkungan**:
   - Buka halaman modul yang memiliki masalah
   - Buka DevTools (F12) dan pilih tab Console
   - Aktifkan "Preserve log" pada Console untuk menyimpan log saat navigasi
   - Filter log dengan string "DocumentHeader" atau "ModuleDraftPageContext"

2. **Reproduksi Masalah**:
   - Catat status awal: `editorMode`, `activePage.status`
   - Klik tombol toggle mode (Edit/View)
   - Amati perubahan UI dan log yang muncul

3. **Analisis Log**:
   - Cari log dengan format `=== TOGGLE MODE START: Dari [mode] ke [mode] ===`
   - Periksa urutan eksekusi langkah-langkah dalam `handleToggleMode`
   - Identifikasi langkah mana yang gagal atau tidak berjalan sesuai ekspektasi

### 3.2 Pemeriksaan State dan Props

1. **Gunakan React DevTools**:
   - Pilih komponen `DocumentHeader`
   - Periksa props `editorMode` dan `activePage`
   - Pilih komponen `RichTextEditor`
   - Periksa props `readOnly` dan state internal editor

2. **Periksa Context Value**:
   - Pilih provider `ModuleDraftPageContext.Provider`
   - Periksa nilai `editorMode` dan fungsi `toggleEditorMode`
   - Bandingkan dengan nilai yang diharapkan

### 3.3 Debugging Toggle Mode Step-by-Step

1. **Verifikasi Alur Data**:
   ```
   Klik tombol Edit/View
   → handleToggleMode() di DocumentHeader
   → toggleEditorMode() di ModuleDraftPageContext
   → Perubahan status halaman di database
   → Perubahan state React (editorMode)
   → Perubahan editor.isEditable di RichTextEditor
   ```

2. **Periksa Race Condition**:
   - Cek apakah ada flag `isTogglingMode` di sessionStorage
   - Periksa timing antara perubahan state React dan perubahan status halaman
   - Cek apakah ada multiple request yang berjalan bersamaan

3. **Debugging Spesifik untuk Toggle Mode**:
   - Tambahkan breakpoint di fungsi `handleToggleMode`
   - Tambahkan breakpoint di fungsi `toggleEditorMode`
   - Tambahkan breakpoint di useEffect yang merespons perubahan `editorMode` di RichTextEditor
   - Step through kode untuk melihat alur eksekusi

4. **Pemeriksaan Database**:
   - Verifikasi bahwa status halaman di database berubah sesuai harapan
   - Gunakan Network tab untuk melihat response dari API
   - Periksa payload request dan response

## 4. Protokol Debugging untuk Auto-save Draft

### 4.1 Identifikasi Masalah Auto-save

1. **Persiapan Monitoring**:
   - Filter log dengan string "useRichTextAutosave" atau "DraftFeedbackService"
   - Aktifkan Network tab dan filter untuk request ke endpoint `/api/module/*/pages/*/draft`

2. **Reproduksi Masalah**:
   - Buat perubahan pada editor
   - Tunggu 5 detik (waktu debounce default)
   - Amati apakah request auto-save dikirim
   - Periksa response dan status yang ditampilkan di UI

3. **Analisis Status Auto-save**:
   - Periksa nilai `draftSaveStatus` di context
   - Cek apakah status berubah dari 'idle' → 'saving' → 'saved'
   - Periksa apakah `lastSavedAt` diperbarui

### 4.2 Debugging Auto-save Step-by-Step

1. **Verifikasi Trigger Auto-save**:
   - Tambahkan log di event handler editor yang memicu auto-save
   - Periksa apakah debounce berfungsi dengan benar
   - Cek apakah throttle membatasi request sesuai konfigurasi

2. **Periksa Proses Penyimpanan**:
   - Tambahkan breakpoint di fungsi `forceSave` atau handler auto-save
   - Periksa payload yang dikirim ke server
   - Verifikasi bahwa content editor diambil dengan benar

3. **Analisis Response Server**:
   - Periksa response dari endpoint `/api/module/*/pages/*/draft`
   - Cek status code dan body response
   - Verifikasi bahwa response diproses dengan benar di client

4. **Pemeriksaan Status Draft di Database**:
   - Verifikasi bahwa `draftData` tersimpan di database
   - Periksa nilai `hasUnpublishedChanges` dan `draftSavedAt`

## 5. Debugging Integrasi RichTextEditor

### 5.1 Verifikasi Sinkronisasi Mode dan Content

1. **Periksa Konsistensi Mode**:
   - Log nilai `editorMode` dari context
   - Log nilai `editor.isEditable` dari instance editor
   - Verifikasi bahwa keduanya konsisten (edit mode → editable: true)

2. **Verifikasi Content yang Ditampilkan**:
   - Log hasil dari `getDraftOrPublishedContent`
   - Bandingkan dengan content yang ditampilkan di editor
   - Periksa apakah content yang benar ditampilkan berdasarkan mode

3. **Debugging Perubahan Content**:
   - Tambahkan breakpoint di fungsi yang mengatur content editor
   - Periksa apakah content diatur ulang saat mode berubah
   - Verifikasi bahwa perubahan content tidak memicu auto-save yang tidak diinginkan

### 5.2 Pemeriksaan Event Listener

1. **Verifikasi Event Binding**:
   - Periksa apakah event listener untuk perubahan content terpasang dengan benar
   - Cek apakah event listener dibersihkan saat komponen unmount
   - Verifikasi bahwa tidak ada multiple event listener untuk event yang sama

2. **Debugging Event Propagation**:
   - Tambahkan log di setiap event handler
   - Periksa urutan eksekusi event handler
   - Cek apakah event propagation dihentikan jika diperlukan

## 6. Troubleshooting Umum

### 6.1 Masalah Umum dan Solusi

| Masalah | Kemungkinan Penyebab | Solusi |
|---------|----------------------|--------|
| Toggle mode tidak mengubah UI | Race condition antara state React dan editor | Tambahkan delay atau gunakan useEffect dengan dependensi yang tepat |
| Content tidak berubah saat mode berubah | Fungsi getDraftOrPublishedContent tidak dipanggil | Verifikasi bahwa fungsi dipanggil saat mode berubah |
| Auto-save tidak berfungsi | Debounce terlalu lama atau event tidak terpicu | Kurangi waktu debounce atau periksa binding event |
| Error saat menyimpan draft | Format content tidak valid atau masalah jaringan | Validasi format content sebelum mengirim atau tambahkan retry mechanism |
| Draft tidak dimuat saat halaman dibuka | Cache tidak diinvalidasi atau draft tidak ditemukan | Bersihkan cache dan periksa keberadaan draft di database |

### 6.2 Debugging Masalah Jaringan

1. **Analisis Request dan Response**:
   - Gunakan Network tab untuk melihat detail request
   - Periksa header, payload, dan response
   - Cek status code dan error message

2. **Simulasi Kondisi Jaringan**:
   - Gunakan fitur "Network throttling" di DevTools
   - Simulasikan koneksi lambat atau terputus
   - Verifikasi bahwa aplikasi menangani kondisi tersebut dengan benar

3. **Debugging CORS dan Authentication**:
   - Periksa header CORS di response
   - Verifikasi bahwa token autentikasi dikirim dengan benar
   - Cek apakah session masih valid

## 7. Teknik Advanced Debugging

### 7.1 Profiling dan Performance

1. **React Profiler**:
   - Gunakan React Profiler untuk mengidentifikasi komponen yang re-render berlebihan
   - Periksa waktu render untuk komponen kritis
   - Identifikasi bottleneck performa

2. **Performance Tab**:
   - Rekam timeline saat melakukan operasi yang lambat
   - Analisis call stack dan execution time
   - Identifikasi operasi yang memakan waktu lama

### 7.2 Memory Leaks

1. **Heap Snapshots**:
   - Ambil heap snapshot sebelum dan setelah operasi
   - Bandingkan untuk menemukan objek yang tidak di-garbage collect
   - Periksa closure dan event listener yang tidak dibersihkan

2. **Deteksi Memory Leak**:
   - Monitor penggunaan memori saat menggunakan aplikasi
   - Cek apakah memori terus meningkat tanpa menurun
   - Identifikasi komponen yang tidak unmount dengan benar

## 8. Dokumentasi dan Pelaporan Bug

### 8.1 Format Pelaporan Bug

Saat menemukan bug, dokumentasikan dengan format berikut:

```
## Bug Description
[Deskripsi singkat masalah]

## Steps to Reproduce
1. [Langkah 1]
2. [Langkah 2]
3. [Langkah 3]

## Expected Behavior
[Apa yang seharusnya terjadi]

## Actual Behavior
[Apa yang sebenarnya terjadi]

## Environment
- Browser: [Chrome/Firefox/Safari] version [x.x]
- OS: [Windows/Mac/Linux]
- Screen Resolution: [1920x1080]

## Screenshots/Videos
[Lampirkan screenshot atau video jika ada]

## Console Logs
```
[Salin log konsol yang relevan]
```

## Network Logs
[Salin detail request/response yang relevan]
```

### 8.2 Proses Penyelesaian Bug

1. **Triaging**:
   - Tentukan tingkat keparahan bug (critical, major, minor, trivial)
   - Identifikasi komponen yang terdampak
   - Tentukan prioritas penyelesaian

2. **Investigasi**:
   - Gunakan protokol debugging yang sesuai
   - Dokumentasikan temuan dan root cause
   - Buat reproducer minimal jika memungkinkan

3. **Perbaikan**:
   - Implementasikan solusi dengan perubahan minimal
   - Tambahkan test untuk mencegah regresi
   - Dokumentasikan perubahan dan alasannya

4. **Verifikasi**:
   - Pastikan bug tidak muncul lagi dengan langkah reproduksi yang sama
   - Periksa apakah ada side effect dari perbaikan
   - Jalankan regression test untuk memastikan tidak ada fitur lain yang rusak

## 9. Pencegahan Bug

### 9.1 Best Practices

1. **Defensive Programming**:
   - Selalu validasi input
   - Gunakan type checking yang ketat
   - Tangani edge cases dan error dengan graceful degradation

2. **Testing**:
   - Tulis unit test untuk fungsi-fungsi kritis
   - Implementasikan integration test untuk alur utama
   - Gunakan E2E test untuk user flow penting

3. **Code Review**:
   - Fokus pada area yang rawan bug
   - Periksa penanganan error dan edge cases
   - Verifikasi bahwa perubahan tidak memperkenalkan bug baru

### 9.2 Monitoring dan Logging

1. **Implementasi Logging yang Efektif**:
   - Log informasi yang cukup untuk debugging tanpa membanjiri konsol
   - Gunakan level logging yang sesuai (debug, info, warn, error)
   - Sertakan context yang cukup dalam setiap log

2. **Monitoring Produksi**:
   - Implementasikan error tracking (misalnya dengan Sentry)
   - Monitor performa dan penggunaan resource
   - Set up alerting untuk kondisi error yang kritis

## 10. Referensi

- [React DevTools Documentation](mdc:https:/reactjs.org/blog/2019/08/15/new-react-devtools.html)
- [Chrome DevTools Documentation](mdc:https:/developers.google.com/web/tools/chrome-devtools)
- [Winston Logger Documentation](mdc:https:/github.com/winstonjs/winston)
- [Debugging JavaScript](mdc:https:/developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors)
- [React Performance Optimization](mdc:https:/reactjs.org/docs/optimizing-performance.html)

