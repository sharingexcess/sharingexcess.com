import { FC } from 'react'
import { useRouter } from 'next/dist/client/router'
import { Button, ExternalLink, Image } from '@sharingexcess/designsystem'
import Link from 'next/link'

const pages: { title: string; path: string }[] = [
  {
    title: 'HOME',
    path: '/',
  },
  {
    title: 'ABOUT',
    path: '/about',
  },
  {
    title: 'NEWS',
    path: '/news',
  },
  {
    title: 'CAMPUS',
    path: '/campus',
  },
  {
    title: 'CONTACT',
    path: '/contact',
  },
  {
    title: '/icons/facebook.png',
    path: 'https://www.facebook.com/sharingexcess/',
  },
  {
    title: '/icons/instagram.png',
    path: 'https://www.instagram.com/sharingexcess/',
  },
  {
    title: '/icons/tiktok.png',
    path: 'https://www.tiktok.com/@sharingexcess',
  },
]

interface PageLinksProps {
  color: 'black' | 'green' | 'white'
}

export const PageLinks: FC<PageLinksProps> = ({ color }) => {
  const { pathname } = useRouter()

  return (
    <ul>
      {pages.map(({ title, path }) =>
        path.includes('https') ? (
          <ExternalLink to={path} key={title}>
            <Button
              type="tertiary"
              color={color}
              classList={[
                'Header-link',
                path === pathname ? 'active' : 'inactive',
              ]}
              id={`Header-link-${title.toLowerCase()}`}
            >
              {title.includes('.png') ? (
                <Image src={title} alt="Header Link" />
              ) : (
                title
              )}
            </Button>
          </ExternalLink>
        ) : (
          <Button
            key={title}
            type="tertiary"
            color={color}
            classList={[
              'Header-link',
              path === pathname ? 'active' : 'inactive',
            ]}
            id={`Header-link-${title.toLowerCase()}`}
          >
            <Link href={path}>{title}</Link>
          </Button>
        )
      )}
    </ul>
  )
}
