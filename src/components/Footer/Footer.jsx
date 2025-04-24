import React from 'react'
import Banner from '../../assets/website/footer-pattern.jpg'
import footerLogo from '../../assets/logo.png'
import { FaFacebook, FaInstagram, FaLinkedin, FaTelegram } from 'react-icons/fa'
import { FcIphone } from 'react-icons/fc'

const BannerImg = {
  backgroundImage: `url(${Banner})`,
  backgroundPosition:'bottom',
  backgroundRepeat:'no-repeat',
  backgroundSize:'cover',
  height:'100%',
  width:'100%',
}

const FooterLinks = [
  {
    id:1,
    title:"Home",
    link:"/#"
  },
  {
    id:2,
    title:"About",
    link:"/#about"
  },
  {
    id:3,
    title:"Contact",
    link:"/#contact"
  },
  {
    id:4,
    title:"Blog",
    link:"/#blog"
  }
]

const Footer = () => {
  return (
    <div style={BannerImg} className='text-white'>
      <div className='container'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 pb-44'>
          {/* Company details */}
          <div className='flex flex-col gap-4 py-8 px-4' data-aos = 'zoom-in'>
            <div className='flex gap-2 items-center mb-4'><img src={footerLogo} alt="" className='w-12'/><h1 className='sm:text-3xl text-xl font-semibold'>Shopsy</h1></div>
            <p>Shop stylish clothing for men, women, and kids online.</p>
          </div>
          {/* Important links */}
          <div className='flex flex-col gap-2 py-8 px-4' data-aos = 'zoom-in'>
            <h1 className='text-xl font-semibold'>Important Links</h1>
            {
              FooterLinks.map((link) => (
                <a href={link.link} key={link.id} className='hover:text-primary cursor-pointer hover:pl-1  duration-300'>
                  {link.title}
                </a>
              ))
            }
          </div>
          {/* All the links */}
          <div className='flex flex-col gap-2 py-8 px-4' data-aos = 'zoom-in'>
            <h1 className='text-xl font-semibold'>Links</h1>
            {
              FooterLinks.map((link) => (
                <a href={link.link} key={link.id}  className='hover:text-primary cursor-pointer duration-300 hover:translate-x-1'>
                  {link.title}
                </a>
              ))
            }
          </div>
          {/* Reseaux sociaux */}
          <div className='flex flex-col gap-4 py-8 px-4' data-aos = 'zoom-in'>
            <div  className='flex gap-4 items-center'><FaInstagram className='w-8 h-8'/> <FaFacebook className='w-8 h-8'/> <FaLinkedin className='w-8 h-8'/> </div>
            <div className='flex gap-2 items-center'><FaTelegram className='w-6 h-6'/> <p>Yaounde, Francel Cabrel</p></div>
            <div  className='flex gap-2 items-center'><FcIphone className='w-6 h-6'/> <p>+7 7784043957</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer