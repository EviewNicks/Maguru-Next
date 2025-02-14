# Folder `store`

Folder ini mengelola state management aplikasi menggunakan Redux Toolkit. Semua konfigurasi store, hooks, dan fitur terkait state dikelompokkan dalam folder ini.

## Struktur Folder
- `hooks.ts`: Custom hooks untuk Redux (`useAppDispatch` dan `useAppSelector`).
- `store.ts`: Konfigurasi utama Redux store.
- `features/`: Modularisasi fitur-fitur state seperti `users`, `modal`, dan `toast`.

---

## File Utama

### `hooks.ts`
- Berisi custom hooks untuk mempermudah penggunaan Redux:
  - **`useAppDispatch`**: Untuk mendapatkan tipe dispatch yang sesuai.
  - **`useAppSelector`**: Untuk mendapatkan state dengan tipe `RootState`.

---

### `store.ts`
- File ini mengatur Redux store menggunakan `configureStore`.
- Reducers yang digunakan:
  - `userReducer`: Mengelola data dan status pengguna.
  - `modalReducer`: Mengelola status modal (buka/tutup).
  - `toastReducer`: Mengelola notifikasi toast.

**Tipe yang didefinisikan**:
- **`RootState`**: Tipe global untuk seluruh state aplikasi.
- **`AppDispatch`**: Tipe dispatch untuk memastikan action yang sesuai.

---

## Sub-Folder `features/`
Folder ini berisi modul state management untuk berbagai fitur. Setiap modul diimplementasikan menggunakan `createSlice`.

### `modalSlice.ts`
- Mengelola status modal:
  - **State**:
    - `isOpen`: Status buka/tutup modal.
    - `title`, `message`, `userId`: Detail tambahan saat modal aktif.
  - **Reducers**:
    - `openModal`: Membuka modal dengan detail tertentu.
    - `closeModal`: Menutup modal dan mengatur ulang detail.

---

### `toastSlice.ts`
- Mengelola notifikasi toast:
  - **State**:
    - `toasts`: Daftar notifikasi yang sedang ditampilkan.
  - **Reducers**:
    - `addToast`: Menambahkan toast baru.
    - `removeToast`: Menghapus toast berdasarkan ID.

---

### `userSlice.ts`
- Mengelola data dan status pengguna:
  - **State**:
    - `data`: Daftar pengguna.
    - `loading`: Status pemuatan data.
    - `error`: Error message.
    - `previousStates`: Data sebelum perubahan untuk mendukung update optimistik.
    - `optimisticUpdates`: Perubahan data sementara.
  - **Reducers**:
    - `startOptimisticUpdate`: Memulai update optimistik.
    - `revertOptimisticUpdate`: Mengembalikan perubahan optimistik jika terjadi error.
  - **Async Thunks**:
    - `fetchUsers`: Mengambil daftar pengguna dari API.
    - `updateUser`: Memperbarui data pengguna melalui API.
    - `deleteUser`: Menghapus pengguna berdasarkan ID.

---

## Catatan Tambahan
- Gunakan `hooks.ts` untuk mempermudah penggunaan dispatch dan selector dengan tipe yang sesuai.
- Pastikan `userSlice` diperbarui secara hati-hati, terutama saat menggunakan update optimistik untuk mencegah inkonsistensi data.
- API yang digunakan oleh `userSlice` harus mendukung operasi CRUD yang diimplementasikan di server.
