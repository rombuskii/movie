import { useUser } from '@/context/UserContext'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, {useState, useEffect} from 'react'
import axios from 'axios'
import StarRatings from 'react-star-ratings'
import { useToast } from '@chakra-ui/react'
import Link from 'next/link'

export async function getServerSideProps(context) {
    const id = context.params.movie
    const full = "drama-detail/" + context.params.movie
    console.log(id)
    let movie = await fetch(`https://consumet-pied.vercel.app/movies/dramacool/info?id=${full}`)
    .then(response => response.json())
    let reviews = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/review/movie/${id}`)
    .then(response => response.json());

    return {
        props: {movie, reviews}
    }

}


const Movie = ({movie, reviews}) => {
    const router = useRouter();
    const toast = useToast();
    const id = router.query.movie;
    const {user} = useUser();
    const [movieReview, setMovieReview] = useState(reviews?.reviews)
    const [input, setInput] = useState('')
    const [rating, setRating] = useState(0);
    const [liked, setLiked] = useState(false);

    const getShelf = async() => {
        const username = user?.username
        console.log(username)
        const {data} = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/showshelf/${username}`);
        if(data?.favorites) {
            if(data.favorites.some(fav => fav === "drama-detail/" + id)) {
                setLiked(true);
            }
        }
        if(data?.ratings) {
            const rating = data.ratings.find(rating => rating.title === movie.title)
            if(rating) {
                setRating(rating.rating);
            }
        }
    }

    useEffect(() => {
        if(user) getShelf(); 
    }, [])

    const updateRating = async(newRating, name) => {
        if(!user) {
            toast({
                title: 'Not Logged In',
                description: "Login for user functionality.",
                status: 'error',
                duration: 2000,
                isClosable: true,
            })
            router.push('/login');
            return;
        }
        setRating(parseInt(newRating));
        axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/rating/movie/${id}`, {
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
    const favorite = async() => {
        if(!user) {
            toast({
                title: 'Not Logged In',
                description: "Login for user functionality.",
                status: 'error',
                duration: 2000,
                isClosable: true,
            })
            router.push('/login');
            return;
        }
        axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/favorite/movie/${id}`, {
            username: user.username
        })
        if(liked) {
            toast({
                title: 'Removed From Favorites',
                description: "",
                status: 'error',
                duration: 2000,
                isClosable: true,
            })
        }
        if(!liked) {
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

    const handleSubmit = async(e) => {
        e.preventDefault();
        if(!user) {
            toast({
                title: 'Not Logged In',
                description: "Login for user functionality.",
                status: 'error',
                duration: 2000,
                isClosable: true,
            })
            router.push('/login');
            return;
        };
        let newReviews; 
        if(!movieReview) {
            newReviews = [{user: user.username, body:input, title: movie.title}]
        } else {
            newReviews = [...movieReview, {user: user.username, body:input, title: movie.title}]
         }
        setMovieReview(newReviews);
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/review`, {
            user: user.username,
            show: "drama-detail/" + id,
            content: input,
            title: movie.title
        })
        setInput('')
    }

    const deleteReview = async(e, index, reviewId) => {
        e.preventDefault();
        const newReviews = movieReview.filter((review, i) => i !== index);
        setMovieReview(newReviews)
        await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/review/movie/${id}/${reviewId}`)
    }

  return (
    <>
    {
    <div className='mb-3 flex flex-col gap-5 justify-center items-center'>
        <h1 className='text-2xl'>{movie.title} <i onClick={favorite} 
        className={`duration-300 text-md sm:text-lg md:text-xl lg:text-2xl hover:scale-110  cursor-pointer select-none 
                ${liked ? 'text-red-500 fa-solid' : 'fa-regular'} fa-heart`}></i>
        </h1>
        <span className='flex gap-3'>
        {/*movie.genres.map((genre, index) => {
            return (
                <p key={index}>{genre}</p>
            )
        })*/}
        </span>
        
        <Image className='rounded-lg' src={movie.image} width={200} height={200}/>
        <p>{movie.description}</p>
        <div className='p-2 text-black w-full bg-red-300 rounded-xl'>
        <form onSubmit={handleSubmit} className='mb-5'>
            <div className='flex justify-between items-center'>
            <h1 className='text-xl'>Leave a Review 💖:</h1>
            <StarRatings starDimension='2rem' rating={rating} starHoverColor="yellow" starRatedColor="yellow" changeRating={updateRating} numberOfStars={5} name='rating'/>
            </div>
            <hr className='border-black border'/>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder='Say something nice <3' className='mt-2 outline-none select-none border-2 border-black text-black w-full p-1 rounded-lg' type='text'/>
        </form>
            <h1 className='text-xl'>Reviews:</h1>
            <hr className='border-black border'/>
            <div className='mt-3 bg-black rounded-xl text-white p-2'>
                {movieReview?.map((review, index) => {
                    return (
                        <span className='flex justify-between'>
                        <p key={index}><Link className='hover:text-pink-500 duration-300 cursor-pointer' href={review.user === user?.username ? `/profile` :`/profile/${review.user}`}>{review.user}</Link>: {review.body}</p>
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