import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User, UpdateUserPayload } from '@/types/user'
import { RootState } from '../store'

interface UserState {
  data: User[]
  loading: boolean
  error: string | null
  previousStates: Record<string, User | null>
  optimisticUpdates: Record<string, UpdateUserPayload>
}

// Definisikan tipe untuk thunk
type FetchUsersThunkConfig = { state: RootState; rejectValue: string }

const initialState: UserState = {
  data: [],
  loading: false,
  error: null,
  previousStates: {},
  optimisticUpdates: {},
}

export const fetchUsers = createAsyncThunk<User[], void, FetchUsersThunkConfig>(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data: User[] = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch users'
      )
    }
  }
)

export const updateUser = createAsyncThunk<
  User,
  UpdateUserPayload,
  { rejectValue: string }
>('users/updateUser', async (payload, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/users/${payload.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await response.json()

    if (!response.ok) {
      return rejectWithValue(result.error?.message || 'Failed to update user')
    }

    return result.data
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to update user'
    )
  }
})

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('users/deleteUser', async (userId, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) {
      return { error: { message: data.error || 'Failed to delete user' } }
    }
    return data
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to delete user'
    )
  }
})

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    startOptimisticUpdate: (
      state,
      action: PayloadAction<UpdateUserPayload>
    ) => {
      const { id, ...updates } = action.payload
      const targetUser = state.data.find((user) => user.id === id)
      if (targetUser) {
        state.previousStates[id] = { ...targetUser }
        state.optimisticUpdates[id] = action.payload
        state.data = state.data.map((user) =>
          user.id === id ? { ...user, ...updates } : user
        )
      }
    },
    revertOptimisticUpdate: (state, action: PayloadAction<string>) => {
      const id = action.payload
      if (state.previousStates[id]) {
        state.data = state.data.map((user) =>
          user.id === id ? state.previousStates[id]! : user
        )
        delete state.previousStates[id]
        delete state.optimisticUpdates[id]
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
        state.error = null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Something went wrong'
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        const index = state.data.findIndex(
          (user) => user.id === action.payload.id
        )
        if (index !== -1) {
          state.data[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to update user'
        // Revert optimistic update if it exists
        const id = action.meta.arg.id
        if (state.previousStates[id]) {
          state.data = state.data.map((user) =>
            user.id === id ? state.previousStates[id]! : user
          )
          delete state.previousStates[id]
          delete state.optimisticUpdates[id]
        }
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false
        state.data = state.data.filter((user) => user.id !== action.payload)
        state.error = null
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to delete user'
      })
  },
})

export default userSlice.reducer
