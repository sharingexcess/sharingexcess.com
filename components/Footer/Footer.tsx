import { Image, Text, ExternalLink, Button } from '@sharingexcess/designsystem'
import React, { FC } from 'react'
import Link from 'next/link'
import { useIsMobile } from 'hooks'

export const Footer: FC = () => {
  const isMobile = useIsMobile()

  return (
    <div id="Footer">
      <Image src="/logos/green.png" alt="Sharing Excess Logo" />
      <nav id="Footer-links">
        <Button type="tertiary">
          <Link href="/">Home</Link>
        </Button>

        <Button type="tertiary">
          <Link href="/about">About</Link>
        </Button>

        <Button type="tertiary">
          <Link href="/news">News</Link>
        </Button>

        <Button type="tertiary">
          <Link href="/campus">Campus</Link>
        </Button>

        <Button type="tertiary">
          <Link href="/donate">Donate</Link>
        </Button>

        <Button type="tertiary">
          <Link href="/contact">Contact</Link>
        </Button>
      </nav>
      <div id="Footer-legal">
        <Text type="small" color="grey" align={isMobile ? 'center' : 'right'}>
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
          <ExternalLink to="mailto:contact@sharingexcess.com">
            <Button type="tertiary" size="small" color="green">
              contact@sharingexcess.com
            </Button>
          </ExternalLink>
        </div>
      </div>
    </div>
  )
}
