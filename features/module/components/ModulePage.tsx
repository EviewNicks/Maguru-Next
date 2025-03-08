// features/module/components/ModulePage.tsx
import { useEffect, useState, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { selectUserId } from '@/store/features/userSlice'
import useModuleProgress from '@/features/module/hooks/useModuleProgress'
import ModuleContent from '@/features/module/components/ModuleContent'
import ModuleNavigation from '@/features/module/components/ModuleNavigation'
import ModuleProgress from '@/features/module/components/ModuleProgress'
import SummaryCard from '@/features/module/components/SummaryCard'
import { Card } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

interface ModulePageProps {
  moduleId: string
  quickViewMode?: boolean
}

const ModulePage: React.FC<ModulePageProps> = ({ moduleId, quickViewMode: initialQuickViewMode = false }) => {
  const userId = useSelector(selectUserId)
  const {
    currentPage,
    progressPercentage,
    currentModule,
    currentPageData,
    isPageCompleted,
    quickViewMode,
    incompleteSections,
    navigationHistory,
    goToNextPage,
    goToPrevPage,
    navigateToPage,
    setPageCompletionStatus,
    toggleQuickViewMode,
  } = useModuleProgress({ 
    moduleId, 
    userId: userId || 'default-user',
    initialQuickViewMode
  })

  // State untuk melacak interaksi pengguna dengan halaman
  const [userInteractions, setUserInteractions] = useState<Set<string>>(new Set())
  
  // Ref untuk melacak interaksi yang hilang dan status penyelesaian
  const prevMissingInteractionsRef = useRef<string[]>([])
  const prevIsPageCompletedRef = useRef<boolean>(isPageCompleted)

  // Fungsi untuk mencatat interaksi pengguna
  const recordInteraction = useCallback((interactionId: string) => {
    setUserInteractions(prev => {
      const newInteractions = new Set(prev)
      newInteractions.add(interactionId)
      return newInteractions
    })
  }, [setUserInteractions])

  // Fungsi untuk menyorot bagian yang belum selesai
  const highlightIncompleteSections = useCallback(() => {
    // Implementasi nyata akan menambahkan kelas CSS atau efek visual ke elemen yang belum selesai
    console.log('Menyorot bagian yang belum selesai:', incompleteSections)
    
    // Contoh: tambahkan kelas CSS ke elemen dengan ID yang sesuai
    incompleteSections.forEach(sectionId => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.classList.add('highlight-incomplete')
        // Tambahkan kelas untuk animasi perhatian
        element.classList.add('pulse-attention')
        // Hapus kelas animasi setelah beberapa saat
        setTimeout(() => {
          element.classList.remove('pulse-attention')
        }, 2000)
      }
    })
  }, [incompleteSections])

  // Fungsi untuk menangani navigasi dengan validasi
  const handleNavigateToPage = useCallback((pageNumber: number, force: boolean = false) => {
    const success = navigateToPage(pageNumber, force)
    
    if (!success && !force && !quickViewMode && pageNumber > currentPage) {
      // Tampilkan toast jika navigasi gagal karena halaman belum selesai
      toast({
        title: "Halaman belum selesai",
        description: incompleteSections.length > 0 
          ? `Selesaikan bagian berikut: ${incompleteSections.join(', ')}` 
          : "Selesaikan halaman ini terlebih dahulu atau aktifkan Mode Eksplorasi Cepat",
        variant: "destructive",
      })
      
      // Sorot bagian yang belum selesai
      highlightIncompleteSections()
    }
    
    return success
  }, [navigateToPage, quickViewMode, currentPage, incompleteSections, highlightIncompleteSections])

  // Efek untuk memperbarui status penyelesaian halaman berdasarkan interaksi pengguna
  useEffect(() => {
    if (!currentPageData) return;
    
    const requiredInteractions = currentPageData.requiredInteractions || [];
    
    // Jika tidak ada interaksi yang diperlukan, halaman dianggap selesai
    if (requiredInteractions.length === 0) {
      if (!isPageCompleted && !prevIsPageCompletedRef.current) {
        setPageCompletionStatus(true, []);
        prevIsPageCompletedRef.current = true;
      }
    } else {
      const missingInteractions = requiredInteractions.filter(
        interaction => !userInteractions.has(interaction)
      );
      
      // Bandingkan dengan nilai sebelumnya
      const isCompleted = missingInteractions.length === 0;
      if (isCompleted !== prevIsPageCompletedRef.current) {
        setPageCompletionStatus(isCompleted, missingInteractions);
        prevIsPageCompletedRef.current = isCompleted;
      }
      
      prevMissingInteractionsRef.current = missingInteractions;
    }
  }, [userInteractions, currentPageData, isPageCompleted, setPageCompletionStatus]) // Menambahkan dependensi yang hilang

  useEffect(() => {
    // Scroll to top when page changes
    window.scrollTo(0, 0)
  }, [currentPage])

  // Efek untuk logging saat pengguna membuka halaman terakhir
  useEffect(() => {
    if (currentPageData?.isLastPage) {
      console.log('Pengguna membuka halaman terakhir modul', {
        moduleId,
        userId,
        timestamp: new Date().toISOString(),
        navigationHistory
      })
      
      // Simpan status ke localStorage
      const moduleCompletion = {
        moduleId,
        userId,
        lastVisitedPage: currentPage,
        visitedPages: navigationHistory,
        timestamp: new Date().toISOString()
      }
      
      localStorage.setItem(`module_last_page_${moduleId}`, JSON.stringify(moduleCompletion))
    }
  }, [currentPageData?.isLastPage, moduleId, userId, currentPage, navigationHistory])

  if (!currentModule || !currentPageData) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p>Modul tidak ditemukan atau sedang dimuat...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">{currentModule.title}</h1>
      <p className="text-muted-foreground mb-6">{currentModule.description}</p>
      
      <ModuleProgress
        currentPage={currentPage}
        totalPages={currentModule.totalPages}
        progressPercentage={progressPercentage}
      />
      
      <div className="my-6">
        {currentPageData.isLastPage ? (
          <SummaryCard
            moduleData={currentModule}
            visitedPages={navigationHistory}
            currentPage={currentPage}
            totalPages={currentModule.totalPages}
            onNavigateToPage={handleNavigateToPage}
            progressPercentage={progressPercentage}
          />
        ) : (
          <ModuleContent
            title={currentPageData.title}
            content={currentPageData.content}
            media={currentPageData.media}
            onInteraction={recordInteraction}
          />
        )}
      </div>
      
      <ModuleNavigation
        currentPage={currentPage}
        totalPages={currentModule.totalPages}
        onPrevPage={goToPrevPage}
        onNextPage={goToNextPage}
        isLastPage={currentPageData.isLastPage}
        isPageCompleted={isPageCompleted}
        quickViewMode={quickViewMode}
        onToggleQuickViewMode={toggleQuickViewMode}
        incompleteSections={incompleteSections}
        visitedPages={navigationHistory}
      />
      
      {currentModule.totalPages > 3 && (
        <Card className="mt-8 p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: currentModule.totalPages }).map((_, index) => {
              const pageNum = index + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => handleNavigateToPage(pageNum)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    pageNum === currentPage
                      ? 'bg-primary text-primary-foreground'
                      : pageNum < currentPage || quickViewMode
                      ? 'bg-muted hover:bg-muted-foreground/20'
                      : 'bg-muted/50 hover:bg-muted-foreground/10 cursor-not-allowed'
                  }`}
                  disabled={!quickViewMode && pageNum > currentPage && !isPageCompleted}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

export default ModulePage