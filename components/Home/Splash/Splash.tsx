import {
  Button,
  Spacer,
  Text,
  ExternalLink,
  Image,
} from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'
import React, { FC } from 'react'

export const Splash: FC = () => {
  const isMobile = useIsMobile()

  return (
    <div id="Splash">
      <video
        id="Splash-video-background"
        src="/this_is_sharing_excess.mp4"
        autoPlay
        muted
        loop
        poster="/splash3.png"
      />
      <div id="Splash-content">
        <Text
          type="primary-header"
          color="white"
          align={isMobile ? 'center' : 'left'}
          shadow
        >
          At <span className="green">Sharing Excess</span>
          <Spacer width={4} />,
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
        <ExternalLink to="https://app.mobilecause.com/form/l2Z4OQ?vid=lpnht">
          <Button size="large" color="green" type="primary">
            Donate $10 to Rescue 80 Meals
          </Button>
        </ExternalLink>
      </div>
    </div>
  )
}
