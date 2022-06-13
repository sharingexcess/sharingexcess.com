import {
  Button,
  Spacer,
  FlexContainer,
  Image,
  Text,
} from '@sharingexcess/designsystem'
import { PageHeader } from 'components/PageHeader/PageHeader'
import { useIsMobile } from 'hooks'
import Head from 'next/head'
import React, { FC } from 'react'

export const Impact: FC = () => {
  const isMobile = useIsMobile()
  return (
    <div id="Impact">
      <Head>
        <title>Impact | Sharing Excess</title>
      </Head>
      <PageHeader
        image={isMobile ? '/headers/about_mobile.jpeg' : '/headers/team.png'}
        label="impact"
        title={`Driven by results.`}
      />
      <Spacer height={isMobile ? 32 : 64} />
      <FlexContainer
        direction={isMobile ? 'vertical' : 'horizontal'}
        primaryAlign="center"
        secondaryAlign={isMobile ? 'center' : 'start'}
        id="stat-container"
      >
        <FlexContainer
          direction="vertical"
          primaryAlign="start"
          secondaryAlign="center"
          className="stat-container-col"
        >
          <Image
            src="/impact/pwpm-tomatoes.jpg"
            alt="Diagram"
            classList={['stat-img']}
          />
          <Spacer height={12} />
          <Text type="secondary-header" color="green" align="center">
            8,123,456
          </Text>
          <Spacer height={8} />
          <Text type="small-header" align="center">
            pounds of food rescued since 2018
          </Text>
          <Spacer height={8} />
          <Text type="paragraph">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
            vulputate libero et velit interdum, ac aliquet odio mattis. Class
            aptent taciti sociosqu ad litora.
          </Text>
        </FlexContainer>

        <FlexContainer
          direction="vertical"
          primaryAlign="start"
          secondaryAlign="center"
          className="stat-container-col"
        >
          <Image
            src="/impact/pwpm-tomatoes.jpg"
            alt="Diagram"
            classList={['stat-img']}
          />
          <Spacer height={12} />
          <Text type="secondary-header" color="green" align="center">
            $14,635,272
          </Text>
          <Spacer height={8} />
          <Text type="small-header" align="center">
            total retail value of rescued food
          </Text>
          <Spacer height={8} />
          <Text type="paragraph">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
            vulputate libero et velit interdum, ac aliquet odio mattis. Class
            aptent taciti sociosqu ad litora.
          </Text>
        </FlexContainer>

        <FlexContainer
          direction="vertical"
          primaryAlign="start"
          secondaryAlign="center"
          className="stat-container-col"
        >
          <Image
            src="/impact/pwpm-tomatoes.jpg"
            alt="Diagram"
            classList={['stat-img']}
          />
          <Spacer height={12} />
          <Text type="secondary-header" color="green" align="center">
            28,985,942
          </Text>
          <Spacer height={8} />
          <Text type="small-header" align="center">
            pounds of co2 diverted from landfills
          </Text>
          <Spacer height={8} />
          <Text type="paragraph">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
            vulputate libero et velit interdum, ac aliquet odio mattis. Class
            aptent taciti sociosqu ad litora.
          </Text>
        </FlexContainer>
      </FlexContainer>
      <Spacer height={isMobile ? 16 : 124} />
      <Image
        src="/impact/cumulative-impact.png"
        alt="Diagram"
        id="cumulative-impact-img"
      />

      <Spacer height={isMobile ? 16 : 124} />
      <FlexContainer direction="vertical" id="Impact-annual-report-section">
        <Text type="small-header" align="center">
          Annual Report
        </Text>
        <Spacer height={22} />
        <Text type="paragraph" align="center">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
          vulputate libero et velit interdum, ac aliquet odio mattis. Class
          aptent taciti sociosqu ad litora torquent per conubia
        </Text>
        <Spacer height={22} />
        <Button type="primary" size="medium" color="green">
          Full Report
        </Button>
      </FlexContainer>

      <Spacer height={isMobile ? 64 : 124} />
      <FlexContainer direction="vertical" id="Impact-metric-section">
        <Image
          src="/partners/partners-bg.svg"
          alt="Background Color"
          classList={['Impact-background-wave-img']}
        />

        <Text type="primary-header" align="center">
          $1 = 16 meals served
        </Text>
        <Spacer height={22} />
        <Text type="paragraph" align={isMobile ? 'left' : 'center'}>
          Every dollar donated contributes to this metric. One dollar goes to 20
          pounds of food delivered, $57.20 in food value, and 73.2 pounds of
          greenhouse gases reduced.
        </Text>
        <Spacer height={32} />
        <Image
          src="/impact/drexel-popup.jpg"
          alt="Food distribution at Drexel University"
          id="Impact-metric-section-img"
        />
        <Spacer height={22} />
        <Button type="primary" size="large" color="green">
          Start A Donation
        </Button>
      </FlexContainer>
    </div>
  )
}
