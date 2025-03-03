// features/module/hooks/useModuleProgress.ts
import { useDispatch, useSelector } from 'react-redux'
import {
  SET_CURRENT_PAGE,
  SET_MODULE_COMPLETED,
  SET_MODULE_ID,
  SET_USER_ID,
  SET_PROGRESS_PERCENTAGE,
  RESET_PROGRESS,
  selectCurrentPage,
  selectIsModuleCompleted,
  selectModuleId,
  selectProgressPercentage,
} from '@/store/features/progressSlice'
import { useEffect, useCallback, useState } from 'react'
import modules from '@/features/module/data/moduleData'
import { ModuleData } from '@/features/module/types'

interface UseModuleProgressProps {
  moduleId?: string
  userId?: string
}

const useModuleProgress = ({
  moduleId,
  userId,
}: UseModuleProgressProps = {}) => {
  const dispatch = useDispatch()
  const currentPage = useSelector(selectCurrentPage)
  const isModuleCompleted = useSelector(selectIsModuleCompleted)
  const currentModuleId = useSelector(selectModuleId)
  const progressPercentage = useSelector(selectProgressPercentage)

  // State untuk mode eksplorasi cepat
  const [quickViewMode, setQuickViewMode] = useState(false)
  // State untuk menandai apakah halaman saat ini sudah selesai
  const [isPageCompleted, setIsPageCompleted] = useState(true)
  // State untuk menyimpan bagian yang belum selesai
  const [incompleteSections, setIncompleteSections] = useState<string[]>([])
  // State untuk logging navigasi
  const [navigationHistory, setNavigationHistory] = useState<number[]>([])

  // Fungsi untuk mendapatkan data modul berdasarkan ID
  const getModuleById = useCallback((id: string): ModuleData | undefined => {
    return modules.find((moduleItem) => moduleItem.id === id)
  }, [])

  // Fungsi untuk mendapatkan modul saat ini
  const getCurrentModule = (): ModuleData | undefined => {
    if (!currentModuleId) return undefined
    return getModuleById(currentModuleId)
  }

  // Fungsi untuk mendapatkan halaman saat ini
  const getCurrentPage = () => {
    const currentModule = getCurrentModule()
    if (!currentModule || !currentPage) return undefined
    return currentModule.pages.find((page) => page.pageNumber === currentPage)
  }

  // Fungsi untuk menghitung persentase kemajuan
  const calculateProgressPercentage = useCallback(
    (currentPageNum: number, totalPages: number): number => {
      return Math.round((currentPageNum / totalPages) * 100)
    },
    []
  )

  // Fungsi untuk menyorot bagian yang belum selesai
  const highlightIncompleteSections = (sections: string[]) => {
    setIncompleteSections(sections)
    return sections
  }

  // Fungsi untuk mengatur status penyelesaian halaman
  const setPageCompletionStatus = (isCompleted: boolean, sections: string[] = []) => {
    setIsPageCompleted(isCompleted)
    setIncompleteSections(sections)
    return isCompleted
  }

  // Fungsi untuk toggle mode eksplorasi cepat
  const toggleQuickViewMode = () => {
    const newMode = !quickViewMode
    setQuickViewMode(newMode)

    // Tampilkan peringatan jika mode eksplorasi cepat diaktifkan
    if (newMode) {
      console.log('Mode eksplorasi cepat diaktifkan. Progres tidak akan disimpan.')
    }

    return newMode
  }

  // Fungsi untuk pindah ke halaman berikutnya
  const goToNextPage = () => {
    const currentModule = getCurrentModule()
    if (!currentModule) return

    // Jika halaman belum selesai dan bukan mode eksplorasi cepat, tampilkan peringatan
    if (!isPageCompleted && !quickViewMode && currentPage < currentModule.totalPages) {
      console.log('Halaman belum selesai. Selesaikan halaman ini terlebih dahulu atau aktifkan mode eksplorasi cepat.')
      return false
    }

    if (currentPage < currentModule.totalPages) {
      const nextPage = currentPage + 1

      // Catat navigasi untuk analitik
      logNavigation(currentPage, nextPage)

      dispatch(SET_CURRENT_PAGE(nextPage))

      const newProgressPercentage = calculateProgressPercentage(
        nextPage,
        currentModule.totalPages
      )
      dispatch(SET_PROGRESS_PERCENTAGE(newProgressPercentage))

      // Jika halaman terakhir, tandai modul sebagai selesai
      if (nextPage === currentModule.totalPages) {
        dispatch(SET_MODULE_COMPLETED(true))
      }

      // Reset status penyelesaian halaman
      setIsPageCompleted(true)
      setIncompleteSections([])

      return true
    }

    return false
  }

  // Fungsi untuk pindah ke halaman sebelumnya
  const goToPrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1

      // Catat navigasi untuk analitik
      logNavigation(currentPage, prevPage)

      dispatch(SET_CURRENT_PAGE(prevPage))

      const currentModule = getCurrentModule()
      if (currentModule) {
        const newProgressPercentage = calculateProgressPercentage(
          prevPage,
          currentModule.totalPages
        )
        dispatch(SET_PROGRESS_PERCENTAGE(newProgressPercentage))
      }

      // Jika sebelumnya di halaman terakhir dan sekarang mundur, tandai modul sebagai belum selesai
      dispatch(SET_MODULE_COMPLETED(false))

      // Reset status penyelesaian halaman
      setIsPageCompleted(true)
      setIncompleteSections([])

      return true
    }

    return false
  }

  // Fungsi untuk pindah ke halaman tertentu dengan validasi
  const navigateToPage = (pageNumber: number, forceNavigate: boolean = false) => {
    const currentModule = getCurrentModule()
    if (!currentModule) return false

    // Validasi ketat
    if (pageNumber < 1 || pageNumber > currentModule.totalPages) {
      console.log(`Halaman ${pageNumber} tidak valid. Halaman harus antara 1 dan ${currentModule.totalPages}.`)
      return false
    }

    // Jika halaman belum selesai dan bukan mode eksplorasi cepat, tampilkan peringatan
    if (!isPageCompleted && !quickViewMode && !forceNavigate && pageNumber > currentPage) {
      console.log('Halaman belum selesai. Selesaikan halaman ini terlebih dahulu atau aktifkan mode eksplorasi cepat.')
      return false
    }

    // Catat navigasi untuk analitik
    logNavigation(currentPage, pageNumber)

    dispatch(SET_CURRENT_PAGE(pageNumber))

    const newProgressPercentage = calculateProgressPercentage(
      pageNumber,
      currentModule.totalPages
    )
    dispatch(SET_PROGRESS_PERCENTAGE(newProgressPercentage))

    // Jika halaman terakhir, tandai modul sebagai selesai
    if (pageNumber === currentModule.totalPages) {
      dispatch(SET_MODULE_COMPLETED(true))
    } else {
      dispatch(SET_MODULE_COMPLETED(false))
    }

    // Reset status penyelesaian halaman
    setIsPageCompleted(true)
    setIncompleteSections([])

    return true
  }

  // Fungsi untuk mencatat navigasi untuk analitik UX
  const logNavigation = (fromPage: number, toPage: number) => {
    console.log(`Navigasi: Dari halaman ${fromPage} ke halaman ${toPage}`)
    setNavigationHistory((prev) => [...prev, toPage])
  }

  // Fungsi untuk memulai modul
  const startModule = useCallback(
    (newModuleId: string, newUserId: string) => {
      const moduleData = getModuleById(newModuleId)
      if (!moduleData) return

      dispatch(SET_MODULE_ID(newModuleId))
      dispatch(SET_USER_ID(newUserId))
      dispatch(SET_CURRENT_PAGE(1))
      dispatch(SET_MODULE_COMPLETED(false))
      dispatch(
        SET_PROGRESS_PERCENTAGE(
          calculateProgressPercentage(1, moduleData.totalPages)
        )
      )

      // Reset status modul
      setQuickViewMode(false)
      setIsPageCompleted(true)
      setIncompleteSections([])
      setNavigationHistory([1]) // Mulai dengan halaman 1
    },
    [dispatch, getModuleById, calculateProgressPercentage]
  )

  // Fungsi untuk mereset kemajuan modul
  const resetProgress = () => {
    dispatch(RESET_PROGRESS())
    setQuickViewMode(false)
    setIsPageCompleted(true)
    setIncompleteSections([])
    setNavigationHistory([])
  }

  // Inisialisasi modul jika moduleId dan userId disediakan
  useEffect(() => {
    if (
      moduleId &&
      userId &&
      (!currentModuleId || currentModuleId !== moduleId)
    ) {
      startModule(moduleId, userId)
    }
  }, [moduleId, userId, currentModuleId, startModule])

  return {
    currentPage,
    isModuleCompleted,
    progressPercentage,
    currentModule: getCurrentModule(),
    currentPageData: getCurrentPage(),
    isPageCompleted,
    quickViewMode,
    incompleteSections,
    navigationHistory,
    goToNextPage,
    goToPrevPage,
    navigateToPage,
    setPageCompletionStatus,
    highlightIncompleteSections,
    toggleQuickViewMode,
    startModule,
    resetProgress,
  }
}

export default useModuleProgress
