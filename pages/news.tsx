import { Header } from 'components'
import { Text } from '@sharingexcess/designsystem'
import type { NextPage } from 'next'

const News: NextPage = () => {
  return (
    <div style={{ background: '#000000', padding: '128px 64px 256px 64px' }}>
      <Header />
      <Text type="primary-header" color="white">
        News
      </Text>
    </div>
  )
}

export default News
