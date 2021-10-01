import { useWidth } from 'hooks'
import { useEffect, useState } from 'react'

export function useIsMobile(): boolean {
  const width = useWidth()
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    if (!isMobile && width && width < 600) {
      setIsMobile(true)
    }
    if (isMobile && width && width > 600) {
      setIsMobile(false)
    }
  }, [width, isMobile])

  return isMobile
}
