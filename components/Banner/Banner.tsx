import {
  Button,
  ExternalLink,
  Image,
  Spacer,
  Text,
} from '@sharingexcess/designsystem'
import React, { FC, useEffect, useState } from 'react'
import { DONATE_LINK } from 'utils/constants'

export const Banner: FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true)
    }, 2000)
  }, [])

  return (
    <aside id="Banner" className={isVisible ? 'visible' : 'hidden'}>
      <Button
        id="Banner-close"
        type="tertiary"
        color="white"
        handler={() => setIsVisible(false)}
      >
        X
      </Button>
      <Image src="/icons/party.png" id="Banner-icon" alt="Banner Image" />
      <Spacer width={32} />
      <div>
        <Text type="paragraph" color="black">
          We have a match campaign going on from now until the end of the year!
          That means your donation to Sharing Excess is doubled.
        </Text>
        <Text type="paragraph" color="black">
          Help us raise $50,000 to deliver 1.5 million meals this winter.{' '}
          <ExternalLink to={DONATE_LINK}>
            Click here to donate now!
          </ExternalLink>
        </Text>
      </div>
    </aside>
  )
}
