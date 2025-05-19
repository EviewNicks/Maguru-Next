# Rencana Implementasi Task 5.4: Perbaikan Error Handling dan Notifikasi

## 1. Deskripsi Tugas

**Tugas**: Meningkatkan sistem error handling dan notifikasi pada aplikasi modul pembelajaran untuk memberikan pengalaman pengguna yang lebih baik dan informatif ketika terjadi error.

**Masalah saat ini**:

- Error handling masih basic dan tidak memberikan informasi yang cukup kepada pengguna
- Format error tidak konsisten antar komponen dan fitur
- Saat terjadi error, tidak ada opsi untuk retry yang jelas
- Error boundary belum diimplementasikan untuk mencegah crash UI
- Notifikasi error kurang informatif dan spesifik tentang apa yang terjadi dan bagaimana menyelesaikannya

**Solusi yang diusulkan**:

- Standarisasi format error di seluruh aplikasi
- Implementasi error boundary untuk mencegah crash UI
- Perbaikan ErrorNotifier.tsx untuk pesan yang lebih informatif
- Penambahan mekanisme retry untuk operasi yang gagal
- Peningkatan UX dengan pesan error yang spesifik dan solusi yang jelas

## 2. Komponen Utama Error Handling

### 2.1. Perbaikan Format Error Standar

- Membuat struktur error yang konsisten dengan informasi berikut:
  - Kode error (untuk identifikasi)
  - Pesan error yang user-friendly
  - Detail teknis (opsional, hanya untuk development)
  - Saran tindakan (apa yang harus dilakukan pengguna)
  - Status dapat diulang (retry) atau tidak

### 2.2. Implementasi Error Boundary

- Membuat komponen error boundary untuk mencegah UI crash saat terjadi error
- Menampilkan fallback UI yang informatif
- Memberikan opsi untuk reload atau kembali ke halaman sebelumnya

### 2.3. Peningkatan Sistem Notifikasi

- Menyempurnakan komponen ErrorNotifier.tsx
- Mengkategorikan error berdasarkan jenisnya (network, validation, server, dll)
- Menambahkan durasi notifikasi yang tepat berdasarkan jenis error
- Menambahkan tombol aksi pada notifikasi (retry, dismiss, dll)

## 3. File yang Perlu Dimodifikasi

1. **`features/manage-module/components/ErrorNotifier.tsx`**:

   - Standarisasi format error dan pesan
   - Penambahan fungsi parseError untuk menganalisis error dengan lebih baik
   - Penambahan opsi retry untuk jenis error yang dapat diulang

2. **`features/manage-module/components/ErrorBoundary.tsx`** (baru):

   - Implementasi error boundary komponen
   - Pembuatan UI fallback yang informatif

3. **`features/manage-module/hooks/useModulePageCRUD.ts`**:

   - Perbaikan error handling untuk operasi CRUD
   - Integrasi dengan sistem notifikasi yang ditingkatkan

4. **`features/manage-module/hooks/useRichTextAutosave.ts`**:

   - Perbaikan error handling untuk proses autosave
   - Penambahan kategorisasi error untuk autosave

5. **`features/manage-module/context/ModulePageCRUDContext.tsx`**:
   - Peningkatan error handling di tingkat context
   - Penambahan state untuk tracking status error dan retry attempts

## 4. Rencana Implementasi

### 4.1. Perubahan pada ErrorNotifier.tsx

```typescript
// New error categorization function
export function categorizeError(error: unknown): ErrorCategory {
  // Check network errors
  if (
    error instanceof Error &&
    (error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('connection'))
  ) {
    return 'network'
  }

  // Check validation errors
  if (error instanceof Error && error.message.includes('validation')) {
    return 'validation'
  }

  // Handle API error responses
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as any).status
    if (status >= 400 && status < 500) return 'client'
    if (status >= 500) return 'server'
  }

  // Default category
  return 'unknown'
}

// Enhanced error notification
export function showEnhancedErrorNotification(error: unknown): void {
  const errorDetails = handleError(error)
  const category = categorizeError(error)

  // Configure duration based on error type
  const duration = category === 'network' ? 8000 : 5000

  // Enhanced toast with appropriate action buttons
  toast.error(errorDetails.message, {
    description: errorDetails.details || 'Terjadi kesalahan. Coba lagi nanti.',
    duration,
    action: {
      label: getActionLabelByCategory(category),
      onClick: () => handleErrorAction(error, category),
    },
  })
}
```

### 4.2. Implementasi ErrorBoundary.tsx

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryBase extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error('UI Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Terjadi kesalahan!</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Aplikasi mengalami masalah yang tidak terduga. Silakan muat ulang
            halaman atau kembali ke beranda.
          </p>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Muat Ulang
            </Button>
            <Button
              onClick={() => (window.location.href = '/')}
              className="flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper dengan router
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return <ErrorBoundaryBase fallback={fallback}>{children}</ErrorBoundaryBase>
}
```

### 4.3. Perbaikan Error Handling di CRUD Hooks

```typescript
// Di useModulePageCRUD.ts
// Improved error handling with retry mechanism
const updatePage = useMutation({
  // ...existing code
  onError: (error, variables, context) => {
    // Categorize error
    const errorCategory = categorizeError(error)

    // Determine if operation can be retried
    const canRetry = errorCategory === 'network' || errorCategory === 'server'

    // Rollback to previous state if mutation fails
    if (context?.previousState) {
      queryClient.setQueryData(
        ['modulePage', moduleId, variables.pageId],
        context.previousState
      )
    }

    // Show enhanced error notification with retry option if applicable
    showEnhancedErrorNotification(error, {
      retryFn: canRetry ? () => updatePage.mutate(variables) : undefined,
    })
  },
})
```

### 4.4. Integrasi Error Boundary dalam Aplikasi

```tsx
// Di app/(admin)/manage-module/pages/[moduleId]/page.tsx
import { ErrorBoundary } from '@/features/manage-module/components/ErrorBoundary'

export default function ModulePageEditorPage() {
  // ...existing code

  return (
    <ErrorBoundary>
      <Suspense fallback={<ModulePageEditorSkeleton />}>
        <ModulePageEditor
          moduleId={moduleId}
          initialPageId={pageId}
          onPageChange={handlePageChange}
        />
      </Suspense>
    </ErrorBoundary>
  )
}
```

## 5. Testing

### 5.1. Unit Testing

1. **Test error categorization**:

   - Verifikasi bahwa error dikategorikan dengan benar berdasarkan jenisnya
   - Pastikan pesan error yang ditampilkan sesuai dengan kategori

2. **Test ErrorBoundary**:

   - Simulasikan error dalam komponen child
   - Verifikasi ErrorBoundary menangkap error dan menampilkan fallback UI
   - Test fungsionalitas tombol reload dan navigate home

3. **Test retry mechanism**:
   - Simulasikan network error yang dapat diulang
   - Verifikasi bahwa tombol retry memanggil fungsi yang benar
   - Test bahwa state UI kembali normal setelah retry berhasil

### 5.2. File Testing yang Perlu Diupdate

1. **`features/manage-module/components/ErrorNotifier.test.tsx`** (update)
2. **`features/manage-module/components/ErrorBoundary.test.tsx`** (baru)
3. **`features/manage-module/hooks/useModulePageCRUD.test.ts`** (update)

## 6. Acceptance Criteria

- [ ] Format error konsisten di seluruh aplikasi
- [ ] Error dapat dikategorikan berdasarkan jenis (network, validation, server, dll)
- [ ] Error boundary berhasil mencegah UI crash ketika terjadi error
- [ ] Notifikasi error menampilkan informasi yang jelas dan spesifik
- [ ] Terdapat opsi retry untuk error yang dapat diulang
- [ ] Feedback visual yang jelas saat terjadi error dan saat recovery
- [ ] Semua unit test berjalan dengan sukses

## 7. Timeline Estimasi

Total estimasi: 1 hari kerja

- Perbaikan ErrorNotifier.tsx (3 jam)
- Implementasi ErrorBoundary.tsx (2 jam)
- Integrasi dengan CRUD hooks (2 jam)
- Testing dan fixing bugs (1 jam)

## 8. Referensi File yang Diperlukan

1. **Error Handling**

   - `features/manage-module/components/ErrorNotifier.tsx`
   - `features/manage-module/components/ErrorBoundary.tsx` (baru)

2. **Hooks & Context**

   - `features/manage-module/hooks/useModulePageCRUD.ts`
   - `features/manage-module/hooks/useRichTextAutosave.ts`
   - `features/manage-module/context/ModulePageCRUDContext.tsx`

3. **Komponen UI**

   - `app/(admin)/manage-module/pages/[moduleId]/page.tsx`
   - `features/manage-module/components/ModulePageEditor.tsx`
   - `features/manage-module/components/RichTextEditor.tsx`

4. **Tests**
   - `features/manage-module/components/ErrorNotifier.test.tsx`
   - `features/manage-module/components/ErrorBoundary.test.tsx` (baru)
   - `features/manage-module/hooks/useModulePageCRUD.test.ts`
