import React, { FC, useEffect, useState } from 'react'
import { Button, Image } from '@sharingexcess/designsystem'
import { PageLinks } from './Header.children'
import Head from 'next/head'
import Link from 'next/link'
import { useWidth } from 'hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { useScrollPosition } from 'hooks/useScrollPosition'

export const Header: FC = () => {
  const width = useWidth()
  const scroll = useScrollPosition()
  const [prevScroll, setPrevScroll] = useState(scroll)
  const [background, setBackground] = useState(false)
  const isCondensed = width && width < 1000
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    console.log(scroll, prevScroll)
    if (scroll < 100) {
      setBackground(false)
    } else if (scroll > 100 && scroll > prevScroll) {
      setBackground(true)
    } else if (scroll < prevScroll) {
      setBackground(true)
    }
    setPrevScroll(scroll)
  }, [scroll]) // eslint-disable-line

  useEffect(() => {
    console.log('background is', background)
  }, [background])

  const toggleMenu = () => setMenu(currMenu => !currMenu)

  return (
    <>
      <Head>
        <title>Sharing Excess | Let&apos;s Free Food!</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
      <header id="Header" className={background ? 'with-background' : ''}>
        <Link href="/">
          <a id="Header-logo">
            <Image src="/logo.png" alt="Sharing Excess Logo" />
          </a>
        </Link>
        {!isCondensed && <PageLinks color={background ? 'black' : 'white'} />}
        <Button
          type="primary"
          id="Header-donate"
          color={background ? 'green' : 'white'}
        >
          Donate
        </Button>
        <Button
          type="secondary"
          color={background ? 'green' : 'white'}
          id="Header-sign-in"
        >
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
