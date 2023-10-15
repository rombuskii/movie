import React from 'react'
import Link from 'next/link'
import { useUser } from '@/context/UserContext'
import Router, {useRouter} from 'next/navigation'
import axios from 'axios'

const Navbar = () => {
    const router = useRouter();
    const {user, logout} = useUser();
  return (
    <div className='bg-gray-500 p-3'>
        <div className='flex justify-between'>
            <Link href='/'>Show Shelf</Link>
            <div className='flex'>
                {user === undefined && <Link href='/login'>Login</Link>}
                {user !== undefined && <Link href='/' className='hover:cursor-pointer' onClick={logout}>Logout</Link>}
            </div>
        </div>
    </div>
  )
}

export default Navbar