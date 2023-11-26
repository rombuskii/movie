import React, {useState} from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useUser } from '@/context/UserContext'

const ProfileSearch = () => {
    const [search, setSearch] = useState('')
    const [results, setResults] = useState([{}])
    const {user} = useUser();
    console.log(results)
    const searchProfile = async(e) => {
        e.preventDefault();
        await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/userlist/${search}`)
        .then(response => setResults(response.data))
        setSearch('')
    }
  return (
    <div className=''>
        <form onSubmit={searchProfile} className='my-2 w-full gap-2 flex flex-col items-center justify-center'>
            <label for='profile' className='select-none text-xl'>Enter Username: </label>
            <input id='profile' value={search} placeholder='Enter Username' onChange={e => setSearch(e.target.value)} className='duration-300 focus:border-black border-2 outline-none text-black w-full max-w-[50ch] p-2 rounded-lg'/>
        </form>
        <div>{results?.length == 0 && <p className='text-center'>No one's here :(</p>}</div>
        <div className='grid grid-cols-3 xl:grid-cols-5'>
        {results?.length > 0 && results?.map((usr, index) => {
            if(user && usr.username === user.username) {
                return (
                    <Link href={`/profile`} key={index}>{usr.username}</Link>
                )
            }
            return (
                <Link href={`/profile/${usr.username}`} key={index}>{usr.username}</Link>
            )
        })}
        </div>
    </div>
  )
}

export default ProfileSearch