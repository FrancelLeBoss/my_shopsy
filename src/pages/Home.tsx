import React from 'react'
import Hero from "../components/Hero/Hero";
import Products from "../components/Products/Products";
import TopProducts from "../components/TopProducts/TopProducts";
import Banner from "../components/Banner/Banner";
import Subscribe from "../components/Subscribe/Subscribe";
import Testimony from "../components/Testimony/Testimony";

interface HomeProps {
  handleOrderPopup: () => void;
  message: string;
}

export const Home: React.FC<HomeProps> = ({handleOrderPopup, message}) => {
  return (
    <div>
      <Hero handleOrderPopup={handleOrderPopup} message ={message} />
      <Products />
      <TopProducts />
      <Banner />
      <Subscribe />
      <Testimony />
    </div>
  )
}

export default Home
