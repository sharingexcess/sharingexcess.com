import { Spacer } from '@sharingexcess/designsystem'
import { PageHeader } from 'components/PageHeader/PageHeader'
import { FlexContainer, Image, Text } from 'designsystem'
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
      <Spacer height={isMobile ? 48 : 64} />
      <div id="stat-container">
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
      </div>
      <Spacer height={96} />
      <Image
        src="/impact/cumulative-impact.png"
        alt="Diagram"
        id="cumulative-impact"
      />
    </div>
  )
}
