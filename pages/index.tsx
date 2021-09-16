import { Spacer } from '@sharingexcess/designsystem'
import { Header, Splash, Solution, Impact, News } from 'components'
import { useIsMobile } from 'hooks'
import type { NextPage } from 'next'

const Home: NextPage = () => {
  const isMobile = useIsMobile()

  return (
    <div>
      <Header />
      <Splash />
      {!isMobile && <Spacer height={250} />}
      <Solution />
      <Impact />
      <News />
    </div>
  )
}

export default Home
