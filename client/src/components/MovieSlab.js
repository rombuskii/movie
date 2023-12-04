import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const MovieSlab = ({movie}) => {
  return (
    <Link style={{ position: 'relative', width: '100px', height: '150px' }} className='mx-2 xl:mx-10' href={`/show/${movie.id}`}>
      <Image className='rounded-md duration-300 hover:scale-110' sizes="100px"
      fill
      style={{
        width: '100%',
        height: '100%',
      }} src={movie.image}></Image>
    </Link>
  )
}

export default MovieSlab