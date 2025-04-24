import React, { useEffect, useState } from 'react'
import Logo from "../../assets/logo.png"
import { IoMdCart, IoMdSearch } from 'react-icons/io'
import DarkMode from './DarkMode'
import { FaRegCaretSquareDown } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { BiCart, BiHeart } from 'react-icons/bi'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios';
import Swal from 'sweetalert2'


const Menu = [
    {
        id:1,
        name:"Home",
        link:"/"
    },
    {
        id:2,
        name:"Top Rated",
        link:"/top-rated"
    },
    {
        id:3,
        name:"Kids Wear",
        link:"/kids-wear"
    },
    {
        id:4,
        name:"Mens Wear",
        link:"/men-wear"
    },
    {
        id:5,
        name:"Womens Wear",
        link:"/women-wear"
    },
//     {
//         id:6,
//         name:"Trending Product",
//         link:"/#"
//     }
]

const DropdownLinks = [
    {
        id:1,
        name:"Trending Products",
        link:"/#"
    },
    {
        id:2,
        name:"Best Selling",
        link:"/#"
    },
    {
        id:3,
        name:"Top Rated",
        link:"/#"
    },
]
const Navbar = ({handleOrderPopup}) => {
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch()
    const cart = useSelector((state) => state.cart.items);
    // const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalItems = cart?.length;
    const totalPrice = cart?.reduce((total, item) => total + item.variant.price * item.quantity, 0);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;


    useEffect(() => {
        if (user) {
            axios
                .get(`${apiBaseUrl}api/cart/${user?.id}/`)
                .then(async (response) => {
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
                })
                .catch((error) => console.error("Error fetching data:", error));
        }
    }, [user]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            dispatch({ type: 'user/login', payload: JSON.parse(storedUser,token) });
        }
    }, []);

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout',
            text: "Are you sure you want to logout?",   
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout!'
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                .post(`${apiBaseUrl}api/logout/`, {token:user.token}, { withCredentials: true })
                localStorage.removeItem('user'); // Supprime les données de l'utilisateur
                localStorage.removeItem('token'); // Supprime les données de l'utilisateur
                dispatch({ type: 'user/logout' });
                Swal.fire(
                    'Logged out!',
                    'You have been logged out.',
                    'success'
                )
            }
        })
    }

  return (
    <div className='shadow-md bg-white dark:bg-gray-900 dark:text-white duration-200 relative z-40'>
        <div className='container hidden md:flex justify-between items-center'>
            <div className='flex items-center gap-2'>
                <span className='text-primary font-bold'>Free shipping</span>
                <span className='text-gray-500'>on all orders</span>
            </div>
            <div className='flex items-center gap-2 text-gray-600 dark:text-gray-200'>
                <Link >Help</Link>
                <span className='text-gray-500'>|</span>
                <Link>Contact</Link>
                <span className='text-gray-500'>|</span> 
                {user ? <Link to="/profile" className='text-primary' title={`${user.username} is connected`}>{user.username}</Link> : <Link to="/login" className='text-primary' title='Login or Register'>Login</Link>}
                <span className='text-gray-500'>|</span>
                {user ? <div onClick={()=>handleLogout()} className='text-primary cursor-pointer' title='Logout'>Logout</div> : <Link to="/register" className='text-primary' title='Login or Register'>Register</Link>}
                <span className='text-gray-500'>|</span>
                {/* Darkmode switcher */}
                <div className='text-lg'  title='Dark or Light modes'><DarkMode/></div>
            </div>
        </div>
        {/* Upper Navbar */}
        <div className='bg-primary/40 py-2'>
            <div className='container flex justify-between items-center'>
                <div>
                    <Link to="/" className='font-bold text-2xl sm:text-3xl flex gap-2'>
                       <img src={Logo} alt="Logo" className='w-10'/> 
                       Shopsy
                    </Link>
                </div>
                {/* Search bar and order button */}
                <div className='flex items-center justify-between gap-2'>
                    <div className='relative hidden sm:flex items-center group focus-within:border-blue-200'>
                        <input type="text" placeholder="Search" className='w-48 sm:w-48 group-hover:w-80 
                        focus:border-primary 
                        focus:outline-none focus:border-1
                        transition-all duration-300 border
                         border-gray-300 px-2 py-1
                         dark:border-gray-500
                         dark:bg-gray-800 dark:focus:border-primary'/>
                        <IoMdSearch className='absolute right-3 text-gray-500 
                        group-hover:text-primary group-focus:text-primary'/>
                    </div>
                    <div className='flex items-center'>
                        <button 
                        onClick={()=> handleOrderPopup()}
                        className='text-secondary hover:text-white hover:bg-primary 
                        transition-all duration-200 p-2 rounded-full relative'
                        title={`Total items in cart: ${totalItems}`}>
                            <span className='absolute -top-0 -right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs'>{totalItems}</span>
                            <BiCart className='text-3xl'/>
                        </button>
                        <Link to="/wishlist" className='text-secondary hover:text-white hover:bg-primary 
                        transition-all duration-200 p-2 rounded-full'
                        title={'Wishlist'}>  
                            <BiHeart className='text-3xl'/>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
        {/* Lower navbar */}
        <div className='flex justify-center'>
            <ul className='hidden sm:flex justify-between gap-4 items-center'>
                {
                    Menu.map((data)=>(
                        <li key={data.id}><Link to={data.link} className='inline-block px-4 hover:text-primary duration-200'>{data.name}</Link></li>
                    ))
                }
                {/* Simple dropdown */}
                <li className='group relative cursor-pointer'>
                    <Link to="#" className='group flex items-center gap-[2px] py-2 hover:text-primary'>
                        Trending Products
                        <span className=''>
                            <FaRegCaretSquareDown className='transition-all duration-200 group-hover:rotate-180'/>
                        </span>
                    </Link>
                    <div className='absolute z-[9999] hidden group-hover:block w-44 rounded-md bg-white p-2 text-black shadow-md'>
                        <ul>
                            {
                                DropdownLinks.map((data)=>(
                                    <li key={data.id} className=''>
                                        <Link to={data.link}
                                        className='hover:bg-primary/20 inline-block w-full rounded-md p-2'>
                                            {data.name}
                                        </Link>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </li>
            </ul>
        </div>
    </div>
  )
}

export default Navbar