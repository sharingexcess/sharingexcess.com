import {
  Splash,
  Solution,
  Impact,
  News,
  Volunteer,
  Donate,
  Footer,
  Problem,
} from 'components/Home'
import { Header } from 'components'
import type { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div>
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
