import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User, UpdateUserPayload } from '@/types/user'

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [/* your mock data */],
  isLoading: false,
  error: null
}

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<UpdateUserPayload>) => {
      const { id, ...updates } = action.payload;
      const userIndex = state.users.findIndex(user => user.id === id);
      if (userIndex !== -1) {
        state.users[userIndex] = { ...state.users[userIndex], ...updates };
      }
    }
  }
})

export const { updateUser } = userSlice.actions;
export default userSlice.reducer;