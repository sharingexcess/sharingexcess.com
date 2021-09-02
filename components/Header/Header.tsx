import React, { FC } from 'react'
import { Button, Image } from 'components/SEDS'
import { PageLinks } from './Header.children'
import Head from 'next/head'

export const Header: FC = () => {
  return (
    <>
      <Head>
        <title>Sharing Excess | Let&apos;s Free Food!</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
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
    </>
  )
}
