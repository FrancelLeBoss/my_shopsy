/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode:"class",
  theme: {
    extend: {
      // fontFamily:{
      //   sans:["Poppins"]
      // }
      colors:{
        primary:"#fea928",
        secondary:"#ed8900",
        golden: '#FFD700'

      },
      
      container:{
        center:true,
        padding:{
          DEFAULT: '1rem',
          sm:'3rem'
        }
      }
    },
  },
  plugins: [],
}

