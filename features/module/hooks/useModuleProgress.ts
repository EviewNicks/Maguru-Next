// features/module/hooks/useModuleProgress.ts
import { useDispatch, useSelector } from 'react-redux';
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
  selectUserId,
  selectProgressPercentage
} from '../../../store/features/progressSlice';
import { useEffect } from 'react';
import modules from '../data/moduleData';
import { ModuleData } from '../types';

interface UseModuleProgressProps {
  moduleId?: string;
  userId?: string;
}

const useModuleProgress = ({ moduleId, userId }: UseModuleProgressProps = {}) => {
  const dispatch = useDispatch();
  const currentPage = useSelector(selectCurrentPage);
  const isModuleCompleted = useSelector(selectIsModuleCompleted);
  const currentModuleId = useSelector(selectModuleId);
  const currentUserId = useSelector(selectUserId);
  const progressPercentage = useSelector(selectProgressPercentage);

  // Fungsi untuk mendapatkan data modul berdasarkan ID
  const getModuleById = (id: string): ModuleData | undefined => {
    return modules.find(module => module.id === id);
  };

  // Fungsi untuk mendapatkan modul saat ini
  const getCurrentModule = (): ModuleData | undefined => {
    if (!currentModuleId) return undefined;
    return getModuleById(currentModuleId);
  };

  // Fungsi untuk mendapatkan halaman saat ini
  const getCurrentPage = () => {
    const module = getCurrentModule();
    if (!module || !currentPage) return undefined;
    return module.pages.find(page => page.pageNumber === currentPage);
  };

  // Fungsi untuk menghitung persentase kemajuan
  const calculateProgressPercentage = (currentPageNum: number, totalPages: number): number => {
    return Math.round((currentPageNum / totalPages) * 100);
  };

  // Fungsi untuk pindah ke halaman berikutnya
  const goToNextPage = () => {
    const module = getCurrentModule();
    if (!module) return;

    if (currentPage < module.totalPages) {
      const nextPage = currentPage + 1;
      dispatch(SET_CURRENT_PAGE(nextPage));
      
      const newProgressPercentage = calculateProgressPercentage(nextPage, module.totalPages);
      dispatch(SET_PROGRESS_PERCENTAGE(newProgressPercentage));
      
      // Jika halaman terakhir, tandai modul sebagai selesai
      if (nextPage === module.totalPages) {
        dispatch(SET_MODULE_COMPLETED(true));
      }
    }
  };

  // Fungsi untuk pindah ke halaman sebelumnya
  const goToPrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      dispatch(SET_CURRENT_PAGE(prevPage));
      
      const module = getCurrentModule();
      if (module) {
        const newProgressPercentage = calculateProgressPercentage(prevPage, module.totalPages);
        dispatch(SET_PROGRESS_PERCENTAGE(newProgressPercentage));
      }
      
      // Jika sebelumnya di halaman terakhir dan sekarang mundur, tandai modul sebagai belum selesai
      dispatch(SET_MODULE_COMPLETED(false));
    }
  };

  // Fungsi untuk pindah ke halaman tertentu
  const goToPage = (pageNumber: number) => {
    const module = getCurrentModule();
    if (!module) return;

    if (pageNumber >= 1 && pageNumber <= module.totalPages) {
      dispatch(SET_CURRENT_PAGE(pageNumber));
      
      const newProgressPercentage = calculateProgressPercentage(pageNumber, module.totalPages);
      dispatch(SET_PROGRESS_PERCENTAGE(newProgressPercentage));
      
      // Jika halaman terakhir, tandai modul sebagai selesai
      if (pageNumber === module.totalPages) {
        dispatch(SET_MODULE_COMPLETED(true));
      } else {
        dispatch(SET_MODULE_COMPLETED(false));
      }
    }
  };

  // Fungsi untuk memulai modul
  const startModule = (newModuleId: string, newUserId: string) => {
    const module = getModuleById(newModuleId);
    if (!module) return;

    dispatch(SET_MODULE_ID(newModuleId));
    dispatch(SET_USER_ID(newUserId));
    dispatch(SET_CURRENT_PAGE(1));
    dispatch(SET_MODULE_COMPLETED(false));
    dispatch(SET_PROGRESS_PERCENTAGE(calculateProgressPercentage(1, module.totalPages)));
  };

  // Fungsi untuk mereset kemajuan modul
  const resetProgress = () => {
    dispatch(RESET_PROGRESS());
  };

  // Inisialisasi modul jika moduleId dan userId disediakan
  useEffect(() => {
    if (moduleId && userId && (!currentModuleId || currentModuleId !== moduleId)) {
      startModule(moduleId, userId);
    }
  }, [moduleId, userId]);

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
  };
};

export default useModuleProgress;
