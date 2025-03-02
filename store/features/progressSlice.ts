// store/features/progressSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface ProgressState {
  currentPage: number;
  isModuleCompleted: boolean;
  moduleId: string | null;
  userId: string | null;
  progressPercentage: number;
}

const initialState: ProgressState = {
  currentPage: 1,
  isModuleCompleted: false,
  moduleId: null,
  userId: null,
  progressPercentage: 0,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    SET_CURRENT_PAGE: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    SET_MODULE_COMPLETED: (state, action: PayloadAction<boolean>) => {
      state.isModuleCompleted = action.payload;
    },
    SET_MODULE_ID: (state, action: PayloadAction<string>) => {
      state.moduleId = action.payload;
    },
    SET_USER_ID: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    SET_PROGRESS_PERCENTAGE: (state, action: PayloadAction<number>) => {
      state.progressPercentage = action.payload;
    },
    RESET_PROGRESS: (state) => {
      state.currentPage = 1;
      state.isModuleCompleted = false;
      state.progressPercentage = 0;
    },
  },
});

export const {
  SET_CURRENT_PAGE,
  SET_MODULE_COMPLETED,
  SET_MODULE_ID,
  SET_USER_ID,
  SET_PROGRESS_PERCENTAGE,
  RESET_PROGRESS,
} = progressSlice.actions;

// Selectors
export const selectCurrentPage = (state: RootState) => state.progress.currentPage;
export const selectIsModuleCompleted = (state: RootState) => state.progress.isModuleCompleted;
export const selectModuleId = (state: RootState) => state.progress.moduleId;
export const selectUserId = (state: RootState) => state.progress.userId;
export const selectProgressPercentage = (state: RootState) => state.progress.progressPercentage;

export default progressSlice.reducer;
