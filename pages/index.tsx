import { Carousel, Header, Splash } from 'components'
import type { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div>
      <Header />
      <Splash />
      <Carousel />
    </div>
  )
}

export default Home
