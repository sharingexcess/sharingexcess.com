import { Spacer } from '@sharingexcess/designsystem'
import { Header, Splash, Solution, Impact, News } from 'components'
import type { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div>
      <Header />
      <Splash />
      <Spacer height={250} />
      <Solution />
      <Impact />
      <News />
    </div>
  )
}

export default Home
