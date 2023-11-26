import React, {useEffect, useState} from 'react'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/router';
import axios from 'axios';
import { FaTrash } from "react-icons/fa";

/*export async function getServerSideProps() {
  
  .then(response => response.json());

  return {
      props: {users}
  }
}*/

const Admin = () => {
    const {user, isAuthenticated} = useUser();
    const router = useRouter();
    const [users, setUsers] = useState([{}]);

    const getUsers = async() => {
      try {
        let profiles = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/users`, {withCredentials: true});
        setUsers(profiles.data)
      }
      catch(error) {
        console.error(error)
      }
    }
    const [currentUser, setCurrentUser] = useState({})
    useEffect(() => {
        if(!user || !user?.admin) {
            router.push('/error')
        }
        getUsers();
    })
  return (
    <div>
      <h1 className='text-center text-3xl mb-2 '>Admin</h1>
      <h2 className='text-center text-xl my-2'>Edit User</h2>
      <form className='border-2 rounded-md p-2 flex flex-col gap-2 items-center justify-center w-full'>
      <span>
      <label className='mr-2'>Username:</label>
      <input onChange={(e) => setCurrentUser({...currentUser, username: e.target.value})} value={currentUser.username} className='ml-2 text-black max-w-[30ch] p-2  rounded-xl'/>
      </span>
      <span>
      <label className='mr-2'>Password:</label>
      <input onChange={(e) => setCurrentUser({...currentUser, password: e.target.value})} value={currentUser.password} className='ml-2 text-black max-w-[30ch] p-2  rounded-xl'/>
      </span>
      <span>
      <label className='mr-2'>Admin:</label>
      <input type='checkbox' checked={currentUser.admin} onChange={(e) => setCurrentUser({...currentUser, admin: e.target.value})} className='ml-2 text-black max-w-[30ch] p-2  rounded-xl'/>
      </span>
      </form>
      <h2 className='text-center text-xl my-2 '>Users</h2>
      <div className='grid grid-cols-5 border-2 rounded-md'>
        {users.length > 0 && users.map((user, index) => {
        return (
          <div className='flex p-2 m-2'>
          <p className='bg-black hover:bg-white hover:text-black duration-300 cursor-pointer p-2 rounded-sm' onClick={() => setCurrentUser(user)}  key={index}>{user.username}</p>
          <button className="bg-red-500 hover:text-black duration-300 cursor-pointer p-2 rounded-sm">
                    <FaTrash />
          </button>
          </div>
        )
      })}
      </div>

    </div>
  )
}

export default Admin