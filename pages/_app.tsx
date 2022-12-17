import '../assets/main.css'
import type { AppProps } from 'next/app'
import { FC, useEffect } from 'react'
import { SessionProvider } from "next-auth/react"

const Noop: FC = ({ children }: any) => <>{children}</>

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  useEffect(() => {
    document.body.classList?.remove('loading')
  }, [])

  const Layout = (Component as any).Layout || Noop

  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  )
}
