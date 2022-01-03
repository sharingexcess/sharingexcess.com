import {
  Button,
  ExternalLink,
  Image,
  Spacer,
  Text,
} from '@sharingexcess/designsystem'
import React, { FC, useEffect, useState } from 'react'
import { HOLIDAY_RAFFLE } from 'utils/constants'

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
      <Image src="/icons/present.png" id="Banner-icon" alt="Banner Image" />
      <Spacer width={32} />
      <div>
        <Text type="paragraph" color="black">
          We have a Holiday Fundraiser going on from now until Monday, December
          20th!{' '}
          <strong>
            We are raffling off over $8,000 worth of incredible prizes.{' '}
          </strong>
        </Text>
        <Text type="paragraph" color="black">
          Tickets are just $5.{' '}
          <ExternalLink to={HOLIDAY_RAFFLE}>
            Check out the baskets and enter now!
          </ExternalLink>
        </Text>
      </div>
    </aside>
  )
}
