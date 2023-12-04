import React, {useEffect, useState} from 'react'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/router';
import axios from 'axios';
import { FaTrash } from "react-icons/fa";
import { useToast } from '@chakra-ui/react';

const Admin = () => {
    const {user, isAuthenticated} = useUser();
    const router = useRouter();
    const [users, setUsers] = useState([{}]);
    const toast = useToast();
    const [showShelf, setShowShelf] = useState({});

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
    }, [])

    const updateUser = async(e) => {
      e.preventDefault();
      const {data} = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/users/${currentUser.username}`, currentUser)
      setUsers(data);
      console.log(data)
      toast({
        title: 'User Updated',
        description: "",
        status: 'success',
        duration: 2000,
        isClosable: true,
    })
    }

    const deleteShow = async(e, id) => {
      e.preventDefault();
      const index = id.indexOf('/');
      if(id.includes('tv')) {
        const show = id.slice(index + 1);
        await axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/favorite/tv/${show}`, {username: currentUser.username})
      } else {
        const movie = id.slice(index + 1);
        await axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/favorite/movie/${movie}`, {username: currentUser.username})
      }
      const filtered = showShelf.favorites.filter((fav) => fav != id);
      setShowShelf({...showShelf, favorites: filtered});
      toast({
        title: 'Show Deleted',
        description: "",
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
    }

    const deleteUser = async(e, user) => {
      e.preventDefault();
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/users/${user.username}`)
      const filtered = users.filter((u) => u.username != user.username)
      setUsers(filtered);
      toast({
        title: 'User Deleted',
        description: "",
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
    }

    const getUser = async(e, user) => {
      e.preventDefault();
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/showshelf/${user.username}`)
      setShowShelf(data);
      setCurrentUser(user);
    }

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
      <input type='checkbox' checked={currentUser.admin} onClick={(e) => setCurrentUser({...currentUser, admin: !currentUser.admin})} className='ml-2 text-black max-w-[30ch] p-2  rounded-xl'/>
      </span>
      <span>
        <button onClick={updateUser} className='bg-cyan-500 p-2 my-2 rounded-xl border-2 border-white hover:scale-110 duration-300'>Update User</button>
      </span>
      </form>
      <h2 className='text-center text-xl my-2 '>Show Shelf</h2>
      <div className='flex p-2 gap-5 border-2 rounded-md'>
        {showShelf !== undefined && (
          showShelf.favorites?.map((fav) => {
            return <p className='bg-black p-1 rounded-md'>{fav}<button onClick={(e) => deleteShow(e, fav)} className="mx-2 bg-red-500 hover:text-black duration-300 cursor-pointer p-2 rounded-sm">
            <FaTrash />
            </button></p>
          })
        )}
      </div>
      <h2 className='text-center text-xl my-2 '>Users</h2>
      <div className='grid grid-cols-2 xl:grid-cols-5 border-2 rounded-md'>
        {users.length > 0 && users.map((user, index) => {
        return (
          <div className='flex p-1 xl:p-2 m-1 xl:m-2'>
          <p className='bg-black hover:bg-white hover:text-black duration-300 cursor-pointer p-2 rounded-sm' onClick={(e) => getUser(e, user)}  key={index}>{user.username}</p>
          <button onClick={(e) => deleteUser(e, user)} className="bg-red-500 hover:text-black duration-300 cursor-pointer p-2 rounded-sm">
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