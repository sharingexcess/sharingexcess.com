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
    if (width) {
      const container = document.getElementById(containerId)
      if (!container) return
      const height = container.clientHeight
      const ratio = height / width

      console.log('ratio', ratio)

      if (ratio < THRESHOLD_1) {
        if (flipped) {
          setSrc('/wave/wave-sm-flipped.svg')
        } else {
          setSrc('/wave/wave-sm.svg')
        }
        console.log('one!')
      } else if (ratio < THRESHOLD_2) {
        if (flipped) {
          setSrc('/wave/wave-med-flipped.svg')
        } else {
          setSrc('/wave/wave-med.svg')
        }

        console.log('two!')
      } else if (ratio < THRESHOLD_3) {
        if (flipped) {
          setSrc('/wave/wave-lg-flipped.svg')
        } else {
          setSrc('/wave/wave-lg.svg')
        }

        console.log('three!')
      } else if (ratio < THRESHOLD_4) {
        if (flipped) {
          setSrc('wave/wave-mobile-flipped.svg')
        } else {
          setSrc('/wave/wave-mobile.svg')
        }

        console.log('four!')
      } else {
        if (flipped) {
          setSrc('wave/wave-med-flipped.svg')
        } else {
          setSrc('/wave/wave-med.svg')
        }
        console.log('else!')
      }
    }
  }, [width])

  return src ? (
    <Image src={src} alt="background" id="WaveBackground-img" />
  ) : null
}
