import React, { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

// Mock reducer sederhana
const mockReducer = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: (state = { user: null }, action: any) => {
    switch (action.type) {
      default:
        return state
    }
  },
}

// Buat mock store untuk testing
export const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: mockReducer,
    preloadedState: initialState,
  })
}

// Custom Provider untuk komponen testing
export const TestReduxProvider = ({
  children,
  initialState = {},
}: {
  children: ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialState?: any
}) => {
  const store = createTestStore(initialState)
  return <Provider store={store}>{children}</Provider>
}
