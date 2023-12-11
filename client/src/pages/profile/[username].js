import { useUser } from '@/context/UserContext'
import React, {useState, useEffect} from 'react'
import * as client from '../../util/client'
import MovieSlab from '@/components/MovieSlab'
import axios from 'axios'
import MovieImg from '@/components/MovieImg'
import { useRouter } from 'next/router'
import Link from 'next/link'

export async function getServerSideProps(context) {
  const username = context.params.username
  let profile = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/users/${username}`)
  .then(response => response.json())
  return {
      props: {profile: profile}
  }

}


const BrowseProfile =  ({profile,}) => {
  const { user } = useUser();
  const [showShelf, setShowShelf] = useState()
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [reviews, setReviews] = useState([{}])
  console.log(reviews)

  const getShelf = async() => {
    const username = user?.username
    console.log(username)
    const {data} = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/showshelf/${profile?.username}`);
    if(data.favorites) {
      let favorites = data.favorites.map((fav) => client.getMovie(fav));
      favorites = await Promise.all(favorites);
      setShowShelf(favorites);
    }
  }

  const getReviews = async() => {
    await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/review/${profile?.username}`)
    .then(response => {
        setReviews(response.data)
    })
}

  useEffect(() => {
    if(!profile) {
      router.push('/error/no-user')
      return
    }
    getShelf();
    getReviews();
    setIsLoading(false);
  }, [])
  return (
    <div className='flex flex-col gap-3 items-center justify-center'>
      <h1 className='text-3xl'>{profile?.username + "'s" + " Profile"}</h1>
      <h1 className='text-2xl'>Favorites</h1>
      <hr className='border-2 w-full'/>
      <div className='flex overflow-auto'>
      {showShelf && showShelf.map((fav) => {
        return (
          <MovieImg id={fav.ids} image={fav.image}/>
        )
      })}
      {isLoading && <p>Loading...</p>}
      {!isLoading && !showShelf && <p>No Favorites Yet :(</p>}
      </div>
      <hr className='border-2 w-full'/>
      <h1 className='text-2xl'>Reviews</h1>
      <hr className='border-2 w-full'/>
      {user && user.friends.includes(profile.username) || (user && user.admin) &&
      <div className=''>
        <ul>
      {reviews.length > 0 && reviews.map((review, i) => 
            review.reviews && review.reviews.map(rev => <li><Link href={`/show/${review.show}`}>{rev.title} - {rev.body}</Link></li>)
        )}
        </ul>
      {!reviews && <p>No Reviews Yet :(</p>}
      </div>
      }
      {!(user && user.friends.includes(profile.username)) || (user && !user.admin) && <p>Must be friends to see reviews</p>}
      <hr className='border-2 w-full'/>
    </div>
  )
}

export default BrowseProfile