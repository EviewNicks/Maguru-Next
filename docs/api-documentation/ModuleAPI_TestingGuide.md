# Panduan Pengujian API Modul Pembelajaran

Dokumen ini berisi langkah-langkah untuk menguji API modul pembelajaran menggunakan Postman. API ini mengelola modul dan halaman modul dalam sistem Maguru.

## Persiapan

1. Pastikan server lokal sudah berjalan: `npm run dev`
2. Import collection Postman dari `docs/postman/Module_API_Collection.json`
3. Set environment variable di Postman:
   - `baseUrl` = `http://localhost:3000`

## Pengujian API Module

### 1. Membuat Modul Baru

**Request:**

- Method: POST
- Endpoint: `{{baseUrl}}/api/module`
- Body (JSON):
  ```json
  {
    "title": "Modul Testing API",
    "description": "Ini adalah modul untuk testing API menggunakan Postman",
    "status": "DRAFT"
  }
  ```

**Respon yang Diharapkan:**

- Status: 201 Created
- Body yang berisi data modul yang dibuat termasuk `id`

**Langkah Selanjutnya:**

- Salin `id` modul dari respons ke variabel `moduleId` di Postman

### 2. Mendapatkan Daftar Modul

**Request:**

- Method: GET
- Endpoint: `{{baseUrl}}/api/module?page=1&limit=10`

**Respon yang Diharapkan:**

- Status: 200 OK
- Body berisi array modul dan metadata paginasi

### 3. Mendapatkan Detail Modul

**Request:**

- Method: GET
- Endpoint: `{{baseUrl}}/api/module/{{moduleId}}`

**Respon yang Diharapkan:**

- Status: 200 OK
- Body berisi detail modul

### 4. Memperbarui Modul

**Request:**

- Method: PUT
- Endpoint: `{{baseUrl}}/api/module/{{moduleId}}`
- Body (JSON):
  ```json
  {
    "title": "Modul Testing API Updated",
    "description": "Ini adalah modul untuk testing API menggunakan Postman (Updated)"
  }
  ```

**Respon yang Diharapkan:**

- Status: 200 OK
- Body berisi data modul yang diperbarui

### 5. Memperbarui Status Modul

**Request:**

- Method: PATCH
- Endpoint: `{{baseUrl}}/api/module/{{moduleId}}/status`
- Body (JSON):
  ```json
  {
    "status": "ACTIVE"
  }
  ```

**Respon yang Diharapkan:**

- Status: 200 OK
- Body berisi data modul dengan status yang diperbarui

## Pengujian API Halaman Modul

### 1. Membuat Halaman Modul

**Request:**

- Method: POST
- Endpoint: `{{baseUrl}}/api/module/{{moduleId}}/pages`
- Body (JSON):
  ```json
  {
    "title": "Halaman Test 1",
    "type": "content",
    "blocks": [
      {
        "type": "paragraph",
        "content": "Ini adalah konten halaman test pertama."
      },
      {
        "type": "heading",
        "content": "Sub Judul"
      },
      {
        "type": "code",
        "content": "console.log('Hello World');",
        "language": "javascript"
      }
    ]
  }
  ```

**Respon yang Diharapkan:**

- Status: 201 Created
- Body berisi data halaman modul yang dibuat termasuk `id`

**Langkah Selanjutnya:**

- Salin `id` halaman dari respons ke variabel `pageId` di Postman

### 2. Membuat Halaman Modul Tambahan (untuk Reorder)

Ulangi langkah 1 untuk membuat dua halaman modul lagi dengan judul berbeda. Salin ID-nya ke variabel `pageId2` dan `pageId3`.

### 3. Mendapatkan Daftar Halaman Modul

**Request:**

- Method: GET
- Endpoint: `{{baseUrl}}/api/module/{{moduleId}}/pages?includeContent=false`

**Respon yang Diharapkan:**

- Status: 200 OK
- Body berisi array halaman modul dan metadata

### 4. Mendapatkan Detail Halaman Modul

**Request:**

- Method: GET
- Endpoint: `{{baseUrl}}/api/pages/{{pageId}}`

**Respon yang Diharapkan:**

- Status: 200 OK
- Body berisi detail halaman modul

### 5. Memperbarui Halaman Modul

**Request:**

- Method: PUT
- Endpoint: `{{baseUrl}}/api/pages/{{pageId}}`
- Body (JSON):
  ```json
  {
    "title": "Halaman Test 1 (Updated)",
    "blocks": [
      {
        "type": "paragraph",
        "content": "Ini adalah konten halaman test pertama yang telah diperbarui."
      },
      {
        "type": "heading",
        "content": "Sub Judul Baru"
      },
      {
        "type": "code",
        "content": "console.log('Hello Updated World');",
        "language": "javascript"
      }
    ]
  }
  ```

**Respon yang Diharapkan:**

- Status: 200 OK
- Body berisi data halaman modul yang diperbarui

### 6. Mengubah Urutan Halaman Modul

**Request:**

- Method: PUT
- Endpoint: `{{baseUrl}}/api/module/{{moduleId}}/pages/reorder`
- Body (JSON):
  ```json
  {
    "pageIds": ["{{pageId2}}", "{{pageId3}}", "{{pageId}}"]
  }
  ```

**Respon yang Diharapkan:**

- Status: 200 OK
- Body berisi pesan sukses

### 7. Menghapus Halaman Modul

**Request:**

- Method: DELETE
- Endpoint: `{{baseUrl}}/api/pages/{{pageId}}`

**Respon yang Diharapkan:**

- Status: 200 OK
- Body berisi pesan sukses

### 8. Menghapus Modul

**Request:**

- Method: DELETE
- Endpoint: `{{baseUrl}}/api/module/{{moduleId}}`

**Respon yang Diharapkan:**

- Status: 200 OK
- Body berisi pesan sukses

## Pengujian Error Handling

### 1. Mencoba Mengakses Modul yang Tidak Ada

**Request:**

- Method: GET
- Endpoint: `{{baseUrl}}/api/module/invalid-id`

**Respon yang Diharapkan:**

- Status: 404 Not Found
- Body berisi pesan error

### 2. Mencoba Membuat Modul dengan Data Tidak Valid

**Request:**

- Method: POST
- Endpoint: `{{baseUrl}}/api/module`
- Body (JSON):
  ```json
  {
    "description": "Ini modul tanpa judul (invalid)"
  }
  ```

**Respon yang Diharapkan:**

- Status: 400 Bad Request
- Body berisi detail validasi yang gagal

## Verifikasi dengan Schema Prisma

Pastikan respons API sesuai dengan schema Prisma di `prisma/schema.prisma`:

### Modul

```prisma
model Module {
  id          String       @id @default(uuid())
  title       String
  description String?
  status      ModuleStatus @default(DRAFT)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  createdBy   String
  updatedBy   String
  pages       ModulePage[]
}
```

### Halaman Modul

```prisma
model ModulePage {
  id        String   @id @default(uuid())
  moduleId  String   @map("module_id")
  order     Int
  type      String
  content   String
  language  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  version   Int      @default(1)
  title     String
  module    Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
}
```

## Catatan Pengujian

- Untuk pengelolaan halaman modul, perhatikan format `blocks` yang dikirim/diterima adalah array dari content blocks
- Respons API harus mengembalikan `success: true` untuk operasi yang berhasil
- Untuk operasi yang melibatkan banyak halaman modul (misalnya reorder), pastikan urutan halaman sesuai dengan yang diharapkan

## Mengatasi Masalah Umum

### 1. Authentication Error (401)

- Pastikan middleware autentikasi berjalan dengan benar di mode development

### 2. Kesalahan Parsing JSON

- Pastikan format body request sesuai
- Periksa nama properti dan tipe data yang dikirim

### 3. Endpoint Not Found (404)

- Periksa penulisan path endpoint
- Pastikan variabel Postman (`moduleId`, `pageId`, dll) sudah terisi
