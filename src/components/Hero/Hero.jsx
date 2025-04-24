import React from 'react'
import Image1 from '../../assets/hero/women.png'
import Image2 from '../../assets/hero/shopping.png'
import Image3 from '../../assets/hero/sale.png'
import Slider from 'react-slick'

const ImageList = [
    {
        id:1,
        img:Image1,
        title:"Up to 50% off on all Men's Wear",
        description:"Lorem Ipsum s simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. "
    },
    {
        id:2,
        img:Image2,
        title:"30% off on all Women's Wear",
        description:"Lorem Ipsum s simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. "
    },
    {
        id:3,
        img:Image3,
        title:"70% off on all Products Sale",
        description:"Lorem Ipsum s simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. "
    },
]

const Hero = ({handleOrderPopup, message}) => {

    var settings = {
        dots: false,
        arrows: false,
        infinite: true,
        speed: 800,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        cssEase: 'ease-in-out',
        pauseOnHover: false,
        pauseOnFocus: true,
    }

  return (
    <div className='relative overflow-hidden min-h-[550px] sm:min-h-[570px] bg-gray-100 dark:bg-gray-950
    dark:text-white duration-200
    flex justify-center items-center'>
        {/* Backgroung pattern */}
        <div className='h-[700px] w-[700px] bg-primary/40 absolute -top-1/2 
        right-0 rotate-45 rounded-3xl -z-9'>

        </div>
        {/* Hero section */}
        <div className='container pb-8 sm:pb-0'>
            <Slider {... settings}>
                {ImageList.map((data) => (
                    <div key={data.id}> 
                    <div className='grid grid-cols-1 sm:grid-cols-2 items-center'>
                        {/* Text content section */}
                        <div className='flex flex-col gap-4 justify-center pt-12 sm:pt-0 text-center 
                        sm:text-left relative z-10' key={data.id}>
                            <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold'
                            data-aos = 'zoom-out'
                            data-aos-once = 'true'
                            data-aos-duration = '500'
                            >{data.title}</h1>
                            <p className='text-sm'
                                data-aos = 'fade-up'
                                data-aos-delay = '100'
                                data-aos-duration = '500'
                            >{data.description}</p>
                            <div data-aos = 'fade-up'
                                data-aos-delay = '300'
                                data-aos-duration = '500'>
                                <button onClick={()=>handleOrderPopup()} className='bg-gradient-to-r from-primary to-secondary hover:scale-105
                                    duration-200 text-white py-2 px-4 rounded-xl'
                                    >Order now
                                </button>
                            </div>
                        </div>
                        {/* Image section */}
                        <div className='order-2 sm:order-1'>
                            <div className='relative z-10'
                            data-aos = 'zoom-in'
                            data-aos-once = 'true'>
                                <img src={data.img} alt='' 
                                className='w-[300px] h-[300px] sm:h-[450px] sm:w-[450px] sm:scale-105 lg:scale-125
                                object-contain mx-auto'/>
                            </div>
                        </div>
                    </div>
                </div>
                ) )}
            </Slider>
        </div>
    </div>
  )
}

export default Hero