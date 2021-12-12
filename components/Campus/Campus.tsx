import React, { FC } from 'react'
import { PageHeader } from 'components'
import {
  Text,
  Spacer,
  FlexContainer,
  Image,
  ExternalLink,
  Button,
} from '@sharingexcess/designsystem'
import Head from 'next/head'
import Link from 'next/link'
import { useIsMobile } from 'hooks'
import { getAnalytics, logEvent } from 'firebase/analytics'

const chapters = [
  {
    name: 'Drexel University',
    image: '/campus/drexel.png',
    link: 'https://dragonlink.drexel.edu/organization/se-drexel',
  },
  {
    name: 'University of Pennsylvania',
    image: '/campus/penn.png',
    link: 'https://pennclubs.com/club/sharing-excess-at-upenn',
  },
  {
    name: 'Temple University',
    image: '/campus/temple.png',
    link: 'https://temple.campuslabs.com/engage/organization/setu',
  },
  {
    name: "Saint Joseph's University",
    image: '/campus/sju.png',
    link: 'https://hawkchill.com/people/new-club-reallocates-food-waste-on-campus/',
  },
  {
    name: 'Delaware County Community College',
    image: '/campus/dccc.png',
    link: 'https://www.dccc.edu/',
  },
  {
    name: 'University of Pittsburgh',
    image: '/campus/pitt.png',
    link: 'https://pitt2.campuslabs.com/engage/organization/sepitt',
  },
  {
    name: 'Neumann University',
    image: '/campus/neumann.png',
    link: 'https://neumann.edu',
  },
]

function logAnalyticsEvent() {
  const analytics = getAnalytics()
  logEvent(analytics, 'Reach out to start a chapter')
}

export const Campus: FC = () => {
  const isMobile = useIsMobile()

  return (
    <main id="Campus">
      <Head>
        <title>Campus | Sharing Excess</title>
      </Head>
      <PageHeader
        label="CAMPUS CHAPTERS"
        title="Powered by students."
        image={isMobile ? '/headers/campus.png' : '/headers/campus.png'}
      />
      <Spacer height={32} />
      <Text>
        Campus chapters play a crucial role in building food sharing networks.
        By volunteering, researching, and fundraising, students can work with
        Sharing Excess to promote food security on campus, and distribute
        surplus food in their community.
      </Text>
      <Spacer height={16} />
      <Text>
        Student chapters incite change within their campus and surrounding
        communities by fighting food waste and dismantling the stigma
        surrounding food insecurity. This includes food rescue networks, meal
        swipe donation programs, pop-up food distributions, and educational
        seminars.
      </Text>
      <Spacer height={32} />
      <Text color="green" type="section-header">
        Active Chapters
      </Text>
      <FlexContainer primaryAlign="space-between" id="Campus-chapters">
        {chapters.map(c => (
          <FlexContainer
            direction="vertical"
            key={c.name}
            className="Campus-chapter"
            fullWidth={false}
          >
            <ExternalLink to={c.link}>
              <Image src={c.image} alt={c.name} />
              <Text type="small-header" align="center">
                {c.name}
              </Text>
            </ExternalLink>
          </FlexContainer>
        ))}
      </FlexContainer>
      <Spacer height={isMobile ? 64 : 96} />

      <FlexContainer
        id="Campus-section-header"
        secondaryAlign="center"
        primaryAlign="center"
      >
        <Image src="/campus/chapter.JPG" alt="Sharing Excess Team" />
        <Text type="primary-header" color="white" shadow align="center">
          Looking to start a chapter?
        </Text>
      </FlexContainer>
      <Spacer height={isMobile ? 24 : 48} />
      <FlexContainer direction="vertical">
        <Text type="secondary-header" color="green" align="center">
          It&apos;s easy to get started!
        </Text>
        <Spacer height={24} />
        <Text align="center" color="black">
          Join us on our mission to fight food insecurity with food surplus.
          While we at Sharing Excess HQ are exceptionally happy and willing to
          help you throughout every step of establishing and growing your
          chapter, you will want a fellow group of students to help plan and
          execute your first event and spread word of this awesome organization
          on campus! Gather your group and reach out to get started.
        </Text>
        <Spacer height={32} />
        <Button type="primary" color="green" size="large">
          <Link href="/contact">Reach Out to Start a Chapter</Link>
          handler={logAnalyticsEvent}
        </Button>
      </FlexContainer>
    </main>
  )
}
