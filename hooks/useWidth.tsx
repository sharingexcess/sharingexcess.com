import { useEffect, useState } from 'react'

export function useWidth(): number | undefined {
  const [width, setWidth] = useState<number | undefined>()

  useEffect(() => {
    setWidth(window.innerWidth)
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, []) // eslint-disable-line

  function updateWidth() {
    if (window.innerWidth !== width) {
      setWidth(window.innerWidth)
    }
  }

  return width
}
