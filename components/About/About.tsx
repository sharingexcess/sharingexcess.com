import React, { FC } from 'react'
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

export const About: FC = () => {
  const isMobile = useIsMobile()

  function ContentSectionLeft({
    title,
    img,
    alt,
    paragraph,
    buttonLink,
    buttonText,
    isExternal,
  }: Record<any, any>) {
    return isMobile ? (
      <FlexContainer
        className="About-content-section"
        direction="vertical"
        primaryAlign="start"
        secondaryAlign="center"
        id="About-content-section-left"
      >
        <Text
          type="secondary-header"
          color="black"
          classList={['About-content-section-header']}
        >
          {title}
        </Text>
        <Spacer height={24} />
        <Image src={img} alt={alt} classList={['About-content-section-img']} />
        <Spacer height={24} />
        <Text type="paragraph" color="black">
          {paragraph}
        </Text>
        <Spacer height={26} />
        <a
          href={buttonLink}
          target={isExternal ? '_blank' : undefined}
          rel="noreferrer"
        >
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
            <a
              href={buttonLink}
              target={isExternal ? '_blank' : undefined}
              rel="noreferrer"
            >
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
          <Text
            type="secondary-header"
            color="black"
            classList={['About-content-section-header']}
          >
            {title}
          </Text>
          <Spacer height={24} />
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
        image={isMobile ? '/headers/about_mobile.png' : '/headers/about.png'}
        label="ABOUT US"
        title={`Scaling human compassion,\none city at a time.`}
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
            Sharing Excess delivers surplus food to communities in need.
          </Text>
          <Spacer height={isMobile ? 24 : 24} />
          <Text type="paragraph" color="black">
            40% of all food produced in the US goes to waste every year, while
            over 40 million people experience food insecurity.
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
              Read More About The Problem
            </Button>
          </ExternalLink>
          <Spacer height={isMobile ? 32 : 46} />
        </FlexContainer>
        {isMobile && <Spacer height={48} />}
        <FlexContainer direction="vertical">
          <Image src="/about/diagram.png" alt="Diagram" id="diagram-image" />
        </FlexContainer>
      </FlexContainer>

      <Spacer height={isMobile ? 48 : 96} />

      <ContentSectionLeft
        title="Our Story"
        img="/about/about_story.png"
        alt="Team members smiling"
        paragraph="
        What started as a grassroots effort on a college campus in 2018 has grown to a national movement that has fed hundreds of thousands of people."
        buttonLink="https://www.phillymag.com/be-well-philly/2021/02/23/sharingexcess/"
        buttonText="Read More About Our Story"
        isExternal
      />

      {<Spacer height={isMobile ? 192 : 256} />}

      <ContentSectionRight
        title="Who We Are"
        img="/about/who-we-are.jpg"
        alt="Group photo on a sunny day"
        paragraph="Sharing Excess was brought to life by a team of change makers, innovators, and problem solvers who believe food should be shared, not wasted - and we’re growing! Click below to meet our team, and learn more about joining."
        buttonText="Meet the Team"
        buttonLink="/about/team"
        flipped={false}
      />

      {<Spacer height={isMobile ? 192 : 256} />}

      <ContentSectionLeft
        title="Our Impact"
        img="/about/impact-preview.jpg"
        alt="Palettes of produce"
        paragraph="What started as a few extra meal swipes has grown to over 500,000 lbs. of food rescued every month. Learn more about how we're changing the food waste equation."
        buttonLink="/impact"
        buttonText="Learn More"
      />

      {<Spacer height={isMobile ? 192 : 256} />}

      <ContentSectionRight
        title="Our Partners"
        img="/about/about_community.png"
        alt="Sharing Excess receives a ten thousand dollar donation check from Giant"
        paragraph="Together with businesses, foundations, and organizations we make the magic of Sharing Excess come to life. Learn more about how you can partner with us."
        buttonLink="/about/partners"
        buttonText="Check Out Our Partners"
        flipped={true}
      />

      {<Spacer height={isMobile ? 192 : 256} />}

      <ContentSectionLeft
        title="Keep Up with SE!"
        img="/about/about_blog.jpg"
        alt="Volunteers with Free Food signs"
        paragraph="At Sharing Excess, we're constantly growing, expanding, and partnering in new and exciting ways. Follow our blog to stay up to date with all that's new at SE."
        buttonLink="https://medium.com/sharing-excess"
        isExternal
        buttonText="Visit Our Blog"
      />
    </div>
  )
}
