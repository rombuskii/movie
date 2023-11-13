import '@/styles/globals.css'
import { UserProvider } from '@/context/UserContext'
import Layout from '@/components/Layout'
import Head from 'next/head'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false
import { ChakraProvider } from '@chakra-ui/react'

export default function App({ Component, pageProps }) {
  return (
    <ChakraProvider>
    <UserProvider>
      <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={'anonymous'}/>
      <link href="https://fonts.googleapis.com/css2?family=Amatic+SC&family=Poppins:wght@100;400&display=swap" rel="stylesheet"/>
      </Head>
      <Layout>
      <Component {...pageProps} />
      </Layout>
    </UserProvider>
    </ChakraProvider>
  )
}
