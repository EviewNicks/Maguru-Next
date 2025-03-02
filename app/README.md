# Folder `app`

Folder ini mengelola routing dan layout utama proyek, serta mendukung fitur dynamic routing untuk modul seperti `dashboard`, `api`, dan `courses`.

## Struktur Folder
- `dashboard/`: Mengelola halaman dan layout untuk dashboard pengguna.
- `api/`: Menyediakan endpoint API untuk komunikasi server-side.
- `courses/`: Modul pembelajaran dengan dynamic routing.
- `layout.tsx`: Layout global aplikasi, mengatur elemen UI utama.
- `page.tsx`: Halaman utama aplikasi.

## File Utama
### `layout.tsx`
- Mengelola elemen UI global, seperti:
  - `Navbar`: Navigasi utama aplikasi.
  - `GlobalModal` dan `GlobalToast`: Elemen untuk modal dan notifikasi.
  - `Providers`: Wrapper untuk state management global.
  - `Container`: Pembungkus konten utama.

### `page.tsx`
- Halaman utama dengan teks sederhana sebagai placeholder.

