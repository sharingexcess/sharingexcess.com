import { Button, Image, Spacer, Text } from '@sharingexcess/designsystem'
import { useIsMobile } from 'hooks'
import React, { FC } from 'react'
import Link from 'next/link'

const content = [
  {
    image: '/volunteer1.png',
    header: 'Volunteer',
    body: 'Join our fleet of paid and volunteer drivers, rescuing food seven days a week. Help us close the gap between food excess and scarcity in your own car on your own time.',
    button: 'Drive With Us',
  },
  {
    image: '/volunteer2.png',
    header: 'Donate',
    body: 'Help support our mission to reduce food waste and fight food insecurity in our communities. 100% of your tax deductible donation goes to our rescuing and redistributing food.',
    button: 'Start a Donation',
  },
  {
    image: '/volunteer3.png',
    header: 'Join Us',
    body: 'You can help Sharing Excess fight food waste from the comfort of your own home. Join our team and help us source food, fundraise, research, and much more.',
    button: 'Get Involved',
  },
]

export const Volunteer: FC = () => {
  const isMobile = useIsMobile()
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
        {content.map(c => (
          <div key={c.header}>
            <Image src={c.image} alt={c.header} />
            <Spacer height={16} />
            <Text type="secondary-header" color="black" align="center">
              {c.header}
            </Text>
            <Text type="small" color="grey" align="center">
              {c.body}
            </Text>
            <Button type="primary" size="medium" color="green">
              {c.button}
            </Button>
          </div>
        ))}
      </section>
    </div>
  )
}
