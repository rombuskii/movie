import { useUser } from '@/context/UserContext'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, {useState, useEffect} from 'react'
import axios from 'axios'

export async function getServerSideProps(context) {
    const id = 'tv/' + context.params.movie
    console.log(id)
    let movie = await fetch(`https://consumet-pied.vercel.app/movies/flixhq/info?id=${id}`)
    .then(response => response.json())
    let reviews = await fetch(`http://localhost:3001/api/review/${id}`)
    .then(response => response.json());

    return {
        props: {movie, reviews}
    }

}


/**
 * 
  "id": "string",
  "title": "string",
  "url": "string",
  "image": "string",
  "releaseDate": "string",
  "description": "string",
  "geners": [
      "string"
  ],
  "type": "Movie",
  "casts": [
      "string"
  ],
  "tags": [
      "string"
  ],
  "production": "string",
  "duration": "string",
  "episodes": [
      {
      "id": "string",
      "url": "string",
      "title": "string",
      "number": 0,
      "season": 0
      }
  ]
}}
 */


const Movie = ({movie, reviews}) => {
    const router = useRouter();
    const id = router.query.movie;
    const {user} = useUser();
    const [movieReview, setMovieReview] = useState(reviews?.reviews)
    const [input, setInput] = useState('')

    const handleSubmit = async(e) => {
        e.preventDefault();
        if(!user) return;
        let newReviews; 
        if(!movieReview) {
            newReviews = [{user: user.username, body:input}]
        } else {
            newReviews = [...movieReview, {user: user.username, body:input}]
         }
        setMovieReview(newReviews);
        await axios.post('http://localhost:3001/api/review', {
            user: user.username,
            show: 'tv/' + id,
            content: input
        })
        setInput('')
    }

    const deleteReview = async(e, index, reviewId) => {
        e.preventDefault();
        const newReviews = movieReview.filter((review, i) => i !== index);
        setMovieReview(newReviews)
        await axios.delete(`http://localhost:3001/api/review/tv/${id}/${reviewId}`)
    }

  return (
    <>
    <div className='mb-3 flex flex-col gap-5 justify-center items-center'>
        <h1>{movie.title}</h1>
        <span className='flex gap-3'>
        {movie.genres.map((genre, index) => {
            return (
                <p key={index}>{genre}</p>
            )
        })}
        </span>
        
        <Image className='rounded-lg' src={movie.image} width={200} height={200}/>
        <p>{movie.description}</p>
        <div className='p-2 text-black w-full bg-red-300 rounded-xl'>
        <form onSubmit={handleSubmit} className='mb-5'>
            <h1 className='text-xl'>Leave a Review 💖:</h1>
            <hr className='border-black border'/>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder='Say something nice <3' className='mt-2 outline-none select-none border-2 border-black text-black w-full p-1 rounded-lg' type='text'/>
        </form>
            <h1 className='text-xl'>Reviews:</h1>
            <hr className='border-black border'/>
            <div className='mt-3 bg-black rounded-xl text-white p-2'>
                {movieReview?.map((review, index) => {
                    return (
                        <span className='flex justify-between'>
                        <p key={index}>{review.user}: {review.body}</p>
                        {(review.user == user?.username || user?.admin) && <p onClick={e => deleteReview(e, index, review._id)} className='duration-300 hover:scale-110 cursor-pointer p-2'>❌</p>}
                        </span>
                    )
                })}
        </div>
        </div>
    </div>
    </>
  )
}

export default Movie