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
import { formatDistanceToNow } from 'date-fns';
import Swal from 'sweetalert2'

import { fr } from 'date-fns/locale'; // Importez la locale française

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale:fr });
};

const Product = () => {
    const { productId, v } = useParams();
    const user = useSelector((state) => state.user.user);
    const cart = useSelector((state) => state.cart.cart);
    const dispatch = useDispatch();
    const [variantId, setVariantId] = useState(v);
    const [sizeId, setSizeId] = useState(null);
    const [comment, setComment] = useState(null);
    const [comments, setComments] = useState([]);
    const [currentComPage, setCurrentComPage] = useState(1);
    const commentsPerPage = 5; // Nombre de commentaires par page
    const indexOfLastComment = currentComPage * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    const currentComments = comments.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)) // Trier par date décroissante
    .slice(indexOfFirstComment, indexOfLastComment); // Extraire les commentaires pour la page actuelle
    const totalCommentsPages = Math.ceil(comments.length / commentsPerPage);
    const handleNextPage = () => {
    if (currentComPage < totalCommentsPages) {
        setCurrentComPage(currentComPage + 1);
    }
    };
    const handlePreviousPage = () => {
    if (currentComPage > 1) {
        setCurrentPage(currentComPage - 1);
    }
    };

    const [pressed, setPressed] = useState(false);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const [product, setProduct] = useState(null);
    const [displayReviews, setDisplayReviews] = useState(false);
    const [category, setCategory] = useState(null);
    const selectedVariant = (vId) => {
        return product?.variants?.find((variant) => variant.id === parseInt(vId)) || product?.variants[0];
    };
    const variant = selectedVariant(variantId);
    const [selectedVariantImage, setSelectedVariantImage] = useState(null);
    const [userInfos, setUserInfos] = useState({});

    useEffect(() => {
        axios.get(`${apiBaseUrl}api/products/${productId}/`)
            .then(response => {
                setProduct(response.data);
            })
            .catch(error => console.error("Error fetching data:", error));
        
    }, [productId, variantId]);

    useEffect(() => {
        const initialVariant = selectedVariant(variantId);
        setSelectedVariantImage(initialVariant?.images[0]?.image || null);
        if (product) {
            const categoryId = product.category;
            axios.get(`${apiBaseUrl}api/categories/${categoryId}/`)
                .then(response => {
                    setCategory(response.data.title);
                })
                .catch(error => console.error("Error fetching data:", error));
        }
    }, [product]);

    useEffect(() => {
        const fetchCommentsAndUsers = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}api/comments/${productId}/`);
                setComments(response.data);

                // Chargez les informations utilisateur pour chaque commentaire
                const users = {};
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
    }, [product]);

    const getUserInfo = async (userId) => {
        try {
            const response = await axios.get(`${apiBaseUrl}api/user/${userId}/`);
            return response.data;
        } catch (error) {   
            console.error('Error fetching user info:', error);
            return null;
        }
    };

    const handleAddComment = async (comment) => {
        try {
            const response = await axios.post(
                `${apiBaseUrl}api/comments/save/`,
                { comment, user: user.id, stars: 5, product: productId },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            const newComment ={ id:response.data.comment.product_id,
                comment:response.data.comment.content, 
                user: user.id, 
                stars: response.data.comment.stars, 
                product: productId,
                updated_at: response.data.comment.updated_at,
                created_at: response.data.comment.created_at}
            // Ajoutez le nouveau commentaire à la liste existante
            setComments((prevComments) => [...prevComments, newComment]);

                // Récupérez les informations utilisateur si elles ne sont pas déjà chargées
            if (!userInfos[newComment.user]) {
                const userInfo = await getUserInfo(newComment.user);
                setUserInfos((prevUserInfos) => ({
                ...prevUserInfos,
                [newComment.user]: userInfo,
                }));
            }
            // Réinitialisez le champ de commentaire
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

    const fetchCart = async () => {
        try {
          const response = await axios.get(`${apiBaseUrl}api/cart/${user?.id}/`);
          
            const cartData = response.data;

            // Récupérer les détails de chaque variante
            const items = await Promise.all(
                cartData.map(async (item) => {
                    const variantResponse = await axios.get(`${apiBaseUrl}api/products/variant/${item.variant}/`);
                    const sizeResponse = await (await axios.get(`${apiBaseUrl}api/products/size/${item.size}/`))
                    return {
                        id: item.id,
                        variant: variantResponse.data, // Stocker la variante entière
                        size: sizeResponse.data, // Stocker la taille entière
                        quantity: item.quantity,
                    };
                })
            );

            // Dispatch pour mettre à jour le panier dans Redux
            dispatch({ type: 'cart/updateCart', payload: items });
          console.log("Cart fetched successfully:", response.data);

        } catch (error) {
          console.error("Error fetching cart data:", error);
        }
      };

    const handleAddToCart = () => {
        if (user) {
            axios.post(`${apiBaseUrl}api/cart/add/`, {
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
                dispatch({ type: 'cart/updateCartItem', payload: response.data.cart_item });
                fetchCart(); // Mettre à jour le panier après l'ajout
                // Afficher une notification de succès
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
            console.log("User not logged in");
        }
    }

    useEffect(() => {
        if (user) {
            axios
                .get(`${apiBaseUrl}api/cart/${user?.id}/`)
                .then(async (response) => {
                    const cartData = response.data;
                    console.log("User ", user?.id, " cart data: ", cartData);

                    // Récupérer les détails de chaque variante
                    const items = await Promise.all(
                        cartData.map(async (item) => {
                            const variantResponse = await axios.get(`${apiBaseUrl}api/products/variant/${item.variant}/`);
                            const sizeResponse = await (await axios.get(`${apiBaseUrl}api/products/size/${item.size}/`))
                            return {
                                id: item.id,
                                variant: variantResponse.data, // Stocker la variante entière
                                size: sizeResponse.data, // Stocker la taille entière
                                quantity: item.quantity,
                            };
                        })
                    );

                    // Dispatch pour mettre à jour le panier dans Redux
                    dispatch({ type: 'cart/updateCart', payload: items });
                })
                .catch((error) => console.error("Error fetching data:", error));
        }
    }, [user]);

    return (
        <div className='flex flex-col gap-0'>
            <div className="bg-primary/40 py-3">
                <div className="text-xl text-secondary text-center font-semibold dark:text-gray-200">Product Details</div>
                <div className="text-sm text-gray-500 text-center dark:text-gray-200">Home / {category || "Loading..." } / {product?.title}</div>
            </div>
            <div className='flex flex-col gap-2'>
                <div className='container flex flex-col gap-2 lg:gap-4 lg:flex-row py-2'>
                    {/* partie gauche(photos) */}
                    <div className='flex gap-2 flex-col-reverse lg:flex-row items-start h-1/2 lg:h-[628px] lg:w-[548px] w-full'>
                        <div className='flex lg:flex-col flex-row gap-1'>
                            {selectedVariant(variantId)?.images.map((img) => (
                                <div key={img.id} className='w-[64px] h-[64px] rounded cursor-pointer'>
                                    <img src={apiBaseUrl + img.image} className='h-full w-full' alt=""
                                        onMouseEnter={() => setSelectedVariantImage(img.image)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className='lg:h-[628px] lg:w-[488px] h-auto w-full rounded cursor-pointer'>
                            <img src={apiBaseUrl + selectedVariantImage} className='h-full w-full' alt="" />
                        </div>
                    </div>
                    {/* partie droite, details */}
                    <div className='flex-1 flex flex-col gap-4 lg:mr-32'>
                        <div className='flex flex-col gap-1'>
                            <div className='text-2xl font-semibold dark:text-gray-200'>{product?.title}</div>
                            <p className='text-lg text-med text-gray-500 dark:text-gray-200'>{product?.short_desc}</p>
                            <p className='text-2xl text-gray-700 flex lg:flex-row flex-col lg:items-center gap-2 dark:text-gray-200'>
                                {variant?.discount > 0
                                    ? "$" + new_price(variant?.price, variant?.discount)
                                    : "$" + variant?.price}
                                {variant?.discount > 0 && (
                                    <span className='text-xl text-gray-400 line-through'>
                                        ${variant?.price}
                                    </span>
                                )}
                                {variant?.discount > 0 && (
                                    <span className='text-xl text-green-600'>
                                        Enjoy -{variant?.discount}% on this product
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className='flex items-center gap-2'>
                                {product?.variants?.map((v) => (
                                    <img
                                    key={v.id}
                                    src={
                                    Array.isArray(v.images) && v.images.length > 0
                                        ? apiBaseUrl + (v.images.find((img) => img.mainImage)?.image || v.images[0].image)
                                        : apiBaseUrl + "/default-image.jpg" // Image par défaut si aucune image n'est disponible
                                    }
                                    alt="Variant Image"
                                    className={`h-14 w-14  cursor-pointer border-2 ${variantId == v.id ? 'border-primary' : 'border-gray-300'}`} 
                                    onClick={() => {
                                        setVariantId(v.id);
                                    }} 
                                />  
                                ))
                            }
                        </div>
                        <div className='flex flex-col gap-4 '>
                            <div className='flex justify-between items-center gap-2 lg:text-lg md:text-base text-sm font-semibold dark:text-gray-100 text-gray-700'>
                                <div className=''>Select Size</div>
                                <Link to={'/'} className='flex items-center gap-1'><FaRuler /> Size guide</Link>
                            </div>
                            <div className='grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-2'>
                                {
                                    product?.variants?.find((v) => v.id == variantId)?.sizes.map((v) => (
                                        <div key={v.id} className={`p-2 border ${sizeId == v.id ? 'border-primary' : 'border-gray-300'} cursor-pointer`}
                                            onClick={() => setSizeId(v.id)}>
                                            {v.size}
                                        </div>    
                                    ))
                                }
                            </div>
                            <div className={`${!sizeId && pressed?'flex font-serif text-red-600':'hidden'}`}>Select a size </div>
                            <div className='flex flex-col items-center gap-4'>
                                <button className='bg-primary  hover:bg-secondary text-gray-50 py-2 px-4 w-full' onClick={()=>{
                                    setPressed(true)
                                    handleAddToCart()
                                    }}>Add to Cart</button>
                                <button className='text-primary hover:text-secondary py-2 px-4 w-full border border-primary hover:border-secondary'>Add to Wishlist</button>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <div className='text-gray-700 dark:text-gray-200 font-semibold'>Product details</div>
                                <p className='text-gray-500 dark:text-gray-400'>{product?.long_desc}</p>
                                <div className='text-gray-700 dark:text-gray-200 cursor-pointer hover:text-primary dark:hover:text-primary'>More about the product</div>
                            </div>
                            <hr />
                            <div className='flex items-center justify-between cursor-pointer' onClick={() => setDisplayReviews(!displayReviews)}>
                                <span className=''>Reviews({comments.length})</span>
                                <div className='flex gap-1 items-center'>
                                    <span className='text-yellow-500'>{averageStars()}</span><BsStarFill className='text-yellow-500' />
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