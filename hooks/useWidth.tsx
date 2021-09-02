import { useEffect, useState } from 'react'

export function useWidth(): number | undefined {
  const [width, setWidth] = useState<number | undefined>()
  let debounce_timer: NodeJS.Timeout

  useEffect(() => {
    setWidth(window.innerWidth)
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, []) // eslint-disable-line

  function updateWidth() {
    debounce_timer && clearTimeout(debounce_timer)
    debounce_timer = setTimeout(() => {
      if (window.innerWidth !== width) {
        setWidth(window.innerWidth)
      }
    }, 100)
  }

  return width
}
