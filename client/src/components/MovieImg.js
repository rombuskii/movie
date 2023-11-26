import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const MovieImg = ({id, image}) => {
  return (
    <Link className='mx-10' href={`/show/${id}`}>
      <Image className='rounded-md duration-300 hover:scale-110'  width={100} height={100} src={image}></Image>
    </Link>
  )
}

export default MovieImg