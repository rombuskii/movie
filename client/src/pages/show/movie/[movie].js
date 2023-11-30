import { useUser } from '@/context/UserContext'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import StarRatings from 'react-star-ratings'
import { useToast } from '@chakra-ui/react'

export async function getServerSideProps(context) {
    const id = context.params.movie
    console.log(id)
    let movie = await fetch(`https://consumet-pied.vercel.app/movies/flixhq/info?id=movie/${id}`)
        .then(response => response.json())
    let reviews = await fetch(`http://localhost:3001/api/review/movie/${id}`)
        .then(response => response.json());

    return {
        props: { movie, reviews }
    }

}


const Movie = ({ movie, reviews }) => {
    const router = useRouter();
    const toast = useToast();
    const id = router.query.movie;
    const { user } = useUser();
    const [movieReview, setMovieReview] = useState(reviews?.reviews)
    const [input, setInput] = useState('')
    const [rating, setRating] = useState(0);
    const [liked, setLiked] = useState(false);
    const [onList, setOnList] = useState(false);

    const getShelf = async () => {
        const username = user?.username
        console.log(username)
        const { data } = await axios.get(`http://localhost:3001/api/showshelf/${username}`);
        if (data.favorties !== undefined && data.favorites.some(fav => fav === 'movie/' + id)) {
            setLiked(true);
        }
        if (data.watchlist !== undefined && data.watchlist.some(on => on === 'movie/' + id)) {
            setOnList(true);
        }
        if (data.ratings !== undefined) {
            const rating = data.ratings.find(rating => rating.title === movie.title)
        }
        if (rating) {
            setRating(rating.rating);
        }
    }

    useEffect(() => {
        getShelf();
    }, [])

    const updateRating = async (newRating, name) => {
        if (!user) {
            toast({
                title: 'User Not Logged In',
                description: "Login for user functionality.",
                status: 'error',
                duration: 2000,
                isClosable: true,
            })
        }
        setRating(parseInt(newRating));
        axios.post(`http://localhost:3001/api/rating/movie/${id}`, {
            rating: newRating,
            title: movie.title,
            username: user.username
        })
        toast({
            title: 'Rating Updated',
            description: "",
            status: 'info',
            duration: 2000,
            isClosable: true,
        })
    }
    const favorite = async () => {
        if (!user) {
            toast({
                title: 'User Not Logged In',
                description: "Login for user functionality.",
                status: 'error',
                duration: 2000,
                isClosable: true,
            })
            return;
        }
        axios.put(`http://localhost:3001/api/favorite/movie/${id}`, {
            username: user.username
        })
        if (liked) {
            toast({
                title: 'Removed From Favorites',
                description: "",
                status: 'error',
                duration: 2000,
                isClosable: true,
            })
        }
        if (!liked) {
            toast({
                title: 'Added to Favorites',
                description: "",
                status: 'success',
                duration: 2000,
                isClosable: true,
            })

        }
        setLiked(prev => !prev);
    }

    const watchlist = async () => {
        if (!user) {
            toast({
                title: 'User Not Logged In',
                description: "Login for user functionality.",
                status: 'error',
                duration: 2000,
                isClosable: true,
            })
            return;
        }
        axios.put(`http://localhost:3001/api/watchlist/movie/${id}`, {
            username: user.username
        })
        if (onList) {
            toast({
                title: 'Removed From Watchlsit',
                description: "",
                status: 'error',
                duration: 2000,
                isClosable: true,
            })
        }
        if (!onList) {
            toast({
                title: 'Added to Watchlist',
                description: "",
                status: 'success',
                duration: 2000,
                isClosable: true,
            })

        }
        setOnList(prev => !prev);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        let newReviews;
        if (!movieReview) {
            newReviews = [{ user: user.username, body: input, title: movie.title }]
        } else {
            newReviews = [...movieReview, { user: user.username, body: input, title: movie.title }]
        }
        setMovieReview(newReviews);
        await axios.post('http://localhost:3001/api/review', {
            user: user.username,
            show: 'movie/' + id,
            content: input,
            title: movie.title
        })
        setInput('')
    }

    const deleteReview = async (e, index, reviewId) => {
        e.preventDefault();
        const newReviews = movieReview.filter((review, i) => i !== index);
        setMovieReview(newReviews)
        await axios.delete(`http://localhost:3001/api/review/movie/${id}/${reviewId}`)
    }

    return (
        <>
            {
                <div className='mb-3 flex flex-col gap-5 justify-center items-center'>
                    <h1 className='text-2xl'>{movie.title}
                        <i onClick={favorite} className={`mx-2 duration-300 text-md sm:text-lg md:text-xl lg:text-2xl hover:scale-110  cursor-pointer select-none 
        ${liked ? 'text-red-500 fa-solid' : 'fa-regular'} fa-heart`}></i>
                        <i onClick={watchlist} className={`mx-2 duration-300 text-md sm:text-lg md:text-xl lg:text-2xl hover:scale-110  cursor-pointer select-none fa-solid
        ${onList ? 'fa-check' : 'fa-plus'}`}></i></h1>
                    <span className='flex gap-3'>
                        {movie.genres.map((genre, index) => {
                            return (
                                <p key={index}>{genre}</p>
                            )
                        })}
                    </span>

                    <Image className='rounded-lg' src={movie.image} width={200} height={200} />
                    <p>{movie.description}</p>
                    <div className='p-2 text-black w-full bg-red-300 rounded-xl'>
                        <form onSubmit={handleSubmit} className='mb-5'>
                            <div className='flex justify-between'>
                                <h1 className='text-xl'>Leave a Review 💖:</h1>
                                <StarRatings starDimension='2rem' rating={rating} starHoverColor="yellow" starRatedColor="yellow" changeRating={updateRating} numberOfStars={5} name='rating' />
                            </div>
                            <hr className='border-black border' />
                            <input value={input} onChange={e => setInput(e.target.value)} placeholder='Say something nice <3' className='mt-2 outline-none select-none border-2 border-black text-black w-full p-1 rounded-lg' type='text' />
                        </form>
                        <h1 className='text-xl'>Reviews:</h1>
                        <hr className='border-black border' />
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
            }
        </>

    )
}

export default Movie