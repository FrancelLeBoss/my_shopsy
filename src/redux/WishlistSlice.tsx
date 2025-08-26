// src/redux/wishlistSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"; // Importez PayloadAction

interface WishlistItem {
  id: number; // Assurez-vous que l'id est de type number ou string selon votre logique
  variant?: any;
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

const WishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Ajouter un produit à la wishlist
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      // Typage plus strict
      const variant = action.payload;
      // Vérifiez si l'élément existe déjà avant de l'ajouter pour éviter les doublons
      const existingItem = state.items.find((item) => item.id === variant.id);
      if (!existingItem) {
        state.items.push(variant);
      }
    },
    // Mettre à jour la wishlist (souvent après une récupération depuis l'API)
    updateWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
    },
    // Supprimer un produit de la wishlist
    removeFromWishlist: (
      state: WishlistState,
      action: PayloadAction<{ itemDeleted: number }>
    ) => {
      // Typage plus strict
      const { itemDeleted } = action.payload;
      state.items = state.items.filter((item) => item.id !== itemDeleted);
    },
    // Vider la liste de souhaits (utilisé pour une action spécifique, pas la déconnexion)
    clearWishlist: (state) => {
      state.items = [];
    },
    // NOUVEAU: Réinitialiser l'état de la wishlist à l'état initial
    reset: (state) => {
      // Renommé 'resetWishlist' en 'reset'
      state.items = initialState.items;
    },
  },
});

// Exportez la nouvelle action 'reset'
export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  updateWishlist,
  reset,
} = WishlistSlice.actions;
export default WishlistSlice.reducer;
