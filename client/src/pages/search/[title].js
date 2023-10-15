import React from 'react'
import { useRouter } from 'next/router'
import MovieTile from '@/components/MovieTile'

export async function getServerSideProps(context) {
    const title = context.params.title
    let movies = await fetch(`https://consumet-pied.vercel.app/movies/flixhq/${title}`)
    .then(response => response.json())

    return {
        props: {movies}
    }

}

const Search = ({movies}) => {
    const router = useRouter()
    const results = movies.results
  return (
    <div>
        <div className='grid grid-cols-5 items-center'>
        {results.map((movie, index) => {
            return (
                <MovieTile movie={movie}/>
            )
        })}
        </div>
    </div>
  )
}

export default Search