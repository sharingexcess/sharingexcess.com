import { FlexContainer, Spacer, Text, Image } from '@sharingexcess/designsystem'
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
      <FlexContainer direction="vertical" className="Partners-header-text">
        <Text type="secondary-header" color="green">
          Working with the community
        </Text>
        <Spacer height={32} />
        <Text type="paragraph" color="black" align="center">
          We’ve worked with over 200 partners, and we’ve highlighted some
          collaborations below. consectetur adipiscing elit. Etiam eu turpis
          molestie, dictum est a, mattis tellus. Sed dignissim, metus nec
          fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus
          elit sed risus.
        </Text>
        <Spacer height={98} />
      </FlexContainer>
    </div>
  )
}
