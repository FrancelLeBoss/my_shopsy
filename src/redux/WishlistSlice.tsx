import { createSlice } from '@reduxjs/toolkit';

interface WishlistItem {
  id: string;
  variant?:any
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

const WishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Ajouter un produit au panier
    addToWishlist: (state, action: { payload: WishlistItem }) => {
      const variant = action.payload;
      state.items.push(variant);
    },
    updateWishlist: (state, action: { payload: WishlistItem[] }) => {
      state.items = action.payload;
    },
    removeFromWishlist: (state: WishlistState, action: { payload: { itemDeleted: string } }) => {
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