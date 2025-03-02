
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

