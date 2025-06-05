import React, { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";
import { new_price } from './Boutique';
import { BsStarFill } from 'react-icons/bs';
import { Link } from "react-router-dom";
import { FaRuler } from 'react-icons/fa';
import { GrDown, GrUp } from "react-icons/gr";
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { BiStar } from 'react-icons/bi';
import { formatDistanceToNow, set } from 'date-fns';
import Swal from 'sweetalert2'

import { fr, se } from 'date-fns/locale'; // Importez la locale française

const formatRelativeTime = (dateString:any) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale:fr });
};

// Define types for product variant and image structure
interface ProductImage {
    id: number;
    image: string;
    mainImage: boolean;
}

interface ProductSize {
    id: number;
    size: string;
}

interface ProductVariant {
    id: number;
    color: string;
    price: number;
    discount: number;
    images: ProductImage[];
    sizes: ProductSize[];
}

interface ProductType {
    id: number;
    title: string;
    short_desc: string;
    long_desc: string;
    category: number;
    variants: ProductVariant[];
}


const Product = () => {
    const { productId, v } = useParams();
    const user = useSelector((state:any) => state.user.user);
    const cart = useSelector((state: any) => state.cart.cart);
    const dispatch = useDispatch();
    const [variantId, setVariantId] = useState<number | any>(v);
    const [sizeId, setSizeId] = useState<number | null>(null);
    const [comment, setComment] = useState<string | null>(null);
    type CommentType = {
        id: number;
        comment: string;
        user: number;
        stars: number;
        product: number;
        updated_at: string;
        created_at: string;
    };
    const [comments, setComments] = useState<CommentType[]>([]);
    const [currentComPage, setCurrentComPage] = useState(1);
    const commentsPerPage = 5; // Nombre de commentaires par page
    const indexOfLastComment = currentComPage * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    const currentComments = comments
        .slice()
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()) // Trier par date décroissante
        .slice(indexOfFirstComment, indexOfLastComment); // Extraire les commentaires pour la page actuelle
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
    const [product, setProduct] = useState<ProductType | null>(null); // Use ProductType
    const [displayReviews, setDisplayReviews] = useState(false);
    const [category, setCategory] = useState<string | null>(null); // Category is a string title
    const [productWished, setProductWished] = useState(false);

    const selectedVariant = (vId : any): ProductVariant | undefined => { // Return type ProductVariant or undefined
        return product?.variants?.find((variant:ProductVariant) => variant.id === parseInt(vId)) || product?.variants[0];
    };
    const variant = selectedVariant(variantId);
    const [selectedVariantImage, setSelectedVariantImage] = useState<string | null>(null);
    const [userInfos, setUserInfos] = useState<{ [key: number]: any }>({});

    useEffect(() => {
        axios.get<ProductType>(`${apiBaseUrl}api/products/${productId}/`) // Type the response
            .then(response => {
                setProduct(response.data);
            })
            .catch(error => console.error("Error fetching data:", error));

    }, [productId, apiBaseUrl]); // Add apiBaseUrl to dependency array

    useEffect(() => {
    if (user && variant) {
        axios.post<{ exists: boolean }>(`${apiBaseUrl}api/wishlist/already_exists/`, {user_id: user.id, variant_id: variant.id}, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(response => {
            const data = response.data; // data is now typed as { exists: boolean }
            setProductWished(data.exists);
        })
        .catch(error => console.error("Error checking wishlist existence:", error)); // Add error handling
    }
}, [user, variant, apiBaseUrl]); // Add apiBaseUrl to dependency array

    useEffect(() => {
        const initialVariant = selectedVariant(variantId);
        setSelectedVariantImage(initialVariant?.images[0]?.image || null);
        if (product) {
            const categoryId = product.category;
            axios.get<{ title: string }>(`${apiBaseUrl}api/categories/${categoryId}/`) // Type the response
                .then(response => {
                    setCategory(response.data.title);
                })
                .catch(error => console.error("Error fetching category data:", error)); // Add error handling
        }
    }, [product, variantId, apiBaseUrl]); // Add apiBaseUrl to dependency array

    useEffect(() => {
        const fetchCommentsAndUsers = async () => {
            try {
                const response = await axios.get<CommentType[]>(`${apiBaseUrl}api/comments/${productId}/`);
                setComments(response.data);

                const users: { [key: number]: any } = {};
                for (const comment of response.data) {
                    const userInfo = await getUserInfo(comment.user);
                    users[comment.user] = userInfo;
                }
                setUserInfos(users);
            } catch (error) {
                console.error("Error fetching the comments or user info:", error);
            }
        };

        fetchCommentsAndUsers();
    }, [product, productId, apiBaseUrl]); // Added productId and apiBaseUrl to dependency array

    const getUserInfo = async (userId: number) => {
        try {
            const response = await axios.get(`${apiBaseUrl}api/user/${userId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user info:', error);
            return null;
        }
    };

    // Define type for add comment response
    interface AddCommentResponse {
        comment: {
            product_id: number;
            content: string;
            stars: number;
            updated_at: string;
            created_at: string;
        };
    }

    const handleAddComment = async (commentText: string | null) => {
        if (!commentText || !user) return;

        try {
            const response = await axios.post<AddCommentResponse>( // Type the response here
                `${apiBaseUrl}api/comments/save/`,
                { comment: commentText, user: user.id, stars: 5, product: productId },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            const newComment: CommentType = {
                id: response.data.comment.product_id,
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
                setUserInfos((prevUserInfos) => ({
                ...prevUserInfos,
                [newComment.user]: userInfo,
                }));
            }
            setComment(null);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const averageStars = () => {
        if (comments.length === 0) return 0;
        const totalStars = comments.reduce((acc, comment) => acc + comment.stars, 0);
        return (totalStars / comments.length).toFixed(1);
    }

    type CartItemApi = {
        id: number;
        variant: number;
        size: number;
        quantity: number;
    }

    type CartItemRedux = {
        id: number;
        variant: ProductVariant; // More specific type now
        size: ProductSize;   // More specific type now
        quantity: number;
    }

    const fetchCart = async () => {
        try {
            const response = await axios.get<CartItemApi[]>(`${apiBaseUrl}api/cart/${user?.id}/`);

            const cartData = response.data;

            const items: CartItemRedux[] = await Promise.all(
                cartData.map(async (item) => {
                    const variantResponse = await axios.get<ProductVariant>(`${apiBaseUrl}api/products/variant/${item.variant}/`);
                    const sizeResponse = await axios.get<ProductSize>(`${apiBaseUrl}api/products/size/${item.size}/`)
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

    // Define type for add to cart response
    interface AddToCartResponse {
        cart_item: {
            id: number;
            user: number;
            variant: number;
            size: number;
            quantity: number;
            // ... potentially other fields returned by your backend
        };
    }

    const handleAddToCart = () => {
        if (user) {
            axios.post<AddToCartResponse>(`${apiBaseUrl}api/cart/add/`, { // Type the response here
                user_id: user.id,
                variant_id: variantId,
                size_id: sizeId,
                quantity: 1
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            })
            .then(response => {
                console.log("Product added to cart:", response.data.cart_item);
                const data = response.data; // data is now typed as AddToCartResponse
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
                console.error("Error adding product to cart:", error.response.data);
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Please log in to add items to your cart',
                showConfirmButton: true,
                confirmButtonText: 'Get it!',
                confirmButtonColor: '#fea928',

            });
        }
    }

    // Define type for add to wishlist response
    interface AddToWishlistResponse {
        wishlist_item: {
            id: number;
            user: number;
            variant: number; // This is the variant ID from the backend
            // ... potentially other fields
        };
    }

    const handleAddToWishlist = () => {
        if (user) {
            axios.post<AddToWishlistResponse>(`${apiBaseUrl}api/wishlist/add/`, { // Type the response here
                user_id: user.id,
                variant_id: variantId
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            })
            .then(async (response) => {
                const variantIdFromResponse = response.data.wishlist_item.variant; // Accessing wishlist_item
                const variantResponse = await axios.get<ProductVariant>(`${apiBaseUrl}api/products/variant/${variantIdFromResponse}/`); // Type the response
                const wishlistItem = {
                    id: response.data.wishlist_item.id, // Accessing wishlist_item
                    variant: variantResponse.data
                };
                dispatch({ type: 'wishlist/addToWishlist', payload: wishlistItem });
            })
            .catch(error => {
                console.error("Error adding product to wishlist:", error.response.data);
            });
        }
    }

    // Define type for remove from wishlist response
    interface RemoveFromWishlistResponse {
        wishlist_item: {
            id: number;
            // ... potentially other fields
        };
    }

    const handleRemoveFromWishlist = () => {
        let itemDeleted: number | undefined;
        if (user) {
            axios.post<RemoveFromWishlistResponse>(`${apiBaseUrl}api/wishlist/remove/`, { // Type the response here
                user_id: user.id,
                variant_id: variantId
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            })
            .then(response => {
                itemDeleted = response.data.wishlist_item.id; // Accessing wishlist_item
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
                console.error("Error removing product from wishlist:", error.response.data);
            });
        }
    }

    useEffect(() => {
        if (user) {
            axios
                .get<CartItemApi[]>(`${apiBaseUrl}api/cart/${user?.id}/`)
                .then(async (response) => {
                    const cartData = response.data;
                    console.log("User ", user?.id, " cart data: ", cartData);

                    const items: CartItemRedux[] = await Promise.all(
                        cartData.map(async (item) => {
                            const variantResponse = await axios.get<ProductVariant>(`${apiBaseUrl}api/products/variant/${item.variant}/`);
                            const sizeResponse = await axios.get<ProductSize>(`${apiBaseUrl}api/products/size/${item.size}/`)
                            return {
                                id: item.id,
                                variant: variantResponse.data,
                                size: sizeResponse.data,
                                quantity: item.quantity,
                            };
                        })
                    );

                    dispatch({ type: 'cart/updateCart', payload: items });
                })
                .catch((error) => console.error("Error fetching cart data in useEffect:", error));

            interface WishlistResponseData {
                id: number;
                user: number;
                variant: number; // The variant ID
            }

            axios.post<WishlistResponseData[]>(`${apiBaseUrl}api/wishlist/`, { user_id: user.id }, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            })
            .then(async response => {
                console.log("User ", user?.id, " wishlist data: ", response.data);
                type WishlistItemRedux = {
                    id: number;
                    variant: ProductVariant;
                }

                const wishlistData = response.data; // Now correctly typed as WishlistResponseData[]

                const items: WishlistItemRedux[] = await Promise.all(
                        wishlistData.map(async (item) => {
                            const variantResponse = await axios.get<ProductVariant>(`${apiBaseUrl}api/products/variant/${item.variant}/`);
                            return {
                                id: item.id,
                                variant: variantResponse.data,
                            }})
                    );
                    console.log("User wishlist:", items);
                dispatch({ type: 'wishlist/updateWishlist', payload: items });
            })
            .catch((error) => console.error("Error fetching wishlist data in useEffect:", error));

        }
    }, [user, apiBaseUrl, dispatch]);

    return (
        <div className='flex flex-col lg:gap-8'>
            <div className="bg-primary/40 py-3">
                <div className="text-xl text-secondary text-center font-semibold dark:text-gray-200">Product Details</div>
                <div className="text-sm text-gray-500 text-center dark:text-gray-200">Home / {category || "Loading..." } / {product?.title}</div>
            </div>
            <div className='flex flex-col gap-2'>
                <div className='justify-center flex flex-col gap-4 lg:gap-12 lg:flex-row py-2'>
                    {/* partie gauche(photos) */}
                    <div className='flex gap-4 flex-col-reverse lg:flex-row items-start h-1/2 lg:h-[720px] lg:w-[648px] w-full'>
                        <div className='flex lg:flex-col flex-row gap-2'>
                            {selectedVariant(variantId)?.images.map((img: ProductImage) => ( // Use ProductImage type
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
                                {product?.variants?.map((v: ProductVariant) => ( // Use ProductVariant type
                                    <img
                                    key={v.id}
                                    src={
                                    Array.isArray(v.images) && v.images.length > 0
                                        ? apiBaseUrl + (v.images.find((img: ProductImage) => img.mainImage)?.image || v.images[0].image) // Use ProductImage type
                                        : apiBaseUrl + "/default-image.jpg"
                                    }
                                    alt="Variant Image"
                                    className={`h-20 w-20  cursor-pointer border-2 ${Number(variantId) === v.id ? 'border-primary' : 'border-gray-300'}`}
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
                                    product?.variants?.find((v: ProductVariant) => v.id == variantId)?.sizes.map((s: ProductSize) => ( // Use ProductVariant and ProductSize types
                                        <div key={s.id} className={`p-4 border ${sizeId == s.id ? 'border-primary' : 'border-gray-300'} cursor-pointer`}
                                            onClick={() => setSizeId(s.id)}>
                                            {s.size}
                                        </div>
                                    ))
                                }
                            </div>
                            <div className={`${!sizeId && pressed?'flex font-serif text-red-600':'hidden'}`}>Please select a size </div>
                            <div className='flex flex-col items-center gap-4'>
                                <button className='bg-primary  hover:bg-secondary
                                    text-gray-50 py-4 px-4 w-full font-semibold text-lg' onClick={()=>{
                                        setPressed(true)
                                        if (sizeId) {
                                        handleAddToCart()
                                        }
                                        }}>Add to Cart</button>
                                <button title={productWished?"Remove from the wishlist"
                                :"Add to the wish list"} className='text-gray-50
                                hover:bg-black bg-black/80 dark:bg-gray-800 dark:hover:bg-black/80
                                lg:py-4 lg:px-4 p-3 text-lg font-semibold w-full'
                                   onClick={()=>{
                                        if (productWished) {
                                            handleRemoveFromWishlist();
                                        } else {
                                            setProductWished(true)
                                            handleAddToWishlist()
                                            Swal.fire({
                                                icon: 'success',
                                                title: 'Product added to wishlist',
                                                showConfirmButton: false,
                                                timer: 1500
                                            });

                                        }

                                    }}>{productWished? "Remove from the Wishlist":"Add to Wishlist"}</button>
                            </div>
                            <div className='flex flex-col gap-2 text-lg mt-4'>
                                <div className='text-gray-700 dark:text-gray-200 font-semibold text-2xl lg:text-3xl'>Product details</div>
                                <p className='font-medium text-gray-500 dark:text-gray-400'>{product?.long_desc}</p>
                                <div className='font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:text-primary dark:hover:text-primary text-xl'>More about the product</div>
                            </div>
                            <hr />
                            <div className='flex items-center justify-between cursor-pointer  text-2xl lg:text-3xl' onClick={() => setDisplayReviews(!displayReviews)}>
                                <span className=''>Reviews({comments.length})</span>
                                <div className='flex gap-1 items-center'>
                                    <span className='text-primary'>{averageStars()}</span><BsStarFill className='text-primary' />
                                    <span> {displayReviews ? <GrUp /> : <GrDown />} </span>
                                </div>
                            </div>
                            {displayReviews && (
                                <div className='flex flex-col gap-2'>
                                    {user && (
                                        <div className='flex flex-col gap-2'>
                                            <textarea className='p-2 border focus:border-none focus:outline-1 focus:outline-primary bg-transparent' placeholder="Add a comment" onChange={(e)=> setComment(e.target.value)} value={comment?comment:""}></textarea>
                                            <div className='flex justify-between items-center'>
                                                <div> How many stars?</div>
                                                <div className='flex items-center justify-end gap-1'>
                                                    <span className=''><BiStar/></span>
                                                    <span className=''><BiStar/></span>
                                                    <span className=''><BiStar/></span>
                                                    <span className=''><BiStar/></span>
                                                    <span className=''><BiStar/></span>
                                                </div>
                                            </div>
                                            <button className='p-1 bg-primary hover:bg-secondary text-gray-100' onClick={() => {handleAddComment(comment)
                                            setComment(null)
                                            }}>Submit</button>
                                        </div>
                                    )}
                                    {
                                        currentComments.map((c) => (
                                            <div key={c.id} className='flex flex-col gap-1'>
                                                <div className='text-gray-700 dark:text-gray-200 font-semibold flex items-center justify-between'>
                                                    <span>{userInfos[c?.user]?.username || "Loading..."}</span>
                                                    <span>{formatRelativeTime(c?.updated_at)}</span>
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