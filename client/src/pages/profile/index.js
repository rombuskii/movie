import React, {useEffect, useState} from 'react'
import { useUser } from '@/context/UserContext'
import axios from 'axios'
import Link from 'next/link'


const Profile = () => {
    const {user} = useUser();
    const [username, setUsername] = useState(user?.username)
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [birthday, setBirthday] = useState(user?.birthday);
    const [email, setEmail] = useState(user?.email);
    const [friend, setFriend] = useState('');
    const [friends, setFriends] = useState(user?.friends);
    const [pwdErr, setPwdErr] = useState('')
    const [err, setErr] = useState('')
    const [reviews, setReviews] = useState([{}]);

    const getReviews = async() => {
        await axios.get(`http://localhost:3001/api/review/${username}`)
        .then(response => {
            setReviews(response.data)
        })
}

    useEffect(() => {
        if(user) {
            getReviews()
        };
    }, [])

    const changePassword = async(e) => {
        e.preventDefault();
        await axios.post(`http://localhost:3001/api/reset-password/${user?.username}`,
        {
            password: oldPassword,
            newPassword: newPassword
        }
        ).then(() => {
            setOldPassword('');
            setNewPassword('');
            setPwdErr('')
        })
        .catch(err => {
            setPwdErr('Invalid Password')
        })
    }

    const updateAccount = async(e) => {
        e.preventDefault()
        alert('Updated Account')
        console.log(birthday)
        setBirthday('')
        setEmail('')
    }

    const addFriend = async(e) => {
        e.preventDefault();
        if(!user) {
            return
        }
        await axios.post('http://localhost:3001/api/friend', {
            username: user?.username,
            friend: friend
        })
        .then(() => {
            setFriends([...friends, friend])
            setFriend('')
            setErr('')
        })
        .catch(() => setErr("Invalid user"))
        
    }
  return (
    <div className='p-2 flex flex-col gap-5'>
        <div>
        <h1 className='text-2xl'>Username: {user?.username}</h1>
        </div>
        <hr/>
        <form onSubmit={changePassword} className='mt-2 text-xl flex gap-3 flex-col'>
            <h1 className='text-2xl'>Reset Password</h1>
            <p className='text-red-500'>{pwdErr}</p>
            <label htmlFor='current-password'>Current Password:</label>
            <input value={oldPassword} onChange={e => setOldPassword(e.target.value)} id='current-password' required={true} type='password' className='focus:border-black border-2 outline-none w-full max-w-[50ch] p-2 rounded-lg text-black'/>
            <label htmlFor='new-password'>New Password:</label>
            <input value={newPassword} onChange={e => setNewPassword(e.target.value)} id='new-password' required={true} type='password' className='focus:border-black border-2 outline-none w-full max-w-[50ch] p-2 rounded-lg text-black'/>
            <button className='border duration-300 mx-auto w-full max-w-[80ch] hover:border-2 hover:scale-110 bg-red-500 text-white rounded-xl p-2' type='submit'>Change Password</button>
        </form>
        <hr/>
        <form onSubmit={updateAccount} className='mt-2 text-xl flex gap-3 flex-col'>
            <h1 className='text-2xl'>Account Details</h1>
            <label htmlFor='birthday'>Birthday:</label>
            <input value={birthday} onChange={e => setBirthday(e.target.value)} id='birthday' type='date' className='focus:border-black border-2 outline-none w-full max-w-[50ch] p-2 rounded-lg text-black'/>
            <label htmlFor='email'>Email:</label>
            <input value={email} onChange={e => setEmail(e.target.value)} id='email' type='text' className='focus:border-black border-2 outline-none w-full max-w-[50ch] p-2 rounded-lg text-black'/>
            <button className='border duration-300 mx-auto w-full max-w-[80ch] hover:border-2 hover: hover:scale-110 bg-cyan-500 text-white rounded-xl p-2' type='submit'>Update Profile</button>
        </form>
        <hr/>
        <form onSubmit={addFriend} className='mt-2 text-xl flex gap-3 flex-col'>
            <h1 className='text-2xl'>Friends</h1>
            {user && friends?.length == 0 && <p>No friends yet :/</p>}
            {user && user?.friends.map((friend, index) => {
                return (
                    <Link key={index} className='duration-300 hover:text-cyan-300' href={`/profile/${friend}`}>
                        {friend}
                    </Link>
                )
            })}
            <h1 className='text-2xl'>Add Friend</h1>
            <label htmlFor='friend'>Username:</label>
            <p className='text-red-500'>{err}</p>
            <input value={friend} onChange={e => setFriend(e.target.value)} id='friend' required={true} type='text' className='focus:border-black border-2 outline-none w-full max-w-[50ch] p-2 rounded-lg text-black'/>
            <button className='border duration-300 mx-auto w-full max-w-[80ch] hover:border-2 hover: hover:scale-110 bg-emerald-500 text-white rounded-xl p-2' type='submit'>Add Friend</button>
        </form>
        <hr/>
        <h1 className='text-2xl'>Comments</h1>
        {reviews.length > 0 && reviews.map((review, i) => 
            review.reviews && review.reviews.map(rev => <Link href={`/show/${review.show}`}>{rev.title} - {rev.body}</Link>)
        )}
        <hr/>
    </div>
  )
}

export default Profile