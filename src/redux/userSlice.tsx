import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  user: any | null; // User information (adapt 'any' to your actual user type)
  accessToken: string | null; // The short-lived access token
  refreshToken: string | null; // The long-lived refresh token
  isAuthenticated: boolean; // Authentication status
}

const initialState: UserState = {
  user: null,
  // Attempt to load tokens from localStorage on app start (for "Remember Me" sessions)
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken') && !!localStorage.getItem('refreshToken'),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action:PayloadAction<{user:any, access:string, refresh:any, rememberMe:boolean}>) => {
      state.user = action.payload.user;
      state.accessToken  = action.payload.access;
      state.refreshToken = action.payload.refresh;
      state.isAuthenticated = true;

      // Store tokens in localStorage if "Remember Me" is checked
      if (action.payload.rememberMe) {
        localStorage.setItem('accessToken', action.payload.access);
        localStorage.setItem('refreshToken', action.payload.refresh);
      } else {
        // If "Remember Me" is NOT checked, tokens are only in Redux state (in-memory)
        // They will be lost when the browser/tab is closed or on page refresh.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },

    setNewAccessToken: (state, action:PayloadAction<{access:string, refresh:string}>) => {
      // Update the access token and refresh token in the state
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;

      if(localStorage.getItem('refreshToken')) {
        // Update tokens in localStorage if they exist
        localStorage.setItem('accessToken', action.payload.access);
        localStorage.setItem('refreshToken', action.payload.refresh);
      }
    },
    clearAuthTokens:(state) =>{
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    }
  },
});

export const { login, logout, setNewAccessToken, clearAuthTokens } = userSlice.actions;
export default userSlice.reducer;