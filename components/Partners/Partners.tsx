import {
  FlexContainer,
  Spacer,
  Text,
  Image,
  Button,
} from '@sharingexcess/designsystem'
import { PageHeader } from 'components'
import { partners } from 'content/partners'
import { useIsMobile } from 'hooks'
import Head from 'next/head'
import React, { FC } from 'react'

export const Partners: FC = () => {
  const isMobile = useIsMobile()
  return (
    <div id="Partners">
      <Head>
        <title>Partners | Sharing Excess</title>
      </Head>
      <PageHeader
        image="/about/partners-preview.jpg"
        label="our partners"
        title="Working with the community to serve the community."
      />

      <Spacer height={isMobile ? 48 : 96} />
      <FlexContainer
        className="Partners-header-and-text"
        direction={isMobile ? 'vertical' : 'horizontal'}
      >
        <Image src="/about/partners_red_bull.jpg" alt="Partnerships" />
        <Spacer width={64} height={32} />
        <FlexContainer direction="vertical">
          <Text type="secondary-header" color="green" align={'left'}>
            Connecting for-profit, non-profit, and everyone in between.
          </Text>
          <Spacer height={isMobile ? 24 : 32} />
          <Text type="paragraph" color="black" align={'left'}>
            Our mission is to change the food waste equation, and that's only
            possible when we all work together to rescue and redistribute
            surplus food. We're working to provide the missing link between
            businesses, foundations, individual donors, and the communities most
            in need.
          </Text>
        </FlexContainer>
      </FlexContainer>

      <Spacer height={isMobile ? 48 : 98} />

      <Text type="small-header" align="center">
        Featured partners
      </Text>
      <Spacer height={48} />

      <div id="Partners-grid">
        {partners.map(partner => (
          <div key={partner.alt} className="Partners-logo">
            <Image
              src={partner.image}
              alt={partner.alt}
              classList={['Partners-logo-img']}
            />
          </div>
        ))}
      </div>

      <Spacer height={isMobile ? 64 : 120} />

      <FlexContainer
        className="Partners-header-and-text"
        direction={isMobile ? 'vertical' : 'horizontal'}
      >
        <Image src="/about/partners_ymca.jpg" alt="Partnerships" />
        <Spacer width={64} height={32} />
        <FlexContainer
          direction="vertical"
          secondaryAlign={isMobile ? 'center' : 'start'}
        >
          <Text
            type="secondary-header"
            color="green"
            align={isMobile ? 'center' : 'left'}
          >
            Partner With Us
          </Text>
          <Spacer height={isMobile ? 24 : 32} />
          <Text
            type="paragraph"
            color="black"
            align={isMobile ? 'center' : 'left'}
          >
            Whether your organization can provide food, funding, volunteers, or
            support, we'd love to start a conversation. Sharing Excess works
            with over 200 local partners to help redistribute surplus food, and
            we can't wait to hear how you'd like to get involved.
          </Text>
          <Spacer height={32} />
          <a href="/contact">
            <Button type="primary" color="green">
              Start A Partnership
            </Button>
          </a>
        </FlexContainer>
      </FlexContainer>
    </div>
  )
}
