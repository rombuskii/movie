import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const MovieSlab = ({movie}) => {
  return (
    <Link className='mx-10' href={`/show/${movie.id}`}>
      <img className='rounded-md duration-300 hover:scale-110'  width={1000} height={1000} src={movie.image}/>
    </Link>
  )
}

export default MovieSlab