import {
  Button,
  Spacer,
  FlexContainer,
  Image,
  Text,
  ExternalLink,
} from '@sharingexcess/designsystem'
import { PageHeader } from 'components/PageHeader/PageHeader'
import { WaveBackground } from 'components/WaveBackground/WaveBackground'
import { useIsMobile } from 'hooks'
import Head from 'next/head'
import React, { FC } from 'react'

export const Impact: FC = () => {
  const isMobile = useIsMobile()
  return (
    <div id="Impact-page">
      <Head>
        <title>Impact | Sharing Excess</title>
      </Head>
      <PageHeader
        image="/headers/impact.png"
        label="impact"
        title={`Our contribution to a waste-free world.`}
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
            src="/impact/pwpm-tomatoes.png"
            alt="Diagram"
            classList={['stat-img']}
          />
          <Spacer height={12} />
          <Text type="secondary-header" color="green" align="center">
            10,050,698
          </Text>
          <Spacer height={8} />
          <Text type="small-header" align="center">
            pounds of food rescued since 2018
          </Text>
          <Spacer height={16} />
          <Text type="small" align="center">
            That’s roughly equivalent to 330 full size tractor trailers worth of
            food, or 571 school busses, or 180 humpback whales, or 1515 orca
            whales... take your pick!
          </Text>
        </FlexContainer>

        <FlexContainer
          direction="vertical"
          primaryAlign="start"
          secondaryAlign="center"
          className="stat-container-col"
        >
          <Image
            src="/impact/retail.png"
            alt="Diagram"
            classList={['stat-img']}
          />
          <Spacer height={12} />
          <Text type="secondary-header" color="green" align="center">
            $19,585,300
          </Text>
          <Spacer height={8} />
          <Text type="small-header" align="center">
            total retail value of food rescued
          </Text>
          <Spacer height={8} />
          <Text type="small" align="center">
            This is all value that we’re proud to get back in the hands of the
            communities we serve, instead of letting it go to waste in a
            landfill.
          </Text>
        </FlexContainer>

        <FlexContainer
          direction="vertical"
          primaryAlign="start"
          secondaryAlign="center"
          className="stat-container-col"
        >
          <Image src="/impact/co2.png" alt="Diagram" classList={['stat-img']} />
          <Spacer height={12} />
          <Text type="secondary-header" color="green" align="center">
            36,785,554
          </Text>
          <Spacer height={8} />
          <Text type="small-header" align="center">
            pounds of co2 diverted
          </Text>
          <Spacer height={8} />
          <Text type="small" align="center">
            Food waste accounts for about 8% of all global greenhouse gas
            emissions. If food waste were a country, it would be the third
            largest contributor to global warming.
          </Text>
        </FlexContainer>
      </FlexContainer>
      <Spacer height={isMobile ? 16 : 124} />
      <iframe src="https://fortress.maptive.com/ver4/fd5a838add7600ab10fc995f76cce2ce" />

      <Spacer height={isMobile ? 16 : 196} />
      <FlexContainer
        direction={isMobile ? 'vertical' : 'horizontal'}
        id="Impact-annual-report-section"
      >
        <WaveBackground containerId="Impact-annual-report-section" />
        <Image
          src="/impact/reports.png"
          id="Impact-annual-report-image"
          alt="Annual Report"
        />
        <Spacer height={32} width={96} />
        <FlexContainer direction="vertical" secondaryAlign="start">
          <Text type="secondary-header">Annual Reports</Text>
          <Spacer height={22} />
          <Text type="paragraph">
            Take a look at our annual reports over the last couple years. A lot
            of hard work went into making this impact possible, and we're proud
            to show you everything that went into it.
          </Text>
          <Spacer height={22} />
          <FlexContainer primaryAlign="start">
            <ExternalLink to="/reports/2020.pdf">
              <Button type="primary" size="medium" color="green">
                2020 Report
              </Button>
            </ExternalLink>
            <Spacer width={16} />
            <ExternalLink to="/reports/2021.pdf">
              <Button type="primary" size="medium" color="green">
                2021 Report
              </Button>
            </ExternalLink>
          </FlexContainer>
        </FlexContainer>
      </FlexContainer>

      <Spacer height={isMobile ? 64 : 192} />
      <FlexContainer direction="vertical" id="Impact-metric-section">
        <Text type="primary-header" align="center">
          $1 = 20 pounds of food rescued.
        </Text>
        <Spacer height={22} />
        <Text type="paragraph" align={isMobile ? 'left' : 'center'}>
          Your donation goes a long way at Sharing Excess. $1 = 20 pounds of
          food delivered = 16 meals served = $57.20 in retail value = 73.2
          pounds of greenhouse gasses reduced.
        </Text>
        <Spacer height={22} />
        <Button type="primary" size="large" color="green">
          Start A Donation
        </Button>
        <Spacer height={64} />
        <Image
          src="/impact/footer.jpg"
          alt="Food distribution at Drexel University"
          id="Impact-metric-section-img"
        />
      </FlexContainer>
    </div>
  )
}
