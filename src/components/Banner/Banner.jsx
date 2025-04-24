import React from 'react'
import BannerImage from '../../assets/women/women2.jpg'
import { GrSecure } from 'react-icons/gr'
import { IoFastFood } from 'react-icons/io5'
import { GiFoodTruck } from 'react-icons/gi'


const Banner = () => {
  return (
    <div className='min-h-[550px] flex justify-center items-center py-12
    sm:py-0'>
        <div className='container'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-10 items-center'>
            {/* Image section */}
            <div data-aos="zoom-in">
              <img src={BannerImage} alt="" className='max-w-[400px] h-[350px] w-full mx-auto object-cover
              drop-shadow-[-10px_10px_12px_rgba(0,0,0,1)] ' />
            </div>
            {/* Text details section */}
            <div className='flex flex-col gap-4 justify-between'>
              <h1 className='text-3xl sm:text-4xl font-bold dark:text-white'  data-aos="fade-up">Winter Sale up to 50% Off</h1>
              <p className='text-gray-500'  data-aos="fade-up">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio</p>
              <div className='flex flex-col gap-4 justify-between'>
                <div className='flex items-center gap-4' data-aos="fade-up"><div className='p-4 rounded-full bg-purple-100 dark:bg-purple-400 dark:text-white'><GrSecure/></div><span className='dark:text-white'>Quality Products</span></div>
                <div className='flex items-center gap-4' data-aos="fade-up"><div className='p-4 rounded-full bg-orange-100 dark:bg-orange-400 dark:text-white'><IoFastFood/> </div><span className='dark:text-white'>Fast Delivery</span></div>
                <div className='flex items-center gap-4' data-aos="fade-up"><div className='p-4 rounded-full bg-green-100 dark:bg-green-400 dark:text-white'><GiFoodTruck/> </div><span className='dark:text-white'>Easy Payment method</span></div>
                <div className='flex items-center gap-4' data-aos="fade-up"><div className='p-4 rounded-full bg-yellow-100 dark:bg-yellow-400 dark:text-white'><GiFoodTruck/></div> <span className='dark:text-white'>Get Offers</span></div>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default Banner