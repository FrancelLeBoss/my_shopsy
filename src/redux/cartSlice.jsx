import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Liste des articles dans le panier
  totalAmount: 0, // Montant total du panier
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Ajouter un produit au panier
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += product.quantity; // Augmente la quantité si le produit existe déjà
      } else {
        state.items.push(product); // Ajoute un nouveau produit
      }

      // Met à jour le prix total avec 2 chiffres après la virgule
      state.totalPrice = state.items.length > 0
        ? state.items.reduce((total, item) => {
            const price = item.variant?.price || 0;
            return total + price * item.quantity;
          }, 0).toFixed(2) // Limite à 2 chiffres après la virgule
        : 0;
    },

    // Mettre à jour la quantité d'un produit
    updateCartItem: (state, action) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity = quantity;
      }

      // Met à jour le prix total avec 2 chiffres après la virgule
      state.totalPrice = state.items.length > 0
        ? state.items.reduce((total, item) => {
            const price = item.variant?.price || 0;
            return total + price * item.quantity;
          }, 0).toFixed(2) // Limite à 2 chiffres après la virgule
        : 0;
    },

    // Supprimer un produit du panier
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);

      // Met à jour le prix total avec 2 chiffres après la virgule
      state.totalPrice = state.items.length > 0
        ? state.items.reduce((total, item) => {
            const price = item.variant?.price || 0;
            return total + price * item.quantity;
          }, 0).toFixed(2) // Limite à 2 chiffres après la virgule
        : 0;
    },

    // Vider le panier
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },

    // Mettre à jour le panier
    updateCart: (state, action) => {
      state.items = action.payload; // Remplace tous les articles du panier
      state.totalPrice = state.items.length > 0
        ? state.items.reduce((total, item) => {
            const price = item.variant?.price || 0;
            return total + price * item.quantity;
          }, 0).toFixed(2) // Limite à 2 chiffres après la virgule
        : 0;
    },
  },
});

export const { addToCart, updateCartItem, removeFromCart, clearCart, updateCart } = cartSlice.actions;
export default cartSlice.reducer;