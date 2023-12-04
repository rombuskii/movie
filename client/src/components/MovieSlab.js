import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const MovieSlab = ({movie}) => {
  return (
    <div className='w-14'>
    <Link className='mx-10' href={`/show/${movie.id}`}>
      <Image className='rounded-md duration-300 hover:scale-110' sizes="100px"
      fill
      width={100}
      height={100}
      style={{
        width: '100%',
        height: 'auto',
      }} src={movie.image}></Image>
    </Link>
    </div>
  )
}

export default MovieSlab