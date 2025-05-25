
# Test Plan: Memperbaiki apiOptimization.integration.test.tsx

## 1. Identifikasi Masalah

Berdasarkan hasil test report TRPD-1006-2025-05-25T05-30-06.224Z.json, terdapat kegagalan pada test integrasi apiOptimization.integration.test.tsx:

1. Test "menerapkan debounce untuk perubahan editor, hanya mengirim request setelah jeda tertentu" - GAGAL

   - Expected: 1
   - Received: 0
   - Error terjadi di line 197 saat mengecek apiCallCount

2. Test "tidak mengirim request berulang jika konten tidak berubah" - GAGAL
   - Expected: 1
   - Received: 0
   - Error terjadi di line 222 saat mengecek apiCallCount

Masalah utama: meskipun trigger perubahan editor terjadi dan timer debounce dijalankan, fungsi saveEditorContent tidak berhasil memanggil API untuk menyimpan perubahan.

## 2. Analisis Penyebab

Setelah menganalisis kode, beberapa penyebab potensial teridentifikasi:

1. **Masalah di handleEditorChange**: Fungsi ini di-debounce tetapi mungkin tidak bekerja dengan benar dalam konteks pengujian.

2. **Masalah di setActiveModuleId**: Dari kode ModulePageCRUD.ts dan modulePageService.ts, terdapat ketidakkonsistenan dalam penggunaan setActiveModuleId dan getActiveModuleId.

3. **Masalah Timer di Jest**: Penggunaan jest.advanceTimersByTime() mungkin tidak cukup untuk memicu callback debounce dan promise chain.

4. **Masalah MSW Mock**: Handler mock untuk HTTP PUT mungkin tidak dipanggil dengan benar, atau format request tidak sesuai ekspektasi.

5. **Masalah act Warning**: Kemungkinan ada perubahan state asinkron yang tidak dibungkus dengan act().

## 3. File Terkait

Berikut adalah file-file yang perlu dimodifikasi untuk memperbaiki masalah:

1. `features/manage-module/__tests__/utils/testUtils.tsx` - Perbaikan fungsi advanceTimersAndFlushPromises
2. `features/manage-module/services/modulePageService.ts` - Tambahkan fungsi setActiveModuleId dan getActiveModuleId yang benar
3. `features/manage-module/__tests__/integration/apiOptimization.integration.test.tsx` - Perbaikan handling timer dan MSW

## 4. Rencana Perbaikan

### 4.1. Perbaiki modulePageService.ts

1. Pastikan fungsi `setActiveModuleId` dan `getActiveModuleId` berfungsi dengan benar dan tersedia di kedua service.

```typescript
// Tambahkan atau perbaiki di modulePageService.ts jika belum ada
setActiveModuleId(moduleId: string) {
  this._activeModuleId = moduleId
  console.log(`[Service] Setting active moduleId: ${moduleId}`)

  // Simpan di sessionStorage jika dalam lingkungan browser
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('activeModuleId', moduleId)
  }
},

getActiveModuleId(): string | null {
  return this._activeModuleId
}
```

### 4.2. Perbaiki testUtils.tsx

1. Perbaiki fungsi `advanceTimersAndFlushPromises` untuk menangani timer dan promise dengan lebih baik:

```typescript
export async function advanceTimersAndFlushPromises(ms: number) {
  // Advance timers
  act(() => {
    jest.advanceTimersByTime(ms)
  })

  // Flush microtasks/promises - gunakan approach yang lebih reliable
  await act(async () => {
    await new Promise((resolve) => {
      // Menggunakan setTimeout dengan delay 0 untuk memastikan semua microtask queue dijalankan
      setTimeout(resolve, 0)
    })
  })
}
```

2. Tambahkan mock untuk `sonner` toast:

```typescript
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))
```

### 4.3. Perbaiki apiOptimization.integration.test.tsx

1. Perbaiki setup MSW handler untuk PUT request:

```typescript
http.put('/api/module/:moduleId/pages/:pageId', async ({ request, params }) => {
  apiCallCount++
  console.log(
    `[MSW] PUT handler called for pageId ${params.pageId}, count: ${apiCallCount}`
  )

  return HttpResponse.json({
    success: true,
    data: {
      ...mockPages[0],
      updatedAt: new Date(),
    },
  })
})
```

2. Gunakan pendekatan yang lebih robust untuk memastikan callback debounce terpanggil:

```typescript
// Fast-forward past debounce time + buffer
jest.advanceTimersByTime(2500)

// Flush promises
await act(async () => {
  await new Promise((resolve) => setTimeout(resolve, 0))
})

// Expect API call to have happened
expect(apiCallCount).toBe(1)
```

## 5. Implementasi

### Urutan Implementasi:

1. Perbaiki `modulePageService.ts` untuk menambahkan atau memperbaiki fungsi setActiveModuleId dan getActiveModuleId
2. Perbaiki `testUtils.tsx` untuk meningkatkan handling timer dan promise
3. Perbaiki `apiOptimization.integration.test.tsx` untuk memastikan MSW handler berfungsi dengan benar
4. Jalankan test untuk memverifikasi perbaikan

### Timeline dan Estimasi Effort:

- Perbaikan pada modulePageService.ts: 30 menit
- Perbaikan pada testUtils.tsx: 1 jam
- Perbaikan pada apiOptimization.integration.test.tsx: 1 jam
- Testing dan verifikasi: 1 jam

Total: ~3.5 jam

## 6. Metrik Keberhasilan

- Semua test dalam apiOptimization.integration.test.tsx lulus (PASS)
- Tidak ada warning act() dalam output test
- Konsistensi dalam pemanggilan API di test (apiCallCount bekerja dengan benar)

## 7. Referensi

- [Jest Timer Mocks](https://jestjs.io/docs/timer-mocks)
- [Testing Library Act](https://testing-library.com/docs/react-testing-library/api/#act)
- [MSW Documentation](https://mswjs.io/docs/)
- [TanStack Query Testing](https://tanstack.com/query/latest/docs/react/guides/testing)
