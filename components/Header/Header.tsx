import React, { FC, useState } from 'react'
import { Button, Image } from 'components/SEDS'
import { PageLinks } from './Header.children'
import Head from 'next/head'
import Link from 'next/link'
import { useWidth } from 'hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'

export const Header: FC = () => {
  const width = useWidth()
  const isCondensed = width && width < 1000
  const [menu, setMenu] = useState(false)

  const toggleMenu = () => setMenu(currMenu => !currMenu)
  return (
    <>
      <Head>
        <title>Sharing Excess | Let&apos;s Free Food!</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
      <header id="Header">
        <Link href="/">
          <a id="Header-logo">
            <Image src="/logo.png" alt="Sharing Excess Logo" />
          </a>
        </Link>
        {!isCondensed && <PageLinks color="white" />}
        <Button type="primary" id="Header-donate">
          Donate
        </Button>
        <Button type="secondary" id="Header-sign-in">
          Sign In
        </Button>
        {isCondensed && (
          <Button type="tertiary" id="Header-menu-button" handler={toggleMenu}>
            <FontAwesomeIcon icon={faBars} id="Header-menu-icon" />
          </Button>
        )}
        {menu ? (
          <aside id="Header-menu">
            <Button
              type="tertiary"
              id="Header-menu-button"
              handler={toggleMenu}
            >
              <FontAwesomeIcon icon={faBars} id="Header-menu-icon" />
            </Button>
            <PageLinks color="black" />
          </aside>
        ) : null}
      </header>
    </>
  )
}
