import React, { FC, useEffect, useState } from 'react'
import Head from 'next/head'
import {
  Image,
  Spacer,
  Text,
  Button,
  FlexContainer,
  ExternalLink,
} from '@sharingexcess/designsystem'
import { team } from 'content/team'
import { useIsMobile } from 'hooks'
import { PageHeader } from 'components'
import { volunteering } from 'content'
import { useRouter } from 'next/router'
import { DONATE_LINK, PASTEL_COLORS } from 'utils/constants'
import Link from 'next/link'
import { getAnalytics, logEvent } from 'firebase/analytics'

export const About: FC = () => {
  const isMobile = useIsMobile()
  const [section, setSection] = useState('team')
  const router = useRouter()

  function logAnalyticsEvent(description: string) {
    const analytics = getAnalytics()
    logEvent(analytics, description)
  }

  useEffect(() => {
    if (router?.query?.section && typeof router.query.section === 'string') {
      setSection(router.query.section)
    }
  }, [router.query])

  return (
    <div id="About">
      <Head>
        <title>About | Sharing Excess</title>
      </Head>
      <PageHeader
        image={isMobile ? '/headers/about_mobile.jpeg' : '/headers/about.jpeg'}
        label="ABOUT US"
        title={`Sharing Excess is using surplus\nto fight scarcity.`}
      />

      <Spacer height={isMobile ? 48 : 64} />

      <FlexContainer
        className="About-content-section"
        direction={isMobile ? 'vertical-reverse' : 'horizontal'}
        primaryAlign="start"
        secondaryAlign="center"
      >
        <Image src="/about/popup.gif" alt="About Sharing Excess" />
        <Spacer width={48} height={32} />
        <FlexContainer
          direction="horizontal"
          primaryAlign={isMobile ? 'center' : 'start'}
          secondaryAlign={isMobile ? 'center' : 'start'}
        >
          <FlexContainer direction="vertical" secondaryAlign="start">
            <Text type="primary-header" color="green">
              Our Story
            </Text>
            <Spacer height={16} />
            <Text type="paragraph" color="black">
              But as vast a problem as food waste is, the solution often boils
              down to simple last mile logistics and delivery.{' '}
              <span className="green">Sharing Excess</span> is meeting this
              challenge with the power of people, technology, and compassion.
            </Text>
            <Spacer height={38} />
            <Button type="primary" color="green" size="medium">
              Read More on Our Blog
            </Button>
          </FlexContainer>
        </FlexContainer>
      </FlexContainer>

      <FlexContainer
        className="About-content-section"
        direction={isMobile ? 'vertical-reverse' : 'horizontal'}
        primaryAlign="start"
        secondaryAlign="center"
      >
        <FlexContainer
          direction="horizontal"
          primaryAlign={isMobile ? 'center' : 'start'}
          secondaryAlign={isMobile ? 'center' : 'start'}
        >
          <FlexContainer direction="vertical" secondaryAlign="start">
            <Text type="primary-header" color="green">
              Meet the Team
            </Text>
            {/*    for the background color add an id and look at header styling for absolute positioning and z index */}
            <Spacer height={16} />
            <Text type="paragraph" color="black">
              But as vast a problem as food waste is, the solution often boils
              down to simple last mile logistics and delivery.{' '}
              <span className="green">Sharing Excess</span> is meeting this
              challenge with the power of people, technology, and compassion.
            </Text>
            <Spacer height={38} />
            <Button type="primary" color="green" size="medium">
              Meet the Team
            </Button>
          </FlexContainer>
        </FlexContainer>
        <Image src="/about/popup.gif" alt="About Sharing Excess" />
        <Spacer width={30} height={32} />
      </FlexContainer>

      <FlexContainer
        className="About-content-section"
        direction={isMobile ? 'vertical-reverse' : 'horizontal'}
        primaryAlign="start"
        secondaryAlign="center"
      >
        <Image src="/about/popup.gif" alt="About Sharing Excess" />
        <Spacer width={30} height={32} />
        <FlexContainer
          direction="horizontal"
          primaryAlign={isMobile ? 'center' : 'start'}
          secondaryAlign={isMobile ? 'center' : 'start'}
        >
          <FlexContainer direction="vertical" secondaryAlign="start">
            <Text type="primary-header" color="green">
              Impact
            </Text>
            <Spacer height={16} />
            <Text type="paragraph" color="black">
              But as vast a problem as food waste is, the solution often boils
              down to simple last mile logistics and delivery.{' '}
              <span className="green">Sharing Excess</span> is meeting this
              challenge with the power of people, technology, and compassion.
            </Text>
            <Spacer height={38} />
            <Button type="primary" color="green" size="medium">
              Read More
            </Button>
          </FlexContainer>
        </FlexContainer>
      </FlexContainer>

      <FlexContainer
        className="About-content-section"
        direction={isMobile ? 'vertical-reverse' : 'horizontal'}
        primaryAlign="start"
        secondaryAlign="center"
      >
        <FlexContainer
          direction="horizontal"
          primaryAlign={isMobile ? 'center' : 'start'}
          secondaryAlign={isMobile ? 'center' : 'start'}
        >
          <FlexContainer direction="vertical" secondaryAlign="start">
            <Text type="primary-header" color="green">
              Partners
            </Text>
            {/*    for the background color add an id and look at header styling for absolute positioning and z index */}
            <Spacer height={16} />
            <Text type="paragraph" color="black">
              But as vast a problem as food waste is, the solution often boils
              down to simple last mile logistics and delivery.{' '}
              <span className="green">Sharing Excess</span> is meeting this
              challenge with the power of people, technology, and compassion.
            </Text>
            <Spacer height={38} />
            <Button type="primary" color="green" size="medium">
              Meet the Team
            </Button>
          </FlexContainer>
        </FlexContainer>
        <Image src="/about/popup.gif" alt="About Sharing Excess" />
        <Spacer width={30} height={32} />
      </FlexContainer>

      <Spacer height={isMobile ? 64 : 112} />
    </div>
  )
}
