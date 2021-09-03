import { FC } from 'react'
import { useRouter } from 'next/dist/client/router'
import { Button } from 'components/SEDS'
import { useIsMobile } from 'hooks'
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
]

interface PageLinksProps {
  color: string
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
