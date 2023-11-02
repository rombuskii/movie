import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
const Layout = ({ children }) => {
  return (
    <div className='relative min-h-screen flex flex-col text-white bg-gradient-to-b from-pink-700 to-black'>
      <Navbar />
      <main className='p-2 flex-1 flex flex-col'>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout