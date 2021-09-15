import { Header, Splash, Solution } from 'components'
import type { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div>
      <Header />
      <Splash />
      <Solution />
    </div>
  )
}

export default Home
