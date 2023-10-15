import React, {useState} from 'react'
import Link from 'next/link'
import { useUser } from '@/context/UserContext'
import Router, {useRouter} from 'next/navigation'

const Navbar = () => {
    const router = useRouter();
    const {user, logout} = useUser();
    const [search, setSearch] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault();
        if(search) {
        //alert(`Searched for ${search}`)
        router.push(`/search/${search}`)
    }
}
  return (
    <div className='bg-gray-500 p-3'>
        <div className='flex justify-between items-center'>
            <Link className='duration-300 hover:text-cyan-300' href='/'>Show Shelf</Link>
            <form className='w-full max-w-[30ch]' onSubmit={handleSubmit}>
            <input value={search} onChange={e => setSearch(e.target.value)} className='duration-300 border-2 outline-none  focus:border-cyan-500 text-black rounded-lg p-1 w-full max-w-[30ch]' type='text'/>
            </form>
            <div className='flex gap-5'>
            {user !== undefined && user.admin && <Link className='duration-300 hover:text-cyan-300' href='/admin'>Admin</Link>}
                {user !== undefined && <Link className='duration-300 hover:text-cyan-300' href='/profile'>{/*user.username.charAt(0).toUpperCase() + user.username.slice(1)*/`Profile`}</Link>}
                {user === undefined && <Link className='duration-300 hover:text-cyan-300'  href='/login'>Login</Link>}
                {user !== undefined && <Link href='/' className='duration-300 hover:text-cyan-300' onClick={logout}>Logout</Link>}
            </div>
        </div>
    </div>
  )
}

export default Navbar