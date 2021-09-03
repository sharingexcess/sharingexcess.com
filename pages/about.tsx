import { Header } from 'components'
import { Text } from 'components/SEDS'
import type { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div style={{ background: '#000000', padding: '128px 64px 256px 64px' }}>
      <Header />
      <Text type="primary-header" color="white">
        About
      </Text>
    </div>
  )
}

export default Home
