import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import cartReducer from './cartSlice';
import WishlistSlice from './WishlistSlice'; // Importation de la liste de souhaits

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    wishlist: WishlistSlice, // Ajout de la liste de souhaits
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;