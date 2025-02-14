# Folder `types`

Folder ini berisi definisi tipe data TypeScript yang digunakan di seluruh proyek untuk memastikan konsistensi dan type-safety dalam pengembangan.

## Struktur File

- `apiResponse.ts`: Tipe data untuk response API.
- `heroicons.d.ts`: Deklarasi modul untuk library ikon.
- `user.ts`: Definisi tipe data untuk entitas pengguna dan payload untuk aksi tertentu.

## Penjelasan File

### `apiResponse.ts`

- Tipe data untuk struktur standar response API.
- Digunakan untuk memastikan bahwa semua response API mengikuti format tertentu.
- **Contoh Penggunaan**:

  ```typescript
  const response: ApiResponse<User[]> = {
    data: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
      },
    ],
    message: 'Users retrieved successfully',
  }
  ```

### `heroicons.d.ts`

- Deklarasi modul untuk library ikon @heroicons/react/outline dan @heroicons/react/solid.
- Berguna untuk menghindari error TypeScript saat menggunakan library ini.

### `user.ts`

- Tipe data untuk entitas pengguna, seperti User.
- Menyediakan definisi untuk atribut pengguna, seperti id, clerkUserId, role, status, createdAt, dan updatedAt.
- Tipe tambahan untuk payload aksi seperti UpdateUserPayload:
  : Digunakan saat memperbarui data pengguna.

  ***

## Penjelasan File

- Pastikan setiap tipe data yang baru ditambahkan memiliki file yang relevan di folder ini untuk menjaga konsistensi.
- File heroicons.d.ts hanya diperlukan jika proyek Anda menggunakan library @heroicons/react.
