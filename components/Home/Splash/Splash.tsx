import { Carousel } from 'components'
import { Button, Spacer, Text } from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'
import React, { FC } from 'react'

export const Splash: FC = () => {
  const isMobile = useIsMobile()

  return (
    <div id="Splash">
      {isMobile && <Carousel />}
      <div id="Splash-content">
        <Text
          type="primary-header"
          color="white"
          align={isMobile ? 'center' : 'left'}
          shadow
        >
          At Sharing Excess,
          <br />
          we&apos;re using surplus
          <br />
          to solve scarcity.
        </Text>
        <Spacer height={16} />
        <Text
          type="subheader"
          color="white"
          align={isMobile ? 'center' : 'left'}
          shadow
        >
          Partnering with wholesale markets, stores, and restaurants, Sharing
          Excess rescues and redistributes over 10,000 lbs. of food every day.
        </Text>
        <Spacer height={32} />
        <Button size="large" color="white" type="primary">
          Donate $10 to Rescue 80 Meals
        </Button>
      </div>
      {!isMobile && <Carousel />}
    </div>
  )
}
