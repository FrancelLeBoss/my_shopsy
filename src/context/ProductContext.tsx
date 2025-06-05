import React, { createContext, useContext, useState } from "react";

// Créer le contexte
const ProductContext = createContext();

// Fournisseur du contexte
export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]); // Liste des produits
  const [filters, setFilters] = useState({
    gender: [],
    price: [],
    subCategory: null,
  }); // Filtres globaux
  const [sortingCriteria, setSortingCriteria] = useState(""); // Critère de tri

  // Fonction pour filtrer les produits
  const filteredProducts = () => {
    let filtered = products;

    if (filters.subCategory) {
      filtered = filtered.filter(
        (product) => product.sub_categorie === filters.subCategory
      );
    }

    if (filters.gender.length > 0) {
      filtered = filtered.filter((product) =>
        filters.gender.includes(product.gender)
      );
    }

    if (filters.price.length > 0) {
      filtered = filtered.filter(
        (product) => product.price <= Math.max(...filters.price)
      );
    }

    return filtered;
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        setProducts,
        filters,
        setFilters,
        sortingCriteria,
        setSortingCriteria,
        filteredProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useProductContext = () => useContext(ProductContext);