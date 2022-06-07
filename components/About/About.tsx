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
import { useRouter } from 'next/router'
import { getAnalytics, logEvent } from 'firebase/analytics'
import Link from 'next/link'
import { areCookiesEnabled } from '@firebase/util'

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
      >
        <Text type="secondary-header" color="green">
          {title}
        </Text>
        <Spacer height={18} />
        <Image src={img} alt={alt} classList={['About-content-section-img']} />
        <Spacer height={24} />
        <Text type="paragraph" color="black">
          {paragraph}
        </Text>
        <Spacer height={26} />
        <Link href={buttonLink} passHref>
          <Button type="primary" color="green" size="medium">
            {buttonText}
          </Button>
        </Link>
      </FlexContainer>
    ) : (
      <FlexContainer
        className="About-content-section"
        direction="horizontal"
        primaryAlign="start"
        secondaryAlign="center"
      >
        <Image src={img} alt={alt} classList={['About-content-section-img']} />
        {/* <Spacer width={126} /> */}
        <FlexContainer
          direction="horizontal"
          primaryAlign="start"
          secondaryAlign="start"
          id="About-section-text--left"
        >
          <FlexContainer direction="vertical" secondaryAlign="start">
            <Text type="secondary-header" color="green">
              {title}
            </Text>
            <Spacer height={16} />
            <Text type="paragraph" color="black">
              {paragraph}
            </Text>
            <Spacer height={38} />
            <Link href={buttonLink} passHref>
              <Button type="primary" color="green" size="medium">
                {buttonText}
              </Button>
            </Link>
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
    bgImg,
  }: Record<any, any>) {
    return isMobile ? (
      <FlexContainer
        className="About-content-section"
        direction="vertical"
        primaryAlign="start"
        secondaryAlign="center"
      >
        <Image
          src={bgImg}
          alt="Background Color"
          classList={['About-background-wave-img']}
        />

        <Text type="secondary-header" color="green">
          {title}
        </Text>
        <Spacer height={18} />
        <Image src={img} alt={alt} classList={['About-content-section-img']} />
        <Spacer height={24} />
        <Text type="paragraph" color="black">
          {paragraph}
        </Text>
        <Spacer height={26} />
        {/* <Button type="primary" color="green" size="medium">
          <Link href="/">{buttonText}</Link>
        </Button> */}

        <Link href={buttonLink} passHref>
          <Button type="primary" color="green" size="medium">
            {buttonText}
          </Button>
        </Link>
      </FlexContainer>
    ) : (
      <FlexContainer
        className="About-content-section"
        direction="horizontal"
        primaryAlign="start"
        secondaryAlign="center"
      >
        <Image
          src={bgImg}
          alt="Background Color"
          classList={['About-background-wave-img']}
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
            <Text type="secondary-header" color="green">
              {title}
            </Text>
            <Spacer height={16} />
            <Text type="paragraph" color="black">
              {paragraph}
            </Text>
            <Spacer height={38} />
            <Link href={buttonLink} passHref>
              <Button type="primary" color="green" size="medium">
                {buttonText}
              </Button>
            </Link>
          </FlexContainer>
          {/* <Spacer width={126} /> */}
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
        title={`Sharing Excess is using surplus\nto fight scarcity.`}
      />

      <Spacer height={isMobile ? 28 : 64} />

      <FlexContainer
        direction={isMobile ? 'vertical' : 'horizontal'}
        id="About-mission-section"
      >
        <FlexContainer direction="vertical" secondaryAlign="center">
          <Text type="secondary-header" color="green" id="About-mission-header">
            Using surplus as a solution to scarcity.
          </Text>
          <Spacer height={isMobile ? 24 : 16} />
          <Text type="paragraph" color="black">
            Sharing Excess uses surplus as a solution to scarcity. While over 40
            million people in the US face food insecurity, nearly 40% of the
            nation&apos;s food supply is going to waste. Our mission is to
            bridge the gap between excess and scarcity by partnering with
            grocery stores, restaurants, wholesalers, and farmers to deliver
            surplus food to a network of nonprofits, food banks, and community
            organizations to alleviate local food insecurity.
          </Text>
          <Spacer height={isMobile ? 32 : 46} />
        </FlexContainer>
        <FlexContainer direction="vertical">
          <Image
            src="/about/SE-Diagram-1.jpg"
            alt="Diagram"
            id="diagram-image"
          />
          <Spacer height={16} />
          <Text type="small" color="black">
            Image caption
          </Text>
        </FlexContainer>
      </FlexContainer>

      <Spacer height={isMobile ? 64 : 96} />

      <ContentSectionLeft
        title="Our Story"
        img="/about/history2-crop.png"
        alt="Team members smiling"
        paragraph="But as vast a problem as food waste is, the solution often boils
        down to simple last mile logistics and delivery. Sharing Excess is meeting this
        challenge with the power of people, technology, and compassion."
        buttonLink="/"
        buttonText="Read More on our Blog"
      />

      <ContentSectionRight
        title="Who We Are"
        img="/about/who-we-are.jpg"
        alt="Group photo on a sunny day"
        paragraph="But as vast a problem as food waste is, the solution often boils
      down to simple last mile logistics and delivery. Sharing Excess is meeting this
      challenge with the power of people, technology, and compassion."
        buttonText="Meet the Team"
        buttonLink="/team"
        bgImg="/about/backgroundcolor-1.svg"
      />

      <ContentSectionLeft
        title="Our Impact"
        img="/about/impact-preview.jpg"
        alt="Palettes of produce"
        paragraph="But as vast a problem as food waste is, the solution often boils
        down to simple last mile logistics and delivery. Sharing Excess is meeting this
        challenge with the power of people, technology, and compassion."
        buttonLink="/impact"
        buttonText="Read More"
      />

      <ContentSectionRight
        title="Partners"
        img="/about/partners-preview.jpg"
        alt="Sharing Excess receives a ten thousand dollar donation check from Giant"
        paragraph="But as vast a problem as food waste is, the solution often boils
      down to simple last mile logistics and delivery. Sharing Excess is meeting this
      challenge with the power of people, technology, and compassion."
        buttonLink="/partners"
        buttonText="Learn More"
        bgImg="/about/backgroundcolor-2.svg"
      />

      <ContentSectionLeft
        title="Keep Up with SE!"
        img="/about/blog-img.jpg"
        alt="Volunteers with Free Food signs"
        paragraph="But as vast a problem as food waste is, the solution often boils
      down to simple last mile logistics and delivery. Sharing Excess is meeting this
      challenge with the power of people, technology, and compassion."
        buttonLink="/"
        buttonText="Visit Our Blog"
      />
    </div>
  )
}
