import { Button, Image, Spacer, Text } from '@sharingexcess/designsystem'
import React, { FC } from 'react'

const content = [
  {
    image: '/solution1.png',
    header: '3,177,738 lbs.',
    body: 'Total food rescued since 2018',
  },
  {
    image: '/solution2.png',
    header: '$9,088,331',
    body: 'Retail value ($2.86/lb average)',
  },
  {
    image: '/solution3.png',
    header: '11,630,522 lbs.',
    body: 'CO2 diverted ($3.66/lb average)',
  },
]

export const Impact: FC = () => {
  return (
    <div id="Impact">
      <Text type="small-header" color="white" shadow>
        OUR IMPACT
      </Text>
      <Spacer height={32} />
      <Text type="primary-header" color="white" shadow>
        Partnering with 150 local orgs to distribute 100,000lbs. monthly.
      </Text>
      <Spacer height={16} />
      <Text type="subheader" color="white" shadow>
        That&apos;s approximately 120 billion pounds of food ending up in
        landfills each year, needlessly wasted for logistical reasons like
        inventory turnover, lack of affordable transportation, and
        non-standardized expiration dates.
      </Text>
      <Spacer height={64} />
      <section id="Impact-content">
        {content.map(c => (
          <div key={c.header}>
            <Image src={c.image} alt={c.header} />
            <Spacer height={16} />
            <Text type="section-header" color="white" align="center" shadow>
              {c.header}
            </Text>
            <Text type="paragraph" color="white" align="center">
              {c.body}
            </Text>
          </div>
        ))}
      </section>
      <Spacer height={64} />
      <Button type="primary" size="large" color="white">
        Read More About Our Impact
      </Button>
    </div>
  )
}
