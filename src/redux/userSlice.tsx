import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types/User'; // Adjust the import path as necessary


interface UserState {
  user: User | null; // User information (adapt 'any' to your actual user type)
  accessToken: string | null; // The short-lived access token
  refreshToken: string | null; // The long-lived refresh token
  isAuthenticated: boolean; // Authentication status
  isLoading?: boolean; // Optional loading state for async operations
  error?: string | null; // Optional error state for async operations
}

const initialState: UserState = {
  user: null,
  // Attempt to load tokens from localStorage on app start (for "Remember Me" sessions)
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken') && !!localStorage.getItem('refreshToken'),
  isLoading: false, // Optional loading state
  error: null, // Optional error state
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
        localStorage.setItem('user', JSON.stringify(action.payload.user)); // Optional: Store user data
      } 
      state.isLoading = false; // Reset loading state after login
      state.error = null; // Reset error state after successful login
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },

    setNewAccessToken: (state, action:PayloadAction<{access:string}>) => {
      // Update the access token and refresh token in the state
      state.accessToken = action.payload.access;

      if(state.refreshToken) {
        // Update tokens in localStorage if they exist
        localStorage.setItem('accessToken', action.payload.access);
      }
    },
    clearAuthTokens:(state) =>{
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    rehydrateAuth: (state) => {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');

      if (storedAccessToken && storedRefreshToken && storedUser) {
        try{
          state.accessToken = storedAccessToken;
          state.refreshToken = storedRefreshToken;
          state.user = JSON.parse(storedUser);
          state.isAuthenticated = true;
        }
        catch (e) {
          console.error("Failed to parse user data from localStorage:", e);
          // Efface les données invalides pour éviter des problèmes futurs
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
        }
      }
      else{
        state.user = null;
        state.accessToken = null;  
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user'); // Clear user data if tokens are not present
      }
    }
  },
});

export const { login, logout, setNewAccessToken, clearAuthTokens, rehydrateAuth } = userSlice.actions;
export default userSlice.reducer;