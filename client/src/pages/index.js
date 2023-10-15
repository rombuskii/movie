import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useUser } from '@/context/UserContext'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const {isAuthenticated, user} = useUser();
  console.log(user)
  if(!isAuthenticated) {
  return (
    <div>
      <h1>Welcome to Show Shelf</h1>
    </div>
  )
} else {
  return (
    <div>
      <h1>Glad to see you, {user?.username}</h1>
    </div>
  )
}
}
