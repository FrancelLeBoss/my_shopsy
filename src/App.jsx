import React, { useEffect, useState } from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Navbar from './components/navbar/Navbar'
import Footer from './components/Footer/Footer'
import Cart from './components/Cart/Cart'
import AOS from "aos"
import "aos/dist/aos.css"
import { Boutique } from './pages/Boutique'
import Product  from './pages/Product'
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import axios from 'axios';
import Login from './pages/Login'
import { useDispatch, useSelector } from 'react-redux'
import { login } from './redux/userSlice'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'


function App() {
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL; 
const dispatch = useDispatch()
const [orderPopup, setOrderPopup] = useState(false)
const [_category, setCategory] = useState(1)
const [message, setMessage] = useState("");
const handleOrderPopup = () => {
  setOrderPopup(!orderPopup)
}



useEffect(() => {
  AOS.init({
    offset:100,
    duration:800,
    easing:"ease-in-sine", 
    delay:100
  });
  AOS.refresh();
}, [])

useEffect(() => {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  if (storedUser && storedToken) {
    dispatch(login({ user: JSON.parse(storedUser), token: JSON.parse(storedToken) }));
  }
}, [dispatch]);

  return (
    <Router>
      <div className='bg-white dark:bg-gray-900 dark:text-white duration-200'>
      <Navbar handleOrderPopup={handleOrderPopup}/>

      <Routes>
          <Route path="/" element={<Home handleOrderPopup={handleOrderPopup} message={message} />} />
          <Route path="/kids-wear" element={<Boutique _category={1}/>} />
          <Route path="/men-wear" element={<Boutique _category={2}/>} />
          <Route path="/women-wear" element={<Boutique _category={3}/>} />
          <Route path="/product/:productId/:v" element={<Product/>} />
          <Route path="/login" element = {<Login/>}/>
          <Route path="/register" element = {<Register/>}/>
          <Route path="/reset-password" element = {<ResetPassword/>}/>
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<h1 className='text-center text-4xl'>404 Not Found</h1>} />
        </Routes>
       <Footer/>
       <Cart orderPopup={orderPopup} setOrderPopup={setOrderPopup}/>
    </div>
    </Router>
  )
}

export default App