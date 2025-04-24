import React from 'react'
import Banner from '../../assets/website/orange-pattern.jpg'

const BannerImage = {
    backgroundImage:`url(${Banner})`,
    backgroundPosition:'center',
    backgroundRepeat:'no-repeat',
    backgroundSize:'cover',
    height:'100%',
    width:'100%'
}

const Subscribe = () => {
  return (
    <div data-aos ='zoom-in'
    className='bg-gray-100 dark:bg-gray-800 text-white '
    style={BannerImage}>
        <div className='container backdrop-blur-sm py-10 text-center'>
            <div className='flex flex-col gap-6 items-center'>
                <h1 className='text-2xl text-center sm:text-left 
                sm:text-4xl font-semibold'
                >Get Notified About New Products</h1>
                <input data-aos ='fade-up' type="text" name="" className='w-[400px] sm:w-[500px] md:w-[600px] p-3 text-gray-600 focus:outline-primary' placeholder='Enter your name'/>
            </div>
        </div>
    </div>
  )
}

export default Subscribe