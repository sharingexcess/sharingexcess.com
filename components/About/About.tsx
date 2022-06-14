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
import { useIsMobile } from 'hooks'
import { PageHeader } from 'components'
import { WaveBackground } from 'components'
import { useRouter } from 'next/router'
import { getAnalytics, logEvent } from 'firebase/analytics'
import Link from 'next/link'

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

  function ContentSectionLeft({
    title,
    img,
    alt,
    paragraph,
    buttonLink,
    buttonText,
  }: Record<any, any>) {
    return isMobile ? (
      <FlexContainer
        className="About-content-section"
        direction="vertical"
        primaryAlign="start"
        secondaryAlign="center"
        id="About-content-section-left"
      >
        <Text type="secondary-header" color="black">
          {title}
        </Text>
        <Spacer height={18} />
        <Image src={img} alt={alt} classList={['About-content-section-img']} />
        <Spacer height={24} />
        <Text type="paragraph" color="black">
          {paragraph}
        </Text>
        <Spacer height={26} />
        <a href={buttonLink}>
          <Button type="primary" color="green" size="medium">
            {buttonText}
          </Button>
        </a>
      </FlexContainer>
    ) : (
      <FlexContainer
        className="About-content-section"
        direction="horizontal"
        primaryAlign="start"
        secondaryAlign="center"
      >
        <Image src={img} alt={alt} classList={['About-content-section-img']} />
        <FlexContainer
          direction="horizontal"
          primaryAlign="start"
          secondaryAlign="start"
          id="About-section-text--left"
        >
          <FlexContainer direction="vertical" secondaryAlign="start">
            <Text type="secondary-header" color="black">
              {title}
            </Text>
            <Spacer height={16} />
            <Text type="paragraph" color="black">
              {paragraph}
            </Text>
            <Spacer height={38} />
            <a href={buttonLink}>
              <Button type="primary" color="green" size="medium">
                {buttonText}
              </Button>
            </a>
          </FlexContainer>
        </FlexContainer>
      </FlexContainer>
    )
  }

  function ContentSectionRight({
    title,
    img,
    alt,
    paragraph,
    buttonText,
    buttonLink,
    flipped,
  }: Record<any, any>) {
    return isMobile ? (
      <FlexContainer
        className="About-content-section"
        direction="vertical"
        primaryAlign="start"
        secondaryAlign="center"
        id="About-content-section-mobile"
      >
        <WaveBackground
          containerId="About-content-section-mobile"
          flipped={flipped}
        />

        <FlexContainer
          direction="vertical"
          primaryAlign="start"
          secondaryAlign="center"
        >
          <Text type="secondary-header" color="black">
            {title}
          </Text>
          <Spacer height={18} />
          <Image
            src={img}
            alt={alt}
            classList={['About-content-section-img']}
          />
          <Spacer height={24} />
          <Text type="paragraph" color="black">
            {paragraph}
          </Text>
          <Spacer height={26} />

          <a href={buttonLink}>
            <Button type="primary" color="green" size="medium">
              {buttonText}
            </Button>
          </a>
        </FlexContainer>
      </FlexContainer>
    ) : (
      <FlexContainer
        className="About-content-section"
        direction="horizontal"
        primaryAlign="start"
        secondaryAlign="center"
        id="About-content-section-desktop"
      >
        <WaveBackground
          containerId="About-content-section-desktop"
          flipped={flipped}
        />

        <FlexContainer
          direction="horizontal"
          primaryAlign="start"
          secondaryAlign="start"
        >
          <FlexContainer
            direction="vertical"
            secondaryAlign="start"
            id="About-section-text--right"
          >
            <Text type="secondary-header" color="black">
              {title}
            </Text>
            <Spacer height={16} />
            <Text type="paragraph" color="black">
              {paragraph}
            </Text>
            <Spacer height={38} />
            <a href={buttonLink}>
              <Button type="primary" color="green" size="medium">
                {buttonText}
              </Button>
            </a>
          </FlexContainer>
          <Image
            src={img}
            alt={alt}
            classList={['About-content-section-img']}
          />
        </FlexContainer>
      </FlexContainer>
    )
  }

  return (
    <div id="About">
      <Head>
        <title>About | Sharing Excess</title>
      </Head>
      <PageHeader
        image={isMobile ? '/headers/about_mobile.jpeg' : '/headers/about.jpeg'}
        label="ABOUT US"
        title={`Rescuing and redistrubuting food sustainably, and equitably.`}
      />

      <Spacer height={isMobile ? 48 : 64} />

      <FlexContainer
        direction={isMobile ? 'vertical-reverse' : 'horizontal'}
        id="About-mission-section"
      >
        <FlexContainer
          direction="vertical"
          secondaryAlign={isMobile ? 'center' : 'start'}
        >
          <Text type="secondary-header" color="black" id="About-mission-header">
            Sharing Excess connects food businesses with nonprofits in need.
          </Text>
          <Spacer height={isMobile ? 24 : 24} />
          <Text type="paragraph" color="black">
            40% of all food produced in the US goes to waste every year, while
            over 40 million people face food insecurity.
            <Spacer height={16} />
            Our mission is to bridge the gap between excess and scarcity by
            partnering with grocery stores, restaurants, wholesalers, and
            farmers to deliver surplus food to a network of nonprofits, food
            banks, and community organizations to alleviate local food
            insecurity.
          </Text>
          <Spacer height={32} />
          <ExternalLink to="https://www.usda.gov/foodwaste/faqs">
            <Button type="primary" color="green">
              Read More about Food Waste
            </Button>
          </ExternalLink>
          <Spacer height={isMobile ? 32 : 46} />
        </FlexContainer>
        {isMobile && <Spacer height={48} />}
        <FlexContainer direction="vertical">
          <Image
            src="/about/SE-Diagram-1.jpg"
            alt="Diagram"
            id="diagram-image"
          />
        </FlexContainer>
      </FlexContainer>

      <Spacer height={isMobile ? 48 : 96} />

      <ContentSectionLeft
        title="Our Story"
        img="/about/history2-crop.jpeg"
        alt="Team members smiling"
        paragraph="Starting from humble roots as a boot-strapped student startup, Sharing Excess has grown into a sustainable and growing nonprofit with over 200 community partners."
        buttonLink="https://blog.sharingexcess.com"
        buttonText="Read More on our Blog"
      />

      {<Spacer height={isMobile ? 144 : 192} />}

      <ContentSectionRight
        title="Who We Are"
        img="/about/who-we-are.jpg"
        alt="Group photo on a sunny day"
        paragraph="Sharing Excess is powered by a lean and mean team of volunteers, students, and change makers - and we're growing! Click below to meet our team and learn about joining."
        buttonText="Meet the Team"
        buttonLink="/about/team"
        flipped={false}
      />

      {<Spacer height={isMobile ? 112 : 192} />}

      <ContentSectionLeft
        title="Making an Impact"
        img="/about/impact-preview.jpg"
        alt="Palettes of produce"
        paragraph="What started as a few extra meal swipes has grown to over 500,000 lbs. of food rescued every month. Learn more about how we're changing the food waste equation."
        buttonLink="/impact"
        buttonText="Dig In to Our Impact Data"
      />

      {<Spacer height={isMobile ? 144 : 192} />}

      <ContentSectionRight
        title="Working with the Community"
        img="/about/partners-preview.jpg"
        alt="Sharing Excess receives a ten thousand dollar donation check from Giant"
        paragraph="Nothing we do would be possible without the support of our local partners and donors. Learn more about how your organization can help fight food waste."
        buttonLink="/about/partners"
        buttonText="Check Out Our Partners"
        flipped={true}
      />

      {<Spacer height={isMobile ? 112 : 192} />}

      <ContentSectionLeft
        title="Keep Up with SE!"
        img="/about/blog-img.jpg"
        alt="Volunteers with Free Food signs"
        paragraph="At Sharing Excess, we're constantly growing, expanding, and partnering in new and exciting ways. Follow our blog to stay up to date with all that's new at SE."
        buttonLink="htt[s://blog.sharingexcess.com"
        buttonText="Visit Our Blog"
      />
    </div>
  )
}
