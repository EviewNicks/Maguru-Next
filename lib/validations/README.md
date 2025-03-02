# Folder `validation`

---

## Penjelasan File

### `user.ts`

Berisi skema validasi data pengguna menggunakan library zod.

Skema yang tersedia

- `UserRoleEnum`: 
  Enum untuk peran pengguna (admin, mahasiswa, dosen).
- `UserStatusEnum`: 
  Enum untuk status pengguna (active, inactive, pending).
- `updateUserSchema`: 
  Validasi input untuk pembaruan data pengguna.
-  `getUsersQuerySchema`: 
  Validasi query parameter saat mengambil data pengguna.
