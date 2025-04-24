import React from 'react'
import Image1 from '../../assets/women/women.png'
import Image2 from '../../assets/women/women2.jpg'
import Image3 from '../../assets/women/women3.jpg'
import Image4 from '../../assets/women/women4.jpg'
import Image5 from '../../assets/women/women3.jpg'
import { IoStar } from 'react-icons/io5'

const ProductsData = [
    {
        id:1,
        title:"Women Ethnic",
        img:Image1,
        color:"White",
        stars:5,
        aosDelay:0
    },
    {
        id:2,
        title:"Women western",
        img:Image2,
        color:"Red",
        stars:4.5,
        aosDelay:200
    },
    {
        id:3,
        title:"Goggles",
        img:Image3,
        color:"brown",
        stars:4.7,
        aosDelay:400
    },
    {
        id:4,
        title:"Printed T-Shirt",
        img:Image4,
        color:"Yellow",
        stars:4.4,
        aosDelay:600
    },
    {
        id:5,
        title:"Fashion T-Shirt",
        img:Image5,
        color:"Pink",
        stars:4.5,
        aosDelay:800
    }
]

const Products = () => {
  return (
    <div className='mt-14 mb-12'>
        <div className='container'>
            {/* Header section */}
            <div className='text-center mb-10 max-w-[600px] mx-auto '>
                <p className='text-sm text-primary font-medium' data-aos = "fade-up">Top selling product for you</p>
                <h1 className='text-3xl font-bold dark:text-white' data-aos = "fade-up">Products</h1>
                <p className='text-xs text-gray-400' data-aos = "fade-up">Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis, sapiente temporibus, necessitatibus.</p>
            </div>
            {/*Body section*/}
            <div className='flex flex-col gap-8'>
                <div className='grid grid-cols-1 sm:grid-cols-3
                md:grid-cols-4 lg:grid-cols-5 place-items-center gap-5'>
                    {
                        ProductsData.map((item) => (
                            <div className='flex flex-col space-y-3 gap-0' 
                            key={item.id}
                            data-aos = "fade-up"
                            data-aos-delay = {item.aosDelay}>
                        <img src={item.img} alt="" className='h-[220px] w-[150px] 
                        object-cover rounded-md'/>
                       <div className='flex flex-col'>
                            <span className='font-semibold dark:text-white'>{item.title}</span>
                            <span className='text-gray-500'>{item.color}</span>
                            <div className='flex gap-1 items-center dark:text-white'><IoStar className='text-golden'/> {item.stars}</div>
                       </div>
                    </div>
                        ) )
                    }
                </div>
                <div className='text-center'><button className='px-5 py-1 bg-primary rounded text-white text-semibold'>View All Button</button></div>
            </div>
        </div>
    </div>
  )
}

export default Products