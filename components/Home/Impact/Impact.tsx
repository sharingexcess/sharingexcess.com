import { Button, Spacer, Text, Image } from '@sharingexcess/designsystem'
import React, { FC, useEffect, useState } from 'react'
import TrackVisibility from 'react-on-screen'
import Link from 'next/link'
import { useIsMobile } from 'hooks'

const content = [
  {
    image: '/icons/food.png',
    header: 4606254,
    subheader: 'Pounds of Food Rescued since 2018',
    body: 'Partnering with grocery stores, restaurants, wholesalers, and farmers, Sharing Excess has rescued and delivered food to over 180 nonprofits and food banks.',
  },
  {
    image: '/icons/money.png',
    header: 9266148,
    prefix: '$',
    subheader: 'Total Retail Value of Rescued Food',
    body: 'With an average retail value of $2.86 per pound, Sharing Excess has returned over $9 million of valuable, fresh food to the local economy and community.',
  },
  {
    image: '/icons/cloud.png',
    header: 16858890,
    subheader: 'Pounds of CO2 Diverted from Landfills',
    body: 'By keeping food waste out of landfills, Sharing Excess has diverted over 16 million pounds of carbon dioxide from the atmosphere.',
  },
]

const ImpactContentChunk: FC<{
  data: {
    header: number
    body: string
    subheader: string
    image: string
    prefix?: string
  }
  isVisible: boolean
}> = ({ data, isVisible }) => {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (isVisible && value < data.header) {
      setTimeout(
        () =>
          setValue(
            Math.min(Math.round(value + data.header / 100), data.header)
          ),
        10
      )
    } else if (!isVisible) {
      setValue(0)
    }
  }, [value, isVisible, data.header])

  function numberWithCommas(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <div
      className={`Impact-content-chunk ${isVisible ? 'focused' : 'unfocused'}`}
    >
      <Image src={data.image} alt="Impact" />
      <Spacer height={24} />
      <Text type="primary-header" color="white" align="center" shadow>
        {data.prefix}
        {numberWithCommas(value)}
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
        type="primary-header"
        color="white"
        shadow
        align="center"
      >
        IMPACT: BY THE NUMBERS
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
