import { FC } from 'react'
import { useRouter } from 'next/dist/client/router'
import { Button } from '@sharingexcess/designsystem'
import Link from 'next/link'

const pages = [
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
    title: 'STORE',
    path: '/store',
  },
]

interface PageLinksProps {
  color: 'black' | 'green' | 'white'
}

export const PageLinks: FC<PageLinksProps> = ({ color }) => {
  const { pathname } = useRouter()

  return (
    <ul>
      {pages.map(({ title, path }) => (
        <Button
          key={title}
          type="tertiary"
          color={color}
          classList={['Header-link', path === pathname ? 'active' : 'inactive']}
          id={`Header-link-${title.toLowerCase()}`}
        >
          <Link href={path}>{title}</Link>
        </Button>
      ))}
    </ul>
  )
}
