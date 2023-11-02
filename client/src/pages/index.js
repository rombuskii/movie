import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useUser } from '@/context/UserContext'
import MovieSlab from '@/components/MovieSlab'

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
  console.log(user)
  return (
    <div>
      <h1 className='text-2xl'>Favorites</h1>
      <hr className='border-2'/>
      <h1 className='text-2xl'>Your Watchlist</h1>
      <hr className='border-2'/>
      <h1 className='text-2xl'>Recommended</h1>
      <hr className='border-2'/>
      <div className='flex overflow-auto'>
      {results.map((movie, index) => {
        return (
          <MovieSlab movie={movie}/>
        )
      })}
      </div>
    </div>
  )
}
