import React, { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";
import { new_price } from './Boutique'; // Assurez-vous que new_price est toujours exporté de Boutique.tsx
import { BsStarFill } from 'react-icons/bs';
import { Link } from "react-router-dom";
import { FaRuler } from 'react-icons/fa';
import { GrDown, GrUp } from "react-icons/gr";
// ANCIEN : import axios from 'axios';
import axiosInstance from '../api/axiosInstance'; // NOUVEAU : Importer votre instance Axios configurée
import { useSelector, useDispatch } from 'react-redux';
import { BiStar } from 'react-icons/bi';
import { formatDistanceToNow } from 'date-fns';
import Swal from 'sweetalert2'

import { fr } from 'date-fns/locale'; // Importez la locale française

// Typage RootState et User depuis votre Redux store
import type { RootState } from '../redux/store'; // ASSUREZ-VOUS QUE CE CHEMIN EST CORRECT
import {User} from '../types/User'
import { CommentType, ProductSize, Product as ProductType, ProductVariant, ProductVariantImage } from '../types/Product'; // Assurez-vous que ce chemin est correct

const formatRelativeTime = (dateString: any) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
};

// Pour les infos utilisateur des commentaires (pour le username)
interface UserInfoForComment {
  username: string;
  // Ajoutez d'autres champs si nécessaire
}

// Pour les réponses des API d'ajout au panier/wishlist
interface AddToCartResponse {
  cart_item: {
    id: number;
    user: number;
    variant: number;
    size: number;
    quantity: number;
  };
}

interface AddToWishlistResponse {
  wishlist_item: {
    id: number;
    user: number;
    variant: number;
    variant_id: number; // Assurez-vous que votre API renvoie cet ID
  };
}

interface RemoveFromWishlistResponse {
  wishlist_item: {
    id: number;
  };
}

// Pour les types de panier et wishlist dans Redux
type CartItemApi = {
  id: number;
  variant: number;
  size: number;
  quantity: number;
}

type CartItemRedux = {
  id: number;
  variant: ProductVariant;
  size: ProductSize;
  quantity: number;
}

type WishlistItemRedux = {
  id: number;
  variant: ProductVariant;
}


const Product = () => {
  const { productId, v } = useParams<{ productId: string, v: string }>(); // Typage des params
  const user: User | null = useSelector((state: RootState) => state.user.user); // Typage correct de l'utilisateur
  const cart = useSelector((state: RootState) => state.cart.items); // Assurez-vous que cart.items est le bon chemin
  const dispatch = useDispatch();

  const [variantId, setVariantId] = useState<number | null>(parseInt(v || '', 10) || null); // Parse v pour s'assurer que c'est un nombre, avec fallback
  const [sizeId, setSizeId] = useState<number | null>(null);
  const [comment, setComment] = useState<string | null>(null);

  const [comments, setComments] = useState<CommentType[]>([]);
  const [currentComPage, setCurrentComPage] = useState(1);
  const commentsPerPage = 5;
  const indexOfLastComment = currentComPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments
    .slice()
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(indexOfFirstComment, indexOfLastComment);
  const totalCommentsPages = Math.ceil(comments.length / commentsPerPage);

  const handleNextPage = () => {
    if (currentComPage < totalCommentsPages) {
      setCurrentComPage(currentComPage + 1);
    }
  };
  const handlePreviousPage = () => {
    if (currentComPage > 1) {
      setCurrentComPage(currentComPage - 1);
    }
  };

  const [pressed, setPressed] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const [product, setProduct] = useState<ProductType | null>(null);
  const [displayReviews, setDisplayReviews] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [productWished, setProductWished] = useState(false);

  // Fonction pour obtenir la variante sélectionnée
  const selectedVariant = (vId: number | null): ProductVariant | undefined => {
    return product?.variants?.find((variant: ProductVariant) => variant.id === vId);
  };
  const variant = selectedVariant(variantId);

  const [selectedVariantImage, setSelectedVariantImage] = useState<string | null>(null);
  const [userInfos, setUserInfos] = useState<{ [key: number]: UserInfoForComment }>({}); // Typage précis

  // Initialisation du produit et de l'image de la variante
  useEffect(() => {
    if (productId) {
      // MODIFICATION ICI : Utilisation de axiosInstance
      axiosInstance.get<ProductType>(`api/products/${productId}/`)
        .then(response => {
          setProduct(response.data);
          // Initialise l'image de la variante sélectionnée après le chargement du produit
          const initialVariant = response.data.variants.find(v => v.id === variantId) || response.data.variants[0];
          if (initialVariant) {
            const mainImage = initialVariant.images.find(img => img.mainImage)?.image || initialVariant.images[0]?.image;
            setSelectedVariantImage(mainImage || null);
          }
        })
        .catch(error => console.error("Error fetching product data:", error));
    }
  }, [productId, variantId]); // Ajout de variantId ici pour recharger si l'ID de la variante change dans l'URL


  // Vérifier si le produit est déjà dans la wishlist de l'utilisateur
  useEffect(() => {
    // Cette requête nécessite l'authentification
    if (user?.id && variant?.id) { // Vérifie que user et variant sont définis
      axiosInstance.post<{ exists: boolean }>(`api/wishlist/already_exists/`, { user_id: user.id, variant_id: variant.id })
        .then(response => {
          setProductWished(response.data.exists);
        })
        .catch(error => console.error("Error checking wishlist existence:", error));
    } else {
      // Si l'utilisateur n'est pas connecté, le produit ne peut pas être "wishé"
      setProductWished(false);
    }
  }, [user, variant]);


  // Récupération de la catégorie du produit
  useEffect(() => {
    if (product?.category) {
      // MODIFICATION ICI : Utilisation de axiosInstance
      axiosInstance.get<{ title: string }>(`api/categories/${product.category}/`)
        .then(response => {
          setCategory(response.data.title);
        })
        .catch(error => console.error("Error fetching category data:", error));
    }
  }, [product]);


  // Récupération des commentaires et infos utilisateur
  useEffect(() => {
    const fetchCommentsAndUsers = async () => {
      if (!productId) return; // S'assurer que productId est défini

      try {
        // MODIFICATION ICI : Utilisation de axiosInstance
        const response = await axiosInstance.get<CommentType[]>(`api/comments/${productId}/`);
        setComments(response.data);

        const users: { [key: number]: UserInfoForComment } = {};
        for (const comment of response.data) {
          if (!users[comment.user]) { // Évite les requêtes dupliquées pour le même utilisateur
            const userInfo = await getUserInfo(comment.user);
            if (userInfo) {
              users[comment.user] = userInfo;
            }
          }
        }
        setUserInfos(users);
      } catch (error) {
        console.error("Error fetching the comments or user info:", error);
      }
    };

    fetchCommentsAndUsers();
  }, [productId]); // Dépend de productId, plus besoin de product si on utilise productId pour l'API


  // Fonction pour obtenir les infos utilisateur d'un commentaire
  const getUserInfo = async (userId: number): Promise<UserInfoForComment | null> => {
    try {
      // MODIFICATION ICI : Utilisation de axiosInstance
      const response = await axiosInstance.get<UserInfoForComment>(`api/user/${userId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Please log in to add a comment',
        showConfirmButton: true,
        confirmButtonText: 'Got it!',
        confirmButtonColor: '#fea928',
      });
      return;
    }
    if (!comment || comment.trim() === "") {
      Swal.fire({
        icon: 'warning',
        title: 'Please write a comment',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }
    if (!productId) {
      console.error("Product ID is missing for adding comment.");
      return;
    }

    try {
      // MODIFICATION ICI : Utilisation de axiosInstance, et suppression du header manuel
      const response = await axiosInstance.post<any>(
        `api/comments/save/`,
        { comment: comment, user: user.id, stars: 5, product: productId }
      );

      const newComment: CommentType = {
        id: response.data.comment.id, // Assurez-vous que votre backend renvoie l'ID du commentaire
        comment: response.data.comment.content, // 'content' ou 'comment' selon votre backend
        user: user.id,
        stars: response.data.comment.stars,
        product: Number(productId),
        updated_at: response.data.comment.updated_at,
        created_at: response.data.comment.created_at
      };
      setComments((prevComments) => [...prevComments, newComment]);

      // Si l'info utilisateur n'est pas déjà chargée pour ce commentaire, la charger
      if (!userInfos[newComment.user]) {
        const userInfo = await getUserInfo(newComment.user);
        if (userInfo) {
          setUserInfos((prevUserInfos) => ({
            ...prevUserInfos,
            [newComment.user]: userInfo,
          }));
        }
      }
      setComment(null); // Réinitialiser le champ du commentaire après l'envoi
    } catch (error) {
      console.error('Error adding comment:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to add comment',
        text: 'An error occurred while adding your comment.',
      });
    }
  };

  const averageStars = () => {
    if (comments.length === 0) return 0;
    const totalStars = comments.reduce((acc, comment) => acc + comment.stars, 0);
    return (totalStars / comments.length).toFixed(1);
  }

  const fetchCart = async () => {
    if (!user?.id) {
      console.log("User not logged in, cannot fetch cart.");
      return;
    }
    try {
      // MODIFICATION ICI : Utilisation de axiosInstance
      const response = await axiosInstance.get<CartItemApi[]>(`api/cart/${user.id}/`);
      const cartData = response.data;
      console.log("User ", user.id, " cart data: ", cartData);

      const items: CartItemRedux[] = await Promise.all(
        cartData.map(async (item) => {
          // MODIFICATION ICI : Utilisation de axiosInstance pour les détails de variante/taille
          const variantResponse = await axiosInstance.get<ProductVariant>(`api/products/variant/${item.variant}/`);
          const sizeResponse = await axiosInstance.get<ProductSize>(`api/products/size/${item.size}/`)
          return {
            id: item.id,
            variant: variantResponse.data,
            size: sizeResponse.data,
            quantity: item.quantity,
          };
        })
      );
      dispatch({ type: 'cart/updateCart', payload: items }); // Assurez-vous que l'action est correctement typée dans votre cartSlice
      console.log("Cart fetched successfully:", response.data);

    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Please log in to add items to your cart',
        showConfirmButton: true,
        confirmButtonText: 'Get it!',
        confirmButtonColor: '#fea928',
      });
      return; // Arrête l'exécution si l'utilisateur n'est pas connecté
    }
    if (!sizeId) {
      setPressed(true); // Afficher le message d'erreur si la taille n'est pas sélectionnée
      return;
    }

    // MODIFICATION ICI : Utilisation de axiosInstance, et suppression du header manuel
    axiosInstance.post<AddToCartResponse>(`api/cart/add/`, {
      user_id: user.id,
      variant_id: variantId,
      size_id: sizeId,
      quantity: 1
    })
      .then(response => {
        console.log("Product added to cart:", response.data.cart_item);
        const data = response.data; // data est maintenant de type AddToCartResponse
        // Mise à jour locale (si votre slice gère les updates spécifiques)
        dispatch({ type: 'cart/updateCartItem', payload: data.cart_item }); // Assurez-vous que l'action updateCartItem prend bien un cart_item de l'API
        fetchCart(); // Rafraîchit le panier entier après l'ajout pour la cohérence
        Swal.fire({
          icon: 'success',
          title: 'Product added to cart',
          showConfirmButton: false,
          timer: 1500
        });
        setPressed(false)
      })
      .catch(error => {
        console.error("Error adding product to cart:", error.response?.data || error.message);
        Swal.fire({
          icon: 'error',
          title: 'Failed to add to cart',
          text: 'An error occurred while adding the product to your cart.',
        });
      });
  }

  const handleAddToWishlist = () => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Please log in to add items to your wishlist',
        showConfirmButton: true,
        confirmButtonText: 'Got it!',
        confirmButtonColor: '#fea928',
      });
      return;
    }
    if (!variantId) {
      console.error("Variant ID is missing for adding to wishlist.");
      return;
    }

    // MODIFICATION ICI : Utilisation de axiosInstance, et suppression du header manuel
    axiosInstance.post<AddToWishlistResponse>(`api/wishlist/add/`, {
      user_id: user.id,
      variant_id: variantId
    })
      .then(async (response) => {
        const variantIdFromResponse = response.data.wishlist_item.variant_id;
        console.log("the product added to wishlist: ", response.data.wishlist_item);
        // MODIFICATION ICI : Utilisation de axiosInstance
        const variantResponse = await axiosInstance.get<ProductVariant>(`api/products/variant/${variantIdFromResponse}/`);
        const wishlistItem: WishlistItemRedux = {
          id: response.data.wishlist_item.id,
          variant: variantResponse.data
        };
        dispatch({ type: 'wishlist/addToWishlist', payload: wishlistItem }); // Assurez-vous que l'action est correctement typée
        setProductWished(true); // Mettre à jour l'état local pour le ruban "In Wishlist"
        Swal.fire({
          icon: 'success',
          title: 'Product added to wishlist',
          showConfirmButton: false,
          timer: 1500
        });
      })
      .catch(error => {
        console.error("Error adding product to wishlist:", error.response?.data || error.message);
        Swal.fire({
          icon: 'error',
          title: 'Failed to add to wishlist',
          text: 'An error occurred while adding the product to your wishlist.',
        });
      });
  }

  const handleRemoveFromWishlist = () => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Please log in to remove items from your wishlist',
        showConfirmButton: true,
        confirmButtonText: 'Got it!',
        confirmButtonColor: '#fea928',
      });
      return;
    }
    if (!variantId) {
      console.error("Variant ID is missing for removing from wishlist.");
      return;
    }

    let itemDeleted: number | undefined;
    // MODIFICATION ICI : Utilisation de axiosInstance, et suppression du header manuel
    axiosInstance.post<RemoveFromWishlistResponse>(`api/wishlist/remove/`, {
      user_id: user.id,
      variant_id: variantId
    })
      .then(response => {
        itemDeleted = response.data.wishlist_item.id;
        console.log("Product removed from wishlist ID:", itemDeleted);
        if (itemDeleted !== undefined) {
          dispatch({ type: 'wishlist/removeFromWishlist', payload: { itemDeleted } }); // Assurez-vous que l'action est correctement typée
        }
        setProductWished(false); // Mettre à jour l'état local
        Swal.fire({
          icon: 'success',
          title: 'Product removed from wishlist',
          showConfirmButton: false,
          timer: 1500
        });
      })
      .catch(error => {
        console.error("Error removing product from wishlist:", error.response?.data || error.message);
        Swal.fire({
          icon: 'error',
          title: 'Failed to remove from wishlist',
          text: 'An error occurred while removing the product from your wishlist.',
        });
      });
  }

  // Ce useEffect récupère le panier et la wishlist après que l'utilisateur soit chargé
  // (soit à la connexion, soit à la rehydration).
  // La logique est déjà conditionnée par 'user', donc elle ne s'exécutera pas pour les non-connectés.
  useEffect(() => {
    if (user && user.id) {
      // Aucune modification ici, car fetchCart est déjà une fonction à part
      fetchCart();

      // Pour la wishlist, puisque fetchCart est déjà un async, on peut le faire ici.
      // Ou appeler une fonction séparée fetchWishlist si elle existe.
      // La logique de récupération de la wishlist est déjà dans l'useEffect principal
      // C'est juste un réarrangement logique pour clarté.
      // La ligne suivante était déjà présente mais sans un appel direct à une fonction nommée:
      // MODIFICATION ICI: Utilisation de axiosInstance pour la récupération initiale de la wishlist
      axiosInstance.post<any[]>(`api/wishlist/`, { user_id: user.id }) // Si votre backend accepte POST pour récupérer la wishlist
        .then(async response => {
          const wishlistData = response.data;
          const items: WishlistItemRedux[] = await Promise.all(
            wishlistData.map(async (item: any) => { // 'any' ici parce que wishlistData peut être non-typer
              const variantResponse = await axiosInstance.get<ProductVariant>(`api/products/variant/${item.variant}/`);
              return {
                id: item.id,
                variant: variantResponse.data,
              };
            }))
          dispatch({ type: 'wishlist/updateWishlist', payload: items });
        })
        .catch((error) => console.error("Error fetching wishlist data in useEffect:", error));

    }
  }, [user, dispatch]); // Dépend de user et dispatch


  // Assurez-vous que cette fonction existe et est correctement typée si elle est utilisée
  // (Elle est définie plus bas dans votre code, mais ici c'est pour référence si elle était externe)
  const indexOfMainImageOfvariant = (variant: ProductVariant): number => {
    const index = variant.images.findIndex((image: ProductVariantImage) => image.mainImage === true);
    return index !== -1 ? index : 0;
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-950">
        <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          Loading product details...
        </div>
      </div>
    );
  }


  return (
    <div className='flex flex-col lg:gap-8'>
      <div className="bg-primary/40 py-3">
        <div className="text-xl text-secondary text-center font-semibold dark:text-gray-200">Product Details</div>
        <div className="text-sm text-gray-500 text-center dark:text-gray-200">Home / {category || "Loading..."} / {product?.title}</div>
      </div>
      <div className='flex flex-col gap-2'>
        <div className='justify-center flex flex-col gap-4 lg:gap-12 lg:flex-row py-2'>
          {/* partie gauche(photos) */}
          <div className='flex gap-4 flex-col-reverse lg:flex-row items-start h-1/2 lg:h-[720px] lg:w-[648px] w-full'>
            <div className='flex lg:flex-col flex-row gap-2'>
              {selectedVariant(variantId)?.images.map((img: ProductVariantImage) => (
                <div key={img.id} className='w-[64px] h-[64px] rounded cursor-pointer'>
                  <img src={apiBaseUrl + img.image} className='h-full w-full' alt=""
                    onMouseEnter={() => setSelectedVariantImage(img.image)}
                  />
                </div>
              ))}
            </div>
            <div className='lg:h-full h-auto w-full rounded cursor-pointer relative overflow-hidden'>
              {productWished && (
                <div
                  style={{
                    position: 'absolute',
                    top: '24px',
                    left: '-48px',
                    width: '180px',
                    transform: 'rotate(-45deg)',
                    background: 'linear-gradient(90deg, #22c55e 80%, #16a34a 100%)',
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    padding: '6px 0',
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    borderRadius: '8px'
                  }}
                >
                  In Wishlist
                </div>
              )}
              <img src={apiBaseUrl + selectedVariantImage} className='h-full w-full rounded' alt="" />
            </div>
          </div>
          {/* partie droite, details */}
          <div className='flex-1 flex flex-col gap-4 max-w-[500px]'>
            <div className='flex flex-col gap-1'>
              <div className='text-3xl font-semibold dark:text-gray-200'>{product?.title}</div>
              <p className='text-lg font-medium text-gray-500 dark:text-gray-200'>{product?.short_desc}</p>
              <p className='text-2xl text-gray-700 flex lg:flex-row flex-col lg:items-center gap-2 dark:text-gray-200 font-semibold my-3'>
                {(variant && variant.discount > 0)
                  ? "$" + new_price(variant.price, variant.discount)
                  : "$" + (variant ? variant.price : "")}
                {(variant && variant.discount > 0) && (
                  <span className='text-xl text-gray-400 line-through'>
                    ${variant.price}
                  </span>
                )}
                {(variant && variant.discount > 0) && (
                  <span className='text-xl text-green-600'>
                    Enjoy -{variant.discount}% on this product
                  </span>
                )}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              {product?.variants?.map((v: ProductVariant) => (
                <img
                  key={v.id}
                  src={
                    Array.isArray(v.images) && v.images.length > 0
                      ? apiBaseUrl + (v.images.find((img: ProductVariantImage) => img.mainImage)?.image || v.images[0].image)
                      : apiBaseUrl + "/default-image.jpg"
                  }
                  alt="Variant Image"
                  className={`h-20 w-20 cursor-pointer border-2 ${Number(variantId) === v.id ? 'border-primary' : 'border-gray-300'}`}
                  onClick={() => {
                    setVariantId(v.id);
                  }}
                />
              ))}
            </div>
            <div className='flex flex-col gap-4 '>
              <div className='flex justify-between items-center gap-2 lg:text-lg md:text-base text-sm font-bold dark:text-gray-100 text-gray-700'>
                <div className=''>Select Size</div>
                <Link to={'/'} className='flex items-center gap-1'><FaRuler /> Size guide</Link>
              </div>
              <div className='grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 lg:gap-4 gap-2 font-semibold'>
                {
                  product?.variants?.find((v: ProductVariant) => v.id == variantId)?.sizes.map((s: ProductSize) => (
                    <div key={s.id} className={`p-4 border ${sizeId == s.id ? 'border-primary' : 'border-gray-300'} cursor-pointer`}
                      onClick={() => setSizeId(s.id)}>
                      {s.size}
                    </div>
                  ))
                }
              </div>
              <div className={`${!sizeId && pressed ? 'flex font-serif text-red-600' : 'hidden'}`}>Please select a size </div>
              <div className='flex flex-col items-center gap-4'>
                <button className='bg-primary hover:bg-secondary
                                 text-gray-50 py-4 px-4 w-full font-semibold text-lg' onClick={() => {
                    setPressed(true)
                    if (sizeId) {
                      handleAddToCart()
                    }
                  }}>Add to Cart</button>
                <button title={productWished ? "Remove from the wishlist"
                  : "Add to the wish list"} className='text-gray-50
                                 hover:bg-black bg-black/80 dark:bg-gray-800 dark:hover:bg-black/80
                                 lg:py-4 lg:px-4 p-3 text-lg font-semibold w-full'
                  onClick={() => {
                    if (productWished) {
                      handleRemoveFromWishlist();
                    } else {
                      handleAddToWishlist()
                    }
                  }}>{productWished ? "Remove from the Wishlist" : "Add to Wishlist"}</button>
              </div>
              <div className='flex flex-col gap-2 text-lg mt-4'>
                <div className='text-gray-700 dark:text-gray-200 font-semibold text-2xl lg:text-3xl'>Product details</div>
                <p className='font-medium text-gray-500 dark:text-gray-400'>{product?.long_desc}</p>
                <div className='font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:text-primary dark:hover:text-primary text-xl'>More about the product</div>
              </div>
              <hr />
              <div className='flex items-center justify-between cursor-pointer text-2xl lg:text-3xl' onClick={() => setDisplayReviews(!displayReviews)}>
                <span className=''>Reviews({comments.length})</span>
                <div className='flex gap-1 items-center'>
                  <span className='text-primary'>{averageStars()}</span><BsStarFill className='text-primary' />
                  <span> {displayReviews ? <GrUp /> : <GrDown />} </span>
                </div>
              </div>
              {displayReviews && (
                <div className='flex flex-col gap-2'>
                  {user && ( // Afficher la zone de commentaire seulement si l'utilisateur est connecté
                    <div className='flex flex-col gap-2'>
                      <textarea className='p-2 border focus:border-none focus:outline-1 focus:outline-primary bg-transparent' placeholder="Add a comment" onChange={(e) => setComment(e.target.value)} value={comment || ""}></textarea>
                      <div className='flex justify-between items-center'>
                        <div> How many stars?</div>
                        <div className='flex items-center justify-end gap-1'>
                          {/* Stars selection, vous pouvez implémenter un système de rating ici */}
                          <span className=''><BiStar /></span>
                          <span className=''><BiStar /></span>
                          <span className=''><BiStar /></span>
                          <span className=''><BiStar /></span>
                          <span className=''><BiStar /></span>
                        </div>
                      </div>
                      <button className='p-1 bg-primary hover:bg-secondary text-gray-100' onClick={handleAddComment}>Submit</button>
                    </div>
                  )}
                  {!user && ( // Message si l'utilisateur n'est pas connecté
                    <div className="text-center text-gray-600 dark:text-gray-300 py-4">
                      Please <Link to="/login" className="text-primary hover:underline">log in</Link> to add a comment.
                    </div>
                  )}

                  {
                    currentComments.map((c) => (
                      <div key={c.id} className='flex flex-col gap-1'>
                        <div className='text-gray-700 dark:text-gray-200 font-semibold flex items-center justify-between'>
                          <span>{userInfos[c.user]?.username || "Loading..."}</span>
                          <span>{formatRelativeTime(c.updated_at)}</span>
                        </div>
                        <p className='text-gray-500 dark:text-gray-400'>{c.comment}</p>
                        <div className='flex items-center gap-1'>
                          <span className='text-yellow-500'>{c.stars}</span><BsStarFill className='text-yellow-500' />
                        </div>
                      </div>
                    ))
                  }
                  <div className='flex items-center justify-end gap-2'>
                    <button className='text-gray-600 dark:text-gray-400 p-2' onClick={handlePreviousPage} disabled={currentComPage === 1}>Previous</button>
                    <span className='text-gray-500'>{currentComPage} / {totalCommentsPages}</span>
                    <button className='dark:text-gray-400 text-gray-600 p-2' onClick={handleNextPage} disabled={currentComPage === totalCommentsPages}>Next</button>
                  </div>
                </div>

              )}
              <hr />
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <div className='text-2xl p-5 font-semibold'>People wear this so nicely</div>
          <div></div>
        </div>
        <div className='flex flex-col gap-2'>
          <div className='text-2xl p-5 font-semibold'>You might be interested...</div>
          <div></div>
        </div>
      </div>
    </div>
  )
}

export default Product