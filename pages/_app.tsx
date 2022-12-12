import '../assets/main.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }: AppProps) {

  useEffect(() => {
    document.body.classList?.remove('loading')
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
