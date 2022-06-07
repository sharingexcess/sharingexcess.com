import {
  FlexContainer,
  Spacer,
  Text,
  Image,
  Button,
} from '@sharingexcess/designsystem'
import { PageHeader } from 'components'
import { useIsMobile } from 'hooks'
import React, { FC } from 'react'

export const Partners: FC = () => {
  const isMobile = useIsMobile()
  return (
    <div id="Partners">
      <PageHeader
        image={isMobile ? '/headers/about_mobile.jpeg' : '/headers/team.png'}
        label="partners"
        title={`Accessing surplus to capture and distribute.`}
      />

      <Spacer height={isMobile ? 96 : 48} />
      <FlexContainer direction="vertical" className="Partners-header-and-text">
        <Text type="secondary-header" color="green" align="center">
          Working With The Community
        </Text>
        <Spacer height={32} />
        <Text
          type="paragraph"
          color="black"
          align={isMobile ? 'left' : 'center'}
        >
          We’ve worked with over 200 partners, and we’ve highlighted some
          collaborations below. consectetur adipiscing elit. Etiam eu turpis
          molestie, dictum est a, mattis tellus. Sed dignissim, metus nec
          fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus
          elit sed risus.
        </Text>
        <Spacer height={98} />
      </FlexContainer>

      <div id="Partners-grid">
        <div className="Partners-logo">
          <Image
            src="/partners/example-partner.jpg"
            alt="Giant logo"
            classList={['Partners-logo-img']}
          />
        </div>

        <div className="Partners-logo">
          <Image
            src="/partners/example-partner.jpg"
            alt="Giant logo"
            classList={['Partners-logo-img']}
          />
        </div>

        <div className="Partners-logo">
          <Image
            src="/partners/example-partner.jpg"
            alt="Giant logo"
            classList={['Partners-logo-img']}
          />
        </div>

        <div className="Partners-logo">
          <Image
            src="/partners/example-partner.jpg"
            alt="Giant logo"
            classList={['Partners-logo-img']}
          />
        </div>
        <div className="Partners-logo">
          <Image
            src="/partners/example-partner.jpg"
            alt="Giant logo"
            classList={['Partners-logo-img']}
          />
        </div>
        <div className="Partners-logo">
          <Image
            src="/partners/example-partner.jpg"
            alt="Giant logo"
            classList={['Partners-logo-img']}
          />
        </div>
        <div className="Partners-logo">
          <Image
            src="/partners/example-partner.jpg"
            alt="Giant logo"
            classList={['Partners-logo-img']}
          />
        </div>
        <div className="Partners-logo">
          <Image
            src="/partners/example-partner.jpg"
            alt="Giant logo"
            classList={['Partners-logo-img']}
          />
        </div>
        <div className="Partners-logo">
          <Image
            src="/partners/example-partner.jpg"
            alt="Giant logo"
            classList={['Partners-logo-img']}
          />
        </div>
        <div className="Partners-logo">
          <Image
            src="/partners/example-partner.jpg"
            alt="Giant logo"
            classList={['Partners-logo-img']}
          />
        </div>
        <div className="Partners-logo">
          <Image
            src="/partners/example-partner.jpg"
            alt="Giant logo"
            classList={['Partners-logo-img']}
          />
        </div>
        <div className="Partners-logo">
          <Image
            src="/partners/example-partner.jpg"
            alt="Giant logo"
            classList={['Partners-logo-img']}
          />
        </div>
      </div>

      <Spacer height={120} />

      <FlexContainer direction="vertical" className="Partners-header-and-text">
        <Text type="secondary-header" color="green" align="center">
          Partner With Us
        </Text>
        <Spacer height={32} />
        <Text
          type="paragraph"
          color="black"
          align={isMobile ? 'left' : 'center'}
        >
          We’ve worked with over 200 partners, and we’ve highlighted some
          collaborations below. consectetur adipiscing elit. Etiam eu turpis
          molestie, dictum est a, mattis tellus. Sed dignissim, metus nec
          fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus
          elit sed risus.
        </Text>
        <Spacer height={32} />
        <Button type="primary" color="green">
          Start A Partnership
        </Button>
      </FlexContainer>

      <Spacer height={120} />
      <FlexContainer
        direction="vertical"
        primaryAlign="center"
        secondaryAlign="center"
      >
        {/* <Image
          src="/partners/partners-bg.svg"
          alt="Background Color"
          classList={['Partners-background-wave-img']}
        /> */}

        <FlexContainer
          direction="vertical"
          className="Partners-header-and-text"
        >
          <Text type="secondary-header" color="black" align="center">
            Collaborations
          </Text>
          <Spacer height={32} />
          <Text type="paragraph" color="black" align="center">
            These incredible collaborations tell a story. consectetur adipiscing
            elit. Etiam eu turpis molestie, dictum est a, mattis tellus.
            consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a,
            mattis tellus.{' '}
          </Text>
        </FlexContainer>
      </FlexContainer>
    </div>
  )
}
