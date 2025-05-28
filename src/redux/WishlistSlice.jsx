import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Liste des articles dans la wishlist
};

const WishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Ajouter un produit au panier
    addToWishlist: (state, action) => {
      const variant = action.payload;
      const existingItem = state.items.find((item) => item.id === variant.id);

      if (!existingItem) {
        state.items.push(variant); // Ajoute un nouveau produit
      } 
    },
    updateWishlist: (state, action) => {
      state.items = action.payload;
    },

    // Supprimer un produit de la liste de souhaits
    removeFromWishlist: (state, action) => {
      const {itemDeleted} = action.payload;
      state.items = state.items.filter((item) => item.id !== itemDeleted);

    },
    // Vider la liste de souhaits
    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = WishlistSlice.actions;
export default WishlistSlice.reducer;