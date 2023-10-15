import React from 'react'

export async function getServerSideProps(context) {
  const id = 'tv/' + context.params.show
  let show = await fetch(`https://consumet-pied.vercel.app/movies/flixhq/info?id=${id}`)
  .then(response => response.json())

  return {
      props: {show}
  }

}

const Show = ({show}) => {
  return (
    <div>{show.title}</div>
  )
}

export default Show