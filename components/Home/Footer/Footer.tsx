import { Image, Text, ExternalLink, Button } from '@sharingexcess/designsystem'
import React, { FC } from 'react'

export const Footer: FC = () => {
  return (
    <div id="Footer">
      <Image src="/logo.png" alt="Sharing Excess Logo" />
      <div>
        <Text type="small" color="grey">
          Federation of Neighborhood Centers is the 501(c)(3) fiscal agent of
          Sharing Excess, therefore all donations are tax-deductible. Nonprofit
          Tax ID/EIN: 23-1630073. “Sharing Excess” is a registered trademark
          (TM). All rights reserved.
        </Text>
        <div>
          <ExternalLink to="tel:18337427397">
            <Button type="tertiary" size="small" color="green">
              1-833-SHAREXS
            </Button>
          </ExternalLink>
          {' | '}
          <ExternalLink to="mailto:tech@sharingexcess.com">
            <Button type="tertiary" size="small" color="green">
              tech@sharingexcess.com
            </Button>
          </ExternalLink>
        </div>
      </div>
    </div>
  )
}
