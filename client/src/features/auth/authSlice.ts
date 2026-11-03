import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../app/api';

interface AuthState {
  currentUser: User | null;
}

const initialState: AuthState = {
  currentUser: null,
};

// Simulated auth — no real login, just picking a user identity.
// The exercise explicitly says not to implement production auth.
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser(state, action: PayloadAction<User>) {
      state.currentUser = action.payload;
    },
    logout(state) {
      state.currentUser = null;
    },
  },
});

export const { setCurrentUser, logout } = authSlice.actions;
export default authSlice.reducer;
