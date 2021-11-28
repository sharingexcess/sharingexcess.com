import { Button, Spacer, Text, Image } from '@sharingexcess/designsystem'
import React, { FC } from 'react'
import TrackVisibility from 'react-on-screen'
import Link from 'next/link'
import { useIsMobile } from 'hooks'

const content = [
  {
    image: '/icons/package.png',
    header: '4,606,254 lbs.',
    subheader: 'Total Food Rescued since 2018',
    body: 'Partnering with wholesale markets, grocery stores, restaurants, and community organizations, Sharing Excess has rescued, transported, and delivered food to over 150 local nonprofits and food pantries.',
  },
  {
    image: '/icons/money.png',
    header: '$9,266,148',
    subheader: 'Total Retail Value of Rescued Food',
    body: 'With an average retail value of $2.86 per pound, Sharing Excess has returned over $9 million of valuable, fresh food to the local economy and community.',
  },
  {
    image: '/icons/cloud.png',
    header: '16,858,890 lbs.',
    subheader: 'Total CO2 Diverted from Landfills',
    body: "By keeping food waste out of landfills, Sharing Excess's work has diverted over 16 million pounds of carbon dioxide from the atmosphere.",
  },
]

const ImpactContentChunk: FC<{
  data: { header: string; body: string; subheader: string; image: string }
  isVisible: boolean
}> = ({ data, isVisible }) => {
  return (
    <div
      className={`Impact-content-chunk ${isVisible ? 'focused' : 'unfocused'}`}
    >
      <Image src={data.image} alt="Impact" />
      <Spacer height={24} />
      <Text type="primary-header" color="white" align="center" shadow>
        {data.header}
      </Text>
      <Spacer height={24} />
      <Text type="small-header" color="white" align="center" shadow>
        {data.subheader}
      </Text>
      <Spacer height={8} />
      <Text type="paragraph" color="white" align="center">
        {data.body}
      </Text>
    </div>
  )
}

export const Impact: FC = () => {
  const isMobile = useIsMobile()

  return (
    <div id="Impact">
      <Text
        id="Impact-title"
        type="small-header"
        color="white"
        shadow
        align="center"
      >
        OUR IMPACT: BY THE NUMBERS
      </Text>
      <section id="Impact-content">
        {content.map(c => (
          <TrackVisibility key={c.header} offset={200}>
            {({ isVisible }) => (
              <ImpactContentChunk data={c} isVisible={isVisible} />
            )}
          </TrackVisibility>
        ))}
      </section>
      <Spacer height={isMobile ? 32 : 64} />
      <Button type="primary" size="large" color="white" fullWidth={isMobile}>
        <Link href="/about">Read More About Our Impact</Link>
      </Button>
    </div>
  )
}
