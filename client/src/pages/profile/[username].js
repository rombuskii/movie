import React, {useState} from 'react'


export async function getServerSideProps(context) {
  const username = context.params.username
  let user = await fetch(`http://localhost:3001/api/users/${username}`)
  .then(response => response.json())

  return {
      props: {user: user[0]}
  }

}

const BrowseProfile = ({user}) => {
  
  return (
    <div className='flex flex-col items-center justify-center'>
      {user.username}
    </div>
  )
}

export default BrowseProfile