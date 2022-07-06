import React, { FC } from 'react'
import { Button, Image, Spacer, Text, Card } from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'
import Link from 'next/link'
import { getAnalytics, logEvent } from 'firebase/analytics'

export const Solution: FC = () => {
  const isMobile = useIsMobile()
  function logAnalyticsEvent() {
    const analytics = getAnalytics()
    logEvent(analytics, 'Button Click - Home Page Our Work')
  }

  return (
    <div id="Solution">
      <section id="Solution-background">
        <Image src="/home/pwpm.png" alt="Test" />
      </section>
      <Card id="Solution-content">
        <Text type="primary-header" color="black" align="right">
          We improve access to excess.
        </Text>
        <Spacer height={16} />
        <Text
          type="subheader"
          color={isMobile ? 'white' : 'grey'}
          align="right"
        >
          Sharing Excess specializes in last-mile logistics. We use technology
          and clever innovation to deliver food excess to communities free of
          charge, before it goes to waste.
        </Text>
        <Spacer height={isMobile ? 16 : 32} />
        <Button
          type="primary"
          size="medium"
          color={isMobile ? 'white' : 'green'}
          handler={logAnalyticsEvent}
        >
          <Link href="/about">Learn More About Our Work</Link>
        </Button>
      </Card>
    </div>
  )
}
