// store/store.ts
import { configureStore } from '@reduxjs/toolkit'
import userReducer from './features/userSlice'
import modalReducer from './features/modalSlice'
import toastReducer from './features/toastSlice'
import progressReducer from './features/progressSlice'

export const store = configureStore({
  reducer: {
    users: userReducer,
    modal: modalReducer,
    toast: toastReducer,
    progress: progressReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
