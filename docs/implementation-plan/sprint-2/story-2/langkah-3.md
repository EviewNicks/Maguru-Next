# Langkah 3: Manajemen Konten Multi-Page

**OPS-140: Manajemen Konten Multi-Page**  
_In Progress_

Memungkinkan admin untuk menambahkan, mengedit, menghapus, dan mengelola halaman konten (teori dan kode) sebagai bagian dari modul. Fokus saat ini adalah pada dua tipe konten—teori dan kode—dengan struktur yang berbeda dari metadata modul.

---

## 1. Skema Database (Backend)

### Perbaikan:

- Memperbarui model `ModulePage` untuk memisahkan field `content` dan `language` (untuk tipe "kode").
- Menambahkan indeks pada `[moduleId, order]` dan indeks unik pada `[moduleId, order]` untuk mencegah duplikasi urutan.

### Contoh Skema:

```prisma
model ModulePage {
  id          String   @id @default(uuid())
  moduleId    String   @map("module_id")
  order       Int
  type        String   // "teori" atau "kode"
  content     String   // HTML untuk teori, snippet kode untuk kode
  language    String?  // Hanya diisi jika type = "kode" (contoh: "python", "javascript")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([moduleId, order])
  @@unique([moduleId, order])
}
```

## 2. Validasi Input di Backend

### Perbaikan:

- Perbarui Zod schema untuk tipe konten sehingga field `language` diperlukan untuk tipe "kode".

### Contoh Zod Schema:

```typescript
import { z } from 'zod'

export const PageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('teori'),
    content: z.string().max(5000, 'Konten teori terlalu panjang'),
  }),
  z.object({
    type: z.literal('kode'),
    content: z.string().max(2000, 'Konten kode terlalu panjang'),
    language: z.enum(['python', 'javascript']), // Wajib untuk tipe kode
  }),
])
```

## 3. Endpoint Batch Update untuk Pengurutan Halaman

### Perbaikan:

- Tambahkan endpoint `PATCH /api/modules/:moduleId/pages/reorder` untuk update batch urutan halaman.

### Contoh Payload:

```json
{
  "updates": [
    { "pageId": "page1", "order": 1 },
    { "pageId": "page2", "order": 2 }
  ]
}
```

## 4. Sanitasi Konten Teori di Backend

### Perbaikan:

- Terapkan sanitasi pada konten tipe "teori" sebelum penyimpanan untuk menghindari XSS.

### Contoh Implementasi:

```typescript
import xss from 'xss'

if (type === 'teori') {
  const sanitizedContent = xss(content, {
    whiteList: { b: [], i: [], a: ['href'] },
  })
  // Gunakan sanitizedContent untuk penyimpanan
}
```

## 5. Penyesuaian Form di Frontend

### Perbaikan:

- Gunakan conditional rendering di form modal untuk menampilkan field `language` hanya jika tipe konten adalah "kode".

## 6. Integrasi API dengan React Query (Frontend)

### Perbaikan:

- Buat query untuk mengambil daftar halaman konten berdasarkan `moduleId`.
- Implementasikan mutation untuk operasi CRUD dan batch update urutan dengan optimistik update.

### Contoh Optimistic Update untuk Batch Reorder:

```typescript
useMutation(reorderPages, {
  onMutate: async (updates) => {
    await queryClient.cancelQueries(['modulePages', moduleId])
    const prevPages = queryClient.getQueryData(['modulePages', moduleId])
    queryClient.setQueryData(['modulePages', moduleId], (old: any) =>
      old.map((page) => {
        const update = updates.find((u: any) => u.pageId === page.id)
        return update ? { ...page, order: update.order } : page
      })
    )
    return { prevPages }
  },
  onError: (err, updates, context) => {
    queryClient.setQueryData(['modulePages', moduleId], context.prevPages)
  },
  onSettled: () => {
    queryClient.invalidateQueries(['modulePages', moduleId])
  },
})
```

## 7. Testing dan Validasi

### Perbaikan:

#### Unit Testing:

- Tambahkan test case untuk Zod schema, terutama untuk memastikan tipe "kode" mengharuskan `language`.

```typescript
test('Zod schema rejects code content without language', () => {
  expect(() =>
    PageSchema.parse({ type: 'kode', content: 'console.log(1)' })
  ).toThrow()
})
```

#### Integration Testing:

- Uji endpoint CRUD untuk halaman konten dan endpoint batch reorder.

#### E2E Testing:

- Gunakan Cypress untuk mensimulasikan alur admin mengelola halaman konten, termasuk drag-and-drop untuk pengurutan.

#### Load Testing:

- Uji performa API dengan skenario data besar, misalnya, 10k halaman konten.

---

# Langkah 4: Enhanced Metadata Management

**OPS-141: Enhanced Metadata Management**  
_In Progress_

Memperkaya metadata modul dengan field tambahan—seperti prasyarat, acceptance criteria, dan referensi—untuk mendukung evaluasi konten dan proses pembelajaran yang lebih mendalam. Fitur ini memastikan data tersimpan dalam format yang konsisten (menggunakan array JSON) dan tervalidasi secara menyeluruh, serta memudahkan pengembangan fitur pencarian, filter, dan analitik di masa depan.
