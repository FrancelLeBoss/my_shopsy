import React, { useEffect,useState } from 'react'
import Image1 from '../../assets/shirt/shirt.png'
import Image2 from '../../assets/shirt/shirt2.png'
import Image3 from '../../assets/shirt/shirt3.png'
import { IoStar } from 'react-icons/io5'
import axiosInstance from '../../api/axiosInstance'

const TopProducts = () => {
    const [topProducts, setTopProducts] = useState<any[]>([])

    const ProductsData = [
        {
            id:1,
            title:"Casual Wear",
            img:Image1,
            description:'Lorem ipsum dolor sit amet nhkdl nh consectetur. hgntnm Perferendis, sapiente temporibusgna.',
            stars:4
        },
        {
            id:2,
            title:"Printed shirt",
            img:Image2,
            description:'Lorem ipsum dolor sit amet nhkdl nh consectetur. hgntnm Perferendis, sapiente temporibusgna.',
            stars:4
        },
        {
            id:3,
            title:"Women shirt",
            img:Image3,
            description:'Lorem ipsum dolor sit amet nhkdl nh consectetur. hgntnm Perferendis, sapiente temporibusgna.',
            stars:4
        }
    ]

    useEffect(() => {
        // Fetch top-rated products from the backend API
        axiosInstance
        .get<any[]>(`api/ratings/best_rated/`)
        .then((response) => setTopProducts(response.data))
        .catch((error) => console.error("Error fetching top-rated products data:", error));
        console.log("Top Products: ", topProducts);
    }, []);

  return (
    <div className=""> 
    <div className="container">
        {/* Header section */}
        <div className='text-left mb-24'>
            <p className="text-sm text-primary font-medium" data-aos='fade-up'>Top Rated Products for you</p>
            <h1 className="text-3xl font-bold dark:text-white" data-aos='fade-up'>Best Products</h1>
            <p className="text-xs text-gray-400" data-aos='fade-up'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis, sapiente temporibus, necessitatibus.</p>
        </div>
        {/* Body section */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-items-center gap-20 md:gap-5'>
            {
                ProductsData.map((data)=>(
                    <div key={data.id} data-aos = 'zoom-in'
                     className='rounded-2xl bg-white
                    dark:bg-gray-800 hover:bg-black/80
                    dark:hover:bg-primary hover:text-white relative
                    shadow-xl duration-300 group max-w-[300px] mt-14 group'>
                        {/* Image section */}
                        <div className='h-[100px]'>
                            <img src={data.img} alt={data.title} className='max-w-[140px] block mx-auto
                            transform -translate-y-20 group-hover:scale-105 duration-300
                            drop-shadow-md'/>
                        </div>
                        {/* Desc section */}
                        <div className='pb-4 px-8 flex flex-col gap-[1px] items-center mt-4'>
                            <div className='flex gap-1 text-xl items-center '>
                                <IoStar className='text-yellow-500 group-hover:text-gray-400'/>
                                <IoStar className='text-yellow-500 group-hover:text-gray-400'/>
                                <IoStar className='text-yellow-500 group-hover:text-gray-400'/>
                                <IoStar className='text-yellow-500 group-hover:text-gray-400 border-yellow-500'/>
                            </div>
                            <h1 className='dark:text-white font-bold text-xl'>{data.title}</h1>
                            <p className='text-sm text-gray-500
                             group-hover:text-white duration-300 
                             line-clamp-2'>
                                {data.description}</p>
                            <button className='bg-primary hover:scale-105
                                    duration-200 text-white py-1 px-4 rounded-xl mt-4
                                    group-hover:bg-white group-hover:text-primary'
                                    >Order now
                                </button>
                        </div>
                    </div>
                ))
            }
        </div>
    </div>
</div>
  )
}

export default TopProducts