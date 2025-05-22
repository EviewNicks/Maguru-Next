# Folder `documentation`

Folder ini digunakan untuk menyimpan dokumentasi API dan referensi lain yang relevan dengan proyek. Dokumentasi API menggunakan format OpenAPI Specification (OAS) untuk mempermudah integrasi dan pemahaman sistem.

## File Utama

### `userManagementAPI.yaml`

- Berisi dokumentasi API untuk fitur manajemen pengguna.
- Menggunakan OpenAPI Specification versi 3.0.0.
- Dapat diimpor ke tools seperti Swagger UI, Postman, atau Redoc untuk visualisasi dan pengujian.

## Endpoint yang Terdokumentasi

1. **`/api/users`**:

   - **GET**: Mengambil daftar pengguna, mendukung pagination dan filter berdasarkan nama, email, role, dan status.
   - **POST**: Menambahkan atau memperbarui pengguna berdasarkan data dari Clerk authentication.

2. **`/api/users/{userId}`**:
   - **PATCH**: Memperbarui informasi pengguna tertentu berdasarkan ID.
   - **DELETE**: Menghapus pengguna berdasarkan ID.

## Komponen Skema

### `User`

- Skema data pengguna, termasuk:
  - `id`: ID unik pengguna.
  - `clerkUserId`: ID pengguna yang terkait dengan Clerk.
  - `email`: Alamat email pengguna.
  - `name`: Nama pengguna.
  - `role`: Role pengguna (`admin`, `mahasiswa`, atau `dosen`).
  - `status`: Status pengguna (`active`, `inactive`, atau `pending`).
  - `createdAt`: Tanggal pembuatan data pengguna.
  - `updatedAt`: Tanggal terakhir data pengguna diperbarui.

## Cara Menggunakan Dokumentasi

1. **Visualisasi**:
   - Import file `userManagementAPI.yaml` ke [Swagger Editor](https://editor.swagger.io/) atau [Postman](https://www.postman.com/) untuk melihat dokumentasi dalam format visual.
2. **Pengujian API**:

   - Gunakan Postman atau alat lain untuk menguji endpoint dengan payload yang sesuai.

3. **Integrasi**:
   - Skema API ini dapat digunakan oleh pengembang frontend untuk memahami cara berkomunikasi dengan backend.

## Catatan

- Pastikan server backend berjalan di `http://localhost:3000` saat menguji API.
- Endpoint membutuhkan autentikasi menggunakan Clerk; akses tanpa token yang valid akan menghasilkan respon `401 Unauthorized`.

---

## Panduan Pengembangan

Jika ada perubahan pada API, pastikan:

1. Memperbarui file `userManagementAPI.yaml`.
2. Menginformasikan perubahan ke tim frontend untuk menghindari integrasi yang rusak.
3. Menguji ulang endpoint yang terpengaruh.
