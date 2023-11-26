import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useUser } from '@/context/UserContext'
import MovieSlab from '@/components/MovieSlab'
import MovieImg from '@/components/MovieImg.js'
import { useEffect, useState } from 'react'
import axios from 'axios'
import * as client from '../util/client.js'

const inter = Inter({ subsets: ['latin'] })

export async function getServerSideProps(context) {
  let movies = await fetch(`https://consumet-pied.vercel.app/movies/flixhq/sonic`)
  .then(response => response.json())
  return {
      props: {movies}
  }

}

export default function Home({movies}) {
  const results = movies.results
  const {isAuthenticated, user} = useUser();
  const [showShelf, setShowShelf] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const getShelf = async() => {
    const username = user?.username
    const {data} = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/showshelf/${username}`)
    const promises = data?.favorites?.map(fav => client.getMovie(fav));
    if(promises) {
    const movies = await Promise.all(promises);
    setShowShelf(movies)
    } else {
      setShowShelf(undefined)
    }
  }

  useEffect(() => {
    if(user) {
      getShelf();
      setIsLoading(false);
    };
    setIsLoading(false)
  }, [user])


  return (
    <div className='flex flex-col gap-10'>
      <div>
      <h1 className='text-2xl'>Favorites</h1>
      <hr className='border-2 my-2'/>
      <div className='flex overflow-auto my-2'>
      {isLoading && <p>Loading...</p>}
      {!isLoading && !user && <p>No user...</p>}
      {showShelf && showShelf.map((show) => {
        return <MovieImg id={show.ids} image={show.image}/>
      })}
      </div>
      <hr className='border-2 w-full'/>
      </div>
      {/*
      <div>
      <h1 className='text-2xl'>Your Watchlist</h1>
      <hr className='border-2 w-full'/>
      </div>
    */}
      <div>
      <h1 className='text-2xl'>Recommended</h1>
      <hr className='border-2'/>
      </div>
      <div className='flex my-2 overflow-auto'>
      {results.map((movie, index) => {
        return (
          <MovieSlab key={index} movie={movie}/>
        )
      })}
      </div>
    </div>
  )
}
