import React, { FC } from 'react'
import { Button, Image } from 'components/SEDS'
import { PageLinks } from './Header.children'

export const Header: FC = () => {
  return (
    <header id="Header">
      <Image src="/logo.png" alt="Sharing Excess Logo" id="Header-logo" />
      <PageLinks />
      <Button type="primary" id="Header-donate">
        Donate
      </Button>
      <Button type="secondary" id="Header-sign-in">
        Sign In
      </Button>
    </header>
  )
}
