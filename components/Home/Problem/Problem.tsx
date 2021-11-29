import { Button, ExternalLink, Spacer, Text } from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'
import React, { FC } from 'react'
import Link from 'next/link'
import { DONATE_LINK } from 'utils/constants'

export const Problem: FC = () => {
  const isMobile = useIsMobile()

  return (
    <div id="Problem">
      <Text type="primary-header" color="black">
        Over 40% of food produced in the USA goes to waste every year.
      </Text>
      <Spacer height={isMobile ? 8 : 16} />
      <Text type="subheader" color="grey">
        That&apos;s 120 billion pounds of completely edible food, needlessly
        wasted for logistical reasons like inventory turnover, lack of
        affordable transportation, and non-standardized expiration dates.
        Meanwhile, 38 million Americans experience food insecurity every year.
      </Text>
      <Spacer height={isMobile ? 48 : 96} />
      <section id="Problem-content">
        <div id="Problem-content-left">
          <Text type="primary-header" color="white" align="center">
            100 billion
          </Text>
          <Spacer height={12} />
          <Text type="subheader" color="grey" align="center">
            Meals wasted annually in the USA
          </Text>
        </div>
        <div id="Problem-content-center">
          <Text type="primary-header" color="black" align="center">
            &gt;
          </Text>
        </div>
        <div id="Problem-content-right">
          <Text type="primary-header" color="white" align="center">
            41.6 billion
          </Text>
          <Spacer height={12} />
          <Text type="subheader" color="grey" align="center">
            Meals missed due to food insecurity
          </Text>
        </div>
      </section>
      <Spacer height={isMobile ? 64 : 96} />
      <ExternalLink to={DONATE_LINK}>
        <Button type="primary" size="large" color="black">
          Help Fix This Broken Equation
        </Button>
      </ExternalLink>
    </div>
  )
}
