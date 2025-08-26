export interface ProductVariantImage {
  id: number;
  image: string;
  mainImage: boolean;
}

export interface ProductVariant {
  /**Définition de l'interface pour les variantes de produit
   */
  id: number;
  color: string;
  price: number;
  discount: number;
  images: ProductVariantImage[];
  sizes: ProductSize[];
}

export interface Product {
  id: number;
  title: string;
  short_desc: string;
  long_desc: string;
  subCategory: number;
  gender: string;
  category: number;
  variants: ProductVariant[];
}

export interface VariantImage {
  id: number;
  image: string;
  mainImage: boolean;
}

export interface VariantWithImages {
  images: VariantImage[];
}

// Define types for product variant and image structure (définis une seule fois en haut)
export interface ProductImage {
  id: number;
  image: string;
  mainImage: boolean;
}

export interface WishlistItem {
  id: number;
  variant?: ProductVariant;
}

export interface ProductSize {
  id: number;
  size: string;
}

export type CommentType = {
  id: number;
  comment: string;
  user: number; // L'ID de l'utilisateur qui a commenté
  stars: number;
  product: number;
  updated_at: string;
  created_at: string;
};

// Pour les infos utilisateur des commentaires (pour le username)
export interface UserInfoForComment {
  username: string;
  // Ajoutez d'autres champs si nécessaire
}

export interface CategoryDetails {
  id: number;
  title?: string;
  short_desc?: string;
  slug: string;
  // add other properties as needed
}
export interface CartItem {
  id: number;
  quantity: number;
  variant?: {
    price?: number;
    [key: string]: any;
  };
  size?: ProductSize;
  [key: string]: any;
}
