// features/module/services/moduleService.ts
import { modules } from '../data/moduleData';

// Tipe untuk modul
export interface Module {
  id: string
  title: string
  description: string
  totalPages: number
  estimatedTime?: number
  pages: ModulePage[]
  quizAvailable?: boolean
}

// Tipe untuk halaman modul
export interface ModulePage {
  id: string
  title: string
  content: string
  media?: string
  hasInteractiveElements?: boolean
  requiredInteractions?: string[]
  pageNumber?: number
  isLastPage?: boolean
}

// Fungsi untuk mengambil semua modul
export function fetchModules(): Promise<Module[]> {
  return new Promise((resolve) => {
    // Menggunakan data dari moduleData.ts
    setTimeout(() => resolve(modules as unknown as Module[]), 500);
  });
}

// Fungsi untuk mengambil modul berdasarkan ID
export function fetchModuleById(moduleId: string): Promise<Module | null> {
  return new Promise((resolve) => {
    // Menggunakan data dari moduleData.ts
    const foundModule = modules.find(m => m.id === moduleId);
    setTimeout(() => resolve(foundModule as unknown as Module || null), 300);
  });
}

// Fungsi untuk mengambil halaman modul berdasarkan ID modul dan nomor halaman
export function fetchModulePage(moduleId: string, pageNumber: number): Promise<ModulePage | null> {
  return new Promise((resolve) => {
    // Menggunakan data dari moduleData.ts
    const foundModule = modules.find(m => m.id === moduleId);
    if (!foundModule) {
      setTimeout(() => resolve(null), 300);
    } else {
      const pageIndex = pageNumber - 1;
      const page = foundModule.pages[pageIndex];
      setTimeout(() => resolve(page as unknown as ModulePage || null), 300);
    }
  });
}

// Fungsi untuk menyimpan progres modul
export function saveModuleProgress(moduleId: string, data: { currentPage: number, completedPages: number[], interactionsCompleted: Record<string, string[]> }): void {
  try {
    localStorage.setItem(`module_progress_${moduleId}`, JSON.stringify({
      ...data,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error saving module progress:", error);
  }
}

// Fungsi untuk mengambil progres modul
export function getModuleProgress(moduleId: string): {
  currentPage: number,
  completedPages: number[],
  interactionsCompleted: Record<string, string[]>
} | null {
  try {
    const storedProgress = localStorage.getItem(`module_progress_${moduleId}`);
    
    return storedProgress ? JSON.parse(storedProgress) : null;
  } catch (error) {
    console.error("Error getting module progress:", error);
    return null;
  }
}
