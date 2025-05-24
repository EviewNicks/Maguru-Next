

# Planning Implementasi Context API untuk Multi-Page Module

## 1. Analisis Situasi Saat Ini

Saat ini, fitur Multi-Page Module mengalami masalah props drilling dimana props seperti `moduleId`, `pageId`, `activePage`, dan handler functions diteruskan melalui beberapa level komponen:

- `page.tsx` → `ModulePageEditor.tsx` → `RichTextEditor.tsx` → `RichTextEditorWithAutosave.tsx`
- `layout.tsx` → `ModulePageSidebar.tsx` → `SidebarContent.tsx`

Meskipun sudah ada implementasi Context API (`ModulePagesContext` dan `ModulePageCRUDContext`), masih ada beberapa state dan handler yang perlu dioptimalkan.

## 2. Tujuan Implementasi

1. Mengurangi props drilling dengan memindahkan lebih banyak state dan handler ke dalam Context API
2. Memisahkan tanggung jawab context dengan jelas (UI state vs. Data state)
3. Mengoptimalkan performa dengan mencegah re-render yang tidak perlu
4. Meningkatkan maintainability kode dengan struktur yang lebih terorganisir

## 3. Rencana Implementasi

### 3.1 Perbaikan ModulePageCRUDContext

#### Tambahkan State untuk Editor dan Navigasi:

```typescript
// Di ModulePageCRUDContext
const [saveStatus, setSaveStatus] = useState<
  'saved' | 'saving' | 'unsaved' | 'error'
>('saved')
const [isNavigating, setIsNavigating] = useState<boolean>(false)
```

#### Tambahkan Handler Functions:

```typescript
// Di ModulePageCRUDContext
const handlePageChange = useCallback(
  (newPageId: string) => {
    // Tandai bahwa ini adalah navigasi halaman
    setIsNavigating(true)

    // Navigasi ke halaman baru
    router.push(`/manage-module/pages/${moduleId}?pageId=${newPageId}`)

    // Hapus flag navigasi setelah navigasi selesai
    setTimeout(() => {
      setIsNavigating(false)
    }, 500)
  },
  [moduleId, router]
)

const handleSelectPage = useCallback(
  (page: ModulePage) => {
    setActivePage(page)
    handlePageChange(page.id)
  },
  [setActivePage, handlePageChange]
)

const handleEditorChange = useCallback(
  (content: object, pageId: string) => {
    if (!pageId) return

    // Jika sedang navigasi, jangan update konten
    if (isNavigating) return

    setSaveStatus('saving')

    // Konversi konten ke format yang diharapkan API
    const updatedBlocks: ContentBlock[] = [
      {
        type: ContentBlockType.TEXT,
        content: JSON.stringify(content),
      },
    ]

    // Simpan perubahan
    updatePage.mutate(
      { pageId, updateData: { blocks: updatedBlocks } },
      {
        onSuccess: () => setSaveStatus('saved'),
        onError: () => setSaveStatus('error'),
      }
    )
  },
  [isNavigating, updatePage]
)
```

#### Optimalkan Context Value dengan useMemo:

```typescript
const value = useMemo(
  () => ({
    moduleId,
    pages,
    activePage,
    setActivePage,
    createPage,
    updatePage,
    deletePage,
    isLoading,
    getNextPage,
    getPreviousPage,
    getFirstPage,
    getLastPage,
    saveStatus,
    setSaveStatus,
    isNavigating,
    setIsNavigating,
    handlePageChange,
    handleSelectPage,
    handleEditorChange,
  }),
  [
    moduleId,
    pages,
    activePage,
    isLoading,
    saveStatus,
    isNavigating,
    handlePageChange,
    handleSelectPage,
    handleEditorChange,
    // ...
  ]
)
```

### 3.2 Penyesuaian Komponen untuk Menggunakan Context

#### ModulePageEditor.tsx:

```typescript
export default function ModulePageEditor({
  initialPageId,
  isLoading: propIsLoading,
}: {
  initialPageId?: string;
  isLoading?: boolean;
}) {
  // Gunakan context untuk mengakses state dan handler
  const {
    activePage,
    isLoading: crudLoading,
    handleEditorChange,
    saveStatus,
    getNextPage,
    getPreviousPage,
    handlePageChange,
  } = useModulePageCRUDContext();

  // Gabungkan status loading dari props dan context
  const isLoading = propIsLoading || crudLoading;

  // Hitung currentPage dan totalPages untuk navigasi
  const { pages } = useModulePageCRUDContext();
  const currentPage = (pages?.findIndex((page) => page.id === activePage?.id) || 0) + 1;
  const totalPages = pages?.length || 0;

  // ...kode lainnya...

  return (
    <>
      {/* Header */}
      <DocumentHeader
        title={activePage?.title || ''}
        onTitleChange={handleTitleChange}
        saveStatus={saveStatus}
        pageId={activePage?.id}
      />

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        <RichTextEditor
          className="h-full"
          initialContent={initialContent}
          pageId={activePage?.id}
          autosave={true}
        />
      </div>

      {/* Footer Navigation */}
      <ModulePageFooterNav
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={() => handlePageChange(getPreviousPage(activePage?.id)?.id)}
        onNext={() => handlePageChange(getNextPage(activePage?.id)?.id)}
        isLoading={isNavigating}
      />
    </>
  );
}
```

#### RichTextEditor.tsx:

```typescript
export function RichTextEditor({
  className,
  initialContent,
  pageId,
  autosave = false,
}: RichTextEditorProps) {
  // Gunakan context untuk mengakses moduleId dan handler
  const { moduleId, handleEditorChange } = useModulePageCRUDContext();

  // ...kode lainnya...

  // Jika pageId disediakan dan autosave diaktifkan, gunakan RichTextEditorWithAutosave
  if (pageId && autosave) {
    return (
      <RichTextEditorWithAutosave
        pageId={pageId}
        className={className}
        initialContent={initialContent}
        onChange={(content) => handleEditorChange(content, pageId)}
      />
    );
  }

  // ...kode lainnya...
}
```

#### RichTextEditorWithAutosave.tsx:

```typescript
export function RichTextEditorWithAutosave({
  pageId,
  className,
  initialContent,
  onChange,
}: Omit<RichTextEditorProps, 'autosave'> & { pageId: string }) {
  // Gunakan context untuk mengakses moduleId dan isNavigating
  const { moduleId, isNavigating } = useModulePageCRUDContext()

  // ...kode lainnya...

  // Fetch page data from API
  useEffect(() => {
    const controller = new AbortController()

    const fetchPageData = async () => {
      if (!pageId) return

      // Periksa flag navigasi - jangan fetch jika sedang navigasi halaman
      if (isNavigating) {
        console.log(
          '[RichTextEditorWithAutosave] Navigation in progress, skipping fetch'
        )
        return
      }

      // ...kode fetch data...
    }

    fetchPageData()

    return () => {
      controller.abort()
    }
  }, [pageId, moduleId, isNavigating])

  // ...kode lainnya...
}
```

#### ModulePageSidebar.tsx:

```typescript
export default function ModulePageSidebar() {
  // Gunakan context untuk UI state
  const { isSidebarOpen, toggleSidebar, expandedItems, toggleExpand } = useModulePagesContext();

  // Gunakan context untuk data dan handler
  const { pages, activePage, handleSelectPage, createPage } = useModulePageCRUDContext();

  // ...kode lainnya...

  return (
    <div
      data-sidebar="true"
      className={`fixed right-0 top-0 h-full transition-all duration-300 z-50 ${
        isSidebarOpen ? 'w-64' : 'w-8'
      }`}
    >
      {/* Toggle Button */}
      <button onClick={toggleSidebar}>
        {isSidebarOpen ? <ChevronRight /> : <ChevronLeft />}
      </button>

      {/* Sidebar Content */}
      {isSidebarOpen && (
        <>
          <SidebarHeader />
          <SidebarContent
            expandedItems={expandedItems}
            toggleExpand={toggleExpand}
            pages={pages}
            activePage={activePage}
            onSelectPage={handleSelectPage}
            onCreatePage={() => createPage({ /* default page data */ })}
          />
        </>
      )}
    </div>
  );
}
```

### 3.3 Penyesuaian page.tsx dan layout.tsx

#### layout.tsx:

```typescript
export default function ModulePageLayout({ children }: ModulePageLayoutProps) {
  const params = useParams();
  const moduleId = params.moduleId as string;

  return (
    <ModulePagesProvider>
      <ModulePageCRUDProvider moduleId={moduleId}>
        <ModulePageLayoutContent>{children}</ModulePageLayoutContent>
      </ModulePageCRUDProvider>
    </ModulePagesProvider>
  );
}

function ModulePageLayoutContent({ children }: ModulePageLayoutProps) {
  // Tidak perlu lagi meneruskan banyak props ke komponen child
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Toaster position="top-right" />
      <div className="h-screen overflow-hidden">
        {children}
        <ModulePageSidebar />
      </div>
    </div>
  );
}
```

#### page.tsx:

```typescript
export default function ModulePageEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Mendapatkan moduleId dari URL parameters
  const moduleId = params.moduleId as string;

  // Mendapatkan pageId dari query parameters (jika ada)
  const pageId = searchParams.get('pageId') || undefined;

  // Gunakan context untuk mengakses state dan handler
  const { setActivePage, pages } = useModulePageCRUDContext();

  // Efek untuk mengatur activePage berdasarkan pageId dari URL
  useEffect(() => {
    if (pageId && pages.length > 0) {
      const currentPage = pages.find((page) => page.id === pageId);
      if (currentPage) {
        setActivePage(currentPage);
      }
    }
  }, [pageId, pages, setActivePage]);

  // ...kode lainnya...

  return (
    <ErrorBoundary fallback={editorErrorFallback}>
      <Suspense fallback={<ModulePageEditorSkeleton />}>
        <ModulePageEditor
          initialPageId={pageId}
          isLoading={false}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## 4. Langkah-langkah Implementasi

1. **Perbaiki ModulePageCRUDContext**:

   - Tambahkan state `saveStatus` dan `isNavigating`
   - Tambahkan handler functions: `handlePageChange`, `handleSelectPage`, `handleEditorChange`
   - Optimalkan context value dengan useMemo

2. **Sesuaikan ModulePagesContext**:

   - Pastikan fokus hanya pada UI state (sidebar, expanded items)
   - Hapus state yang sudah ada di ModulePageCRUDContext

3. **Refaktor Komponen untuk Menggunakan Context**:

   - ModulePageEditor.tsx
   - RichTextEditor.tsx
   - RichTextEditorWithAutosave.tsx
   - ModulePageSidebar.tsx
   - SidebarContent.tsx
   - ModulePageFooterNav.tsx

4. **Sesuaikan page.tsx dan layout.tsx**:

   - Sederhanakan props yang diteruskan ke komponen child
   - Gunakan context untuk mengakses state dan handler

5. **Testing**:
   - Uji navigasi antar halaman
   - Uji autosave konten
   - Uji toggle sidebar
   - Uji pembuatan dan penghapusan halaman

## 5. Manfaat yang Diharapkan

1. **Kode yang Lebih Bersih**: Mengurangi props drilling dan membuat kode lebih mudah dibaca
2. **Performa yang Lebih Baik**: Mencegah re-render yang tidak perlu dengan useMemo dan useCallback
3. **Maintainability yang Lebih Baik**: Pemisahan tanggung jawab yang jelas antara UI state dan data state
4. **Developer Experience yang Lebih Baik**: Lebih mudah untuk menambahkan fitur baru dan melakukan debugging

## 6. Daftar Referensi File

1. **Context Files**:

   - `features/manage-module/context/ModulePagesContext.tsx`
   - `features/manage-module/context/ModulePageCRUDContext.tsx`

2. **Hook Files**:

   - `features/manage-module/hooks/useModulePageCRUD.ts`
   - `features/manage-module/hooks/useModulePageEditor.ts`
   - `features/manage-module/hooks/useRichTextAutosave.ts`

3. **Component Files**:

   - `app/(admin)/manage-module/pages/[moduleId]/page.tsx`
   - `app/(admin)/manage-module/pages/[moduleId]/layout.tsx`
   - `features/manage-module/components/ModulePageEditor.tsx`
   - `features/manage-module/components/RichTextEditor.tsx`
   - `features/manage-module/components/RichTextEditorWithAutosave.tsx`
   - `features/manage-module/components/ModulePageSidebar.tsx`
   - `features/manage-module/components/ModulePageEditor/sidebar/SidebarContent.tsx`
   - `features/manage-module/components/ModulePageFooterNav.tsx`

4. **Type Files**:

   - `features/manage-module/types/modulePageSchema.ts`
   - `features/manage-module/types/index.ts`

5. **Service Files**:
   - `features/manage-module/services/modulePageService.ts`
