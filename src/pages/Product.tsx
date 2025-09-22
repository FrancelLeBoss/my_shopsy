import React, { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";
import { new_price } from './Boutique';
import { BsStarFill } from 'react-icons/bs';
import { Link } from "react-router-dom";
import { FaRuler } from 'react-icons/fa';
import { GrDown, GrUp } from "react-icons/gr";
import axiosInstance from '../api/axiosInstance';
import { useSelector, useDispatch } from 'react-redux';
import { BiStar } from 'react-icons/bi';
import { formatDistanceToNow } from 'date-fns';
import Swal from 'sweetalert2'
import { fr } from 'date-fns/locale';

// Typage RootState et User depuis votre Redux store
import type { RootState } from '../redux/store';
import {User} from '../types/User'
import { CommentType, ProductSize, Product as ProductType, ProductVariant, ProductVariantImage } from '../types/Product';

const formatRelativeTime = (dateString: any) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
};

// ... (vos interfaces restent inchangées)
interface UserInfoForComment {
  username: string;
  // Ajoutez d'autres champs si nécessaire
}

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
    variant_id: number;
  };
}

interface RemoveFromWishlistResponse {
  wishlist_item: {
    id: number;
  };
}

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
  const { productId, v } = useParams<{ productId: string, v: string }>();
  const user: User | null = useSelector((state: RootState) => state.user.user);
  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  const [variantId, setVariantId] = useState<number | null>(parseInt(v || '', 10) || null);
  const [sizeId, setSizeId] = useState<number | null>(null);
  const [comment, setComment] = useState<string | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [selectedStar, setSelectedStar] = useState<number>(0);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [currentComPage, setCurrentComPage] = useState(1);
  const [relatedBySubCatProducts, setRelatedBySubCatProducts] = useState<ProductType[]>([]);
  const [relatedByCatProducts, setRelatedByCatProducts] = useState<ProductType[]>([]);
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
  const [category, setCategory] = useState<{ title: string, id: number , slug: string } | null>(null);
  const [productWished, setProductWished] = useState(false);

  // Fonction pour obtenir la variante sélectionnée
  const selectedVariant = (vId: number | null): ProductVariant | undefined => {
    return product?.variants?.find((variant: ProductVariant) => variant.id === vId);
  };
  const mainVariant = (product:ProductType | null):ProductVariant | undefined => {
    return product?.variants[0];
  }

  const variant = selectedVariant(variantId);

  const [selectedVariantImage, setSelectedVariantImage] = useState<string | null>(null);
  const [userInfos, setUserInfos] = useState<{ [key: number]: UserInfoForComment }>({});

  // Initialisation du produit et de l'image de la variante
  useEffect(() => {
    if (productId) {
      axiosInstance.get<ProductType>(`api/products/${productId}/`)
        .then(response => {
          setProduct(response.data);
          const initialVariant = response.data.variants.find(v => v.id === variantId) || response.data.variants[0];
          if (initialVariant) {
            const mainImage = initialVariant.images.find(img => img.mainImage)?.image || initialVariant.images[0]?.image;
            setSelectedVariantImage(mainImage || null);
          }
        })
        .catch(error => console.error("Error fetching product data:", error));
    }
  }, [productId, variantId]);

  // Vérifier si le produit est déjà dans la wishlist de l'utilisateur
  useEffect(() => {
    if (user?.id && variant?.id) {
      axiosInstance.post<{ exists: boolean }>(`api/wishlist/already_exists/`, { user_id: user.id, variant_id: variant.id })
        .then(response => {
          setProductWished(response.data.exists);
        })
        .catch(error => console.error("Error checking wishlist existence:", error));
    } else {
      setProductWished(false);
    }
  }, [user, variant]);

  // Récupération de la catégorie du produit
  useEffect(() => {
    if (product?.category) {
      axiosInstance.get<{ title: string, id: number , slug: string }>(`api/categories/${product.category}/`)
        .then(response => {
          setCategory(response.data);
        })
        .catch(error => console.error("Error fetching category data:", error));
    }
  }, [product]);

  //recuperation des produits dans la meme sous categorie et  categorie 
    useEffect(() => {
     if (product?.category) {
      axiosInstance.get<ProductType[]>(`api/products/category/${product.category}/`)
        .then(response => {
          setRelatedByCatProducts(response.data);
          console.log("relatedByCatProducts:", response.data);
        })
        .catch(error => console.error("Error fetching related products:", error));
    }
    if (product?.subCategory) {
      axiosInstance.get<ProductType[]>(`api/products/subcategory/${product.subCategory}/`)
        .then(response => {
          setRelatedBySubCatProducts(response.data);
          console.log("relatedBySubCatProducts:", response.data);
        })
        .catch(error => console.error("Error fetching subcategory products:", error));
    }
  }, [product?.category, product?.subCategory]);

  // Récupération des commentaires et infos utilisateur
  useEffect(() => {
    const fetchCommentsAndUsers = async () => {
      if (!productId) return;

      try {
        const response = await axiosInstance.get<CommentType[]>(`api/comments/${productId}/`);
        setComments(response.data);

        const users: { [key: number]: UserInfoForComment } = {};
        for (const comment of response.data) {
          if (!users[comment.user]) {
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
  }, [productId]);

  // Fonction pour obtenir les infos utilisateur d'un commentaire
  const getUserInfo = async (userId: number): Promise<UserInfoForComment | null> => {
    try {
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
      const response = await axiosInstance.post<any>(
        `api/comments/save/`,
        { comment: comment, user: user.id, stars: selectedStar, product: productId }
      );

      const newComment: CommentType = {
        id: response.data.comment.id,
        comment: response.data.comment.content,
        user: user.id,
        stars: response.data.comment.stars,
        product: Number(productId),
        updated_at: response.data.comment.updated_at,
        created_at: response.data.comment.created_at
      };
      setComments((prevComments) => [...prevComments, newComment]);

      if (!userInfos[newComment.user]) {
        const userInfo = await getUserInfo(newComment.user);
        if (userInfo) {
          setUserInfos((prevUserInfos) => ({
            ...prevUserInfos,
            [newComment.user]: userInfo,
          }));
        }
      }
      setComment(null);
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
    //return (totalStars / comments.length).toFixed(1);
    return Math.round(totalStars / comments.length);
  }

const sortRelatedProducts = (products: ProductType[], currentProduct: ProductType | null) => {
  if (!currentProduct) return products;

  return products.slice().sort((a, b) => {
    // Priorité à la même subCategory
    const aSameSubCat = a.subCategory === currentProduct.subCategory ? 1 : 0;
    const bSameSubCat = b.subCategory === currentProduct.subCategory ? 1 : 0;

    if (aSameSubCat !== bSameSubCat) {
      return bSameSubCat - aSameSubCat; // Les produits de la même subCategory passent en premier
    }

    // Sinon, tri par nombre d'étoiles décroissant (propriété déjà présente)
    return (b.id ?? 0) - (a.id ?? 0);
  });
};

  const fetchCart = async () => {
    if (!user?.id) {
      console.log("User not logged in, cannot fetch cart.");
      return;
    }
    try {
      const response = await axiosInstance.get<CartItemApi[]>(`api/cart/`);
      const cartData = response.data;
      console.log("User ", user.id, " cart data: ", cartData);

      const items: CartItemRedux[] = await Promise.all(
        cartData.map(async (item) => {
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
      dispatch({ type: 'cart/updateCart', payload: items });
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
      return;
    }
    if (!sizeId) {
      setPressed(true);
      return;
    }

    axiosInstance.post<AddToCartResponse>(`api/cart/add/`, {
      user_id: user.id,
      variant_id: variantId,
      size_id: sizeId,
      quantity: 1
    })
      .then(response => {
        console.log("Product added to cart:", response.data.cart_item);
        const data = response.data;
        dispatch({ type: 'cart/updateCartItem', payload: data.cart_item });
        fetchCart();
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

    axiosInstance.post<AddToWishlistResponse>(`api/wishlist/add/`, {
      user_id: user.id,
      variant_id: variantId
    })
      .then(async (response) => {
        const variantIdFromResponse = response.data.wishlist_item.variant_id;
        console.log("the product added to wishlist: ", response.data.wishlist_item);
        const variantResponse = await axiosInstance.get<ProductVariant>(`api/products/variant/${variantIdFromResponse}/`);
        const wishlistItem: WishlistItemRedux = {
          id: response.data.wishlist_item.id,
          variant: variantResponse.data
        };
        dispatch({ type: 'wishlist/addToWishlist', payload: wishlistItem });
        setProductWished(true);
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
    axiosInstance.post<RemoveFromWishlistResponse>(`api/wishlist/remove/`, {
      user_id: user.id,
      variant_id: variantId
    })
      .then(response => {
        itemDeleted = response.data.wishlist_item.id;
        console.log("Product removed from wishlist ID:", itemDeleted);
        if (itemDeleted !== undefined) {
          dispatch({ type: 'wishlist/removeFromWishlist', payload: { itemDeleted } });
        }
        setProductWished(false);
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

  useEffect(() => {
    if (user && user.id) {
      fetchCart();

      axiosInstance.get<any[]>(`api/wishlist/`)
        .then(async response => {
          const wishlistData = response.data;
          const items: WishlistItemRedux[] = await Promise.all(
            wishlistData.map(async (item: any) => {
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
  }, [user, dispatch]);

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
        <div className="text-sm text-gray-500 text-center dark:text-gray-200"><Link className="hover:underline cursor-pointer" to="/">Home</Link> / <Link className="hover:underline cursor-pointer" to={`/category/${category?.slug}`}>{category?.title || "Loading..."}</Link>  / {product?.title}</div>
      </div>
      <div className='flex flex-col gap-2'>
        {/* MAIN PRODUCT CONTENT AREA: flex-row for desktop, column for mobile */}
        <div className='justify-center flex flex-col gap-4 lg:gap-12 
                lg:flex-row py-2 px-4 md:px-6'> 
          {/* Left part (photos) - This will be sticky */}
          <div className='
              flex gap-4 flex-col-reverse lg:flex-row items-start
              lg:h-[740px] lg:w-[720px] w-full
              lg:sticky lg:top-4 lg:self-start lg:mb-4 lg:pb-4 // Key changes for sticky
            '>
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
          {/* Right part, details - This will scroll */}
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
              <div className='flex items-center justify-between cursor-pointer text-xl lg:text-2xl' onClick={() => setDisplayReviews(!displayReviews)}>
                <span className=''>Reviews ({comments.length})</span>
                <div className='flex gap-1 items-center text-base lg:text-xl'>
{/*                   <span className='text-primary'>{averageStars()}</span><BsStarFill className='text-primary' /> */}
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`
                      cursor-pointer
                      transition-colors duration-300 text-primary
                      `} >
                        {
                          star <= averageStars() ? <BsStarFill /> : <BiStar />
                        }
                    </span>
                  ))}
                  <span> {displayReviews ? <GrUp /> : <GrDown />} </span>
                </div>
              </div>
              {displayReviews && (
                <div className='flex flex-col gap-2'>
                  {user && (
                    <div className='flex flex-col gap-2'>
                      <textarea className='p-2 border focus:border-none focus:outline-1 focus:outline-primary bg-transparent' placeholder="Add a comment" onChange={(e) => setComment(e.target.value)} value={comment || ""}></textarea>
                      <div className='flex justify-between items-center'>
                        <div> How many stars?</div>
                        <div className='flex items-center justify-end gap-1'>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              onMouseEnter={() => setHoveredStar(star)}
                              onMouseLeave={() => setHoveredStar(0)}
                              onClick={() => setSelectedStar(star)}
                              className={`
                                cursor-pointer
                                transition-colors duration-300 text-primary
                              `}
                            >
                              {
                                (hoveredStar > 0 ? star <= hoveredStar : star <= selectedStar)
                                  ? <BsStarFill  />
                                  : <BiStar />
                               }
                            </span>
                          ))}
                        </div>
                      </div>
                      <button className='p-1 bg-primary hover:bg-secondary text-gray-100' onClick={handleAddComment}>Submit</button>
                    </div>
                  )}
                  {!user && (
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
                          {
                            [1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={`
                                cursor-pointer text-primary`}>
                                {star <= c.stars ? <BsStarFill /> : <BiStar />}
                              </span>
                            ))}
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
          <div className='p-5 px-12 flex gap-4 mb-4 overflow-x-auto snap-x snap-mandatory'>
    {
        sortRelatedProducts(
            relatedBySubCatProducts.length > 5 ? relatedBySubCatProducts : relatedByCatProducts,
            product
        )
        .filter((p) => p.id !== product?.id).map((n) => (
            <a 
                key={n.id} 
                className='flex flex-col gap-2 cursor-pointer flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 snap-start' 
                href={`/product/${n.id}/${n.variants[0]?.id}`} 
            >
                <div className='h-[450px] bg-gray-200 dark:bg-gray-800'>
                    <img 
                        src={apiBaseUrl + mainVariant(n)?.images.find((image) => image.mainImage)?.image || mainVariant(n)?.images[0]?.image} 
                        alt={n?.title} 
                        className='w-full h-full object-cover' 
                    />
                </div>
                <div className='text-lg font-semibold dark:text-gray-200'>{n.title}</div>
                <div className='block text-gray-500 text-base line-clamp-2 max-h-[72px]'>{n.short_desc}</div>
                <div className='text-primary font-bold'>${mainVariant(n)?.price}</div>
            </a>
        ))
    }
</div>
        </div>
      </div>
    </div>
  )
}

export default Product