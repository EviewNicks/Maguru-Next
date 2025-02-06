// store/store.ts
import { configureStore } from '@reduxjs/toolkit'
import userReducer from './features/userSlice'
import modalReducer from './features/modalSlice'
import toastReducer from './features/toastSlice'

export const store = configureStore({
  reducer: {
    users: userReducer,
    modal: modalReducer,
    toast: toastReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
