import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // Informations de l'utilisateur connecté
  token: null, // Jeton d'authentification
  isAuthenticated: false, // Statut de connexion
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;