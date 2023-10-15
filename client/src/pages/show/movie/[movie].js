import React from 'react'

export async function getServerSideProps(context) {
    const id = 'tv/' + context.params.movie
    console.log(id)
    let movie = await fetch(`https://consumet-pied.vercel.app/movies/flixhq/info?id=${id}`)
    .then(response => response.json())

    return {
        props: {movie}
    }

}

const Movie = ({movie}) => {
    console.log(movie)
  return (
    <div>{movie.title}</div>
  )
}

export default Movie