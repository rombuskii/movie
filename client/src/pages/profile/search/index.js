import React, {useState} from 'react'
import axios from 'axios'
import Link from 'next/link'

const ProfileSearch = () => {
    const [search, setSearch] = useState('')
    const [results, setResults] = useState([{}])

    const searchProfile = async(e) => {
        e.preventDefault();
        await axios.get(`http://localhost:3001/api/users/${search}`)
        .then(response => setResults(response.data))
        setSearch('')
    }
  return (
    <div className=''>
        <form onSubmit={searchProfile} className='my-2 w-full gap-2 flex flex-col items-center justify-center'>
            <label for='profile' className='select-none text-xl'>Enter Username: </label>
            <input id='profile' value={search} placeholder='Enter Username' onChange={e => setSearch(e.target.value)} className='duration-300 focus:border-black border-2 outline-none text-black w-full max-w-[50ch] p-2 rounded-lg'/>
        </form>
        <div>{results.length == 0 && <p className='text-center'>No one's here :(</p>}</div>
        <div className='grid grid-cols-3 xl:grid-cols-5'>
        {results.length > 0 && results?.map((user, index) => {
            return (
                <Link href={`/profile/${user.username}`} key={index}>{user.username}</Link>
            )
        })}
        </div>
    </div>
  )
}

export default ProfileSearch