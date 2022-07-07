import React, { FC, useEffect, useState } from 'react'
import { useWidth } from 'hooks'
import { Image } from '@sharingexcess/designsystem'
import { setSourceMapRange } from 'typescript'

export function WaveBackground({ containerId, flipped }: Record<any, any>) {
  const THRESHOLD_1 = 0.2
  const THRESHOLD_2 = 0.33
  const THRESHOLD_3 = 0.76
  const THRESHOLD_4 = 4

  const width = useWidth()

  const [src, setSrc] = useState<string | undefined>()

  useEffect(() => {
    setTimeout(() => {
      if (width) {
        const container = document.getElementById(containerId)
        if (!container) return
        const height = container.clientHeight
        const ratio = height / width

        if (ratio < THRESHOLD_1) {
          if (flipped) {
            setSrc('/wave/wave-sm-flipped.svg')
          } else {
            setSrc('/wave/wave-sm.svg')
          }
        } else if (ratio < THRESHOLD_2) {
          if (flipped) {
            setSrc('/wave/wave-med-flipped.svg')
          } else {
            setSrc('/wave/wave-med.svg')
          }
        } else if (ratio < THRESHOLD_3) {
          if (flipped) {
            setSrc('/wave/wave-lg-flipped.svg')
          } else {
            setSrc('/wave/wave-lg.svg')
          }
        } else if (ratio < THRESHOLD_4) {
          if (flipped) {
            setSrc('wave/wave-mobile-flipped.svg')
          } else {
            setSrc('/wave/wave-mobile.svg')
          }
        } else {
          if (flipped) {
            setSrc('wave/wave-med-flipped.svg')
          } else {
            setSrc('/wave/wave-med.svg')
          }
        }
      }
    }, 0)
  }, [width])

  return src ? (
    <Image src={src} alt="background" id="WaveBackground-img" />
  ) : null
}
