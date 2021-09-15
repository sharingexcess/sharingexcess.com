import { useEffect, useState } from 'react'

export function useScrollPosition(): number {
  const [scroll, setScroll] = useState<number>(0)

  useEffect(() => {
    setScroll(window.pageYOffset)
    window.addEventListener('scroll', updateScroll)
    return () => window.removeEventListener('scroll', updateScroll)
  }, []) // eslint-disable-line

  function updateScroll() {
    if (window.pageYOffset !== scroll) {
      setScroll(window.pageYOffset)
    }
  }

  return scroll
}
