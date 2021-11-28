import { Button, Spacer, Text } from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'
import React, { FC } from 'react'
import Link from 'next/link'

export const Problem: FC = () => {
  const isMobile = useIsMobile()

  return (
    <div id="Problem">
      <Text type="small-header" color="green">
        THE PROBLEM
      </Text>
      <Spacer height={isMobile ? 8 : 32} />
      <Text type="primary-header" color="black">
        Over 40% of food in the USA goes to waste every year.
      </Text>
      <Spacer height={isMobile ? 8 : 16} />
      <Text type="subheader" color="grey">
        That&apos;s 120 billion pounds of food, needlessly wasted for logistical
        reasons like inventory turnover, lack of affordable transportation, and
        non-standardized expiration dates. Meanwhile, food scarcity is an
        increasingly common reality for many families.
      </Text>
      <Spacer height={isMobile ? 48 : 96} />
      <section id="Problem-content">
        <div id="Problem-content-left">
          <Text type="primary-header" color="white" align="center">
            10 billion
          </Text>
          <Spacer height={12} />
          <Text type="subheader" color="grey" align="center">
            Meals Wasted Annually in the US
          </Text>
        </div>
        <div id="Problem-content-center">
          <Text type="secondary-header" color="black" align="center">
            vs.
          </Text>
        </div>
        <div id="Problem-content-right">
          <Text type="primary-header" color="white" align="center">
            10 million
          </Text>
          <Spacer height={12} />
          <Text type="subheader" color="grey" align="center">
            Children facing hunger in the US
          </Text>
        </div>
      </section>
      <Spacer height={isMobile ? 64 : 96} />
      <Button type="primary" size="large" color="black">
        <Link href="/about">Read More About Our Cause</Link>
      </Button>
    </div>
  )
}
