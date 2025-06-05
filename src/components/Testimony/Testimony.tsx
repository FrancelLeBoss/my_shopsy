import React from 'react'
import Slider from 'react-slick'

const Testimony = () => {

    const TestimonialData = [
        {
            id:1,
            name:"Victor",
            text:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis, sapiente temporibus, necessitatibus.",
            img:'https://fastly.picsum.photos/id/783/101/101.jpg?hmac=-AT9hej6gY68HvQoxN2xZrp59GpEoevcpJYvrnvwwWA'
        },
        {
            id:2,
            name:"Satya Nadella",
            text:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis, sapiente temporibus, necessitatibus.",
            img:'https://fastly.picsum.photos/id/0/102/102.jpg?hmac=gE1kfSPoA2bvluUcNNqlaABGx5Ic7wF-MyOUq0jHBAU'
        },
        {
            id:3,
            name:"Virat Kholi",
            text:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis, sapiente temporibus, necessitatibus.",
            img:'https://fastly.picsum.photos/id/274/104/104.jpg?hmac=rojUcdaLqXScWFeAnLipGgEa9HexlM1lQObLZn4dNxU'
        },
        {
            id:4,
            name:"Sachin Tendulkar",
            text:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis, sapiente temporibus, necessitatibus.",
            img:'https://fastly.picsum.photos/id/473/300/300.jpg?hmac=aPTe1knrJgAvwf90lQ9QcolzUAyTJ7BEdygDXemA6Ck'
        }
    ]
    var settings = {
        dots: true,
        arrows: false,
        infinite: true,
        speed: 500,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        cssEase: 'linear',
        pauseOnHover: true,
        pauseOnFocus: true,
        responsive:[
            {
                breakpoint:10000,
                settings:{
                    slidesToShow:3,
                    slidesToScroll:1,
                    infinite:true
                }
            },
            {
                breakpoint:1024,
                settings:{
                    slidesToShow:2,
                    slidesToScroll:1,
                    initialSlide:2
                }

            },
            {
                breakpoint:640,
                settings:{
                    slidesToShow:1,
                    slidesToScroll:1
                }

            }
        ]
    }
  return (
    <div className='py-10 mb-10'>
        <div className='container'>
            {/* Header section */}
            <div className='text-center mb-10 max-w-[600px] mx-auto '>
                <p className='text-sm text-primary' data-aos = "fade-up">What our customers are saying</p>
                <h1 className='text-3xl font-bold dark:text-white' data-aos = "fade-up">Testimonials</h1>
                <p className='text-xs text-gray-400' data-aos = "fade-up">Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis, sapiente temporibus, necessitatibus.</p>
            </div>
            {/*Testimonial cards*/}
            <div data-aos="zoom-in">
                <Slider { ... settings}>
                    {
                        TestimonialData.map((data) => (
                            <div className='my-6'>
                                <div key={data.id} className='flex flex-col gap-4 shadow-lg py-8
                                px-6 mx-4 rounded-xl dark:bg-gray-800 bg-primary/10 relative'>
                                    <div className='mb-4'>
                                        <img src={data.img} alt=""
                                        className='rounded-full w-20 h-20' />
                                    </div>
                                    <div className='flex flex-col gap-4 items-left '>
                                        <div className='space-y-3'>
                                        <p className='text-xs text-gray-500 dark:text-gray-500'>{data.text}</p>
                                        <h1 className='dark:text-primary/60 text-xl font-bold text-black/80'>{data.name}</h1>
                                        </div>
                                    </div>
                                    <p className='dark:text-primary/60 text-black/20 text-9xl font-serif absolute bottom-5 right-0'>''</p>
                                </div>
                            </div>
                        ))
                    }
                </Slider>
            </div>
        </div>
    </div>
  )
}

export default Testimony