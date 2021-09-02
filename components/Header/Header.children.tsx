import { FC } from 'react'
import { useRouter } from 'next/dist/client/router'
import { Button } from 'components/SEDS'
import { useIsMobile } from 'hooks'

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

export const PageLinks: FC = () => {
  const { pathname } = useRouter()
  const isMobile = useIsMobile()

  return isMobile ? null : (
    <ul>
      {pages.map(({ title, path }) => (
        <Button
          key={title}
          type="tertiary"
          color="white"
          classList={['Header-link', path === pathname ? 'active' : 'inactive']}
          id={`Header-link-${title.toLowerCase()}`}
        >
          {title}
        </Button>
      ))}
    </ul>
  )
}
