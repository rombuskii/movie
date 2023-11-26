import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/router';
const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {user, setUser, setIsAuthenticated} = useUser();
    const [err, setErr] = useState();
    const [isLoggingIn, setIsLoggingIn] = useState(true)
    const router = useRouter();

    const handleSubmit = async(e) => {
        e.preventDefault();
        setErr('')
        if(isLoggingIn) {
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/login`, {
          username,
          password
        },{withCredentials: true}).then(response => {
            setUser(response.data);
            setIsAuthenticated(true);
            router.push('/')
        })
        .catch(err => {
            setErr('Invalid login details')
        });
    } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/register`, {
          username,
          password
        },{withCredentials: true}).then(response => {
            setUser(response.data);
            setIsAuthenticated(true);
            router.push('/')
        })
        .catch(err => {
            setErr('User already exists')
        })
    }
}

  return (
    <form onSubmit={handleSubmit} className='flex-1 flex flex-col gap-3 justify-center items-center'>
        <h1 className='text-center mb-4 font-extrabold select-none text-2xl sm:text-4xl uppercase'>Lights. Camera. Action. 🎬 🍿</h1>
        <input className='text-black p-2 w-full max-w-[40ch]' id="username" required={true} name="username" type='text' placeholder='Username' value={username} onChange={e => setUsername(e.target.value)}/>
        <input className='text-black p-2 w-full max-w-[40ch]' id="password" required={true} name="password" type='password' placeholder='Password' value={password} onChange={e => setPassword(e.target.value)}/>
        <button className='duration-300 hover:text-black hover:scale-110 hover:bg-white p-2 border rounded-xl w-full max-w-[40ch] select-none' type='submit'>{isLoggingIn ? 'Login' : 'Register'}</button>
        <h2 className='select-none duration-300 hover:scale-110 cursor-pointer' onClick={() => setIsLoggingIn(!isLoggingIn)}>{!isLoggingIn ? 'Login' : 'Register'}</h2>
      <p className='text-red-500'>{err}</p>
      </form>
  )
}

export default Login