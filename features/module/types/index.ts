// features/module/types/index.ts

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  pages: ModulePage[];
  totalPages: number;
  progressPercentage: number;
  isCompleted: boolean;
}

export interface ModulePage {
  id: string;
  title: string;
  content: string;
  media?: string;
  isLastPage: boolean;
  pageNumber: number;
}

export interface ModuleProgress {
  userId: string;
  moduleId: string;
  currentPage: number;
  isCompleted: boolean;
  progressPercentage: number;
  lastUpdated: string;
}
