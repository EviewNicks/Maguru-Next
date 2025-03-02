// store/features/modalSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ModalState {
  isOpen: boolean
  title?: string
  message?: string
  userId?: string // Tambahkan userId di sini
  onConfirm?: () => void | Promise<void>
}

const initialState: ModalState = {
  isOpen: false,
  title: '',
  message: '',
  userId: undefined, // Default undefined
  onConfirm: undefined,
}

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<Omit<ModalState, 'isOpen'>>) => {
      return { ...action.payload, isOpen: true }
    },
    closeModal: (state) => {
        return { ...state, isOpen: false, userId: undefined } // Reset userId saat modal ditutup
    },
  },
})

export const { openModal, closeModal } = modalSlice.actions
export default modalSlice.reducer
