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
import { useEffect } from 'react'
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

  // Fungsi untuk mendapatkan data modul berdasarkan ID
  const getModuleById = (id: string): ModuleData | undefined => {
    return modules.find((moduleItem) => moduleItem.id === id)
  }

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
  const calculateProgressPercentage = (
    currentPageNum: number,
    totalPages: number
  ): number => {
    return Math.round((currentPageNum / totalPages) * 100)
  }

  // Fungsi untuk pindah ke halaman berikutnya
  const goToNextPage = () => {
    const currentModule = getCurrentModule()
    if (!currentModule) return

    if (currentPage < currentModule.totalPages) {
      const nextPage = currentPage + 1
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
    }
  }

  // Fungsi untuk pindah ke halaman sebelumnya
  const goToPrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1
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
    }
  }

  // Fungsi untuk pindah ke halaman tertentu
  const goToPage = (pageNumber: number) => {
    const currentModule = getCurrentModule()
    if (!currentModule) return

    if (pageNumber >= 1 && pageNumber <= currentModule.totalPages) {
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
    }
  }

  // Fungsi untuk memulai modul
  const startModule = (newModuleId: string, newUserId: string) => {
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
  }

  // Fungsi untuk mereset kemajuan modul
  const resetProgress = () => {
    dispatch(RESET_PROGRESS())
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
  }, [moduleId, userId, currentModuleId])

  return {
    currentPage,
    isModuleCompleted,
    progressPercentage,
    currentModule: getCurrentModule(),
    currentPageData: getCurrentPage(),
    goToNextPage,
    goToPrevPage,
    goToPage,
    startModule,
    resetProgress,
  }
}

export default useModuleProgress
