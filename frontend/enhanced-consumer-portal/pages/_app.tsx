import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'
import { AuthProvider } from '../lib/useAuth'
import ErrorBoundary from '../components/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TRACE HERB - Consumer Portal</title>
        <meta name="description" content="Verify herb authenticity and trace supply chain" />
      </Head>
      <ErrorBoundary>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ErrorBoundary>
    </>
  )
}
