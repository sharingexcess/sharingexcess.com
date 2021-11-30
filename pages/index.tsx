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

const Home: NextPage = () => {
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
