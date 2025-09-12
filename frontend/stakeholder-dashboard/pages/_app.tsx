import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>TRACE HERB Dashboard</title>
        <meta name="description" content="TRACE HERB Stakeholder Dashboard - Real-time blockchain monitoring" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="dashboard-container">
        <Component {...pageProps} />
      </div>
    </>
  )
}
