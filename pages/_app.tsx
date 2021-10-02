import '../styles/globals.sass'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import AppContext from 'contexts/app'
import SideBar from 'components/Sidebar'
import Loading from 'components/Loading'
import { Notify } from 'widgets/Notify'
import { useRef, useState } from 'react'
const App = ({ Component, pageProps }: AppProps) => {
  const loading = useState(false)
  const notify = useRef<any>(null)
  return (
    <AppContext.Provider value={{ loading, notify }}>
      <Head>
        <meta name="viewport" content="width=device-width, height=device-height ,initial-scale=1,viewport-fit=cover" />
        <link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.15.3/css/all.css" integrity="sha384-iKbFRxucmOHIcpWdX9NTZ5WETOPm0Goy0WmfyNcl52qSYtc2Buk0NCe6jU1sWWNB" crossOrigin="anonymous"></link>
        <link rel="icon" href="/images/fav.png" sizes="32x32" />
        <title>Certificate</title>
      </Head>
      <Notify ref={notify} />
      <Loading ready={loading[0]} active={loading[0]} />
      <div id='overlay' />
      {/* <SideBar /> */}
      <Component {...pageProps} />
    </AppContext.Provider>
  )

}
export default App
