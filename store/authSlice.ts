import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { APITokenResponse } from '../types';

export interface AuthState {
  user: APITokenResponse | null;
  authStatus: boolean;
}

const initialState: AuthState = {
  user: null,
  authStatus: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<APITokenResponse | null>) => {
      if (!action.payload) {
        state.authStatus = false;
        state.user = null;
      } else {
        state.authStatus = true;
        state.user = action.payload;
      }
    },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;