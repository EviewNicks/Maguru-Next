# Task 5.5: Integrasi Penuh DocumentHeader dengan API

## Status Task

**Prioritas:** Tinggi  
**Estimasi Waktu:** 1 hari  
**Bagian Dari:** OPS-140 (Manajemen Konten Multi-Page)  
**Status:** ✅ SELESAI [update+2025-07-07]

## Deskripsi Masalah

Saat ini, DocumentHeader pada ModulePageEditor belum terintegrasi sepenuhnya dengan API backend. Beberapa masalah yang ditemui:

1. Tombol-tombol utama belum berfungsi:
   - Tombol "Create" belum memicu pembuatan halaman baru
   - Tombol "Close draft" belum melakukan penghapusan halaman
2. Autosave judul masih bermasalah:

   - Tidak ada konfirmasi visual yang jelas saat judul disimpan
   - Terdapat inconsistensi antara state UI dan data backend

3. User experience kurang optimal:
   - Tidak ada dialog konfirmasi untuk aksi berisiko tinggi (menghapus halaman)
   - Antarmuka tidak responsif terhadap status operasi
4. fungsionalitas yang belum di kerjakan sekarang:
   - memberikan notifikasi errorNotifier terkait fungsionalitas belum di kerjakan.

## Tujuan Implementasi

Mengintegrasikan komponen DocumentHeader.tsx sepenuhnya dengan ModulePageCRUDContext untuk:

1. Mengimplementasikan fungsi tombol "Create" untuk membuat halaman baru
2. Mengimplementasikan fungsi tombol "Close draft" untuk menghapus halaman saat ini
3. Memperbaiki autosave judul dengan indikator status yang jelas
4. Menambahkan dialog konfirmasi untuk aksi berbahaya seperti menghapus halaman
5. Meningkatkan UX dengan feedback visual yang konsisten

## Langkah-langkah Implementasi

### 1. Analisis Komponen dan Context yang Ada

- [x] Analisis `DocumentHeader.tsx`
- [x] Analisis `ModulePageCRUDContext.tsx`
- [x] Analisis `useModulePageCRUD.ts`

### 2. Implementasi Tombol "Create"

1. [x] Modifikasi fungsi handler pada tombol "Create":

   ```tsx
   const handleCreate = async () => {
     try {
       // Set status ke loading
       setIsCreating(true)

       // Membuat halaman baru dengan createPage dari context
       const newPage = await createPage({
         moduleId,
         title: 'Halaman Baru',
         order: pages.length,
         blocks: [],
       })

       // Setelah berhasil, set halaman baru sebagai halaman aktif
       if (newPage && newPage.data) {
         setActivePage(newPage.data)
       }

       // Tampilkan toast sukses
       toast.success('Halaman baru berhasil dibuat')
     } catch (error) {
       console.error('Error creating new page:', error)
     } finally {
       setIsCreating(false)
     }
   }
   ```

2. [x] Tambahkan state loading untuk tombol Create:

   ```tsx
   const [isCreating, setIsCreating] = useState(false)
   ```

3. [x] Update UI tombol Create untuk menampilkan loading state:
   ```tsx
   <Button
     className="bg-[#1868db] hover:bg-[#1868db]/90 text-white"
     onClick={handleCreate}
     disabled={isCreating}
   >
     {isCreating ? (
       <>
         <Loader2 className="h-4 w-4 mr-1 animate-spin" />
         Creating...
       </>
     ) : (
       <>
         <Plus className="h-4 w-4 mr-1" />
         Create
       </>
     )}
   </Button>
   ```

### 3. Implementasi Tombol "Close draft"

1. [x] Buat state untuk dialog konfirmasi:

   ```tsx
   const [showDeleteDialog, setShowDeleteDialog] = useState(false)
   ```

2. [x] Implementasi dialog konfirmasi menggunakan AlertDialog:

   ```tsx
   <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
     <AlertDialogContent>
       <AlertDialogHeader>
         <AlertDialogTitle>Hapus halaman?</AlertDialogTitle>
         <AlertDialogDescription>
           Tindakan ini tidak dapat dibatalkan. Halaman ini akan dihapus secara
           permanen.
         </AlertDialogDescription>
       </AlertDialogHeader>
       <AlertDialogFooter>
         <AlertDialogCancel>Batal</AlertDialogCancel>
         <AlertDialogAction
           onClick={handleDeleteConfirm}
           className="bg-red-500 hover:bg-red-600"
         >
           Hapus
         </AlertDialogAction>
       </AlertDialogFooter>
     </AlertDialogContent>
   </AlertDialog>
   ```

3. [x] Tambahkan handler untuk membuka dialog:

   ```tsx
   const handleCloseDraft = () => {
     if (pageId) {
       setShowDeleteDialog(true)
     }
   }
   ```

4. [x] Tambahkan handler untuk konfirmasi hapus:

   ```tsx
   const [isDeleting, setIsDeleting] = useState(false)

   const handleDeleteConfirm = async () => {
     if (!pageId) return

     try {
       setIsDeleting(true)
       await deletePage(pageId)
       setShowDeleteDialog(false)
       // Navigasi ke halaman lain akan ditangani oleh context
       // karena kita sudah mengimplementasikan logika di deletePage
     } catch (error) {
       console.error('Error deleting page:', error)
     } finally {
       setIsDeleting(false)
     }
   }
   ```

5. [x] Update tombol Close draft:
   ```tsx
   <Button
     variant="ghost"
     className="text-[#a9abaf] h-8 mr-2"
     aria-label="Tutup draft"
     onClick={handleCloseDraft}
     disabled={!pageId || isDeleting}
   >
     {isDeleting ? (
       <>
         <Loader2 className="h-4 w-4 mr-1 animate-spin" />
         Deleting...
       </>
     ) : (
       'Close draft'
     )}
   </Button>
   ```

### 4. Perbaikan Autosave Judul

1. [x] Tambahkan state untuk tracking status save judul:

   ```tsx
   const [titleSaveStatus, setTitleSaveStatus] = useState<
     'saved' | 'saving' | 'unsaved' | 'error'
   >('saved')
   ```

2. [x] Perbaiki implementasi autosave pada useEffect:

   ```tsx
   useEffect(() => {
     if (
       debouncedTitle !== title &&
       pageId &&
       debouncedTitle.trim().length >= 5
     ) {
       const saveTitle = async () => {
         try {
           setTitleSaveStatus('saving')
           await savePage({
             pageId,
             title: debouncedTitle,
           })
           setTitleSaveStatus('saved')
         } catch (error) {
           console.error('Error saving title:', error)
           setTitleSaveStatus('error')

           // Show error notification
           showErrorNotification(error, {
             retryFn: () => saveTitle(),
           })
         }
       }

       saveTitle()
     } else if (
       debouncedTitle.trim().length > 0 &&
       debouncedTitle.trim().length < 5
     ) {
       // Jika judul terlalu pendek, tampilkan error
       setTitleSaveStatus('error')
       toast.error('Judul harus terdiri dari minimal 5 karakter')
     }
   }, [debouncedTitle, title, pageId, savePage])
   ```

3. [x] Perbaiki tampilan status save:

   ```tsx
   const renderSaveStatus = () => {
     switch (titleSaveStatus) {
       case 'saved':
         return (
           <div
             className="flex items-center text-[#a9abaf] mr-2"
             aria-live="polite"
           >
             <CheckCircle
               className="h-3 w-3 mr-1 text-green-500"
               aria-hidden="true"
             />
             <span>Tersimpan</span>
           </div>
         )
       case 'saving':
         return (
           <div
             className="flex items-center text-[#a9abaf] mr-2"
             aria-live="polite"
           >
             <Loader2
               className="h-3 w-3 mr-1 animate-spin"
               aria-hidden="true"
             />
             <span>Menyimpan...</span>
           </div>
         )
       case 'unsaved':
         return (
           <div
             className="flex items-center text-[#a9abaf] mr-2"
             aria-live="polite"
           >
             <Clock
               className="h-3 w-3 mr-1 text-amber-500"
               aria-hidden="true"
             />
             <span>Belum tersimpan</span>
           </div>
         )
       case 'error':
         return (
           <div
             className="flex items-center text-red-400 mr-2"
             aria-live="assertive"
           >
             <AlertCircle className="h-3 w-3 mr-1" aria-hidden="true" />
             <span>Gagal menyimpan</span>
           </div>
         )
       default:
         return null
     }
   }
   ```

4. [x] Tambahkan validasi langsung pada input judul:

   ```tsx
   const handleTitleChange = useCallback(
     (e: React.ChangeEvent<HTMLInputElement>) => {
       const newTitle = e.target.value
       setLocalTitle(newTitle)

       // Set status langsung ke unsaved untuk feedback instan
       setTitleSaveStatus('unsaved')

       if (onTitleChange) {
         onTitleChange(newTitle)
       }
     },
     [onTitleChange]
   )
   ```

### 5. Integrasi dengan ModulePageCRUDContext

1. [x] Tambahkan lebih banyak prop yang diambil dari context:

   ```tsx
   const {
     moduleId,
     pages,
     activePage,
     isLoading,
     setActivePage,
     createPage,
     deletePage,
     savePage,
   } = useModulePageCRUDContext()
   ```

2. [x] Update props pada DocumentHeader untuk menerima nilai dari context:

   ```tsx
   interface DocumentHeaderProps {
     title?: string
     onTitleChange?: (title: string) => void
     saveStatus?: 'saved' | 'saving' | 'unsaved' | 'error'
     pageId?: string
   }
   ```

3. [x] Pastikan pageId digunakan dari props atau dari activePage:
   ```tsx
   const effectivePageId = pageId || (activePage ? activePage.id : undefined)
   ```

### 6. Testing & Refinement

1. [x] Buat unit test untuk DocumentHeader dengan integrasi API baru:

   ```tsx
   // DocumentHeader.test.tsx
   // - Test tombol Create
   // - Test tombol Close draft
   // - Test autosave judul
   // - Test dialog konfirmasi
   ```

2. [x] Tambahkan a11y improvements:

   ```tsx
   // Pastikan semua elemen UI memiliki aria-label yang sesuai
   // Pastikan dialog menggunakan role yang benar
   // Tambahkan keyboard shortcuts untuk aksi umum
   ```

3. [x] Fix style issues:
   ```tsx
   // Pastikan UI konsisten untuk semua state (idle, loading, error)
   // Buat transisi animasi yang halus
   ```

## Subtask Checklist

- [x] **1. Analisis komponen yang ada**

  - [x] 1.1 Review struktur DocumentHeader.tsx
  - [x] 1.2 Review ModulePageCRUDContext.tsx dan useModulePageCRUD.ts
  - [x] 1.3 Identifikasi fungsi yang diperlukan untuk implementasi

- [x] **2. Implementasi tombol "Create"**

  - [x] 2.1 Tambahkan handler untuk membuat halaman baru
  - [x] 2.2 Tambahkan loading state
  - [x] 2.3 Tambahkan feedback visual
  - [x] 2.4 Implementasi navigasi ke halaman baru setelah dibuat

- [x] **3. Implementasi tombol "Close draft"**

  - [x] 3.1 Buat dialog konfirmasi AlertDialog
  - [x] 3.2 Tambahkan handler untuk membuka dialog
  - [x] 3.3 Tambahkan handler untuk konfirmasi hapus
  - [x] 3.4 Tambahkan loading state
  - [x] 3.5 Implementasi navigasi setelah halaman dihapus

- [x] **4. Perbaikan autosave judul**

  - [x] 4.1 Perbaiki state tracking untuk status save
  - [x] 4.2 Implementasi indikator status yang lebih informatif
  - [x] 4.3 Tambahkan validasi input
  - [x] 4.4 Perbaiki error handling

- [x] **5. Integrasi dengan ModulePageCRUDContext**

  - [x] 5.1 Update interface props
  - [x] 5.2 Tambahkan props dari context
  - [x] 5.3 Pastikan semua fungsi menggunakan context

- [x] **6. Testing dan refinement**
  - [x] 6.1 Buat unit test untuk DocumentHeader
  - [x] 6.2 Tambahkan aksesibilitas (a11y)
  - [x] 6.3 Perbaiki style dan UI
  - [x] 6.4 Verifikasi semua flow berhasil

## Expected Outcome

Setelah implementasi selesai, DocumentHeader akan memiliki fitur sebagai berikut:

1. Tombol "Create" yang berfungsi penuh untuk membuat halaman baru
2. Tombol "Close draft" dengan dialog konfirmasi untuk menghapus halaman
3. Autosave judul dengan indikator status yang jelas dan informatif
4. Feedback visual yang responsif untuk semua operasi API
5. Dialog konfirmasi untuk operasi berbahaya
6. Error handling yang baik untuk semua kemungkinan kesalahan

Semua perubahan harus diimplementasikan dengan mempertahankan aksesibilitas dan konsistensi UI.
