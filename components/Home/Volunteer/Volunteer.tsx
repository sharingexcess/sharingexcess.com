import { Button, Image, Spacer, Text } from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'
import React, { FC } from 'react'
import { volunteering } from 'content'
import Link from 'next/link'
import { getAnalytics, logEvent } from 'firebase/analytics'

export const Volunteer: FC = () => {
  const isMobile = useIsMobile()

  function logAnalyticsEvent(description: string) {
    const analytics = getAnalytics()
    logEvent(analytics, 'Home page ' + description)
  }
  return (
    <div id="Volunteer">
      <Text type="small-header" color="green">
        GET INVOLVED
      </Text>
      <Spacer height={isMobile ? 12 : 32} />
      <Text type="primary-header" color="black">
        We&apos;re growing!
        <br />
        And we need your help.
      </Text>
      <Spacer height={isMobile ? 8 : 16} />
      <Text type="subheader" color="grey">
        There are lots of ways you can help Sharing Excess in your free time.
        Join more than 100 volunteers doing their part to make life more
        sustainable and equitable for everyone.
      </Text>
      <Spacer height={isMobile ? 48 : 64} />
      <section id="Volunteer-content">
        {volunteering.map(c => {
          return (
            <div key={c.header}>
              <Image src={c.image} alt={c.header} />
              <Spacer height={24} />
              <Text type="secondary-header" color="black" align="center">
                {c.header}
              </Text>
              <Spacer height={8} />
              <Text type="small" color="grey" align="center">
                {c.body}
              </Text>
              <Spacer height={8} />
              <Button
                type="primary"
                size="medium"
                color="green"
                handler={() => logAnalyticsEvent(c.button)}
              >
                <Link href={c.link}>{c.button}</Link>
              </Button>
            </div>
          )
        })}
      </section>
    </div>
  )
}
