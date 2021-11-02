import { Spacer } from '@sharingexcess/designsystem'
import {
  Header,
  Splash,
  Solution,
  Impact,
  News,
  Volunteer,
  Donate,
  Footer,
  Problem,
} from 'components'
import { useIsMobile } from 'hooks'
import type { NextPage } from 'next'

const Home: NextPage = () => {
  const isMobile = useIsMobile()

  return (
    <div>
      <Header />
      <Splash />
      {!isMobile && <Spacer height={32} />}
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
