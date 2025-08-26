// src/redux/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem, ProductSize } from "../types/Product";

// interface CartItem {
//   id: number;
//   quantity: number;
//   variant?: {
//     price?: number;
//     [key: string]: any;
//   };
//   size?: ProductSize;
//   [key: string]: any;
// }

interface CartState {
  items: CartItem[];
  totalAmount: number; // Montant total du panier (probablement le nombre d'articles uniques ou la somme des quantités)
  totalPrice?: number; // Prix total du panier
}

const initialState: CartState = {
  items: [], // Liste des articles dans le panier
  totalAmount: 0, // Initialisation
  totalPrice: 0, // Initialisation
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Ajouter un produit au panier
    addToCart: (state, action: PayloadAction<CartItem>) => {
      // Ajoutez PayloadAction type pour une meilleure typage
      const product = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += product.quantity;
      } else {
        state.items.push(product);
      }
      // Mettez à jour totalAmount pour refléter le nombre total d'articles ou de quantités
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );

      // Met à jour le prix total avec 2 chiffres après la virgule
      state.totalPrice =
        state.items.length > 0
          ? Number(
              state.items
                .reduce((total, item) => {
                  const price = item.variant?.price || 0;
                  return total + price * item.quantity;
                }, 0)
                .toFixed(2)
            )
          : 0;
    },

    // Mettre à jour la quantité d'un produit
    updateCartItem: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      // Ajoutez PayloadAction type
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity = quantity;
      }
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );

      state.totalPrice =
        state.items.length > 0
          ? Number(
              state.items
                .reduce((total, item) => {
                  const price = item.variant?.price || 0;
                  return total + price * item.quantity;
                }, 0)
                .toFixed(2)
            )
          : 0;
    },

    // Supprimer un produit du panier
    removeFromCart: (state, action: PayloadAction<number>) => {
      // Ajoutez PayloadAction type
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);

      state.totalAmount = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );

      state.totalPrice =
        state.items.length > 0
          ? Number(
              state.items
                .reduce((total, item) => {
                  const price = item.variant?.price || 0;
                  return total + price * item.quantity;
                }, 0)
                .toFixed(2)
            )
          : 0;
    },

    // Vider le panier (utilisé pour une action spécifique, pas la déconnexion)
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalPrice = 0;
    },

    // Mettre à jour le panier (souvent après une récupération depuis l'API)
    updateCart: (state, action: PayloadAction<CartItem[]>) => {
      // Ajoutez PayloadAction type
      state.items = action.payload; // Remplace tous les articles du panier
      state.totalAmount = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      );

      state.totalPrice =
        state.items.length > 0
          ? Number(
              state.items
                .reduce((total, item) => {
                  const price = item.variant?.price || 0;
                  return total + price * item.quantity;
                }, 0)
                .toFixed(2)
            )
          : 0;
    },
    // NOUVEAU: Réinitialiser l'état du panier à l'état initial
    reset: (state) => {
      // Renommé 'resetCart' en 'reset' pour être plus générique
      state.items = initialState.items;
      state.totalAmount = initialState.totalAmount;
      state.totalPrice = initialState.totalPrice;
    },
  },
});

export const {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  updateCart,
  reset,
} = cartSlice.actions; // Exportez la nouvelle action
export default cartSlice.reducer;
