import { Button, Spacer, Text, ExternalLink } from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'
import React, { FC } from 'react'
import { DONATE_LINK } from 'utils/constants'
import { getAnalytics, logEvent } from 'firebase/analytics'

export const Splash: FC = () => {
  const isMobile = useIsMobile()

  function logAnalyticsEvent() {
    const analytics = getAnalytics()
    logEvent(analytics, 'Splash Page Donate Button Click')
  }

  return (
    <div id="Splash">
      {isMobile ? (
        // eslint-disable-next-line
        <img
          id="Splash-video-background"
          src="/headers/home.gif"
          alt="This is Sharing Excess"
        />
      ) : (
        <video
          id="Splash-video-background"
          src="/headers/home.mp4"
          autoPlay
          playsInline
          preload="auto"
          muted
          loop
          poster="/headers/home.gif"
        />
      )}
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
          By partnering with grocery stores, restaurants, wholesalers, and
          farmers, Sharing Excess rescues and redistributes over 10,000 lbs. of
          food every day.
        </Text>
        <Spacer height={32} />
        <ExternalLink to={DONATE_LINK}>
          <Button
            size="large"
            color="green"
            type="primary"
            handler={logAnalyticsEvent}
          >
            Donate $20 to Rescue 320 Meals
          </Button>
        </ExternalLink>
      </div>
    </div>
  )
}
