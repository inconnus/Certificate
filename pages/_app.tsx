import '../styles/globals.sass'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import SideBar from 'components/Sidebar'
function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, height=device-height ,initial-scale=1,viewport-fit=cover" />
        <link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.15.3/css/all.css" integrity="sha384-iKbFRxucmOHIcpWdX9NTZ5WETOPm0Goy0WmfyNcl52qSYtc2Buk0NCe6jU1sWWNB" crossOrigin="anonymous"></link>
        <link rel="icon" href="/images/fav.png" sizes="32x32" />
        <title>Certificate</title>
      </Head>
      <div id='overlay' />
      <SideBar />
      <Component {...pageProps} />
    </>
  )

}
export default App
