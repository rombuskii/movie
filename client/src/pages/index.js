import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useUser } from '@/context/UserContext'
import MovieSlab from '@/components/MovieSlab'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const inter = Inter({ subsets: ['latin'] })

export async function getServerSideProps(context) {
  let movies = await fetch(`https://consumet-pied.vercel.app/movies/flixhq/sonic`)
    .then(response => response.json());
  return {
    props: { movies }
  }

}

export default function Home({ movies }) {
  const results = movies.results;
  const { isAuthenticated, user } = useUser();
  console.log(user);
  const [favs, setFavs] = useState([]);
  const [list, setList] = useState([]);

  const getShelf = async () => {
    const username = user?.username;
    console.log(username);
    const { data } = await axios.get(`http://localhost:3001/api/showshelf/${username}`);
    setFavs(data.favorites);
    setList(data.watchlist);
  }

  useEffect(() => {
    getShelf();
  }, [])

  return (
    <div className='flex flex-col gap-10'>
      <div>
        <h1 className='text-2xl'>Favorites</h1>
        <hr className='border-2' />
        <div className='flex my-2 overflow-auto'>
          {favs?.map((movie, index) => {
            return (
              <MovieSlab key={index} movie={movie} />
            )
          })}
        </div>
      </div>
      <div>
        <h1 className='text-2xl'>Your Watchlist</h1>
        <hr className='border-2' />
        <div className='flex my-2 overflow-auto'>
          {list?.map((movie, index) => {
            return (
              <MovieSlab key={index} movie={movie} />
            )
          })}
        </div>
      </div>
      <div>
        <h1 className='text-2xl'>Recommended</h1>
        <hr className='border-2' />
      </div>
      <div className='flex my-2 overflow-auto'>
        {results.map((movie, index) => {
          return (
            <MovieSlab key={index} movie={movie} />
          )
        })}
      </div>
    </div>
  )
}
