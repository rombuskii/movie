import Image from 'next/image'
import React from 'react'
import Link from 'next/link'

const MovieTile = ({movie}) => {
  return (
    <Link href={`/${movie.id}`}>
    <div className='hover:text-cyan-500 cursor-pointer flex flex-col items-center m-2'>
      <Image className='rounded-md duration-300 hover:scale-110' src={movie.image} width={100} height={100}></Image>
        <p className='text-center mt-2'>{movie.title}</p>
    </div>
    </Link>
  )
}

export default MovieTile