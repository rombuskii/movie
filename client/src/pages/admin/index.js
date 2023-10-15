import React, {useEffect} from 'react'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/router';

const Admin = () => {
    const {user, isAuthenticated} = useUser();
    const router = useRouter();
    
    useEffect(() => {
        if(!user?.admin) {
            router.push('/error')
        }
    })
  return (
    <div>Admin</div>
  )
}

export default Admin