import {
  Splash,
  Solution,
  Impact,
  News,
  Volunteer,
  Donate,
  Problem,
} from 'components/Home'
import { Header, Footer } from 'components'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const Home: NextPage = () => {
  const router = useRouter()

  useEffect(() => {
    if (router.pathname !== '/') {
      router.push(router.pathname)
    }
  }, [router])
  return (
    <div id="Home">
      <Header />
      <Splash />
      <Problem />
      <Solution />
      <Impact />
      <News />
      <Volunteer />
      <Donate />
      <Footer />
    </div>
  )
}

export default Home
