# Folder `config`

Folder ini berisi konfigurasi global yang digunakan di seluruh aplikasi, termasuk konfigurasi tema, provider state management, serta daftar link untuk navigasi.

## Struktur Folder

- `links.ts`: Daftar link dropdown untuk navigasi di navbar.
- `LinksSideBar.tsx`: Daftar link untuk navigasi sidebar.
- `providers.tsx`: Wrapper global untuk penyedia state management, autentikasi, dan tema.
- `theme-provider.tsx`: Penyedia tema untuk mendukung light mode dan dark mode.

---

## File Utama

### 1. `links.ts`

- Berisi array `dropdownLinks` yang digunakan untuk menampilkan menu dropdown di navbar.
- Setiap item dalam `dropdownLinks` memiliki properti:
  - **`label`**: Nama yang ditampilkan.
  - **`href`**: URL tujuan.
  - **`shortcut`**: Shortcut keyboard (opsional).
  - **`disabled`**: Status disabled untuk link tertentu (opsional).
  - **`icon`**: Nama ikon (opsional).
  - **`onClick`**: Fungsi handler jika link memiliki aksi khusus (opsional).

---

### 2. `LinksSideBar.tsx`

- Mengelola array `links` untuk sidebar navigasi.
- Properti pada setiap link:
  - **`href`**: URL tujuan.
  - **`label`**: Nama yang ditampilkan.
  - **`icon`**: Ikon React (menggunakan `Heroicons`).

---

### 3. `providers.tsx`

- **Fungsi Utama**:
  - Menyediakan konteks global untuk state management, tema, dan autentikasi.
- **Komponen Penyedia**:
  - **`ClerkProvider`**: Mengelola autentikasi dengan Clerk.
  - **`Provider`**: Redux store untuk state management global.
  - **`QueryClientProvider`**: Untuk React Query, dengan konfigurasi:
    - `staleTime`: 1 menit.
    - `retry`: 1 kali.
  - **`ThemeProvider`**: Menyediakan tema light dan dark.
  - **`InitUser`**: Komponen yang bertugas menyinkronkan data pengguna dengan backend API `/api/users` menggunakan metode POST.

---

### 4. `theme-provider.tsx`

- Komponen pembungkus tema yang mendukung:
  - **`defaultTheme`**: Tema default (`system`).
  - **`enableSystem`**: Mendukung perubahan tema otomatis berdasarkan sistem.
  - **`disableTransitionOnChange`**: Mematikan transisi saat tema berubah untuk performa yang lebih baik.

---

## Catatan

- **Integrasi React Query**: File `providers.tsx` memiliki konfigurasi untuk caching data menggunakan React Query, memastikan performa yang optimal.
- **Integrasi Clerk**: Autentikasi menggunakan Clerk sudah disinkronkan dengan backend untuk manajemen user.

### Penggunaan

1. **`links.ts` dan `LinksSideBar.tsx`**:
   - Digunakan di navbar dan sidebar untuk navigasi.
2. **`providers.tsx`**:
   - Dibungkus di level root aplikasi untuk menyertakan semua penyedia global.
3. **`theme-provider.tsx`**:
   - Menyediakan mode tema yang konsisten di seluruh aplikasi.
