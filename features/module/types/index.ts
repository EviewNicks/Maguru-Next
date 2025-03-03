// features/module/types/index.ts

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  pages: ModulePage[];
  totalPages: number;
  progressPercentage: number;
  isCompleted: boolean;
  quickViewModeAvailable?: boolean;
  estimatedTime: number; // Waktu estimasi dalam menit
}

export interface ModulePage {
  id: string;
  title: string;
  content: string;
  media?: string;
  isLastPage: boolean;
  pageNumber: number;
  requiredInteractions?: string[];
  interactiveElements?: InteractiveElement[];
}

export interface InteractiveElement {
  id: string;
  type: 'checklist' | 'button' | 'quiz' | 'code-input';
  content: string;
  required: boolean;
}

export interface ModuleProgress {
  userId: string;
  moduleId: string;
  currentPage: number;
  isCompleted: boolean;
  progressPercentage: number;
  lastUpdated: string;
  completedInteractions?: Record<number, string[]>;
  visitedPages?: number[];
  quickViewModeEnabled?: boolean;
}

export interface PageInteractionState {
  pageId: string;
  completedInteractions: string[];
  isPageCompleted: boolean;
  timeSpent: number;
  lastInteractionAt: string;
}

export interface NavigationHistoryEntry {
  fromPage: number;
  toPage: number;
  timestamp: string;
  interactionId?: string;
}
