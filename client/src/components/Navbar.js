import React, {useState} from 'react'
import Link from 'next/link'
import { useUser } from '@/context/UserContext'
import {useRouter} from 'next/navigation'
import axios from 'axios'

const Navbar = () => {
    const router = useRouter();
    const {user, setUser, setIsAuthenticated, logout} = useUser();
    const [search, setSearch] = useState('')

    const handleLogout = async() => {
        setUser(undefined);
        setIsAuthenticated(false)
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/logout`, {}, {withCredentials: true})
        router.push('/');
        router.refresh();
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if(search) {
        //alert(`Searched for ${search}`)
        router.push(`/search/${search}`)
    }
}
  return (
    <div className='bg-red-300 text-black p-3  border-b-2 border-black'>
        <div className='flex  gap-2 xl:gap-3 justify-between items-center'>
            <Link className='duration-300 text-sm xl:text-xl hover:text-white' href='/'>Show Shelf</Link>
            <form className='w-full text-sm xl:text-lg max-w-[30ch]' onSubmit={handleSubmit}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search' className='duration-300 border-2 outline-none focus:border-black text-black rounded-lg p-1 w-full max-w-[30ch]' type='text'/>
            </form>
            <div className='flex gap-2 xl:gap-5 text-sm xl:text-md items-center'>
            {user !== undefined && user.admin && <Link className='duration-300 hover:text-red-500' href='/admin'>Admin</Link>}
                {user !== undefined && <Link className='duration-300 hover:text-white' href='/profile'>{/*user.username.charAt(0).toUpperCase() + user.username.slice(1)*/`Profile`}</Link>}
                {<Link className='duration-300 hover:text-white' href='/profile/search'>{/*user.username.charAt(0).toUpperCase() + user.username.slice(1)*/`Users`}</Link>}
                {user === undefined && <Link className='duration-300 hover:text-white'  href='/login'>Login</Link>}
                {user !== undefined && <Link href='/' className='duration-300 hover:text-white' onClick={handleLogout}>Logout</Link>}
            </div>
        </div>
    </div>
  )
}

export default Navbar