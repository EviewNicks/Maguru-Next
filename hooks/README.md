# Folder `hooks`

Folder ini berisi custom React hooks yang digunakan untuk berbagai fungsi di dalam aplikasi. Hooks ini membantu memisahkan logika bisnis dari komponen UI, sehingga lebih modular dan mudah diuji.

## Daftar Hooks

1. [`use-toast.ts`](#use-toastts)
2. [`useAuth.ts`](#useauthts)
3. [`useUserActions.ts`](#useuseractionsts)
4. [`useUserManagement.ts`](#useusermanagementts)
5. [`useUsers.ts`](#useusersts)

---

### `use-toast.ts`

Hook ini digunakan untuk mengakses dan mengatur komponen `Toast` dari ShadcnUI.

**Fitur:**

- Mempermudah menampilkan notifikasi `Toast`.
- Dapat digunakan untuk berbagai jenis notifikasi (success, error, dll).

---

### `useAuth.ts`

Hook ini bertugas untuk mengelola autentikasi pengguna menggunakan Clerk.

**Fitur:**

- Mengambil informasi user dari Clerk.
- Memuat data user dari database menggunakan fungsi `getCurrentUser`.
- Menyediakan status loading untuk proses autentikasi.

**API yang disediakan:**

- `user`: Data pengguna dari database.
- `isLoading`: Status loading autentikasi.
- `clerkUser`: Data pengguna dari Clerk.

---

### `useUserActions.ts`

Hook ini menyediakan aksi untuk mengelola data pengguna melalui API, seperti update atau delete user.

**Fitur:**

- `updateUser`: Mengupdate informasi user menggunakan `PATCH /api/users/{id}`.
- `deleteUser`: Menghapus user menggunakan `DELETE /api/users/{id}`.
- Menampilkan notifikasi menggunakan `use-toast`.

**Integrasi:**

- Menggunakan `react-query` untuk cache dan invalidasi query.

---

### `useUserManagement.ts`

Hook ini digunakan untuk mengelola data pengguna dengan memanfaatkan Redux untuk state management.

**Fitur:**

- `handleUpdateUser`: Mengupdate user melalui Redux action `updateUser`.
- `handleDeleteUser`: Menghapus user melalui Redux action `deleteUser`.
- Status loading dan error untuk aksi update dan delete.

**API yang disediakan:**

- `handleUpdateUser(payload)`: Mengupdate data user.
- `handleDeleteUser(userId)`: Menghapus user.
- `isUpdating`: ID user yang sedang diupdate.
- `isDeleting`: ID user yang sedang dihapus.

---

### `useUsers.ts`

Hook ini digunakan untuk mengambil dan mengelola daftar pengguna.

**Fitur:**

- `users`: Mengambil daftar user dari endpoint `GET /api/users`.
- `updateUser`: Mengupdate user menggunakan `PATCH /api/users/{id}`.
- `deleteUser`: Menghapus user menggunakan `DELETE /api/users/{id}`.
- Metadata pagination seperti `total`, `page`, dan `limit`.

**API yang disediakan:**

- `users`: Daftar pengguna.
- `metadata`: Informasi pagination.
- `isLoading`: Status loading query.
- `updateUser(payload)`: Mengupdate data user.
- `deleteUser(userId)`: Menghapus user.

**Integrasi:**

- Menggunakan `axios` untuk komunikasi API.
- Cache dan invalidasi query menggunakan `react-query`.

---

## Catatan

- Semua hooks ini dirancang untuk memisahkan logika dari komponen, sehingga lebih mudah digunakan kembali dan diuji.
- Beberapa hooks, seperti `useUserActions` dan `useUsers`, bergantung pada endpoint API. Pastikan endpoint ini berfungsi dengan baik sebelum menggunakan hooks tersebut.
