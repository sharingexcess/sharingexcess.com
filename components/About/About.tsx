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

  function ContentSection({ title, img }: Record<any, any>) {
    return isMobile ? (
      <FlexContainer
        className="About-content-section"
        direction={isMobile ? 'vertical' : 'horizontal'}
        primaryAlign="start"
        secondaryAlign="center"
      >
        <Text type="secondary-header" color="green">
          {title}
        </Text>
        <Image
          src={img}
          alt="About Sharing Excess"
          classList={['About-content-section-img']}
        />
        <Spacer height={16} />
        <Text type="paragraph" color="black">
          But as vast a problem as food waste is, the solution often boils down
          to simple last mile logistics and delivery.{' '}
          <span className="green">Sharing Excess</span> is meeting this
          challenge with the power of people, technology, and compassion.
        </Text>
        <Spacer height={38} />
        <Button type="primary" color="green" size="medium">
          Read More on Our Blog
        </Button>
      </FlexContainer>
    ) : (
      <FlexContainer
        className="About-content-section"
        direction={isMobile ? 'vertical' : 'horizontal'}
        primaryAlign="start"
        secondaryAlign="center"
      >
        <Image
          src="/about/history2.png"
          alt="About Sharing Excess"
          classList={['About-content-section-img']}
        />
        <Spacer width={126} />
        <FlexContainer
          direction="horizontal"
          primaryAlign={isMobile ? 'center' : 'start'}
          secondaryAlign={isMobile ? 'center' : 'start'}
        >
          <FlexContainer direction="vertical" secondaryAlign="start">
            <Text type="secondary-header" color="green">
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
      <Spacer height={isMobile ? 48 : 64} />
      <FlexContainer direction="horizontal" id="About-mission-section">
        <Spacer height={48} />

        <FlexContainer direction="vertical" secondaryAlign="start">
          <Text type="secondary-header" color="green">
            {/* make this ehader more significant */}
            Using surplus as a <br></br> solution to scarcity.
          </Text>
          <Spacer height={16} />
          <Text type="paragraph" color="black">
            Sharing Excess uses surplus as a solution to scarcity. While over 40
            million people in the US face food insecurity, nearly 40% of the
            nation's food supply is going to waste. Our mission is to bridge the
            gap between excess and scarcity by partnering with grocery stores,
            restaurants, wholesalers, and farmers to deliver surplus food to a
            network of nonprofits, food banks, and community organizations to
            alleviate local food insecurity.
          </Text>

          <Spacer height={46} />
        </FlexContainer>
        <Image src="/about/SE-Diagram-1.jpg" alt="Diagram" id="diagram-image" />
      </FlexContainer>
      <Spacer height={96} />
      <ContentSection title="Our Story" img="/about/popup.gif" />
      {/* <Spacer height={96} /> */}
      <FlexContainer
        className="About-content-section"
        direction={isMobile ? 'vertical-reverse' : 'horizontal'}
        primaryAlign="start"
        secondaryAlign="center"
      >
        <Image
          src="/about/backgroundcolor-1.svg"
          alt="Background Color"
          classList={['About-background-wave-img']}
        />
        <FlexContainer
          direction="horizontal"
          primaryAlign={isMobile ? 'center' : 'start'}
          secondaryAlign={isMobile ? 'center' : 'start'}
        >
          <FlexContainer direction="vertical" secondaryAlign="start">
            <Text
              type="secondary-header"
              color="green"
              id="About-secondary-header"
            >
              Who We Are
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
              Meet the Team
            </Button>
          </FlexContainer>
        </FlexContainer>
        <Spacer width={126} />
        <Image
          src="/about/who-we-are.jpg"
          alt="About Sharing Excess"
          classList={['About-content-section-img']}
        />
      </FlexContainer>
      {/* <Spacer height={96} /> */}
      <FlexContainer
        className="About-content-section"
        direction={isMobile ? 'vertical-reverse' : 'horizontal'}
        primaryAlign="start"
        secondaryAlign="center"
      >
        <Image
          src="/about/impact-preview.jpg"
          alt="About Sharing Excess"
          classList={['About-content-section-img']}
        />
        <Spacer width={126} />
        <FlexContainer
          direction="horizontal"
          primaryAlign={isMobile ? 'center' : 'start'}
          secondaryAlign={isMobile ? 'center' : 'start'}
        >
          <FlexContainer direction="vertical" secondaryAlign="start">
            <Text
              type="secondary-header"
              color="green"
              id="About-secondary-header"
            >
              Our Impact
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
      {/* <Spacer height={isMobile ? 8 : 96} /> */}
      <FlexContainer
        className="About-content-section"
        direction={isMobile ? 'vertical-reverse' : 'horizontal'}
        primaryAlign="start"
        secondaryAlign="center"
      >
        <Image
          src="/about/backgroundcolor-2.svg"
          alt="Background Color"
          classList={['About-background-wave-img']}
        />

        <FlexContainer
          direction="horizontal"
          primaryAlign={isMobile ? 'center' : 'start'}
          secondaryAlign={isMobile ? 'center' : 'start'}
        >
          <FlexContainer direction="vertical" secondaryAlign="start">
            <Text
              type="secondary-header"
              color="green"
              id="About-secondary-header"
            >
              Partners
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
              Learn More
            </Button>
          </FlexContainer>
        </FlexContainer>
        <Spacer width={126} />
        <Image
          src="/about/partners-preview.jpg"
          alt="About Sharing Excess"
          classList={['About-content-section-img']}
        />
      </FlexContainer>
      {/* <Spacer height={96} /> */}
      <FlexContainer
        className="About-content-section"
        direction={isMobile ? 'vertical-reverse' : 'horizontal'}
        primaryAlign="start"
        secondaryAlign="center"
      >
        <Image
          src="/about/blog-img.jpg"
          alt="About Sharing Excess"
          classList={['About-content-section-img']}
        />
        <Spacer width={126} />
        <FlexContainer
          direction="horizontal"
          primaryAlign={isMobile ? 'center' : 'start'}
          secondaryAlign={isMobile ? 'center' : 'start'}
        >
          <FlexContainer direction="vertical" secondaryAlign="start">
            <Text type="secondary-header" color="green">
              Keep up with SE!
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
              Visit Our Blog
            </Button>
          </FlexContainer>
        </FlexContainer>
      </FlexContainer>
    </div>
  )
}
